import React, { useState, useEffect, useRef } from 'react'
import { CameraControls, OrbitControls, Text, Float, useFont, Hud, OrthographicCamera } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils } from 'three'

const MENU_ITEMS = [
    { label: "Login", action: () => console.log("Login"), target: 'login' },
    { label: "Sign Up", action: () => console.log("Sign Up"), target: 'signup' },
    { label: "Students", action: () => console.log("Students"), target: 'students' },
    { label: "Teachers", action: () => console.log("Teachers"), target: 'teachers' },
    { label: "Parents", action: () => console.log("Parents"), target: 'parents' }
]

// Preload font
useFont.preload('/jersey-15-v4-latin-regular.ttf')

function SidebarButton({ label, onClick, index, onNavigate, target }) {
    const [hovered, setHovered] = useState(false)
    const textRef = useRef()
    const targetScale = useRef(1)
    const animating = useRef(false)

    const startY = 2
    const gap = 3
    const yPos = startY - (index * gap)

    useEffect(() => {
        document.body.style.cursor = hovered ? 'pointer' : 'auto'
        return () => { document.body.style.cursor = 'auto' }
    }, [hovered])

    useFrame((state, delta) => {
        if (textRef.current) {
            const currentScale = textRef.current.scale.x
            const newScale = MathUtils.lerp(currentScale, targetScale.current, Math.min(1, 12 * delta))
            textRef.current.scale.set(newScale, newScale, newScale)
        }
    })

    const handleClick = () => {
        if (animating.current) return
        animating.current = true
        // Run the item action first
        onClick && onClick()
        // Trigger the squish
        targetScale.current = 0.8
        // After 300ms, restore and navigate
        setTimeout(() => {
            targetScale.current = 1
            animating.current = false
            onNavigate && onNavigate(target)
        }, 300)
    }

    return (
        <group position={[-1, yPos, 0]}>
            <Text
                ref={textRef}
                font='/jersey-15-v4-latin-regular.ttf'
                fontSize={3.5}
                color={hovered ? "#ff6b6b" : "black"}
                // CRITICAL: Align text to the LEFT so they stack neatly
                anchorX="left"
                anchorY="middle"
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={handleClick}
            >{label}</Text>
        </group>
    )
}

function Sidebar({ onNavigate }) {
  // 2. Get the screen dimensions
  const { viewport } = useThree()
  
  // Calculate the left edge of the screen
  // viewport.width / 2 is the edge. We add +2 padding so it's not touching the bezel.
  //const xPosition = (-viewport.width / 2) + 2

    return (
    <group position={[20, 8, 0]}>
        {MENU_ITEMS.map((item, index) => (
            <SidebarButton 
                key={item.label}
                label={item.label}
                onClick={item.action}
                onNavigate={onNavigate}
                target={item.target}
                index={index}
            />
        ))}
    </group>
  )
}

export default function Home({ onNavigate }){

    const controls = useRef ();
    
    useEffect(() => {
        const intro = async () => {
            controls.current.dolly(-22);
            controls.current.smoothTime = 0.8;
            controls.current.dolly(22, true);
        }  
        intro();
    }, []);
    
    return <> 
        

        <CameraControls 
        ref={controls}
        minPolarAngle={Math.PI / 2.5} 
        maxPolarAngle={Math.PI / 2.5}
        />
        
        <directionalLight position={ [ 1, 2, 3 ] } intensity={ 4.5 } />
        <ambientLight intensity={ 1.5 } />
            <Float speed={3}>
                <Text position-x={-24} position-y={9} position-z={9} color="black" font='./jersey-15-v4-latin-regular.ttf' scale={5}>

                    Deutsch{'\n'}    im{'\n'}Ausland
                </Text>
            </Float>
        <Sidebar onNavigate={onNavigate} />
    </>
}