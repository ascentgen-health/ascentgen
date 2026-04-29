'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props {
  userId: string
  defaultUnit: 'F' | 'C'
  existingEntry?: {
    waking_temp_value?: number | null
    waking_temp_unit?: string
    waking_pulse_bpm?: number | null
    post_meal_temp_value?: number | null
    post_meal_temp_unit?: string
    post_meal_pulse_bpm?: number | null
    notes?: string | null
  } | null
  onSaved?: () => void
}

export default function TodayCheckInForm({ userId, defaultUnit, existingEntry, onSaved }: Props) {
  const router = useRouter()
  const todayStr = new Date().toISOString().split('T')[0]

  const [wt, setWt] = useState(existingEntry?.waking_temp_value?.toString() ?? '')
  const [wtUnit, setWtUnit] = useState<'F' | 'C'>(
    (existingEntry?.waking_temp_unit as 'F' | 'C') ?? defaultUnit
  )
  const [wp, setWp] = useState(existingEntry?.waking_pulse_bpm?.toString() ?? '')
  const [pmt, setPmt] = useState(existingEntry?.post_meal_temp_value?.toString() ?? '')
  const [pmtUnit, setPmtUnit] = useState<'F' | 'C'>(
    (existingEntry?.post_meal_temp_unit as 'F' | 'C') ?? defaultUnit
  )
  const [pmp, setPmp] = useState(existingEntry?.post_meal_pulse_bpm?.toString() ?? '')
  const [notes, setNotes] = useState(existingEntry?.notes ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error: upsertError } = await supabase.from('daily_entries').upsert(
        {
          user_id: userId,
          date: todayStr,
          waking_temp_value: wt ? parseFloat(wt) : null,
          waking_temp_unit: wtUnit,
          waking_pulse_bpm: wp ? parseInt(wp, 10) : null,
          post_meal_temp_value: pmt ? parseFloat(pmt) : null,
          post_meal_temp_unit: pmtUnit,
          post_meal_pulse_bpm: pmp ? parseInt(pmp, 10) : null,
          notes: notes || null,
        },
        { onConflict: 'user_id,date' }
      )
      if (upsertError) throw upsertError

      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 3000)
      onSaved?.()
    } catch (err: any) {
      setError(err.message ?? 'Failed to save. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        background: '#111827',
        border: '1px solid #1e2330',
        borderRadius: 12,
        padding: '28px 24px',
      }}
    >
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ ...sectionTitle, marginBottom: 4 }}>Today's Check-In</h2>
        <p style={{ color: '#6B7280', fontSize: 13 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Row: Waking */}
        <div style={{ marginBottom: 20 }}>
          <div style={groupLabel}>Waking readings</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={fieldLabel}>Temperature</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="number"
                  step="0.1"
                  value={wt}
                  onChange={(e) => setWt(e.target.value)}
                  placeholder={wtUnit === 'F' ? '97.8' : '36.6'}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => setWtUnit(wtUnit === 'F' ? 'C' : 'F')}
                  style={unitToggle}
                >
                  °{wtUnit}
                </button>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={fieldLabel}>Pulse (bpm)</label>
              <input
                type="number"
                value={wp}
                onChange={(e) => setWp(e.target.value)}
                placeholder="75"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Row: Post-meal */}
        <div style={{ marginBottom: 20 }}>
          <div style={groupLabel}>Post-meal readings</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={fieldLabel}>Temperature</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="number"
                  step="0.1"
                  value={pmt}
                  onChange={(e) => setPmt(e.target.value)}
                  placeholder={pmtUnit === 'F' ? '98.6' : '37.0'}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => setPmtUnit(pmtUnit === 'F' ? 'C' : 'F')}
                  style={unitToggle}
                >
                  °{pmtUnit}
                </button>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={fieldLabel}>Pulse (bpm)</label>
              <input
                type="number"
                value={pmp}
                onChange={(e) => setPmp(e.target.value)}
                placeholder="82"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 24 }}>
          <label style={fieldLabel}>Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Sleep quality, stress, anything notable..."
            rows={2}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 6,
              padding: '8px 12px',
              color: '#f87171',
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '13px 0',
            background: saved ? '#3d6b3d' : loading ? '#8a6420' : '#C9922A',
            border: 'none',
            borderRadius: 8,
            color: saved ? '#7AAE7A' : '#0d1117',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.04em',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {saved ? '✓ Readings locked in' : loading ? 'Saving...' : "Lock in today's readings"}
        </button>
      </form>
    </div>
  )
}

const sectionTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: '#E8DCC8',
  fontFamily: '"Georgia", serif',
}

const groupLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#C9922A',
  marginBottom: 10,
}

const fieldLabel: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 500,
  color: '#6B7280',
  marginBottom: 5,
  letterSpacing: '0.04em',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  background: '#0d1117',
  border: '1px solid #1e2330',
  borderRadius: 7,
  color: '#E8DCC8',
  fontSize: 14,
  outline: 'none',
}

const unitToggle: React.CSSProperties = {
  padding: '0 14px',
  background: '#1a2235',
  border: '1px solid #1e2330',
  borderRadius: 7,
  color: '#C9922A',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}