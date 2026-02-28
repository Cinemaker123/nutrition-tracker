import { NextResponse } from 'next/server';
import { analyze7Days } from '@/lib/gemini-analysis';
import { supabase } from '@/lib/supabase';
import { validatePassword, getPasswordFromHeader } from '@/lib/password';
import { getDatesRange } from '@/lib/dates';

const GOALS = {
  kcal: 2200,
  protein_g: 140,
  carbs_g: 220,
  fat_g: 98,
  fiber_g: 40,
};

export async function POST(req: Request) {
  // Password check
  const password = getPasswordFromHeader(req);
  const passwordError = validatePassword(password);
  if (passwordError) {
    return new Response(passwordError.error, { status: passwordError.status });
  }

  const { endDate } = await req.json();

  try {
    // Calculate date range (last 7 days including endDate)
    const dates = getDatesRange(endDate, 7);

    // Fetch data for all 7 days
    const { data: entries, error } = await supabase
      .from('food_entries')
      .select('*')
      .in('entry_date', dates)
      .order('entry_date', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Group by date
    const dayData = dates.map(date => {
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
        entries: dayEntries.map(e => ({
          food: e.food,
          amount_g: e.amount_g,
          kcal: e.kcal,
          protein_g: e.protein_g,
          carbs_g: e.carbs_g,
          fat_g: e.fat_g,
          fiber_g: e.fiber_g,
        })),
      };
    });

    // Analyze with Gemini
    const analysis = await analyze7Days(dayData, GOALS);

    return NextResponse.json({ analysis, daysAnalyzed: dayData.filter(d => d.entries.length > 0).length });

  } catch (error) {
    console.error('7-day analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze 7-day data' },
      { status: 500 }
    );
  }
}
