import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { EmailPasswordAuthForm } from '@/features/auth/EmailPasswordAuthForm'
import { downloadJsonFile, parseImportedAppState, serializeAppState } from '@/storage/exportImport'
import { useAppState } from '@/hooks/useAppState'
import { useAuth } from '@/hooks/useAuth'
import { PageLayout } from '@/layouts/PageLayout'

export function SettingsPage() {
  const { state, replaceState, flushPersist } = useAppState()
  const {
    session,
    configured,
    signInWithPassword,
    signUpWithPassword,
    signInWithGoogle,
    signOut,
  } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authBusy, setAuthBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingJson, setPendingJson] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  const onExport = () => {
    const stamp = new Date().toISOString().slice(0, 10)
    downloadJsonFile(`founder-os-backup-${stamp}.json`, serializeAppState(state))
  }

  const onPickImport = () => fileRef.current?.click()

  const onFile = async (file: File | undefined) => {
    if (!file) return
    const text = await file.text()
    setPendingJson(text)
    setImportOpen(true)
    if (fileRef.current) fileRef.current.value = ''
  }

  const confirmImport = () => {
    if (!pendingJson) return
    const parsed = parseImportedAppState(pendingJson)
    setImportOpen(false)
    setPendingJson(null)
    if (!parsed) {
      alert('That file doesn’t look like a valid Founder OS backup.')
      return
    }
    replaceState(parsed)
  }

  const clearAuthForm = () => {
    setPassword('')
    setAuthError(null)
  }

  const onSignIn = async () => {
    setAuthBusy(true)
    setAuthError(null)
    const { error } = await signInWithPassword(email.trim(), password)
    setAuthBusy(false)
    if (error) setAuthError(error)
    else clearAuthForm()
  }

  const onSignUp = async () => {
    setAuthBusy(true)
    setAuthError(null)
    const { error } = await signUpWithPassword(email.trim(), password)
    setAuthBusy(false)
    if (error) setAuthError(error)
    else clearAuthForm()
  }

  const onGoogleSignIn = async () => {
    setAuthBusy(true)
    setAuthError(null)
    const { error } = await signInWithGoogle()
    if (error) {
      setAuthBusy(false)
      setAuthError(error)
    }
  }

  const onSignOut = async () => {
    setAuthBusy(true)
    setAuthError(null)
    try {
      await flushPersist()
      await signOut()
    } finally {
      setAuthBusy(false)
    }
  }

  return (
    <PageLayout title="Settings">
      <div className="fo-stack">
        <Card padding="lg">
          <SectionHeader
            title="Account"
            description="Sign in with Google or email. Your data is stored in Supabase; row-level security ties each row to your user id."
          />
          {!configured ? (
            <div className="fo-prose fo-muted">
              <p style={{ marginTop: 0 }}>
                Add <code className="fo-code">VITE_SUPABASE_URL</code> and{' '}
                <code className="fo-code">VITE_SUPABASE_ANON_KEY</code> to your environment, restart the dev
                server, then reload this page.
              </p>
            </div>
          ) : session ? (
            <div className="fo-settings-auth fo-stack fo-stack--sm">
              <p className="fo-muted" style={{ margin: 0 }}>
                Signed in as <strong>{session.user.email ?? session.user.id}</strong>
              </p>
              <div className="fo-cluster">
                <Button type="button" variant="secondary" disabled={authBusy} onClick={onSignOut}>
                  Sign out
                </Button>
              </div>
            </div>
          ) : (
            <EmailPasswordAuthForm
              email={email}
              password={password}
              error={authError}
              busy={authBusy}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onSignIn={onSignIn}
              onSignUp={onSignUp}
              onGoogleSignIn={onGoogleSignIn}
            />
          )}
        </Card>

        <Card padding="lg">
          <SectionHeader title="Data & privacy" />
          <div className="fo-prose fo-muted">
            <p>
              Founder OS loads and saves your workspace in <strong>Supabase</strong> when you are signed in. Sign in is
              required for cloud-backed pages (dashboard, investors, etc.) when Supabase is configured.
            </p>
            <p>
              Deploying on Vercel? Consider enabling{' '}
              <a href="https://vercel.com/docs/security/deployment-protection" target="_blank" rel="noreferrer">
                Deployment Protection
              </a>{' '}
              if you want a simple access gate (availability varies by plan).
            </p>
            <p>Exported JSON files contain your notes and CRM — treat them like secrets.</p>
          </div>
        </Card>

        <Card padding="lg">
          <SectionHeader
            title="Backup"
            description="Plain JSON export/import. Import replaces your current workspace and writes to Supabase when you are signed in."
          />
          <div className="fo-cluster">
            <Button type="button" onClick={onExport}>
              Export backup
            </Button>
            <Button type="button" variant="secondary" onClick={onPickImport}>
              Import backup…
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="fo-sr-only"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>
        </Card>
      </div>

      <Modal
        open={importOpen}
        onClose={() => {
          setImportOpen(false)
          setPendingJson(null)
        }}
        title="Replace workspace data?"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setImportOpen(false)
                setPendingJson(null)
              }}
            >
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={confirmImport}>
              Replace data
            </Button>
          </>
        }
      >
        <p style={{ marginTop: 0 }}>
          This will overwrite your current workspace in this session and, if you are signed in, in Supabase. Export a
          backup first if you might need to undo.
        </p>
      </Modal>

      <style>{`
        .fo-prose p {
          margin: 0 0 var(--fo-space-3);
          font-size: var(--fo-text-sm);
          line-height: var(--fo-leading-relaxed);
          max-width: 72ch;
        }
        .fo-code {
          font-family: ui-monospace, monospace;
          font-size: 0.9em;
        }
        .fo-stack--sm {
          gap: var(--fo-space-2);
        }
      `}</style>
    </PageLayout>
  )
}
