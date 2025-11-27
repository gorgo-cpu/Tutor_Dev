import React from 'react'
import KeycloakLoginButton from './KeycloakLoginButton.jsx'
import AuthCard from './AuthCard.jsx'

export default function Teachers({ onBack }) {
	return (
		<AuthCard title="Teachers Portal" description="Manage teachers' data and schedules" onBack={onBack}>
			<div className="mb-2">
				<KeycloakLoginButton />
			</div>
			<p className="text-sm text-gray-700">Placeholder content for Teachers. Replace this with your Teacher portal content.</p>
		</AuthCard>
	)
}