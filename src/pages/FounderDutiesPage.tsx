import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Tab, TabList, TabPanel, Tabs } from '@/components/ui/Tabs'
import { DUTY_DEFINITIONS } from '@/constants/duties'
import { isDutyCompleted, toggleDutyCompletion } from '@/features/duties/dutyLogic'
import { useAppState } from '@/hooks/useAppState'
import { PageLayout } from '@/layouts/PageLayout'

export function FounderDutiesPage() {
  const { state, setState } = useAppState()

  const renderGroup = (frequency: 'daily' | 'weekly' | 'monthly') => (
    <div className="fo-stack-sm">
      {DUTY_DEFINITIONS.filter((d) => d.frequency === frequency).map((def) => (
          <Checkbox
            key={def.id}
            label={def.label}
            hint={
              frequency === 'daily'
                ? 'Resets each calendar day.'
                : frequency === 'weekly'
                  ? 'Tracked per week (Monday start).'
                  : 'Tracked per calendar month.'
            }
            checked={isDutyCompleted(state, def.id, frequency)}
            onChange={() =>
              setState((s) => toggleDutyCompletion(s, def.id, frequency))
            }
          />
      ))}
    </div>
  )

  return (
    <PageLayout title="Founder duties">
      <Card padding="lg">
        <Tabs defaultSelectedId="daily">
          <TabList aria-label="Duty frequency">
            <Tab id="daily">Daily</Tab>
            <Tab id="weekly">Weekly</Tab>
            <Tab id="monthly">Monthly</Tab>
          </TabList>
          <TabPanel id="daily">{renderGroup('daily')}</TabPanel>
          <TabPanel id="weekly">{renderGroup('weekly')}</TabPanel>
          <TabPanel id="monthly">{renderGroup('monthly')}</TabPanel>
        </Tabs>
      </Card>
    </PageLayout>
  )
}
