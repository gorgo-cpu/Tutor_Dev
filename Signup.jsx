import React from 'react'
import AuthForm from './AuthForm.jsx'
import { useSupabaseAuth } from './SupabaseProvider.jsx'

export default function Signup({ onBack }) {
  const { user, loading, signOut } = useSupabaseAuth() || {}

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
      <div className="auth-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtext">Sign up with email/password and request a role.</p>
          </div>
          {onBack && (
            <button onClick={onBack} className="auth-link" type="button">
              Back
            </button>
          )}
        </div>

        <AuthForm initialMode="signup" />

        {user && (
          <button onClick={signOut} className="auth-button" type="button">
            Logout
          </button>
        )}
      </div>
    </div>
  )
}
