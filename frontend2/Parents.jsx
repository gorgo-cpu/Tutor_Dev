import React from 'react'
import KeycloakLoginButton from './KeycloakLoginButton.jsx'

export default function Parents({ onBack }) {
	return (
		<div style={{ padding: 24 }}>
			<button onClick={onBack} style={{ marginBottom: 12 }}>
				Back to Home
			</button>
			<h1>Parents Portal</h1>
			<div style={{ marginBottom: 12 }}>
				<KeycloakLoginButton />
			</div>
			<p>Placeholder content for Parents. Replace this with your Parents portal content.</p>
		</div>
	)
}