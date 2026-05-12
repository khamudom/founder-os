import { getWeeklyPeriodKey } from '@/utils/date'
import type { AppStateV1 } from '@/types'

export const STORAGE_KEY = 'founder-os.app.v1'

export const CURRENT_VERSION = 1 as const

export function defaultWeeklyDraft(weekOf: string): AppStateV1['weeklyUpdateDraft'] {
  return {
    weekOf,
    productNotes: '',
    blockers: '',
    nextWeekPriorities: ['', '', ''],
  }
}

export function createDefaultState(now = new Date()): AppStateV1 {
  const iso = now.toISOString()
  const weekOf = getWeeklyPeriodKey(now)
  return {
    version: 1,
    investors: [],
    events: [],
    dutyCompletions: [],
    dailyNotes: [],
    weeklyUpdateDraft: defaultWeeklyDraft(weekOf),
    updatedAt: iso,
  }
}

export function isAppStateV1(value: unknown): value is AppStateV1 {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  if (v.version !== 1) return false
  if (!Array.isArray(v.investors)) return false
  if (!Array.isArray(v.events)) return false
  if (!Array.isArray(v.dutyCompletions)) return false
  if (!Array.isArray(v.dailyNotes)) return false
  if (!v.weeklyUpdateDraft || typeof v.weeklyUpdateDraft !== 'object') return false
  if (typeof v.updatedAt !== 'string') return false
  return true
}
