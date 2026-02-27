import { NextResponse } from 'next/server';
import { createKimiClient, SYSTEM_PROMPT } from '@/lib/kimi';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
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
    // Call Kimi API with JSON Mode
    const kimi = createKimiClient();
    const response = await kimi.chat.completions.create({
      model: 'kimi-k2-turbo-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from Kimi');
    }

    const nutrition = JSON.parse(content);

    // Validate required fields
    const required = ['food_name', 'amount', 'calories', 'protein', 'carbs', 'fat', 'fiber'];
    for (const field of required) {
      if (!(field in nutrition)) {
        throw new Error(`Missing field: ${field}`);
      }
    }

    // Add to database
    const { data, error } = await supabase
      .from('food_entries')
      .insert({
        food_name: nutrition.food_name,
        amount: nutrition.amount,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        fiber: nutrition.fiber,
        entry_date: date || new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Kimi API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze food' },
      { status: 500 }
    );
  }
}
