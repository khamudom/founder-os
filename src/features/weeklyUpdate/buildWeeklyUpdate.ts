import {
  completedDutyLabelsForToday,
  completedDutyLabelsForWeek,
} from '@/features/duties/dutyLogic'
import type { AppStateV1 } from '@/types'
import { isDateInWeek } from '@/utils/date'

function bullet(label: string): string {
  return `→ ${label}`
}

export function buildWeeklyUpdate(state: AppStateV1): string {
  const draft = state.weeklyUpdateDraft
  const lines: string[] = []

  lines.push(`Founder OS Update — Week of ${draft.weekOf}`)
  lines.push('')

  lines.push('Last week:')
  const weeklyDone = completedDutyLabelsForWeek(state)
  if (weeklyDone.length === 0) {
    lines.push(bullet('(no weekly checklist items checked yet)'))
  } else {
    for (const item of weeklyDone) lines.push(bullet(item))
  }

  const dailyDone = completedDutyLabelsForToday(state)
  if (dailyDone.length > 0) {
    lines.push('')
    lines.push('Today’s momentum:')
    for (const item of dailyDone) lines.push(bullet(item))
  }

  if (draft.productNotes.trim()) {
    lines.push('')
    lines.push('Notes:')
    for (const para of draft.productNotes.trim().split(/\n+/)) {
      lines.push(bullet(para))
    }
  }

  const investorsThisWeek = state.investors.filter((i) => isDateInWeek(i.lastContactDate))
  if (investorsThisWeek.length > 0) {
    lines.push('')
    lines.push('Investor / outreach touchpoints:')
    for (const inv of investorsThisWeek) {
      const bits = [inv.name, inv.firm].filter(Boolean).join(' — ')
      lines.push(bullet(bits || inv.name))
    }
  }

  const eventsThisWeek = state.events.filter((e) => isDateInWeek(e.date))
  if (eventsThisWeek.length > 0) {
    lines.push('')
    lines.push('Events:')
    for (const ev of eventsThisWeek) {
      lines.push(bullet(`${ev.name} (${ev.date})`))
    }
  }

  lines.push('')
  lines.push('This week:')
  const prios = draft.nextWeekPriorities.map((p) => p.trim()).filter(Boolean)
  if (prios.length === 0) {
    lines.push(bullet('(add priorities on the Weekly Update page)'))
  } else {
    for (const p of prios) lines.push(bullet(p))
  }

  lines.push('')
  lines.push('Blockers:')
  const block = draft.blockers.trim()
  lines.push(block ? bullet(block) : bullet('None right now'))

  lines.push('')
  return lines.join('\n').trimEnd() + '\n'
}
