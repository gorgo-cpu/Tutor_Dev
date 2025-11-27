import React from 'react'
import KeycloakLoginButton from './KeycloakLoginButton.jsx'

export default function Teachers({ onBack }) {
	return (
		<div style={{ padding: 24 }}>
			<button onClick={onBack} style={{ marginBottom: 12 }}>
				Back to Home
			</button>
			<h1>Teachers Portal</h1>
			<div style={{ marginBottom: 12 }}>
				<KeycloakLoginButton />
			</div>
			<p>Placeholder content for Teachers. Replace this with your Teacher portal content.</p>
		</div>
	)
}