import React from 'react'
import KeycloakLoginButton from './KeycloakLoginButton.jsx'
import AuthCard from './AuthCard.jsx'

export default function Signup({ onBack }) {
	return (
		<AuthCard title="Sign Up" description="Create an account via the Keycloak identity provider" onBack={onBack} showRegister={true}>
			<p className="text-sm text-gray-600">Use the Keycloak registration flow to create a new account.</p>
		</AuthCard>
	)
}