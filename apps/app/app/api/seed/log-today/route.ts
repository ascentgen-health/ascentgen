import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  const body = await req.json();

  const userId = 'demo-user-1';
  const date = new Date().toISOString().slice(0, 10);

  const row = {
    user_id: userId,
    date,
    waking_temp_value: body.waking_temp_value ?? null,
    waking_temp_unit: body.waking_temp_unit ?? null,
    waking_pulse_bpm: body.waking_pulse_bpm ?? null,
    post_meal_temp_value: body.post_meal_temp_value ?? null,
    post_meal_temp_unit: body.post_meal_temp_unit ?? null,
    post_meal_pulse_bpm: body.post_meal_pulse_bpm ?? null,
  };

  const { error } = await supabase
    .from('daily_entries')
    .upsert(row, { onConflict: 'user_id,date' });

  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
