import { supabase } from '../../lib/supabase';
import { Medicine } from '../models/medicine';
import { cancelDoseNotification } from './notificationService';

export const getMedicines = async (): Promise<Medicine[]> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .order('time', { ascending: true });

  if (error) {
    throw new Error('Unable to load your medicines. Please try again.');
  }

  return data as Medicine[];
};

export const getMedicineById = async (id: string): Promise<Medicine> => {
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error('Unable to load medicine details. Please try again.');
  }

  return data as Medicine;
};

export const addMedicine = async (medicine: Omit<Medicine, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Medicine> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('medicines')
    .insert([
      {
        ...medicine,
        user_id: user.user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error('Unable to save this medicine. Please try again.');
  }

  return data as Medicine;
};

export const updateMedicine = async (id: string, medicine: Partial<Omit<Medicine, 'id' | 'created_at' | 'updated_at' | 'user_id'>>): Promise<Medicine> => {
  const { data, error } = await supabase
    .from('medicines')
    .update(medicine)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error('Unable to save this medicine. Please try again.');
  }

  return data as Medicine;
};

export const deleteMedicine = async (id: string): Promise<void> => {
  // 1. Fetch pending doses for this medicine to cancel notifications
  const { data: pendingDoses } = await supabase
    .from('dose_logs')
    .select('id')
    .eq('medicine_id', id)
    .eq('status', 'pending');

  if (pendingDoses) {
    for (const dose of pendingDoses) {
      await cancelDoseNotification(dose.id);
    }
  }

  // 2. Delete the medicine (cascade will handle deleting the dose_logs records)
  const { error } = await supabase
    .from('medicines')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error('Unable to delete this medicine. Please try again.');
  }
};

export const getTodaysMedicines = async (): Promise<Medicine[]> => {
  // For Phase 2B, we fetch active medicines.
  // Real daily schedule filtering can be advanced later.
  // Here we just fetch active ones.
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .eq('status', 'active')
    .order('time', { ascending: true });

  if (error) {
    console.error('Error fetching today\'s medicines:', error);
    return [];
  }

  return data as Medicine[];
};
