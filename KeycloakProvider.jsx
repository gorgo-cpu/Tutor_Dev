import React, { createContext, useContext, useEffect, useState } from 'react'
import Keycloak from 'keycloak-js'

const KeycloakContext = createContext(null)

export function KeycloakProvider({ children }) {
  const [kc, setKc] = useState(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const keycloak = new Keycloak({
      url: 'http://localhost:8080',
      realm: 'tutor',
      clientId: 'frontend'
    })

    keycloak
      .init({ onLoad: 'check-sso', pkceMethod: 'S256' })
      .then((auth) => {
        setKc(keycloak)
        setAuthenticated(auth)
        if (auth) {
          keycloak.loadUserProfile().then((p) => setProfile(p))
        }
      })
      .catch((e) => console.error('KC init failed', e))
  }, [])

  const login = () => kc && kc.login()
  const logout = () => kc && kc.logout({ redirectUri: window.location.origin })

  const value = { kc, authenticated, profile, login, logout }

  return <KeycloakContext.Provider value={value}>{children}</KeycloakContext.Provider>
}

export function useKeycloak() {
  return useContext(KeycloakContext)
}

export default KeycloakContext
