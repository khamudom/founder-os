import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Select } from '@/components/ui/Select'
import { TextArea } from '@/components/ui/TextArea'
import { TextField } from '@/components/ui/TextField'
import type { Investor, InvestorStage } from '@/types'
import { filterInvestors, investorStageLabel, type InvestorFilter } from '@/features/investors/selectors'
import { useAppState } from '@/hooks/useAppState'
import { PageLayout } from '@/layouts/PageLayout'

function parseLinks(raw: string): { url: string }[] {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((url) => ({ url }))
}

function emptyInvestor(): Investor {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    name: '',
    firm: '',
    roleTitle: '',
    stage: 'need_contact',
    warmIntroSource: '',
    lastContactDate: '',
    nextFollowUpDate: '',
    notes: '',
    links: [],
    createdAt: now,
    updatedAt: now,
  }
}

const STAGES: InvestorStage[] = [
  'need_contact',
  'contacted',
  'replied',
  'meeting_booked',
  'follow_up',
  'passed',
  'interested',
]

export function InvestorsPage() {
  const { state, setState } = useAppState()
  const [filter, setFilter] = useState<InvestorFilter>('all')
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Investor>(() => emptyInvestor())
  const [linksText, setLinksText] = useState('')

  const rows = useMemo(() => filterInvestors(state.investors, filter), [state.investors, filter])

  const openCreate = () => {
    const inv = emptyInvestor()
    setDraft(inv)
    setLinksText('')
    setOpen(true)
  }

  const openEdit = (inv: Investor) => {
    setDraft(inv)
    setLinksText(inv.links.map((l) => l.url).join('\n'))
    setOpen(true)
  }

  const save = () => {
    const name = draft.name.trim()
    if (!name) return

    const now = new Date().toISOString()
    const next: Investor = {
      ...draft,
      name,
      links: parseLinks(linksText),
      updatedAt: now,
    }

    setState((s) => {
      const exists = s.investors.some((i) => i.id === draft.id)
      const investors = exists
        ? s.investors.map((i) => (i.id === draft.id ? next : i))
        : [...s.investors, next]
      return { ...s, investors }
    })
    setOpen(false)
  }

  const remove = (id: string) => {
    setState((s) => ({ ...s, investors: s.investors.filter((i) => i.id !== id) }))
  }

  return (
    <PageLayout title="Investor / VC CRM">
      <Card padding="lg">
        <SectionHeader
          title="Pipeline"
          description="Lightweight relationship memory — not a CRM fantasy."
          actions={
            <Button type="button" onClick={openCreate}>
              Add investor
            </Button>
          }
        />

        <div className="fo-cluster" style={{ marginBottom: 'var(--fo-space-4)' }}>
          <Select
            id="investor-filter"
            label="View"
            value={filter}
            onChange={(e) => setFilter(e.target.value as InvestorFilter)}
          >
            <option value="all">All investors</option>
            <option value="need_contact">Need to contact</option>
            <option value="followups_due">Follow-ups due</option>
            <option value="meetings_booked">Meetings booked</option>
          </Select>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            title="No investors in this view"
            description="Add someone you’re building a relationship with — cold, warm intro, or advisor."
            action={
              <Button type="button" onClick={openCreate}>
                Add investor
              </Button>
            }
          />
        ) : (
          <ul className="fo-records">
            {rows.map((inv) => (
              <li key={inv.id} className="fo-record">
                <div className="fo-record__main">
                  <div className="fo-cluster-between">
                    <div style={{ minWidth: 0 }}>
                      <p className="fo-record__title">{inv.name}</p>
                      <p className="fo-muted fo-record__sub">
                        {[inv.firm, inv.roleTitle].filter(Boolean).join(' · ') || '—'}
                      </p>
                    </div>
                    <Badge tone="neutral">{investorStageLabel(inv.stage)}</Badge>
                  </div>
                  <div className="fo-muted fo-record__meta">
                    {inv.nextFollowUpDate ? <>Next follow-up: {inv.nextFollowUpDate}</> : <>No next follow-up date</>}
                    {inv.fitScore ? <> · Fit: {inv.fitScore}/5</> : null}
                  </div>
                  <div className="fo-record__actions">
                    <Button type="button" variant="secondary" size="sm" onClick={() => openEdit(inv)}>
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Remove ${inv.name} from your CRM?`)) remove(inv.id)
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={state.investors.some((i) => i.id === draft.id) ? 'Edit investor' : 'New investor'}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={save}>
              Save
            </Button>
          </>
        }
      >
        <div className="fo-stack-sm">
          <TextField
            id="inv-name"
            label="Name"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            autoComplete="off"
          />
          <TextField
            id="inv-firm"
            label="Firm"
            value={draft.firm ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, firm: e.target.value }))}
          />
          <TextField
            id="inv-role"
            label="Role / title"
            value={draft.roleTitle ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, roleTitle: e.target.value }))}
          />
          <Select
            id="inv-stage"
            label="Stage"
            value={draft.stage}
            onChange={(e) => setDraft((d) => ({ ...d, stage: e.target.value as InvestorStage }))}
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {investorStageLabel(s)}
              </option>
            ))}
          </Select>
          <TextField
            id="inv-intro"
            label="Warm intro source"
            value={draft.warmIntroSource ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, warmIntroSource: e.target.value }))}
          />
          <div className="fo-cluster" style={{ gap: 'var(--fo-space-4)', alignItems: 'stretch' }}>
            <div style={{ flex: '1 1 220px' }}>
              <TextField
                id="inv-last"
                label="Last contact"
                type="date"
                value={draft.lastContactDate ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, lastContactDate: e.target.value }))}
              />
            </div>
            <div style={{ flex: '1 1 220px' }}>
              <TextField
                id="inv-next"
                label="Next follow-up"
                type="date"
                value={draft.nextFollowUpDate ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, nextFollowUpDate: e.target.value }))}
              />
            </div>
          </div>
          <Select
            id="inv-fit"
            label="Fit score"
            value={draft.fitScore ? String(draft.fitScore) : ''}
            onChange={(e) => {
              const v = e.target.value
              setDraft((d) => ({
                ...d,
                fitScore: v === '' ? undefined : (Number(v) as 1 | 2 | 3 | 4 | 5),
              }))
            }}
          >
            <option value="">—</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </Select>
          <TextArea
            id="inv-notes"
            label="Notes"
            value={draft.notes ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
            rows={4}
          />
          <TextArea
            id="inv-links"
            label="Links"
            hint="One URL per line."
            value={linksText}
            onChange={(e) => setLinksText(e.target.value)}
            rows={3}
          />
        </div>
      </Modal>

      <style>{`
        .fo-records {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: var(--fo-space-3);
        }
        .fo-record {
          border: 1px solid var(--fo-color-border);
          border-radius: var(--fo-radius-lg);
          background: var(--fo-color-surface-raised);
          padding: var(--fo-space-4);
        }
        .fo-record__title {
          margin: 0;
          font-weight: var(--fo-weight-semibold);
        }
        .fo-record__sub {
          margin: var(--fo-space-1) 0 0;
          font-size: var(--fo-text-sm);
        }
        .fo-record__meta {
          margin-top: var(--fo-space-3);
          font-size: var(--fo-text-sm);
        }
        .fo-record__actions {
          margin-top: var(--fo-space-3);
          display: flex;
          gap: var(--fo-space-2);
          flex-wrap: wrap;
        }
      `}</style>
    </PageLayout>
  )
}
