export type Id = string

export type ChecklistFrequency = 'daily' | 'weekly' | 'monthly'

export type DutyDefinition = {
  id: string
  label: string
  frequency: ChecklistFrequency
}

export type DutyCompletion = {
  dutyId: string
  periodKey: string
  completedAt: string
}

export type DailyNote = {
  date: string
  text: string
}

export type InvestorStage =
  | 'need_contact'
  | 'contacted'
  | 'replied'
  | 'meeting_booked'
  | 'follow_up'
  | 'passed'
  | 'interested'

export type InvestorLink = {
  label?: string
  url: string
}

export type Investor = {
  id: Id
  name: string
  firm?: string
  roleTitle?: string
  stage: InvestorStage
  warmIntroSource?: string
  lastContactDate?: string
  nextFollowUpDate?: string
  fitScore?: 1 | 2 | 3 | 4 | 5
  notes?: string
  links: InvestorLink[]
  createdAt: string
  updatedAt: string
}

export type StartupEventType =
  | 'local'
  | 'virtual'
  | 'investor_office_hours'
  | 'pitch_event'
  | 'demo_day'
  | 'founder_meetup'

export type StartupEventStatus =
  | 'interested'
  | 'registered'
  | 'attended'
  | 'followed_up'
  | 'skipped'

export type StartupEvent = {
  id: Id
  name: string
  location?: string
  type: StartupEventType
  date: string
  link?: string
  status: StartupEventStatus
  notes?: string
  contactsMade?: string
  createdAt: string
  updatedAt: string
}

export type WeeklyUpdateDraft = {
  weekOf: string
  productNotes: string
  blockers: string
  nextWeekPriorities: string[]
}

export type AppStateV1 = {
  version: 1
  investors: Investor[]
  events: StartupEvent[]
  dutyCompletions: DutyCompletion[]
  dailyNotes: DailyNote[]
  weeklyUpdateDraft: WeeklyUpdateDraft
  updatedAt: string
}

export type InvestorViewFilter =
  | 'all'
  | 'need_contact'
  | 'followups_due'
  | 'meetings_booked'
