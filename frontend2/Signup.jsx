import React from 'react'
import KeycloakLoginButton from './KeycloakLoginButton.jsx'

export default function Signup({ onBack }) {
	return (
		<div style={{ padding: 24 }}>
			<button onClick={onBack} style={{ marginBottom: 12 }}>
				Back to Home
			</button>
			<h1>Sign Up</h1>
			<div style={{ marginBottom: 12 }}>
				<KeycloakLoginButton />
			</div>
			<p>Placeholder signup page. Replace with your signup form.</p>
		</div>
	)
}