export type MedicineRepeat = 'once' | 'daily' | 'weekdays' | 'custom';
export type MedicineStatus = 'active' | 'inactive';

export interface Medicine {
  id: string;
  user_id?: string; // Optional on frontend when inserting
  name: string;
  dose: string;
  time: string; // Stored as 'HH:mm:ss' in DB, but we might pass it differently
  compartment: number;
  repeat: MedicineRepeat;
  status: MedicineStatus;
  created_at?: string;
  updated_at?: string;
}
