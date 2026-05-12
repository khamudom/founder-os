import { useCallback, useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { EmailPasswordAuthForm } from '@/features/auth/EmailPasswordAuthForm'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useAuth } from '@/hooks/useAuth'
import { PageLayout } from '@/layouts/PageLayout'

function safeReturnPath(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//')) {
    return '/'
  }
  if (raw === '/sign-in') {
    return '/'
  }
  return raw
}

export function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = safeReturnPath((location.state as { from?: string } | null)?.from)
  const { session, configured, signInWithPassword, signUpWithPassword, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!configured) {
      navigate('/', { replace: true })
    }
  }, [configured, navigate])

  const clearForm = useCallback(() => {
    setPassword('')
    setError(null)
  }, [])

  const onSignIn = async () => {
    setBusy(true)
    setError(null)
    const { error: err } = await signInWithPassword(email.trim(), password)
    setBusy(false)
    if (err) setError(err)
    else clearForm()
  }

  const onSignUp = async () => {
    setBusy(true)
    setError(null)
    const { error: err } = await signUpWithPassword(email.trim(), password)
    setBusy(false)
    if (err) setError(err)
    else clearForm()
  }

  const onGoogleSignIn = async () => {
    setBusy(true)
    setError(null)
    const { error: err } = await signInWithGoogle()
    if (err) {
      setBusy(false)
      setError(err)
    }
  }

  if (!configured) {
    return null
  }

  if (session) {
    return <Navigate to={from} replace />
  }

  return (
    <PageLayout title="Sign in" authShell>
      <div className="fo-stack">
        <Card padding="lg">
          <SectionHeader
            title="Cloud sync is enabled"
            description="Sign in to open your dashboard and synced data. Your session stays in this browser until you sign out."
          />
          <EmailPasswordAuthForm
            email={email}
            password={password}
            error={error}
            busy={busy}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSignIn={onSignIn}
            onSignUp={onSignUp}
            onGoogleSignIn={onGoogleSignIn}
            emailFieldId="sign-in-email"
            passwordFieldId="sign-in-password"
          />
        </Card>
      </div>
    </PageLayout>
  )
}
