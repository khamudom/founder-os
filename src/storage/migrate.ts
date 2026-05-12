import { createDefaultState, defaultWeeklyDraft } from '@/storage/schema'
import { getWeeklyPeriodKey } from '@/utils/date'
import type { AppStateV1, WeeklyUpdateDraft } from '@/types'

/** Normalizes weekly draft JSON (local export or Supabase row mapping). */
export function normalizeWeeklyDraft(
  raw: unknown,
  fallbackWeekOf: string,
): WeeklyUpdateDraft {
  const base = defaultWeeklyDraft(fallbackWeekOf)
  if (!raw || typeof raw !== 'object') return base
  const w = raw as Record<string, unknown>
  const priorities = Array.isArray(w.nextWeekPriorities)
    ? (w.nextWeekPriorities as unknown[]).map((x) => String(x ?? ''))
    : base.nextWeekPriorities
  while (priorities.length < 3) priorities.push('')
  return {
    weekOf: typeof w.weekOf === 'string' ? w.weekOf : base.weekOf,
    productNotes: typeof w.productNotes === 'string' ? w.productNotes : '',
    blockers: typeof w.blockers === 'string' ? w.blockers : '',
    nextWeekPriorities: priorities.slice(0, 8),
  }
}

/** Normalize unknown persisted JSON to AppStateV1. */
export function migrate(raw: unknown): AppStateV1 {
  if (!raw || typeof raw !== 'object') {
    return createDefaultState()
  }
  const base = createDefaultState()
  const r = raw as Record<string, unknown>

  if (r.version !== 1) {
    return base
  }

  const weekOf = getWeeklyPeriodKey()

  return {
    version: 1,
    investors: Array.isArray(r.investors) ? (r.investors as AppStateV1['investors']) : [],
    events: Array.isArray(r.events) ? (r.events as AppStateV1['events']) : [],
    dutyCompletions: Array.isArray(r.dutyCompletions)
      ? (r.dutyCompletions as AppStateV1['dutyCompletions'])
      : [],
    dailyNotes: Array.isArray(r.dailyNotes) ? (r.dailyNotes as AppStateV1['dailyNotes']) : [],
    weeklyUpdateDraft: normalizeWeeklyDraft(r.weeklyUpdateDraft, weekOf),
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : base.updatedAt,
  }
}
