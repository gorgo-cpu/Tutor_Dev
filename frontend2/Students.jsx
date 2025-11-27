import React from 'react'
import KeycloakLoginButton from './KeycloakLoginButton.jsx'

export default function Students({ onBack }) {
	return (
		<div style={{ padding: 24 }}>
			<button onClick={onBack} style={{ marginBottom: 12 }}>
				Back to Home
			</button>
			<h1>Students Portal</h1>
			<div style={{ marginBottom: 12 }}>
				<KeycloakLoginButton />
			</div>
			<p>Placeholder content for Students. Replace this with your Student portal content.</p>
		</div>
	)
}