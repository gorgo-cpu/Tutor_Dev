import React, { useEffect, useState } from 'react'
import { useKeycloak } from './KeycloakProvider.jsx'
import KeycloakLoginButton from './KeycloakLoginButton.jsx'
import AuthCard from './AuthCard.jsx'

export default function Login({ onBack }) {
	const { kc, authenticated, profile } = useKeycloak() || {}
	const [students, setStudents] = useState([])
	const callStudents = async () => {
		if (!kc || !kc.token) return alert('Not authenticated')
		try {
			const resp = await fetch('http://localhost:4000/students', {
				headers: {
					Authorization: `Bearer ${kc.token}`
				}
			})
			if (!resp.ok) throw new Error(await resp.text())
			const data = await resp.json()
			setStudents(data)
		} catch (err) {
			console.error('API error', err)
			alert('API call failed: ' + err.message)
		}
	}

	return (
		<AuthCard title="Login Demo" description="Use Keycloak to authenticate and call protected endpoints." onBack={onBack}>
			<div className="mt-2">
				<button
					onClick={callStudents}
					className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300"
					disabled={!kc || !kc.token}
				>
					Call GET /students (protected)
				</button>
			</div>
			<pre className="mt-4 bg-gray-100 p-3 rounded text-sm">{JSON.stringify(students, null, 2)}</pre>
		</AuthCard>
	)
}