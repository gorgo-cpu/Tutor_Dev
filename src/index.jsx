import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import Experience from './Experience.jsx'
import Model from './Model.jsx'
import * as THREE from 'three'
import Background from 'three/src/renderers/common/Background.js'
const root = ReactDOM.createRoot(document.querySelector('#root'))

root.render(
    <Canvas
        gl={ {
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            outputColorSpace: THREE.SRGBColorSpace,
            aplpha: false,
        } }
        camera={ {
            fov: 55,
            near: 0.1,
            far: 200,
            position: [ 9, 12, 38 ]
        } }
        
                
    >
        <color attach="background" args={['#d68b36']} />
        <Experience />
        <Model />
    </Canvas>
)