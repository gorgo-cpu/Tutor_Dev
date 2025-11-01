import { MeshReflectorMaterial, Float, Text, Html, PivotControls, TransformControls, OrbitControls, PositionMesh, Text3D } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { MeshNormalMaterial, MeshToonMaterial } from 'three'

export default function Experience()
{
    const cube = useRef()
    const sphere = useRef()
    const cone = useRef()
    useFrame( () => {
        cube.current.rotation.y += 0.005
        cone.current.rotation.y += 0.005
    })

    return <>

        <OrbitControls makeDefault />
        <directionalLight position={ [ 1, 2, 3 ] } intensity={ 4.5 } />
        <ambientLight intensity={ 1.5 } />

        <mesh ref={ cube } position-x={ 0 } position-y={1.65} scale={ 5 } >
            <boxGeometry />
            <meshStandardMaterial color="brown" />
            
        </mesh>

        <mesh ref={ cone } position-x={ 0 } position-y={7} scale={ 5 } >
            <coneGeometry />
            <meshStandardMaterial color="brown" />
            
        </mesh>


        <mesh position-y={ - 1 } rotation-x={ - Math.PI * 0.5 } scale={ 20 }>
            <planeGeometry />
            <MeshReflectorMaterial
                resolution={ 512 }
                blur={ [ 1000, 1000 ] }
                mixBlur={ 1 }
                mirror={ 0.75 }
                color={ 'lightblue' }
            />
        </mesh>

        
            speed={ 3 }
            floatIntensity={ 2 }
        
        mesh
            <Text3D
                font="./Modak_Regular.json"
                fontSize={ 2 }
                color="red"
                position-y={ 7.5 }
                position-x={ -6}
                rotation-z={ 0.3 }
                maxWidth={ 2 }
                textAlign="center"
                bevelEnabled={ true }
                bevelThickness={ 0.03 }
                bevelSize={ 0.02 }
                bevelOffset={ 0 }
                bevelSegments={ 5 }
                height={ 0.5 }
                curveSegments={ 10 }
                letterSpacing={ 0.01 }
                lineHeight={ 1 }
                
            >
                TutoringDE
                <meshNormalMaterial />
            </Text3D>
        
    </>
}