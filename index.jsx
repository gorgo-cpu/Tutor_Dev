import React, { useEffect, useMemo, useState } from 'react'
import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import Home from './Home.jsx'
import { SupabaseProvider, useSupabaseAuth } from './SupabaseProvider.jsx'
import { StrictMode } from 'react'
import { Leva } from 'leva'
import Model from './Model.jsx'
import Students from './Students.jsx'
import Teachers from './Teachers.jsx'
import Parents from './Parents.jsx'
import Login from './Login.jsx'
import Signup from './Signup.jsx'



const root = ReactDOM.createRoot(document.querySelector('#root'))

const PAGES = {
  login: Login,
  signup: Signup,
  students: Students,
  teachers: Teachers,
  parents: Parents,
}

function AppShell() {
  const [view, setView] = useState('canvas') // 'canvas' | 'loading' | 'content'
  const [selectedContent, setSelectedContent] = useState(null)
  const [allowAutoRoute, setAllowAutoRoute] = useState(true)
  const { user, role, loading } = useSupabaseAuth() || {}

  const PageComponent = useMemo(
    () => (selectedContent ? PAGES[selectedContent] || null : null),
    [selectedContent]
  )

  const handleNavigation = (target) => {
    setAllowAutoRoute(true)
    setSelectedContent(target)
    setView('loading')
    setTimeout(() => setView('content'), 600)
  }

  const handleBackToCanvas = () => {
    setAllowAutoRoute(false)
    setSelectedContent(null)
    setView('canvas')
  }

  const pageForRole = (currentRole) => {
    if (currentRole === 'student') return 'students'
    if (currentRole === 'parent') return 'parents'
    if (currentRole === 'teacher') return 'teachers'
    return null
  }

  // Auto-land on role dashboard after login (and block dashboards if role pending)
  useEffect(() => {
    if (!allowAutoRoute) return
    if (loading) return
    if (!user) return

    if (!role) {
      if (selectedContent !== 'login') {
        setSelectedContent('login')
        setView('content')
      }
      return
    }

    const rolePage = pageForRole(role)
    const isAuthPage = selectedContent === 'login' || selectedContent === 'signup'
    const target = !selectedContent || isAuthPage ? rolePage : selectedContent

    if (target && target !== selectedContent) {
      setSelectedContent(target)
      setView('content')
    } else if (target && view !== 'content') {
      setView('content')
    }
  }, [allowAutoRoute, loading, role, selectedContent, user, view])

  return (
    <>
      <Leva collapsed />
      {view === 'canvas' && (
        <Canvas camera={{ fov: 45, near: 0.2, far: 200, position: [0, 15, 60] }}>
          <color attach="background" args={['#faecbd']} />
          <Home onNavigate={handleNavigation} />
          <Model />
        </Canvas>
      )}

      {view === 'loading' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.95)',
            zIndex: 9999,
          }}
        >
          <div style={{ fontSize: 24, color: '#333' }}>Loading...</div>
        </div>
      )}

      {view === 'content' && PageComponent && <PageComponent onBack={handleBackToCanvas} />}
    </>
  )
}

function App() {
  return (
    <StrictMode>
      <SupabaseProvider>
        <AppShell />
      </SupabaseProvider>
    </StrictMode>
  )
}

root.render(<App />)
