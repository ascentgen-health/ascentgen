// app/debug/page.tsx
import { getSupabaseClient } from '@/lib/supabaseClient';

export default async function DebugPage() {
  const supabase = getSupabaseClient();

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