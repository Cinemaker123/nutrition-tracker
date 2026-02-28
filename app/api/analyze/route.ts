import { NextResponse } from 'next/server';
import { parseMacros } from '@/lib/gemini';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  // Check env vars
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY not configured' },
      { status: 500 }
    );
  }

  // Password check
  const password = req.headers.get('x-password');
  if (password !== process.env.APP_PASSWORD) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { text, date } = await req.json();

  if (!text || typeof text !== 'string') {
    return NextResponse.json(
      { error: 'Food description is required' },
      { status: 400 }
    );
  }

  try {
    // Call Gemini API
    const results = await parseMacros(text);
    
    if (!results || results.length === 0) {
      throw new Error('No food items parsed');
    }

    // Prepare all food items for insertion
    const entryDate = date || new Date().toISOString().split('T')[0];
    const entries = results.map(nutrition => ({
      food: nutrition.food,
      amount_g: nutrition.amount_g,
      kcal: nutrition.kcal,
      protein_g: nutrition.protein_g,
      carbs_g: nutrition.carbs_g,
      fat_g: nutrition.fat_g,
      fiber_g: nutrition.fiber_g,
      entry_date: entryDate
    }));

    // Add all to database
    const { data, error } = await supabase
      .from('food_entries')
      .insert(entries)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to analyze food', details: message },
      { status: 500 }
    );
  }
}
