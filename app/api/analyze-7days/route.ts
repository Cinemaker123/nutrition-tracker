import { NextResponse } from 'next/server';
import { analyze7Days } from '@/lib/gemini-analysis';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const GOALS = {
  kcal: 2000,
  protein_g: 170,
  carbs_g: 160,
  fat_g: 65,
  fiber_g: 30,
};

export async function POST(req: Request) {
  // Password check
  const password = req.headers.get('x-password');
  if (password !== process.env.APP_PASSWORD) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { endDate } = await req.json();

  try {
    // Calculate date range (last 7 days including endDate)
    const end = new Date(endDate + 'T00:00:00');
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }

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
