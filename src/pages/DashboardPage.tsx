import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { TextArea } from '@/components/ui/TextArea'
import { DUTY_DEFINITIONS } from '@/constants/duties'
import {
  getDailyNoteForToday,
  isDutyCompleted,
  setDailyNoteForToday,
  toggleDutyCompletion,
  weeklyConsistencyScore,
} from '@/features/duties/dutyLogic'
import { sortEventsByDate } from '@/features/events/selectors'
import { filterInvestors, sortInvestorsByFollowUp } from '@/features/investors/selectors'
import { useAppState } from '@/hooks/useAppState'
import { PageLayout } from '@/layouts/PageLayout'
import { compareIsoDates, todayString } from '@/utils/date'

export function DashboardPage() {
  const { state, setState } = useAppState()

  const dailyNote = getDailyNoteForToday(state)

  const dailyDefs = DUTY_DEFINITIONS.filter((d) => d.frequency === 'daily')
  const scorePct = Math.round(weeklyConsistencyScore(state) * 100)

  const followUps = sortInvestorsByFollowUp(filterInvestors(state.investors, 'followups_due')).slice(
    0,
    6,
  )

  const today = todayString()
  const upcomingEvents = sortEventsByDate(
    state.events.filter((e) => compareIsoDates(e.date, today) >= 0),
  ).slice(0, 6)

  return (
    <PageLayout title="Dashboard">
      <div className="fo-dashboard">
        <Card padding="lg">
          <SectionHeader
            title="Am I visibly carrying founder weight this week?"
            description="A calm snapshot of cadence: checklist momentum, follow-ups, and what moved the company forward."
          />
          <div className="fo-dashboard__grid">
            <Card padding="md">
              <p className="fo-dashboard__kicker">Weekly consistency</p>
              <p className="fo-dashboard__metric">{scorePct}%</p>
              <p className="fo-muted fo-dashboard__fine">
                Weekly duties completed / weekly duties total (this week).
              </p>
            </Card>

            <Card padding="md">
              <p className="fo-dashboard__kicker">Today’s founder checklist</p>
              <div className="fo-stack-sm">
                {dailyDefs.map((def) => (
                  <Checkbox
                    key={def.id}
                    label={def.label}
                    checked={isDutyCompleted(state, def.id, 'daily')}
                    onChange={() =>
                      setState((s) => toggleDutyCompletion(s, def.id, 'daily'))
                    }
                  />
                ))}
              </div>
            </Card>
          </div>
        </Card>

        <div className="fo-dashboard__grid fo-dashboard__grid--2">
          <Card padding="lg">
            <SectionHeader title="Upcoming investor follow-ups" />
            {followUps.length === 0 ? (
              <p className="fo-muted">No follow-ups due right now.</p>
            ) : (
              <ul className="fo-dashboard__list">
                {followUps.map((inv) => (
                  <li key={inv.id}>
                    <strong>{inv.name}</strong>
                    {inv.firm ? <span className="fo-muted"> — {inv.firm}</span> : null}
                    {inv.nextFollowUpDate ? (
                      <span className="fo-muted"> · Next: {inv.nextFollowUpDate}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card padding="lg">
            <SectionHeader title="Upcoming startup events" />
            {upcomingEvents.length === 0 ? (
              <p className="fo-muted">No upcoming events scheduled.</p>
            ) : (
              <ul className="fo-dashboard__list">
                {upcomingEvents.map((ev) => (
                  <li key={ev.id}>
                    <strong>{ev.name}</strong>
                    <span className="fo-muted">
                      {' '}
                      · {ev.date}
                      {ev.location ? ` · ${ev.location}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card padding="lg">
          <SectionHeader
            title="What did I do to move the company forward today?"
            description="One honest paragraph beats a polished narrative."
          />
          <TextArea
            id="daily-note"
            label="Today"
            value={dailyNote}
            rows={5}
            onChange={(e) =>
              setState((s) => setDailyNoteForToday(s, e.target.value))
            }
          />
        </Card>
      </div>

      <style>{`
        .fo-dashboard {
          display: flex;
          flex-direction: column;
          gap: var(--fo-space-6);
        }
        .fo-dashboard__grid {
          display: grid;
          gap: var(--fo-space-4);
          grid-template-columns: 1fr;
          margin-top: var(--fo-space-4);
        }
        @media (min-width: 880px) {
          .fo-dashboard__grid {
            grid-template-columns: 320px 1fr;
            align-items: start;
          }
          .fo-dashboard__grid--2 {
            grid-template-columns: 1fr 1fr;
          }
        }
        .fo-dashboard__kicker {
          margin: 0 0 var(--fo-space-2);
          font-size: var(--fo-text-sm);
          color: var(--fo-color-text-muted);
          font-weight: var(--fo-weight-medium);
        }
        .fo-dashboard__metric {
          margin: 0 0 var(--fo-space-2);
          font-size: var(--fo-text-2xl);
          letter-spacing: -0.03em;
        }
        .fo-dashboard__fine {
          margin: 0;
          font-size: var(--fo-text-sm);
        }
        .fo-dashboard__list {
          margin: 0;
          padding-left: 1.1rem;
          color: var(--fo-color-text);
        }
      `}</style>
    </PageLayout>
  )
}
