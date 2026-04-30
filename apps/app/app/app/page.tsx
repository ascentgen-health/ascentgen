'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { LogoutButton } from '@/app/_components/LogoutButton'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DailyEntry {
  date: string
  waking_temp_value: number | null
  waking_temp_unit: string | null
  waking_pulse_bpm: number | null
  post_meal_temp_value: number | null
  post_meal_temp_unit: string | null
  post_meal_pulse_bpm: number | null
}

interface GQResult {
  gqScore: number | null
  gqTier: 'Dormant' | 'Kindling' | 'Ascending' | null
  patternLabel: string | null
}

interface Props {
  entries: DailyEntry[]
  gq: GQResult | null
  streak: number
  userUnit: 'F' | 'C'
}

// ─── Tier helpers ─────────────────────────────────────────────────────────────

const TIER_COLOR: Record<'Ascending' | 'Kindling' | 'Dormant', string> = {
  Ascending: '#7AAE7A',
  Kindling: '#C8841A',
  Dormant: '#EF4444',
}

const TIER_PATTERN: Record<'Ascending' | 'Kindling' | 'Dormant', string> = {
  Ascending: 'Warm & Steady',
  Kindling: 'Hot but Wired',
  Dormant: 'Cold & Slow',
}

const TIER_BLURB: Record<'Ascending' | 'Kindling' | 'Dormant', string> = {
  Ascending:
    'Warm, steady temps and a calm pulse — the Ascending band where generative energy supports repair and life.',
  Kindling:
    "You’re warming up and getting more stable. Consistent routines help the fire take and hold.",
  Dormant:
    'Colder and/or unstable readings — generative energy is low or scattered, and stress chemistry tends to dominate.',
}

const TIERS = [
  { name: 'Ascending', range: 'GQ 90–100', color: '#7AAE7A', desc: 'Warm, steady, alive — the fire holds.' },
  { name: 'Kindling', range: 'GQ 70–89', color: '#C8841A', desc: 'Heat is building — the fire is catching.' },
  { name: 'Dormant', range: 'GQ 0–69', color: '#EF4444', desc: "Colder, slowed — the fire hasn’t caught yet." },
] as const

// ─── Small helpers ────────────────────────────────────────────────────────────

function formatTemp(val: number | null, unit: string | null, display: 'F' | 'C'): string {
  if (val === null) return '—'
  if (unit === 'F' && display === 'C') return `${(((val - 32) * 5) / 9).toFixed(1)}°C`
  if (unit === 'C' && display === 'F') return `${(((val * 9) / 5 + 32)).toFixed(1)}°F`
  return `${val.toFixed(1)}°${display}`
}

function formatPulse(val: number | null): string {
  return val !== null ? `${val} bpm` : '—'
}

function avg(vals: (number | null)[]): number | null {
  const clean = vals.filter((v): v is number => v !== null)
  if (!clean.length) return null
  return clean.reduce((a, b) => a + b, 0) / clean.length
}

function toDisplayTemp(val: number | null, unit: string | null, display: 'F' | 'C'): string {
  if (val === null) return '—'
  if (unit === 'F' && display === 'C') return `${(((val - 32) * 5) / 9).toFixed(1)}°C`
  if (unit === 'C' && display === 'F') return `${(((val * 9) / 5 + 32)).toFixed(1)}°F`
  return `${val.toFixed(1)}°${display}`
}

// ─── Icons / micro components ────────────────────────────────────────────────

function ArrowTip({ color, size = 52 }: { color: string; size?: number }) {
  const h = Math.round(size * 0.72)
  return (
    <svg width={size} height={h} viewBox={`0 0 ${size} ${h}`} fill="none">
      <polygon
        points={`${size / 2},2 ${size - 2},${h - 2} 2,${h - 2}`}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinejoin="miter"
      />
    </svg>
  )
}

function TierIcon({ color }: { color: string }) {
  return (
    <svg width={14} height={12} viewBox="0 0 14 12" fill="none">
      <polygon points="7,1 13,11 1,11" stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="miter" />
    </svg>
  )
}

function MetricBar({ fill }: { fill: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: 'rgba(237,228,206,0.12)',
      }}
    >
      <div
        style={{
          height: '100%',
          background: '#7AAE7A',
          width: `${fill}%`,
          transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1)',
        }}
      />
    </div>
  )
}

// ─── GQ explainer ────────────────────────────────────────────────────────────

function GQExplainer({ gqScore, gqTier }: { gqScore: number | null; gqTier: string | null }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', marginBottom: 6, marginTop: 20 }}>
      {/* Header row */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '18px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span
            style={{
              fontSize: 11,
              letterSpacing: '2px',
              color: 'var(--text3)',
              textTransform: 'uppercase',
            }}
          >
            About your GQ
          </span>
          {gqTier && (
            <span
              style={{
                fontSize: 11,
                letterSpacing: '1.8px',
                color: TIER_COLOR[gqTier as 'Ascending' | 'Kindling' | 'Dormant'],
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              {gqTier}
              {gqScore !== null ? ` · ${gqScore}` : ''}
            </span>
          )}
        </div>
        <svg
          width={16}
          height={16}
          viewBox="0 0 14 14"
          fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}
        >
          <polyline points="2,4 7,10 12,4" stroke="var(--text3)" strokeWidth="1.4" fill="none" />
        </svg>
      </button>

      {/* Body */}
      {open && (
        <div
          style={{
            padding: '0 28px 26px',
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1.2fr) 1px minmax(0,1fr)',
            gap: 0,
          }}
        >
          {/* Left: explainer text */}
          <div style={{ paddingRight: 24 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: '2px',
                color: 'var(--text3)',
                textTransform: 'uppercase',
                marginBottom: 14,
              }}
            >
              How it works
            </div>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 12 }}>
              Ascentgen watches waking and post-meal temperature and pulse to see how warm and how steady your system
              runs from day to day.
            </p>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 12 }}>
              Those four readings become a <span style={{ color: 'var(--text)' }}>Generative Quotient (GQ)</span> — a
              0–100 index of how close and how stable you are to the generative targets over the last 14 days.
            </p>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.8 }}>
              It&apos;s a compass, not a diagnosis. Direction and stability matter more than hitting any single number.
            </p>
          </div>

          {/* Divider */}
          <div style={{ background: 'var(--line)', margin: '0 24px' }} />

          {/* Right: tier bands */}
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: '2px',
                color: 'var(--text3)',
                textTransform: 'uppercase',
                marginBottom: 14,
              }}
            >
              The three bands
            </div>
            {TIERS.map((t, i) => (
              <div
                key={t.name}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  paddingBottom: i < TIERS.length - 1 ? 14 : 0,
                  marginBottom: i < TIERS.length - 1 ? 14 : 0,
                  borderBottom: i < TIERS.length - 1 ? '1px solid rgba(237,228,206,0.06)' : 'none',
                }}
              >
                <div style={{ paddingTop: 3, flexShrink: 0 }}>
                  <TierIcon color={t.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        letterSpacing: '2.2px',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        color: t.color,
                      }}
                    >
                      {t.name}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: 'rgba(237,228,206,0.35)',
                        letterSpacing: '1px',
                      }}
                    >
                      {t.range}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: 'rgba(237,228,206,0.65)',
                      lineHeight: 1.6,
                    }}
                  >
                    {t.desc}
                  </div>
                </div>
                {gqTier === t.name && (
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: t.color,
                      flexShrink: 0,
                      marginTop: 4,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main dashboard component ────────────────────────────────────────────────

export default function DashboardClient(rawProps: Props) {
  // Defensive default
  const entries = Array.isArray(rawProps.entries) ? rawProps.entries : []
  const gq = rawProps.gq
  const streak = rawProps.streak
  const userUnit = rawProps.userUnit

  const [barWidths, setBarWidths] = useState([0, 0, 0, 0])

  const safeTier = gq?.gqTier ?? 'Dormant'
  const tier: 'Ascending' | 'Kindling' | 'Dormant' = safeTier
  const score = gq?.gqScore ?? null
  const tierColor = TIER_COLOR[tier]

  const last14 = entries.slice(0, 14)
  const wtAvg = avg(last14.map((e) => e.waking_temp_value))
  const mtAvg = avg(last14.map((e) => e.post_meal_temp_value))
  const wpAvg = avg(last14.map((e) => e.waking_pulse_bpm))
  const mpAvg = avg(last14.map((e) => e.post_meal_pulse_bpm))

  function tempBar(val: number | null, unit: string | null, ideal: number) {
    if (val === null) return 0
    const inF = unit === 'C' ? (val * 9) / 5 + 32 : val
    return Math.max(0, Math.min(100, 100 - Math.abs(inF - ideal) * 20))
  }
  function pulseBar(val: number | null, ideal: number) {
    if (val === null) return 0
    return Math.max(0, Math.min(100, 100 - Math.abs(val - ideal) * 3))
  }

  const targetBars = [
    tempBar(wtAvg, last14[0]?.waking_temp_unit ?? 'F', 97.8),
    tempBar(mtAvg, last14[0]?.post_meal_temp_unit ?? 'F', 98.6),
    pulseBar(wpAvg, 75),
    pulseBar(mpAvg, 82),
  ]

  useEffect(() => {
    const t = setTimeout(() => setBarWidths(targetBars), 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries])

  const today = entries[0]
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const metrics = [
    { label: 'Waking Temp', value: toDisplayTemp(wtAvg, last14[0]?.waking_temp_unit ?? 'F', userUnit) },
    { label: 'Post-Meal Temp', value: toDisplayTemp(mtAvg, last14[0]?.post_meal_temp_unit ?? 'F', userUnit) },
    { label: 'Waking Pulse', value: wpAvg !== null ? `${wpAvg.toFixed(0)} bpm` : '—' },
    { label: 'Post-Meal Pulse', value: mpAvg !== null ? `${mpAvg.toFixed(0)} bpm` : '—' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Jost:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');
        :root {
          --bg: #080910;
          --bg2: #0D0E18;
          --panel: #06070E;
          --amber: #C8841A;
          --amber2: #E4A83C;
          --amber3: #F2C46A;
          --text: #EDE4CE;
          --text2: rgba(237,228,206,0.7);
          --text3: rgba(237,228,206,0.5);
          --line: rgba(237,228,206,0.12);
          --green: #7AAE7A;
        }
        .ag-dash *{box-sizing:border-box;margin:0;padding:0}
        .ag-dash{
          background:var(--bg);
          color:var(--text);
          font-family:'Jost',sans-serif;
          font-weight:300;
          min-height:100vh;
        }
        .ag-header{
          background:var(--bg2);
          border-bottom:1px solid var(--line);
          height:64px;
          display:flex;
          align-items:center;
          padding:0 32px;
        }
        .ag-logo{display:flex;align-items:center;gap:14px;margin-right:22px;text-decoration:none}
        .ag-wm{
          font-family:'Cinzel',serif;
          font-size:16px;
          letter-spacing:5px;
          color:var(--text);
          text-transform:uppercase;
          font-weight:400;
        }
        .ag-tagline{
          font-size:11px;
          letter-spacing:2.2px;
          color:var(--text3);
          text-transform:uppercase;
          border-left:1px solid var(--line);
          padding-left:18px;
        }
        .ag-header-right{margin-left:auto;display:flex;align-items:center;gap:16px}
        .ag-date{
          font-size:11px;
          letter-spacing:1.6px;
          color:var(--text3);
          text-transform:uppercase;
        }
        .ag-streak{
          border:1px solid var(--amber);
          padding:6px 16px 5px;
          font-size:11px;
          letter-spacing:2px;
          color:var(--amber3);
          font-weight:500;
          text-transform:uppercase;
          display:flex;
          align-items:center;
          gap:7px;
        }
        .logo-glow{
          animation:logoGlow 3s ease-in-out infinite;
        }
        @keyframes logoGlow{
          0%,100%{
            filter:drop-shadow(0 0 6px rgba(200,132,26,.9)) drop-shadow(0 0 18px rgba(200,132,26,.5))
          }
          50%{
            filter:drop-shadow(0 0 12px rgba(242,196,106,1)) drop-shadow(0 0 30px rgba(200,132,26,.7))
          }
        }
        .ag-body{
          max-width:1200px;
          margin:0 auto;
          padding:40px 32px 80px;
        }
        .ag-hero{
          display:grid;
          grid-template-columns:1fr 1px 1fr;
          background:var(--panel);
          border:1px solid var(--line);
          margin-bottom:4px;
          animation:fadeUp .5s ease both;
        }
        .ag-hero-left,.ag-hero-right{
          padding:40px 44px;
          display:flex;
          flex-direction:column;
          justify-content:center;
        }
        .ag-divider{background:var(--line);width:1px}
        .ag-sec{
          font-size:11px;
          letter-spacing:2.2px;
          color:var(--text3);
          text-transform:uppercase;
          margin-bottom:22px;
        }
        .ag-score-row{display:flex;align-items:flex-end;gap:20px;margin-bottom:18px}
        .ag-score-num{
          font-family:'Cinzel',serif;
          font-size:80px;
          line-height:1;
          color:var(--text);
          letter-spacing:-1px;
        }
        .ag-tier-name{
          font-size:13px;
          letter-spacing:4px;
          text-transform:uppercase;
          font-weight:600;
          margin-bottom:8px;
        }
        .ag-tier-pat{
          font-size:12px;
          color:var(--text2);
          letter-spacing:2px;
          text-transform:uppercase;
        }
        .ag-bands{display:flex;flex-direction:column;margin-bottom:22px}
        .ag-band{
          display:flex;
          align-items:center;
          gap:14px;
          padding:12px 0;
          border-bottom:1px solid rgba(237,228,206,.07);
        }
        .ag-band:first-child{border-top:1px solid rgba(237,228,206,.07)}
        .ag-band-info{flex:1}
        .ag-band-name{
          font-size:12px;
          letter-spacing:2.4px;
          text-transform:uppercase;
          font-weight:600;
          margin-bottom:3px;
        }
        .ag-band-range{
          font-size:11px;
          color:var(--text3);
          letter-spacing:1px;
        }
        .ag-active-dot{
          width:6px;
          height:6px;
          border-radius:50%;
          flex-shrink:0;
        }
        .ag-blurb{
          font-size:14px;
          color:var(--text2);
          line-height:1.9;
          font-style:italic;
          font-weight:300;
          max-width:340px;
        }
        .ag-metrics{
          display:grid;
          grid-template-columns:repeat(4,1fr);
          background:var(--panel);
          border:1px solid var(--line);
          border-top:none;
          margin-bottom:10px;
          animation:fadeUp .5s .1s ease both;
        }
        .ag-metric{
          padding:22px 24px 20px;
          border-right:1px solid var(--line);
          position:relative;
          overflow:hidden;
        }
        .ag-metric:last-child{border-right:none}
        .ag-metric-label{
          font-size:11px;
          letter-spacing:2px;
          color:var(--text3);
          text-transform:uppercase;
          margin-bottom:8px;
        }
        .ag-metric-value{
          font-family:'Cinzel',serif;
          font-size:20px;
          color:var(--text);
          letter-spacing:.3px;
          margin-bottom:4px;
        }
        .ag-metric-sub{
          font-size:11px;
          letter-spacing:1.5px;
          color:var(--text3);
          text-transform:uppercase;
        }
        .ag-2col{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:4px;
          animation:fadeUp .5s .18s ease both;
        }
        .ag-card{
          background:var(--panel);
          border:1px solid var(--line);
          padding:28px 30px;
        }
        .ag-card-label{
          font-size:11px;
          letter-spacing:2.4px;
          color:var(--text3);
          text-transform:uppercase;
          margin-bottom:20px;
          display:flex;
          align-items:center;
          gap:10px;
        }
        .ag-card-label::after{
          content:'';
          flex:1;
          height:1px;
          background:rgba(237,228,206,.08);
        }
        .ag-field{margin-bottom:4px}
        .ag-field-inner{
          background:var(--bg);
          border:1px solid var(--line);
          padding:12px 16px;
          display:flex;
          justify-content:space-between;
          align-items:center;
          cursor:pointer;
          transition:border-color .15s;
        }
        .ag-field-inner:hover{border-color:rgba(237,228,206,.22)}
        .ag-field-name{
          font-size:12px;
          letter-spacing:1.4px;
          color:var(--text2);
          text-transform:uppercase;
        }
        .ag-field-value{
          font-family:'Cinzel',serif;
          font-size:14px;
          color:var(--text);
        }
        .ag-field-empty .ag-field-value{color:rgba(237,228,206,.2)}
        .ag-cta{
          margin-top:18px;
          background:var(--amber);
          border:none;
          padding:13px 0;
          width:100%;
          font-family:'Jost',sans-serif;
          font-size:12px;
          letter-spacing:2.2px;
          color:var(--bg);
          text-transform:uppercase;
          font-weight:600;
          cursor:pointer;
          display:block;
          text-align:center;
          text-decoration:none;
          transition:background .15s;
        }
        .ag-cta:hover{background:var(--amber2)}
        .ag-table-head{
          display:grid;
          grid-template-columns:80px 1fr 1fr 1fr 1fr;
          padding-bottom:8px;
          border-bottom:1px solid rgba(237,228,206,.07);
          margin-bottom:2px;
        }
        .ag-th{
          font-size:11px;
          letter-spacing:1.6px;
          color:rgba(237,228,206,.4);
          text-transform:uppercase;
        }
        .ag-th:not(:first-child){text-align:right}
        .ag-table-row{
          display:grid;
          grid-template-columns:80px 1fr 1fr 1fr 1fr;
          padding:10px 0;
          border-bottom:1px solid rgba(237,228,206,.05);
          cursor:pointer;
          transition:background .1s;
        }
        .ag-table-row:last-child{border-bottom:none}
        .ag-table-row:hover{background:rgba(237,228,206,.03)}
        .ag-td{
          font-size:13px;
          color:var(--text);
        }
        .ag-td:not(:first-child){text-align:right}
        .ag-td-date{
          font-size:12px;
          color:var(--text2);
        }
        .ag-table-foot{
          margin-top:12px;
          font-size:11px;
          letter-spacing:1.5px;
          color:rgba(237,228,206,.3);
          text-transform:uppercase;
          text-align:center;
        }
        .ag-empty{
          padding:28px;
          text-align:center;
          color:var(--text3);
          font-size:14px;
          font-style:italic;
          line-height:1.7;
        }
        .ag-footer{
          margin-top:40px;
          border-top:1px solid rgba(237,228,206,.07);
          padding-top:14px;
          display:flex;
          justify-content:space-between;
          animation:fadeUp .5s .26s ease both;
        }
        .ag-footer-text{
          font-size:11px;
          letter-spacing:1.6px;
          color:rgba(237,228,206,.25);
          text-transform:uppercase;
        }
        @keyframes fadeUp{
          from{opacity:0;transform:translateY(10px)}
          to{opacity:1;transform:translateY(0)}
        }
        @media(max-width:900px){
          .ag-hero{grid-template-columns:1fr}
          .ag-divider{display:none}
          .ag-metrics{grid-template-columns:repeat(2,1fr)}
          .ag-2col{grid-template-columns:1fr}
          .ag-body{padding:24px 18px 60px}
          .ag-header{padding:0 18px}
          .ag-tagline{display:none}
          .ag-score-num{font-size:64px}
        }
      `}</style>

      <div className="ag-dash">
        {/* Header */}
        <header className="ag-header">
          <a href="/app" className="ag-logo">
            <Image
              src="/logo.png"
              alt="Ascentgen"
              width={36}
              height={44}
              style={{ objectFit: 'contain', display: 'block' }}
              className="logo-glow"
              priority
            />
            <span className="ag-wm">Ascentgen</span>
          </a>
          <span className="ag-tagline">Heat · Rhythm · Ascent</span>
          <div className="ag-header-right">
            <span className="ag-date">{todayDate}</span>
            <span className="ag-streak">
              <svg width={8} height={8} viewBox="0 0 8 8" fill="none">
                <polygon points="4,1 7,7 1,7" stroke="#C8841A" strokeWidth="1" fill="none" strokeLinejoin="miter" />
              </svg>
              Day {streak}
            </span>
            <LogoutButton />
          </div>
        </header>

        <div className="ag-body">
          {/* GQ hero */}
          <div className="ag-hero">
            <div className="ag-hero-left">
              <div className="ag-sec">Generative Quotient · 14-day window</div>
              <div className="ag-score-row">
                <ArrowTip color={tierColor} size={52} />
                <span className="ag-score-num">{score ?? '—'}</span>
              </div>
              <div className="ag-tier-name" style={{ color: tierColor }}>
                {tier}
              </div>
              <div className="ag-tier-pat">{TIER_PATTERN[tier]}</div>
            </div>

            <div className="ag-divider" />

            <div className="ag-hero-right">
              <div className="ag-sec">Tier bands</div>
              <div className="ag-bands">
                {TIERS.map((t) => (
                  <div className="ag-band" key={t.name}>
                    <TierIcon color={t.color} />
                    <div className="ag-band-info">
                      <div className="ag-band-name" style={{ color: t.color }}>
                        {t.name}
                      </div>
                      <div className="ag-band-range">{t.range}</div>
                    </div>
                    {tier === t.name && <div className="ag-active-dot" style={{ background: t.color }} />}
                  </div>
                ))}
              </div>
              <p className="ag-blurb">{TIER_BLURB[tier]}</p>
            </div>
          </div>

          {/* Metrics */}
          <div className="ag-metrics">
            {metrics.map((m, i) => (
              <div className="ag-metric" key={m.label}>
                <MetricBar fill={barWidths[i]} />
                <div className="ag-metric-label">{m.label}</div>
                <div className="ag-metric-value">{m.value}</div>
                <div className="ag-metric-sub">14-day avg</div>
              </div>
            ))}
          </div>

          {/* GQ explainer */}
          <GQExplainer gqScore={score} gqTier={gq?.gqTier ?? null} />

          {/* Two columns: today check-in + recent entries */}
          <div className="ag-2col">
            {/* Today’s check-in */}
            <div className="ag-card">
              <div className="ag-card-label">Today&apos;s check-in</div>
              {[
                {
                  name: 'Waking Temp',
                  val: today ? formatTemp(today.waking_temp_value, today.waking_temp_unit, userUnit) : null,
                },
                {
                  name: 'Post-Meal Temp',
                  val: today ? formatTemp(today.post_meal_temp_value, today.post_meal_temp_unit, userUnit) : null,
                },
                {
                  name: 'Waking Pulse',
                  val: today ? formatPulse(today.waking_pulse_bpm) : null,
                },
                {
                  name: 'Post-Meal Pulse',
                  val: today ? formatPulse(today.post_meal_pulse_bpm) : null,
                },
              ].map((f) => (
                <div
                  className={`ag-field${!f.val || f.val === '—' ? ' ag-field-empty' : ''}`}
                  key={f.name}
                >
                  <div className="ag-field-inner">
                    <span className="ag-field-name">{f.name}</span>
                    <span className="ag-field-value">{f.val ?? '—'}</span>
                  </div>
                </div>
              ))}
              <a href="/app/log" className="ag-cta">
                Lock in today&apos;s readings
              </a>
            </div>

            {/* Recent entries */}
            <div className="ag-card">
              <div className="ag-card-label">Recent entries</div>
              <div className="ag-table-head">
                <span className="ag-th">Date</span>
                <span className="ag-th">W Temp</span>
                <span className="ag-th">M Temp</span>
                <span className="ag-th">W BPM</span>
                <span className="ag-th">M BPM</span>
              </div>
              {entries.length === 0 ? (
                <div className="ag-empty">
                  No readings yet.
                  <br />
                  Start with tomorrow&apos;s waking temperature and pulse.
                </div>
              ) : (
                entries.slice(0, 7).map((e) => (
                  <div className="ag-table-row" key={e.date}>
                    <span className="ag-td ag-td-date">
                      {new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="ag-td">
                      {formatTemp(e.waking_temp_value, e.waking_temp_unit, userUnit)}
                    </span>
                    <span className="ag-td">
                      {formatTemp(e.post_meal_temp_value, e.post_meal_temp_unit, userUnit)}
                    </span>
                    <span className="ag-td">{formatPulse(e.waking_pulse_bpm)}</span>
                    <span className="ag-td">{formatPulse(e.post_meal_pulse_bpm)}</span>
                  </div>
                ))
              )}
              <div className="ag-table-foot">14-day log · tap row to edit</div>
            </div>
          </div>

          {/* Footer */}
          <div className="ag-footer">
            <span className="ag-footer-text">Ascentgen · Not medical advice</span>
            <span className="ag-footer-text">GQ recalculates daily</span>
          </div>
        </div>
      </div>
    </>
  )
}