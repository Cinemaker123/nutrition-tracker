import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validatePassword, getPasswordFromHeader } from '@/lib/password';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check password
  const password = getPasswordFromHeader(req);
  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError.error }, { status: passwordError.status });
  }

  const { id } = await params;

  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
