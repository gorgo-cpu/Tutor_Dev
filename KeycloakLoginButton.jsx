import React from 'react'
import { useKeycloak } from './KeycloakProvider.jsx'

export default function KeycloakLoginButton({ style, showRegister = false }) {
  const { kc, authenticated, profile, login, logout } = useKeycloak() || {}

  return (
    <div style={style} className="flex items-center gap-3">
      {!authenticated ? (
        <>
          <button
            onClick={login}
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Login with Keycloak
          </button>
          {showRegister && kc && (
            <button
              onClick={() => kc.register()}
              className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm"
            >
              Sign up
            </button>
          )}
        </>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-sm">Welcome, <strong className="text-indigo-600">{profile?.firstName || profile?.username}</strong></span>
          <button
            onClick={logout}
            className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
