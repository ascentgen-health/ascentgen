// FILE: app/app/RecentEntries.tsx
'use client';

type Entry = {
  id: string;
  date: string;
  waking_temp_value: number | null;
  waking_temp_unit: string;
  waking_pulse_bpm: number | null;
  post_meal_temp_value: number | null;
  post_meal_temp_unit: string;
  post_meal_pulse_bpm: number | null;
  notes: string | null;
};

type Props = {
  entries: Entry[];
};

function formatTemp(val: number | null, unit: string): string {
  if (val == null) return '—';
  return `${val.toFixed(1)} ${unit}`;
}

function formatPulse(val: number | null): string {
  if (val == null) return '—';
  return `${val} bpm`;
}

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function RecentEntries({ entries }: Props) {
  const rows = [...entries].slice(0, 14);

  if (rows.length === 0) {
    return (
      <div style={{ background: '#111827', border: '1px solid #1e2330', borderRadius: 12, padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.7 }}>
          No entries yet. Lock in your first reading above.
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#111827', border: '1px solid #1e2330', borderRadius: 12, padding: '28px 24px' }}>
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 400, color: '#E8DCC8', marginBottom: 20 }}>
        Recent Entries
      </h2>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Wake Temp</th>
              <th style={thStyle}>Wake Pulse</th>
              <th style={thStyle}>PM Temp</th>
              <th style={thStyle}>PM Pulse</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((entry, i) => (
              <tr key={entry.id} style={{ borderBottom: i === rows.length - 1 ? 'none' : '1px solid rgba(30,35,48,0.6)' }}>
                <td style={{ ...tdStyle, color: '#E8DCC8', fontWeight: 500 }}>{formatDate(entry.date)}</td>
                <td style={tdStyle}>{formatTemp(entry.waking_temp_value, entry.waking_temp_unit)}</td>
                <td style={tdStyle}>{formatPulse(entry.waking_pulse_bpm)}</td>
                <td style={tdStyle}>{formatTemp(entry.post_meal_temp_value, entry.post_meal_temp_unit)}</td>
                <td style={tdStyle}>{formatPulse(entry.post_meal_pulse_bpm)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0 12px 10px 0',
  color: '#6B7280',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  borderBottom: '1px solid #1e2330',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 12px 12px 0',
  color: '#6B7280',
  fontSize: 13,
};