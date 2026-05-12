import type { StartupEvent, StartupEventStatus, StartupEventType } from '@/types'
import { compareIsoDates } from '@/utils/date'

export function sortEventsByDate(events: StartupEvent[]): StartupEvent[] {
  return [...events].sort((a, b) => compareIsoDates(a.date, b.date))
}

const TYPE_LABELS: Record<StartupEventType, string> = {
  local: 'Local',
  virtual: 'Virtual',
  investor_office_hours: 'Investor office hours',
  pitch_event: 'Pitch event',
  demo_day: 'Demo day',
  founder_meetup: 'Founder meetup',
}

const STATUS_LABELS: Record<StartupEventStatus, string> = {
  interested: 'Interested',
  registered: 'Registered',
  attended: 'Attended',
  followed_up: 'Followed up',
  skipped: 'Skipped',
}

export function eventTypeLabel(t: StartupEventType): string {
  return TYPE_LABELS[t]
}

export function eventStatusLabel(s: StartupEventStatus): string {
  return STATUS_LABELS[s]
}
