import { getSupabase } from '@/lib/supabase/client'
import { normalizeWeeklyDraft } from '@/storage/migrate'
import { createDefaultState } from '@/storage/schema'
import { getWeeklyPeriodKey } from '@/utils/date'
import type {
  AppStateV1,
  DailyNote,
  DutyCompletion,
  Investor,
  InvestorLink,
  StartupEvent,
  WeeklyUpdateDraft,
} from '@/types'

function dateOnly(s: string | null | undefined): string | undefined {
  if (!s) return undefined
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(s)
  return m ? m[1] : undefined
}

function asInvestorLinks(raw: unknown): InvestorLink[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    if (!item || typeof item !== 'object') return { url: '' }
    const o = item as Record<string, unknown>
    const url = typeof o.url === 'string' ? o.url : ''
    const label = typeof o.label === 'string' ? o.label : undefined
    return label ? { label, url } : { url }
  })
}

export function remoteHasUserData(s: AppStateV1): boolean {
  if (s.investors.length || s.events.length || s.dutyCompletions.length || s.dailyNotes.length) {
    return true
  }
  const w = s.weeklyUpdateDraft
  if (w.productNotes.trim() || w.blockers.trim()) return true
  return w.nextWeekPriorities.some((p) => p.trim().length > 0)
}

function mapInvestorRow(row: Record<string, unknown>): Investor {
  const fit = row.fit_score
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    firm: row.firm ? String(row.firm) : undefined,
    roleTitle: row.role_title ? String(row.role_title) : undefined,
    stage: row.stage as Investor['stage'],
    warmIntroSource: row.warm_intro_source ? String(row.warm_intro_source) : undefined,
    lastContactDate: dateOnly(row.last_contact_date as string | undefined),
    nextFollowUpDate: dateOnly(row.next_follow_up_date as string | undefined),
    fitScore:
      typeof fit === 'number' && fit >= 1 && fit <= 5 ? (fit as Investor['fitScore']) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    links: asInvestorLinks(row.links),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  }
}

function mapEventRow(row: Record<string, unknown>): StartupEvent {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    location: row.location ? String(row.location) : undefined,
    type: row.type as StartupEvent['type'],
    date: dateOnly(String(row.date)) ?? '',
    link: row.link ? String(row.link) : undefined,
    status: row.status as StartupEvent['status'],
    notes: row.notes ? String(row.notes) : undefined,
    contactsMade: row.contacts_made ? String(row.contacts_made) : undefined,
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  }
}

function mapDutyRow(row: Record<string, unknown>): DutyCompletion {
  return {
    dutyId: String(row.duty_id ?? ''),
    periodKey: String(row.period_key ?? ''),
    completedAt: String(row.completed_at ?? new Date().toISOString()),
  }
}

function mapDailyNoteRow(row: Record<string, unknown>): DailyNote {
  const d = row.note_date
  const iso = typeof d === 'string' ? dateOnly(d) ?? d : ''
  return {
    date: iso,
    text: typeof row.body === 'string' ? row.body : '',
  }
}

export async function fetchAppStateFromSupabase(userId: string): Promise<AppStateV1> {
  const supabase = getSupabase()
  const weekOf = getWeeklyPeriodKey()

  const [invRes, evRes, dutyRes, notesRes, draftCurrentRes, draftLatestRes] = await Promise.all([
    supabase.from('investors').select('*').eq('user_id', userId),
    supabase.from('startup_events').select('*').eq('user_id', userId),
    supabase.from('duty_completions').select('*').eq('user_id', userId),
    supabase.from('daily_notes').select('*').eq('user_id', userId),
    supabase
      .from('weekly_update_drafts')
      .select('*')
      .eq('user_id', userId)
      .eq('week_of', weekOf)
      .maybeSingle(),
    supabase
      .from('weekly_update_drafts')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const errors = [
    invRes.error,
    evRes.error,
    dutyRes.error,
    notesRes.error,
    draftCurrentRes.error,
    draftLatestRes.error,
  ]
  for (const err of errors) {
    if (err) throw err
  }

  const investors = (invRes.data ?? []).map((r) => mapInvestorRow(r as Record<string, unknown>))
  const events = (evRes.data ?? []).map((r) => mapEventRow(r as Record<string, unknown>))
  const dutyCompletions = (dutyRes.data ?? []).map((r) =>
    mapDutyRow(r as Record<string, unknown>),
  )
  const dailyNotes = (notesRes.data ?? []).map((r) => mapDailyNoteRow(r as Record<string, unknown>))

  const draftRow =
    draftCurrentRes.data ??
    draftLatestRes.data ??
    null

  let weeklyUpdateDraft: WeeklyUpdateDraft
  if (draftRow) {
    const r = draftRow as Record<string, unknown>
    const w = dateOnly(String(r.week_of ?? '')) ?? weekOf
    weeklyUpdateDraft = normalizeWeeklyDraft(
      {
        weekOf: w,
        productNotes: r.product_notes,
        blockers: r.blockers,
        nextWeekPriorities: r.next_week_priorities,
      },
      weekOf,
    )
  } else {
    weeklyUpdateDraft = normalizeWeeklyDraft(undefined, weekOf)
  }

  const base = createDefaultState()
  return {
    version: 1,
    investors,
    events,
    dutyCompletions,
    dailyNotes,
    weeklyUpdateDraft,
    updatedAt: base.updatedAt,
  }
}

async function insertInChunks(table: string, rows: Record<string, unknown>[], chunkSize = 200) {
  const supabase = getSupabase()
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { error } = await supabase.from(table).insert(chunk)
    if (error) throw error
  }
}

export async function saveAppStateToSupabase(userId: string, state: AppStateV1): Promise<void> {
  const supabase = getSupabase()
  const stamped: AppStateV1 = { ...state, updatedAt: new Date().toISOString() }

  const delResults = await Promise.all([
    supabase.from('investors').delete().eq('user_id', userId),
    supabase.from('startup_events').delete().eq('user_id', userId),
    supabase.from('duty_completions').delete().eq('user_id', userId),
    supabase.from('daily_notes').delete().eq('user_id', userId),
  ])
  for (const r of delResults) {
    if (r.error) throw r.error
  }

  const investorRows: Record<string, unknown>[] = stamped.investors.map((i) => ({
    id: i.id,
    user_id: userId,
    name: i.name,
    firm: i.firm ?? null,
    role_title: i.roleTitle ?? null,
    stage: i.stage,
    warm_intro_source: i.warmIntroSource ?? null,
    last_contact_date: i.lastContactDate ?? null,
    next_follow_up_date: i.nextFollowUpDate ?? null,
    fit_score: i.fitScore ?? null,
    notes: i.notes ?? null,
    links: i.links,
    created_at: i.createdAt,
    updated_at: i.updatedAt,
  }))

  const eventRows: Record<string, unknown>[] = stamped.events.map((e) => ({
    id: e.id,
    user_id: userId,
    name: e.name,
    location: e.location ?? null,
    type: e.type,
    date: e.date,
    link: e.link ?? null,
    status: e.status,
    notes: e.notes ?? null,
    contacts_made: e.contactsMade ?? null,
    created_at: e.createdAt,
    updated_at: e.updatedAt,
  }))

  const dutyRows: Record<string, unknown>[] = stamped.dutyCompletions.map((d) => ({
    user_id: userId,
    duty_id: d.dutyId,
    period_key: d.periodKey,
    completed_at: d.completedAt,
  }))

  const noteRows: Record<string, unknown>[] = stamped.dailyNotes.map((n) => ({
    user_id: userId,
    note_date: n.date,
    body: n.text,
  }))

  await Promise.all([
    insertInChunks('investors', investorRows),
    insertInChunks('startup_events', eventRows),
    insertInChunks('duty_completions', dutyRows),
    insertInChunks('daily_notes', noteRows),
  ])

  const w = stamped.weeklyUpdateDraft
  const { error: draftErr } = await supabase.from('weekly_update_drafts').upsert(
    {
      user_id: userId,
      week_of: w.weekOf,
      product_notes: w.productNotes,
      blockers: w.blockers,
      next_week_priorities: w.nextWeekPriorities,
    },
    { onConflict: 'user_id,week_of' },
  )
  if (draftErr) throw draftErr
}
