import type { Investor, InvestorStage } from '@/types'
import { compareIsoDates, todayString } from '@/utils/date'

export type InvestorFilter = 'all' | 'need_contact' | 'followups_due' | 'meetings_booked'

export function filterInvestors(list: Investor[], filter: InvestorFilter): Investor[] {
  const today = todayString()

  switch (filter) {
    case 'all':
      return list
    case 'need_contact':
      return list.filter((i) => i.stage === 'need_contact')
    case 'meetings_booked':
      return list.filter((i) => i.stage === 'meeting_booked')
    case 'followups_due':
      return list.filter((i) => {
        if (i.stage === 'passed') return false
        if (!i.nextFollowUpDate) return false
        return compareIsoDates(i.nextFollowUpDate, today) <= 0
      })
    default: {
      const _x: never = filter
      return _x
    }
  }
}

export function sortInvestorsByFollowUp(list: Investor[]): Investor[] {
  return [...list].sort((a, b) => {
    const ad = a.nextFollowUpDate ?? '9999-12-31'
    const bd = b.nextFollowUpDate ?? '9999-12-31'
    return compareIsoDates(ad, bd)
  })
}

const STAGE_LABELS: Record<InvestorStage, string> = {
  need_contact: 'Need to contact',
  contacted: 'Contacted',
  replied: 'Replied',
  meeting_booked: 'Meeting booked',
  follow_up: 'Follow-up',
  passed: 'Passed',
  interested: 'Interested',
}

export function investorStageLabel(stage: InvestorStage): string {
  return STAGE_LABELS[stage]
}
