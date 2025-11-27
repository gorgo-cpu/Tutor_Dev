import React from 'react'
import KeycloakLoginButton from './KeycloakLoginButton.jsx'

export default function AuthCard({ title = 'Sign In', description, children, showRegister = false, onBack }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-4 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
            >
              Back to Home
            </button>
          )}
          <h2 className="text-2xl font-semibold mb-2">{title}</h2>
          {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
          <div className="space-y-4">
            <div>
              <KeycloakLoginButton showRegister={showRegister} />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
