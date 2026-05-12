import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { TextArea } from '@/components/ui/TextArea'
import { TextField } from '@/components/ui/TextField'
import { Toast } from '@/components/ui/Toast'
import { buildWeeklyUpdate } from '@/features/weeklyUpdate/buildWeeklyUpdate'
import { useAppState } from '@/hooks/useAppState'
import { PageLayout } from '@/layouts/PageLayout'
import { copyToClipboard } from '@/utils/text'
import { getWeeklyPeriodKey } from '@/utils/date'

export function WeeklyUpdatePage() {
  const { state, setState } = useAppState()
  const [toast, setToast] = useState<string | null>(null)

  const draft = state.weeklyUpdateDraft

  const preview = useMemo(() => buildWeeklyUpdate(state), [state])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(t)
  }, [toast])

  const setDraftField = (patch: Partial<typeof draft>) => {
    setState((s) => ({
      ...s,
      weeklyUpdateDraft: { ...s.weeklyUpdateDraft, ...patch },
    }))
  }

  const setPriority = (idx: number, value: string) => {
    const next = [...draft.nextWeekPriorities]
    next[idx] = value
    while (next.length < 3) next.push('')
    setDraftField({ nextWeekPriorities: next })
  }

  const downloadTxt = () => {
    const blob = new Blob([preview], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `founder-os-weekly-${draft.weekOf}.txt`
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const onCopy = async () => {
    const ok = await copyToClipboard(preview)
    setToast(ok ? 'Copied to clipboard' : 'Copy failed — select text manually')
  }

  return (
    <PageLayout title="Weekly update generator">
      <div className="fo-stack">
        <Card padding="lg">
          <SectionHeader
            title="Draft inputs"
            description="Keep it concrete. This feeds a Discord-ready update — conversational, not corporate."
          />

          <div className="fo-stack-sm">
            <TextField
              id="wu-week"
              label="Week of"
              type="date"
              value={draft.weekOf}
              onChange={(e) => setDraftField({ weekOf: e.target.value })}
              hint="Defaults to the current week anchor you set here."
            />

            <TextArea
              id="wu-notes"
              label="Product / company notes"
              value={draft.productNotes}
              onChange={(e) => setDraftField({ productNotes: e.target.value })}
              rows={5}
            />

            <TextArea
              id="wu-blockers"
              label="Blockers"
              value={draft.blockers}
              onChange={(e) => setDraftField({ blockers: e.target.value })}
              rows={3}
            />

            <div className="fo-stack-sm">
              <p className="fo-muted" style={{ margin: 0, fontSize: 'var(--fo-text-sm)' }}>
                Next week priorities
              </p>
              {[0, 1, 2].map((idx) => (
                <TextField
                  key={idx}
                  id={`wu-p-${idx}`}
                  label={`Priority ${idx + 1}`}
                  value={draft.nextWeekPriorities[idx] ?? ''}
                  onChange={(e) => setPriority(idx, e.target.value)}
                />
              ))}
            </div>

            <div className="fo-cluster">
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setDraftField({
                    weekOf: getWeeklyPeriodKey(),
                  })
                }
              >
                Align week to this Monday
              </Button>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <SectionHeader
            title="Preview"
            actions={
              <div className="fo-cluster">
                <Button type="button" variant="secondary" onClick={onCopy}>
                  Copy
                </Button>
                <Button type="button" variant="ghost" onClick={downloadTxt}>
                  Download .txt
                </Button>
              </div>
            }
          />
          <pre className="fo-preview">{preview}</pre>
        </Card>
      </div>

      {toast ? <Toast message={toast} /> : null}

      <style>{`
        .fo-preview {
          margin: 0;
          padding: var(--fo-space-4);
          border-radius: var(--fo-radius-md);
          border: 1px solid var(--fo-color-border);
          background: rgb(28 27 25 / 0.03);
          font-family: var(--fo-font-mono);
          font-size: var(--fo-text-sm);
          line-height: var(--fo-leading-relaxed);
          white-space: pre-wrap;
          overflow: auto;
        }
      `}</style>
    </PageLayout>
  )
}
