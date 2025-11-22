import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import Experience from './Experience.jsx'
import { StrictMode } from 'react'
import { Leva } from 'leva'
import  Model  from './Model.jsx'

const root = ReactDOM.createRoot(document.querySelector('#root'))

root.render(
    <StrictMode>
        <Leva collapsed />
        <Canvas
            camera={ {
                fov: 45,
                near: 0.2,
                far: 200,
                position: [ - 18, 22, 50 ]
            } }
        >
            <color attach="background" args={['#2a3284']} />
            <Model />
            <Experience />
            
        </Canvas>
    </StrictMode>
)