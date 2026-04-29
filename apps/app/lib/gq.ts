// lib/gq.ts — Generative Quotient calculation engine
// Targets per Bible v0.2:
//   Waking temp: 36.6 °C | Post-meal temp: 37.0 °C
//   Waking pulse: 75 bpm  | Post-meal pulse: 82 bpm

export type GQTier = 'Dormant' | 'Kindling' | 'Ascending'
export type PatternLabel = 'Cold & Slow' | 'Hot but Wired' | 'Warm & Steady'

export interface DailyEntryForGQ {
  waking_temp_value: number | null
  waking_temp_unit: 'C' | 'F'
  waking_pulse_bpm: number | null
  post_meal_temp_value: number | null
  post_meal_temp_unit: 'C' | 'F'
  post_meal_pulse_bpm: number | null
}

export interface GQResult {
  gqScore: number
  gqTier: GQTier
  patternLabel: PatternLabel
  entryCount: number
  windowDays: number
  avgWakingTemp: number | null
  avgPostMealTemp: number | null
  avgWakingPulse: number | null
  avgPostMealPulse: number | null
}

// Convert F → C
function toC(value: number, unit: 'C' | 'F'): number {
  return unit === 'F' ? (value - 32) * (5 / 9) : value
}

// Closeness score: 1.0 at threshold, 0.0 at ceiling, linear between
function closenessScore(
  value: number,
  ideal: number,
  threshold: number,
  ceiling: number
): number {
  const diff = Math.abs(value - ideal)
  if (diff <= threshold) return 1.0
  if (diff >= ceiling) return 0.0
  return 1.0 - (diff - threshold) / (ceiling - threshold)
}

// Stability score (lower SD = better)
function stabilityScore(values: number[], sdThreshold: number, sdCeiling: number): number {
  if (values.length < 2) return 1.0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  const sd = Math.sqrt(variance)
  if (sd <= sdThreshold) return 1.0
  if (sd >= sdCeiling) return 0.0
  return 1.0 - (sd - sdThreshold) / (sdCeiling - sdThreshold)
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  return Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length)
}

export function computeGQ(
  entries: DailyEntryForGQ[],
  windowDays: number = 14
): GQResult | null {
  // Require at least 7 entries for a meaningful score
  const valid = entries.filter(
    (e) =>
      e.waking_temp_value != null &&
      e.waking_pulse_bpm != null &&
      e.post_meal_temp_value != null &&
      e.post_meal_pulse_bpm != null
  )

  if (valid.length < 7) return null

  const slice = valid.slice(-windowDays)

  const wakingTemps = slice.map((e) => toC(e.waking_temp_value!, e.waking_temp_unit))
  const postMealTemps = slice.map((e) => toC(e.post_meal_temp_value!, e.post_meal_temp_unit))
  const wakingPulses = slice.map((e) => e.waking_pulse_bpm!)
  const postMealPulses = slice.map((e) => e.post_meal_pulse_bpm!)

  // Closeness scores per entry, then average
  const wtClose = wakingTemps.map((t) => closenessScore(t, 36.6, 0.2, 0.9))
  const pmtClose = postMealTemps.map((t) => closenessScore(t, 37.0, 0.2, 0.9))
  const wpClose = wakingPulses.map((p) => closenessScore(p, 75, 3, 20))
  const pmpClose = postMealPulses.map((p) => closenessScore(p, 82, 3, 20))

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length

  const tempScore = (avg(wtClose) + avg(pmtClose)) / 2
  const pulseScore = (avg(wpClose) + avg(pmpClose)) / 2

  // Stability scores
  const wtStab = stabilityScore(wakingTemps, 0.15, 0.6)
  const pmtStab = stabilityScore(postMealTemps, 0.15, 0.6)
  const wpStab = stabilityScore(wakingPulses, 3, 12)
  const pmpStab = stabilityScore(postMealPulses, 3, 12)
  const stabilityScore_ = (wtStab + pmtStab + wpStab + pmpStab) / 4

  const gqRaw = 100 * (0.35 * tempScore + 0.35 * pulseScore + 0.3 * stabilityScore_)
  const gqScore = Math.max(0, Math.min(100, Math.round(gqRaw)))

  const gqTier: GQTier =
    gqScore >= 90 ? 'Ascending' : gqScore >= 70 ? 'Kindling' : 'Dormant'

  // 7-day pattern label
  const recent7WT = wakingTemps.slice(-7)
  const recent7PMT = postMealTemps.slice(-7)
  const recent7WP = wakingPulses.slice(-7)
  const recent7PMP = postMealPulses.slice(-7)

  const avgWT7 = avg(recent7WT)
  const avgPMT7 = avg(recent7PMT)
  const avgWP7 = avg(recent7WP)
  const avgPMP7 = avg(recent7PMP)

  const tempSd7 = (stdDev(recent7WT) + stdDev(recent7PMT)) / 2
  const pulseSd7 = (stdDev(recent7WP) + stdDev(recent7PMP)) / 2

  let patternLabel: PatternLabel
  const tempWarm = avgWT7 >= 36.4 && avgPMT7 >= 36.7
  const pulseFast = avgWP7 > 85 || avgPMP7 > 90
  const pulseCalm = avgWP7 >= 68 && avgWP7 <= 85 && avgPMP7 >= 75 && avgPMP7 <= 88
  const tempStable = tempSd7 < 0.3 && pulseSd7 < 6

  if (tempWarm && pulseCalm && tempStable) {
    patternLabel = 'Warm & Steady'
  } else if (pulseFast) {
    patternLabel = 'Hot but Wired'
  } else {
    patternLabel = 'Cold & Slow'
  }

  return {
    gqScore,
    gqTier,
    patternLabel,
    entryCount: slice.length,
    windowDays,
    avgWakingTemp: avg(wakingTemps),
    avgPostMealTemp: avg(postMealTemps),
    avgWakingPulse: avg(wakingPulses),
    avgPostMealPulse: avg(postMealPulses),
  }
}

export function tierColor(tier: GQTier): string {
  if (tier === 'Ascending') return '#7AAE7A'
  if (tier === 'Kindling') return '#C9922A'
  return '#6B7280'
}

export function tierTagline(tier: GQTier): string {
  if (tier === 'Ascending') return 'Warm, steady, alive. The fire holds.'
  if (tier === 'Kindling') return 'Heat is building. The fire is catching.'
  return "The fire hasn't caught yet. Keep showing up."
}
