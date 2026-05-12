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
import {
  eventStatusLabel,
  eventTypeLabel,
  sortEventsByDate,
} from '@/features/events/selectors'
import { useAppState } from '@/hooks/useAppState'
import { PageLayout } from '@/layouts/PageLayout'
import type { StartupEvent, StartupEventStatus, StartupEventType } from '@/types'

function emptyEvent(): StartupEvent {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    name: '',
    location: '',
    type: 'founder_meetup',
    date: '',
    link: '',
    status: 'interested',
    notes: '',
    contactsMade: '',
    createdAt: now,
    updatedAt: now,
  }
}

const TYPES: StartupEventType[] = [
  'local',
  'virtual',
  'investor_office_hours',
  'pitch_event',
  'demo_day',
  'founder_meetup',
]

const STATUSES: StartupEventStatus[] = [
  'interested',
  'registered',
  'attended',
  'followed_up',
  'skipped',
]

export function EventsPage() {
  const { state, setState } = useAppState()
  const [typeFilter, setTypeFilter] = useState<'all' | StartupEventType>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | StartupEventStatus>('all')
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<StartupEvent>(() => emptyEvent())

  const rows = useMemo(() => {
    let list = state.events
    if (typeFilter !== 'all') list = list.filter((e) => e.type === typeFilter)
    if (statusFilter !== 'all') list = list.filter((e) => e.status === statusFilter)
    return sortEventsByDate(list)
  }, [state.events, statusFilter, typeFilter])

  const openCreate = () => {
    setDraft(emptyEvent())
    setOpen(true)
  }

  const openEdit = (ev: StartupEvent) => {
    setDraft(ev)
    setOpen(true)
  }

  const save = () => {
    const name = draft.name.trim()
    if (!name || !draft.date.trim()) return

    const now = new Date().toISOString()
    const next: StartupEvent = {
      ...draft,
      name,
      updatedAt: now,
    }

    setState((s) => {
      const exists = s.events.some((e) => e.id === draft.id)
      const events = exists ? s.events.map((e) => (e.id === draft.id ? next : e)) : [...s.events, next]
      return { ...s, events }
    })
    setOpen(false)
  }

  const remove = (id: string) => {
    setState((s) => ({ ...s, events: s.events.filter((e) => e.id !== id) }))
  }

  return (
    <PageLayout title="Startup events">
      <Card padding="lg">
        <SectionHeader
          title="Community radar"
          description="Keep momentum visible — demos, meetups, office hours."
          actions={
            <Button type="button" onClick={openCreate}>
              Add event
            </Button>
          }
        />

        <div className="fo-events-filters">
          <Select
            id="event-type-filter"
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | StartupEventType)}
          >
            <option value="all">All types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {eventTypeLabel(t)}
              </option>
            ))}
          </Select>
          <Select
            id="event-status-filter"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | StartupEventStatus)}
          >
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {eventStatusLabel(s)}
              </option>
            ))}
          </Select>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            title="No events match"
            description="Try widening filters — or add something you’re considering."
            action={
              <Button type="button" onClick={openCreate}>
                Add event
              </Button>
            }
          />
        ) : (
          <ul className="fo-records">
            {rows.map((ev) => (
              <li key={ev.id} className="fo-record">
                <div className="fo-cluster-between">
                  <div style={{ minWidth: 0 }}>
                    <p className="fo-record__title">{ev.name}</p>
                    <p className="fo-muted fo-record__sub">
                      {ev.date}
                      {ev.location ? ` · ${ev.location}` : ''}
                    </p>
                  </div>
                  <div className="fo-cluster" style={{ flex: '0 0 auto' }}>
                    <Badge tone="info">{eventTypeLabel(ev.type)}</Badge>
                    <Badge tone="neutral">{eventStatusLabel(ev.status)}</Badge>
                  </div>
                </div>
                <div className="fo-record__actions">
                  <Button type="button" variant="secondary" size="sm" onClick={() => openEdit(ev)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Remove ${ev.name}?`)) remove(ev.id)
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={state.events.some((e) => e.id === draft.id) ? 'Edit event' : 'New event'}
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
            id="ev-name"
            label="Event name"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          />
          <TextField
            id="ev-location"
            label="Location"
            value={draft.location ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
          />
          <Select
            id="ev-type"
            label="Type"
            value={draft.type}
            onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as StartupEventType }))}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {eventTypeLabel(t)}
              </option>
            ))}
          </Select>
          <TextField
            id="ev-date"
            label="Date"
            type="date"
            value={draft.date}
            onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
          />
          <TextField
            id="ev-link"
            label="Link"
            value={draft.link ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, link: e.target.value }))}
            hint="Calendar invite, RSVP page, or notes doc."
          />
          <Select
            id="ev-status"
            label="Status"
            value={draft.status}
            onChange={(e) =>
              setDraft((d) => ({ ...d, status: e.target.value as StartupEventStatus }))
            }
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {eventStatusLabel(s)}
              </option>
            ))}
          </Select>
          <TextArea
            id="ev-notes"
            label="Notes"
            value={draft.notes ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
            rows={3}
          />
          <TextArea
            id="ev-contacts"
            label="Contacts made"
            value={draft.contactsMade ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, contactsMade: e.target.value }))}
            rows={3}
          />
        </div>
      </Modal>

      <style>{`
        .fo-events-filters {
          display: grid;
          gap: var(--fo-space-4);
          grid-template-columns: 1fr;
          margin-bottom: var(--fo-space-4);
        }
        @media (min-width: 720px) {
          .fo-events-filters {
            grid-template-columns: 1fr 1fr;
          }
        }
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
