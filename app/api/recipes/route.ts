import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateRecipes } from '@/lib/gemini-recipes';
import { validatePassword, getPasswordFromHeader } from '@/lib/password';
import { getYesterday } from '@/lib/dates';
import type { DayData } from '@/types';

const GOALS = {
  kcal: 2000,
  protein_g: 170,
  carbs_g: 160,
  fat_g: 65,
  fiber_g: 30,
};

export async function GET(req: Request) {
  // Check password
  const password = getPasswordFromHeader(req);
  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError.error }, { status: passwordError.status });
  }

  // Get end date from query params, default to today
  const { searchParams } = new URL(req.url);
  const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];
  
  // Get yesterday and today
  const yesterday = getYesterday(endDate);
  const dates = [yesterday, endDate];

  // Fetch entries for both days
  const { data: entries, error } = await supabase
    .from('food_entries')
    .select('*')
    .in('entry_date', dates)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group entries by date
  const dayData: DayData[] = dates.map(date => {
    const dayEntries = entries?.filter(e => e.entry_date === date) || [];
    const totals = dayEntries.reduce(
      (acc, e) => ({
        kcal: acc.kcal + e.kcal,
        protein_g: acc.protein_g + e.protein_g,
        carbs_g: acc.carbs_g + e.carbs_g,
        fat_g: acc.fat_g + e.fat_g,
        fiber_g: acc.fiber_g + e.fiber_g,
      }),
      { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 }
    );

    return {
      date,
      totals,
      entries: dayEntries,
    };
  });

  try {
    const suggestions = await generateRecipes(dayData, GOALS);
    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error('Error generating recipes:', err);
    return NextResponse.json({ error: 'Failed to generate recipes' }, { status: 500 });
  }
}
