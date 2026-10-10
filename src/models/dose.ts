import { Medicine } from './medicine';

export type DoseStatus = 'pending' | 'taken' | 'missed' | 'skipped';

export interface DoseLog {
  id: string;
  user_id: string;
  medicine_id: string;
  scheduled_time: string; // ISO 8601 string
  taken_at: string | null; // ISO 8601 string
  status: DoseStatus;
  compartment: number | null;
  created_at: string; // ISO 8601 string
  
  // Joined relation for UI convenience
  medicine?: Medicine;
}
