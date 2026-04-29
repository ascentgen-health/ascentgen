'use client';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ConfirmPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/app');
        return;
      }
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) router.push('/app');
      });
      return () => subscription.unsubscribe();
    });
  }, [router]);

  return (
    <main style={{ minHeight: '100vh', background: '#050509', color: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#6B7280', letterSpacing: '0.1em' }}>Signing in...</p>
    </main>
  );
}
