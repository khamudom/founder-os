import { DUTY_DEFINITIONS } from '@/constants/duties'
import type { AppStateV1, ChecklistFrequency, DutyCompletion } from '@/types'
import {
  getDailyPeriodKey,
  getMonthlyPeriodKey,
  getWeeklyPeriodKey,
  todayString,
} from '@/utils/date'

export function periodKeyForFrequency(frequency: ChecklistFrequency, d = new Date()): string {
  switch (frequency) {
    case 'daily':
      return getDailyPeriodKey(d)
    case 'weekly':
      return getWeeklyPeriodKey(d)
    case 'monthly':
      return getMonthlyPeriodKey(d)
    default: {
      const _exhaustive: never = frequency
      return _exhaustive
    }
  }
}

export function isDutyCompleted(
  state: AppStateV1,
  dutyId: string,
  frequency: ChecklistFrequency,
  d = new Date(),
): boolean {
  const key = periodKeyForFrequency(frequency, d)
  return state.dutyCompletions.some((c) => c.dutyId === dutyId && c.periodKey === key)
}

export function toggleDutyCompletion(
  state: AppStateV1,
  dutyId: string,
  frequency: ChecklistFrequency,
  d = new Date(),
): AppStateV1 {
  const periodKey = periodKeyForFrequency(frequency, d)
  const now = new Date().toISOString()
  const exists = state.dutyCompletions.some(
    (c) => c.dutyId === dutyId && c.periodKey === periodKey,
  )

  let dutyCompletions: DutyCompletion[]
  if (exists) {
    dutyCompletions = state.dutyCompletions.filter(
      (c) => !(c.dutyId === dutyId && c.periodKey === periodKey),
    )
  } else {
    const row: DutyCompletion = { dutyId, periodKey, completedAt: now }
    dutyCompletions = [...state.dutyCompletions, row]
  }

  return { ...state, dutyCompletions }
}

export function weeklyDutyDefinitions() {
  return DUTY_DEFINITIONS.filter((d) => d.frequency === 'weekly')
}

export function weeklyConsistencyScore(state: AppStateV1, d = new Date()): number {
  const weekKey = getWeeklyPeriodKey(d)
  const weekly = weeklyDutyDefinitions()
  if (weekly.length === 0) return 1
  const done = weekly.filter((def) =>
    state.dutyCompletions.some((c) => c.dutyId === def.id && c.periodKey === weekKey),
  ).length
  return done / weekly.length
}

export function completedDutyLabelsForWeek(state: AppStateV1, d = new Date()): string[] {
  const weekKey = getWeeklyPeriodKey(d)
  const labels: string[] = []
  for (const def of DUTY_DEFINITIONS) {
    if (def.frequency !== 'weekly') continue
    if (state.dutyCompletions.some((c) => c.dutyId === def.id && c.periodKey === weekKey)) {
      labels.push(def.label)
    }
  }
  return labels
}

export function completedDutyLabelsForToday(state: AppStateV1, d = new Date()): string[] {
  const dayKey = getDailyPeriodKey(d)
  const labels: string[] = []
  for (const def of DUTY_DEFINITIONS) {
    if (def.frequency !== 'daily') continue
    if (state.dutyCompletions.some((c) => c.dutyId === def.id && c.periodKey === dayKey)) {
      labels.push(def.label)
    }
  }
  return labels
}

export function getDailyNoteForToday(state: AppStateV1): string {
  const today = todayString()
  return state.dailyNotes.find((n) => n.date === today)?.text ?? ''
}

export function setDailyNoteForToday(state: AppStateV1, text: string): AppStateV1 {
  const today = todayString()
  const rest = state.dailyNotes.filter((n) => n.date !== today)
  const row = { date: today, text }
  const dailyNotes = text.trim() === '' ? rest : [...rest, row]
  return { ...state, dailyNotes }
}
