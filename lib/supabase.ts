import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Re-export types from shared types file
export type { FoodEntry, Analysis, RecipeSuggestion, MacroGoals, DayData, MacroResult } from '@/types';
