import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import './EmailPasswordAuthForm.css'

function GoogleMark() {
  return (
    <svg className="fo-auth-google-mark" width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.283 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.267 0-9.623-3.634-11.337-8.535l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.099 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  )
}

export type EmailPasswordAuthFormProps = {
  email: string
  password: string
  error: string | null
  busy: boolean
  onEmailChange: (email: string) => void
  onPasswordChange: (password: string) => void
  onSignIn: () => void
  onSignUp: () => void
  /** When set, shows “Continue with Google” above the email fields. */
  onGoogleSignIn?: () => void | Promise<void>
  emailFieldId?: string
  passwordFieldId?: string
}

export function EmailPasswordAuthForm({
  email,
  password,
  error,
  busy,
  onEmailChange,
  onPasswordChange,
  onSignIn,
  onSignUp,
  onGoogleSignIn,
  emailFieldId = 'auth-email',
  passwordFieldId = 'auth-password',
}: EmailPasswordAuthFormProps) {
  return (
    <div className="fo-auth-email-password fo-stack">
      {onGoogleSignIn ? (
        <>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            disabled={busy}
            onClick={() => void onGoogleSignIn()}
            className="fo-auth-google-btn"
          >
            <GoogleMark />
            Continue with Google
          </Button>
          <div className="fo-auth-divider" role="separator">
            <span>or</span>
          </div>
        </>
      ) : null}
      <TextField
        id={emailFieldId}
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        disabled={busy}
      />
      <TextField
        id={passwordFieldId}
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        disabled={busy}
      />
      {error ? (
        <p className="fo-field__error" role="alert" style={{ margin: 0 }}>
          {error}
        </p>
      ) : null}
      <div className="fo-cluster">
        <Button type="button" disabled={busy} onClick={onSignIn}>
          Sign in
        </Button>
        <Button type="button" variant="secondary" disabled={busy} onClick={onSignUp}>
          Create account
        </Button>
      </div>
      <p className="fo-muted" style={{ margin: 0, fontSize: 'var(--fo-text-sm)' }}>
        If your project requires email confirmation, finish that step in your inbox before signing in.
      </p>
    </div>
  )
}
