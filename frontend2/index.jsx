import React, { useState } from 'react'
import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import Home from './Home.jsx'
import { KeycloakProvider } from './KeycloakProvider.jsx'
import { StrictMode } from 'react'
import { Leva } from 'leva'
import  Model  from './Model.jsx'
import Students from './Students.jsx'
import Teachers from './Teachers.jsx'
import Parents from './Parents.jsx'
import Login from './Login.jsx'
import Signup from './Signup.jsx'

const root = ReactDOM.createRoot(document.querySelector('#root'))

function App(){
    const [view, setView] = useState('canvas') // 'canvas' | 'loading' | 'content'
    const [selectedContent, setSelectedContent] = useState(null)

    const pages = {
        login: Login,
        signup: Signup,
        students: Students,
        teachers: Teachers,
        parents: Parents
    }

    const handleNavigation = (target) => {
        // switch to loading overlay and after 2s show content view
        setSelectedContent(target)
        setView('loading')
        setTimeout(() => setView('content'), 2000)
    }

    const handleBackToCanvas = () => {
        setSelectedContent(null)
        setView('canvas')
    }

    const PageComponent = selectedContent ? (pages[selectedContent] || null) : null


    return (
            <StrictMode>
                <KeycloakProvider>
            <Leva collapsed />
            {view === 'canvas' && (
                <Canvas
                    camera={{ fov: 45, near: 0.2, far: 200, position: [-18, 22, 50] }}
                >
                    <color attach="background" args={['#faecbd']} />
                    <Home onNavigate={handleNavigation} />
                    <Model />
                </Canvas>
            )}

            {view === 'loading' && (
                <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.95)', zIndex: 9999 }}>
                    <div style={{ fontSize: 24, color: '#333' }}>Loading...</div>
                </div>
            )}

            {view === 'content' && PageComponent && (
                <PageComponent onBack={handleBackToCanvas} />
            )}
            </KeycloakProvider>
        </StrictMode>
    )
}

root.render(<App />)