// app/debug/page.tsx
import { getSupabaseClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
  let supabase;

  try {
    supabase = getSupabaseClient();
  } catch (e) {
    return (
      <main className="min-h-screen bg-black text-white p-4">
        <h1 className="text-xl mb-4">Supabase debug</h1>
        <p className="text-red-400 mb-2">Supabase is not configured.</p>
        <p className="text-sm text-zinc-400">
          Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.
        </p>
      </main>
    );
  }

  const { data, error } = await supabase
    .from('daily_entries')
    .select('*')
    .limit(5);

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <h1 className="text-xl mb-4">Supabase debug</h1>

      <pre className="text-xs bg-zinc-900 p-3 rounded border border-gray-700 overflow-x-auto">
        {JSON.stringify(
          {
            data,
            error,
          },
          null,
          2
        )}
      </pre>
    </main>
  );
}