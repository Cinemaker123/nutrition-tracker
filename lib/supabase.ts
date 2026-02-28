import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for our database - matching Gemini's output
type FoodEntry = {
  id: string;
  food: string;
  amount_g: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  entry_date: string;
  created_at: string;
};

type Analysis = {
  id: string;
  created_at: string;
  date_range: string;
  analysis: string;
};

export type { FoodEntry, Analysis };
