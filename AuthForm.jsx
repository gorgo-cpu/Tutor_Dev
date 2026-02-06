import React, { useMemo, useState } from 'react'
import { useSupabaseAuth } from './SupabaseProvider.jsx'

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
  { value: 'teacher', label: 'Teacher' },
]

export default function AuthForm({ initialMode = 'login', initialRole = 'student' }) {
  const { signInWithPassword, signUpWithPassword, authError, loading } = useSupabaseAuth() || {}
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [requestedRole, setRequestedRole] = useState(initialRole)
  const [submitting, setSubmitting] = useState(false)
  const [info, setInfo] = useState('')

  const disabled = useMemo(() => loading || submitting, [loading, submitting])

  const onSubmit = async (e) => {
    e.preventDefault()
    setInfo('')
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await signInWithPassword(email, password)
      } else {
        const result = await signUpWithPassword(email, password, requestedRole)
        if (result?.needsEmailConfirmation) {
          setInfo(
            'Check your inbox to confirm your email. After confirming, return here and log in to access your dashboard.'
          )
        } else {
          setInfo('Account created. You can now continue.')
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-card">
      <div>
        <h2 className="auth-title">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="auth-subtext">
          {mode === 'login'
            ? 'Sign in to view your dashboard.'
            : 'Choose a role request. An admin must approve it before dashboards unlock.'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="auth-form">
        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={disabled}
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            placeholder="Enter password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            disabled={disabled}
          />
        </label>

        {mode === 'signup' && (
          <div className="auth-field">
            <span>Requested role</span>
            <select
              value={requestedRole}
              onChange={(e) => setRequestedRole(e.target.value)}
              className="auth-input"
              disabled={disabled}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <small className="auth-subtext">
              Teachers usually require verification. This value is stored as a request, not an assigned permission.
            </small>
          </div>
        )}

        {authError && <div className="auth-message error">{authError.message}</div>}
        {info && <div className="auth-message info">{info}</div>}

        <button type="submit" disabled={disabled} className="auth-button">
          {mode === 'login'
            ? submitting
              ? 'Signing in...'
              : 'Sign in'
            : submitting
            ? 'Creating...'
            : 'Create account'}
        </button>

        <div className="auth-footer">
          <span>{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}</span>
          <button
            type="button"
            onClick={() => {
              setInfo('')
              setMode(mode === 'login' ? 'signup' : 'login')
            }}
            className="auth-link"
            disabled={disabled}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  )
}
