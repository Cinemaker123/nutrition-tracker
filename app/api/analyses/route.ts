import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const APP_PASSWORD = process.env.APP_PASSWORD;

export async function GET(req: Request) {
  // Check password
  const password = req.headers.get('x-password');
  if (password !== APP_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ analyses: data });
}

export async function POST(req: Request) {
  // Check password
  const password = req.headers.get('x-password');
  if (password !== APP_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { date_range, analysis } = await req.json();

  const { data, error } = await supabase
    .from('analyses')
    .insert([{ date_range, analysis }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ analysis: data });
}
