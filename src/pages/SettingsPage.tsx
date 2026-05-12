import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { EmailPasswordAuthForm } from '@/features/auth/EmailPasswordAuthForm'
import { useAppState } from '@/hooks/useAppState'
import { useAuth } from '@/hooks/useAuth'
import { PageLayout } from '@/layouts/PageLayout'

export function SettingsPage() {
  const { flushPersist } = useAppState()
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
      </div>

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
