import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type Route = {
  id: string;
  user_id: string;
  origin: string;
  destination: string;
  modals: string[];
  total_time: number;
  total_distance: number;
  estimated_cost: number;
  is_sustainable: boolean;
  created_at: string;
};

export type EmissionHistory = {
  id: string;
  user_id: string;
  distance: number;
  transport_mode: string;
  co2_generated: number;
  co2_avoided: number;
  created_at: string;
};

export type TransportLine = {
  id: string;
  name: string;
  type: 'bus' | 'metro';
  status: string;
  next_arrival: string;
  favorited_by: string[];
  created_at: string;
  updated_at: string;
};
