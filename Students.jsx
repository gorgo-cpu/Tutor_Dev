import React from 'react'
import KeycloakLoginButton from './KeycloakLoginButton.jsx'
import AuthCard from './AuthCard.jsx'

export default function Students({ onBack }) {
	return (
		<AuthCard title="Students Portal" description="Manage student data and access protected resources" onBack={onBack}>
			<div className="mb-2">
				<KeycloakLoginButton />
			</div>
			<p className="text-sm text-gray-700">Placeholder content for Students. Replace this with your Student portal content.</p>
		</AuthCard>
	)
}