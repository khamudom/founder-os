import type { DutyDefinition } from '@/types'

/** Period keys: daily `YYYY-MM-DD`, weekly Monday `YYYY-MM-DD`, monthly `YYYY-MM`. */
export const DUTY_DEFINITIONS: DutyDefinition[] = [
  // Daily
  {
    id: 'daily-discord',
    label: 'Checked team Discord / communication',
    frequency: 'daily',
  },
  {
    id: 'daily-messages',
    label: 'Responded to important founder/team messages',
    frequency: 'daily',
  },
  {
    id: 'daily-priority',
    label: 'Moved one product/company priority forward',
    frequency: 'daily',
  },
  {
    id: 'daily-external',
    label: 'Took one external-facing founder action',
    frequency: 'daily',
  },
  {
    id: 'daily-learning',
    label: 'Spent time learning fundraising/business/startup skills',
    frequency: 'daily',
  },
  {
    id: 'daily-energy',
    label: 'Logged energy/family capacity',
    frequency: 'daily',
  },
  // Weekly
  {
    id: 'weekly-update-post',
    label: 'Posted weekly founder update',
    frequency: 'weekly',
  },
  {
    id: 'weekly-outreach',
    label: 'Reached out to 2–5 investors/founders/advisors',
    frequency: 'weekly',
  },
  {
    id: 'weekly-public',
    label: 'Made one public-facing post or update',
    frequency: 'weekly',
  },
  {
    id: 'weekly-event',
    label: 'Attended or scheduled one founder/community event',
    frequency: 'weekly',
  },
  {
    id: 'weekly-cofounder',
    label: 'Had co-founder alignment sync',
    frequency: 'weekly',
  },
  {
    id: 'weekly-deck',
    label: 'Improved investor demo/deck/story',
    frequency: 'weekly',
  },
  // Monthly
  {
    id: 'monthly-momentum',
    label: 'Reviewed company momentum',
    frequency: 'monthly',
  },
  {
    id: 'monthly-pipeline',
    label: 'Reviewed investor pipeline',
    frequency: 'monthly',
  },
  {
    id: 'monthly-capacity',
    label: 'Reviewed personal capacity/runway',
    frequency: 'monthly',
  },
  {
    id: 'monthly-ownership',
    label: "Identified next month's ownership areas",
    frequency: 'monthly',
  },
  {
    id: 'monthly-materials',
    label: 'Updated fundraising/demo materials',
    frequency: 'monthly',
  },
]

export function dutyById(id: string): DutyDefinition | undefined {
  return DUTY_DEFINITIONS.find((d) => d.id === id)
}
