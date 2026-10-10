import { supabase } from '../lib/supabase';
import { DoseLog, DoseStatus } from '../models/dose';
import { getTodaysMedicines } from './medicineService';
import { cancelDoseNotification } from './notificationService';

// Helper to convert time string (HH:mm:ss or HH:mm) to a local Date object for today
const getScheduledTimeForToday = (timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
  return scheduledTime;
};

// Generates dose logs for today for all active medicines
export const generateTodaysDoses = async (): Promise<void> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  const medicines = await getTodaysMedicines();
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  for (const medicine of medicines) {
    // 1. Check repeat rules
    if (medicine.repeat === 'weekdays' && (dayOfWeek === 0 || dayOfWeek === 6)) {
      continue; // Skip weekends
    }
    // "custom" and "once" repeat logic can be expanded here based on requirements.
    // For now, we assume active medicines with 'once', 'daily', or 'custom' will be scheduled for today
    // if they are returned by getTodaysMedicines.

    // 2. Determine scheduled time
    const scheduledTime = getScheduledTimeForToday(medicine.time);

    // 3. Application-level check to prevent duplicates
    const { data: existingDoses, error: fetchError } = await supabase
      .from('dose_logs')
      .select('id')
      .eq('medicine_id', medicine.id)
      .eq('scheduled_time', scheduledTime.toISOString());

    if (fetchError) {
      console.error(`Error checking existing dose for ${medicine.name}:`, fetchError);
      continue;
    }

    if (existingDoses && existingDoses.length > 0) {
      // Dose already generated for today
      continue;
    }

    // 4. Insert new dose log
    const { error: insertError } = await supabase
      .from('dose_logs')
      .insert({
        user_id: user.user.id,
        medicine_id: medicine.id,
        scheduled_time: scheduledTime.toISOString(),
        status: 'pending',
        compartment: medicine.compartment,
      });

    // We rely on the database UNIQUE(medicine_id, scheduled_time) constraint
    // to catch any race conditions where a duplicate might still try to insert.
    if (insertError) {
      // Code 23505 is PostgreSQL unique violation
      if (insertError.code !== '23505') {
        console.error(`Error inserting dose for ${medicine.name}:`, insertError);
      }
    }
  }
};

// Retrieves today's doses, including medicine details
export const getTodayDoses = async (): Promise<DoseLog[]> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const { data, error } = await supabase
    .from('dose_logs')
    .select(`
      *,
      medicine:medicines(*)
    `)
    .gte('scheduled_time', startOfDay.toISOString())
    .lte('scheduled_time', endOfDay.toISOString())
    .order('scheduled_time', { ascending: true });

  if (error) {
    throw new Error('Unable to load today\'s doses. Please try again.');
  }

  return data as DoseLog[];
};

export const getUpcomingDoses = async (): Promise<DoseLog[]> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  const now = new Date();

  const { data, error } = await supabase
    .from('dose_logs')
    .select(`
      *,
      medicine:medicines(*)
    `)
    .eq('status', 'pending')
    .gte('scheduled_time', now.toISOString())
    .order('scheduled_time', { ascending: true });

  if (error) {
    throw new Error('Unable to load upcoming doses. Please try again.');
  }

  return data as DoseLog[];
};

export const updateDoseStatus = async (id: string, status: DoseStatus): Promise<DoseLog> => {
  const takenAt = status === 'taken' ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from('dose_logs')
    .update({ 
      status,
      taken_at: takenAt
    })
    .eq('id', id)
    .select(`
      *,
      medicine:medicines(*)
    `)
    .single();

  if (error) {
    throw new Error(`Unable to mark dose as ${status}. Please try again.`);
  }

  // If status is no longer pending, cancel any scheduled notification
  if (status !== 'pending') {
    await cancelDoseNotification(id);
  }

  return data as DoseLog;
};

export const markDoseTaken = (id: string) => updateDoseStatus(id, 'taken');
export const markDoseMissed = (id: string) => updateDoseStatus(id, 'missed');
export const markDoseSkipped = (id: string) => updateDoseStatus(id, 'skipped');

export const getDoseHistory = async (limit = 50): Promise<DoseLog[]> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('dose_logs')
    .select(`
      *,
      medicine:medicines(*)
    `)
    .order('scheduled_time', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error('Unable to load dose history. Please try again.');
  }

  return data as DoseLog[];
};

export const deletePendingDosesForMedicine = async (medicineId: string): Promise<void> => {
  const { data: pendingDoses } = await supabase
    .from('dose_logs')
    .select('id')
    .eq('medicine_id', medicineId)
    .eq('status', 'pending');

  if (pendingDoses && pendingDoses.length > 0) {
    for (const dose of pendingDoses) {
      await cancelDoseNotification(dose.id);
    }
    
    await supabase
      .from('dose_logs')
      .delete()
      .eq('medicine_id', medicineId)
      .eq('status', 'pending');
  }
};
