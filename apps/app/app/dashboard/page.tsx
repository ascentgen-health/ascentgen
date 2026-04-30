import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'
import { computeGQ } from '@/lib/gq'

export default async function DashboardPage() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: entries } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(14)

  const { data: profile } = await supabase
    .from('profiles')
    .select('temp_unit')
    .eq('id', user.id)
    .single()

  const safeEntries = entries ?? []
  const gq = computeGQ(safeEntries)
  const streak = safeEntries.length

  return (
    <DashboardClient
      entries={safeEntries}
      gq={gq}
      streak={streak}
      userUnit={profile?.temp_unit ?? 'F'}
    />
  )
}