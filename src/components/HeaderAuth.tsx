import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmailPasswordAuthForm } from '@/features/auth/EmailPasswordAuthForm'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useAppState } from '@/hooks/useAppState'
import { useAuth } from '@/hooks/useAuth'

function truncateEmail(email: string, max = 28): string {
  if (email.length <= max) return email
  return `${email.slice(0, max - 1)}…`
}

export function HeaderAuth() {
  const navigate = useNavigate()
  const { flushPersist } = useAppState()
  const {
    session,
    configured,
    signInWithPassword,
    signUpWithPassword,
    signInWithGoogle,
    signOut,
  } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const resetForm = useCallback(() => {
    setPassword('')
    setError(null)
  }, [])

  const handleClose = useCallback(() => {
    setModalOpen(false)
    resetForm()
  }, [resetForm])

  const onSignIn = async () => {
    setBusy(true)
    setError(null)
    const { error: err } = await signInWithPassword(email.trim(), password)
    setBusy(false)
    if (err) setError(err)
    else {
      resetForm()
      setModalOpen(false)
    }
  }

  const onSignUp = async () => {
    setBusy(true)
    setError(null)
    const { error: err } = await signUpWithPassword(email.trim(), password)
    setBusy(false)
    if (err) setError(err)
    else resetForm()
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

  const onSignOut = async () => {
    setBusy(true)
    try {
      await flushPersist()
      await signOut()
    } finally {
      setBusy(false)
    }
  }

  if (!configured) {
    return (
      <span className="fo-header-auth fo-header-auth--muted" title="Add Supabase env vars to enable cloud sync">
        Local only
      </span>
    )
  }

  if (session) {
    const label = session.user.email ?? session.user.id
    return (
      <div className="fo-header-auth fo-header-auth--signed-in">
        <span className="fo-header-auth__email" title={label}>
          {truncateEmail(label)}
        </span>
        <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={onSignOut}>
          Sign out
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={() => setModalOpen(true)}>
        Sign in
      </Button>
      <Modal
        open={modalOpen}
        onClose={handleClose}
        title="Sign in"
        footer={
          <>
            <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                handleClose()
                navigate('/settings')
              }}
            >
              Account & backup
            </Button>
          </>
        }
      >
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
          emailFieldId="header-auth-email"
          passwordFieldId="header-auth-password"
        />
      </Modal>
    </>
  )
}
