// Shared TypeScript types for Nutrition Tracker

export interface FoodEntry {
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
}

export interface Analysis {
  id: string;
  created_at: string;
  date_range: string;
  analysis: string;
}

export interface RecipeSuggestion {
  name: string;
  description: string;
  primary_macro: 'protein' | 'carbs' | 'fat' | 'fiber' | 'kcal';
  type?: 'meal' | 'snack';
}

export interface MacroGoals {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

export interface DayEntry {
  food: string;
  amount_g: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

export interface DayData {
  date: string;
  totals: {
    kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
  };
  entries: DayEntry[];
}

export interface MacroResult {
  food: string;
  amount_g: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}
