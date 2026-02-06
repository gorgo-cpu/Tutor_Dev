import React from 'react'
import AuthForm from './AuthForm.jsx'
import { useSupabaseAuth } from './SupabaseProvider.jsx'

export default function Login({ onBack }) {
  const { user, profile, role, loading, signOut } = useSupabaseAuth() || {}

  if (loading) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <h1 className="auth-title">Loading session…</h1>
          <p className="auth-subtext">Please wait.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-shell">
      {!user && (
        <div className="auth-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="auth-title">Account</h1>
              <p className="auth-subtext">Login or sign up to access your dashboard.</p>
            </div>
            {onBack && (
              <button onClick={onBack} className="auth-link" type="button">
                Back
              </button>
            )}
          </div>
          <AuthForm initialMode="login" />
        </div>
      )}

      {user && !role && (
        <div className="auth-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="auth-title">Pending approval</h2>
            {onBack && (
              <button onClick={onBack} className="auth-link" type="button">
                Home
              </button>
            )}
          </div>
          <p className="auth-subtext">
            Your account is created, but an admin must approve your requested role before dashboards unlock.
          </p>
          <div className="auth-message info">
            <div>
              Requested role:{' '}
              <strong>{profile?.requested_role || user?.user_metadata?.requested_role || 'Unknown'}</strong>
            </div>
            <div>Email: <strong>{user.email}</strong></div>
          </div>
          <button onClick={signOut} className="auth-button" type="button">
            Logout
          </button>
        </div>
      )}

      {user && role && (
        <div className="auth-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="auth-title">You're signed in</h2>
            {onBack && (
              <button onClick={onBack} className="auth-link" type="button">
                Home
              </button>
            )}
          </div>
          <p className="auth-subtext">
            Signed in as <strong>{user.email}</strong> with role <strong>{role}</strong>.
          </p>
          <p className="auth-subtext">Use the Home menu to open your dashboard.</p>
          <button onClick={signOut} className="auth-button" type="button">
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
