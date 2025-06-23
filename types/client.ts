export interface Client {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  neck: number | null;
  chest: number | null;
  bust: number | null;
  waist: number | null;
  hips: number | null;
  thigh: number | null;
  inseam: number | null;
  arm_length: number | null;
  outseam: number | null;
  ankle: number | null;
  shoulder: number | null;
  sleeve_length: number | null;
  knee: number | null;
  wrist: number | null;
  rise: number | null;
  bicep: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  pendingSync: boolean;
}
