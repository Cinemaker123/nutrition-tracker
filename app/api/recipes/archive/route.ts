import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validatePassword, getPasswordFromHeader } from '@/lib/password';

export async function GET(req: Request) {
  // Check password
  const password = getPasswordFromHeader(req);
  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError.error }, { status: passwordError.status });
  }

  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ recipes: data });
}

export async function POST(req: Request) {
  // Check password
  const password = getPasswordFromHeader(req);
  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError.error }, { status: passwordError.status });
  }

  const { date_range, suggestions, based_on_dates } = await req.json();

  const { data, error } = await supabase
    .from('recipes')
    .insert([{ date_range, suggestions, based_on_dates }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ recipe: data });
}
