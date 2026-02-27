import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for our database
type FoodEntry = {
  id: string;
  food_name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  entry_date: string;
  created_at: string;
};

export type { FoodEntry };
