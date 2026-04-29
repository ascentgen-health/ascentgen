import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const body = await req.json();

  // Get user — if no user, use a placeholder for now
  const { data: { user } } = await supabase.auth.getUser();
  
  // Temporary: allow unauthenticated saves for testing
  const userId = user?.id ?? '00000000-0000-0000-0000-000000000000';

  const row = {
    user_id: userId,
    date: body.date ?? new Date().toLocaleDateString('en-CA'),
    waking_temp_value: body.waking_temp_value ?? null,
    waking_temp_unit: body.waking_temp_value ? (body.waking_temp_unit ?? 'F') : null,
    waking_pulse_bpm: body.waking_pulse_bpm ?? null,
    post_meal_temp_value: body.post_meal_temp_value ?? null,
    post_meal_temp_unit: body.post_meal_temp_value ? (body.post_meal_temp_unit ?? 'F') : null,
    post_meal_pulse_bpm: body.post_meal_pulse_bpm ?? null,
    notes: body.notes ?? null,
  };

  const { data, error } = await supabase
    .from('daily_entries')
    .upsert(row, { onConflict: 'user_id,date' })
    .select()
    .single();

  if (error) {
    console.error('Save error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}