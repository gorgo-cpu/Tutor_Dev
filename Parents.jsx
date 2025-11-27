import React from 'react'
import KeycloakLoginButton from './KeycloakLoginButton.jsx'
import AuthCard from './AuthCard.jsx'

export default function Parents({ onBack }) {
	return (
		<AuthCard title="Parents Portal" description="Access parent resources and manage contacts." onBack={onBack}>
			<div className="mb-2">
				<KeycloakLoginButton />
			</div>
			<p className="text-sm text-gray-700">Placeholder content for Parents. Replace this with your Parents portal content.</p>
		</AuthCard>
	)
}