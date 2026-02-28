import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const APP_PASSWORD = process.env.APP_PASSWORD;

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check password
  const password = req.headers.get('x-password');
  if (password !== APP_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase
    .from('analyses')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
