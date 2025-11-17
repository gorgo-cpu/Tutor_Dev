import { MeshReflectorMaterial, Float, Text, Html, PivotControls, TransformControls, OrbitControls, PositionMesh, Text3D } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { MeshNormalMaterial, MeshToonMaterial } from 'three'

export default function Experience(){
    return <>

        <OrbitControls makeDefault />
        <directionalLight position={ [ 1, 2, 3 ] } intensity={ 4.5 } />
        <ambientLight intensity={ 1.5 } />

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
        
            <Text3D
                font="./Jersey15.json"
                fontSize={ 5 }
                color="orange"
                position-y={15}
                position-x={ -11}
                rotation-z={ 0 }
                maxWidth={ 1 }
                textAlign="left"
                height={ 0.3 }
                curveSegments={ 5 }
                letterSpacing={ 0.001 }
                lineHeight={ 2 }
                
            >
                Deutsch Im Ausland
                <meshNormalMaterial />
            </Text3D>
        
    </>
}