import { CameraControls, OrbitControls, Text, Float } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { useEffect, useRef } from 'react'

export default function Experience(){

    const controls = useRef ();
    const intro = async () => {
        controls.current.dolly(-22);
        controls.current.smoothTime = 0.8;
        controls.current.dolly(22, true);
    }
    useEffect(() => {
        intro();
    }, []);

    return <>

        <Perf position="top-left" />

        <CameraControls ref={controls} />

        <directionalLight position={ [ 1, 2, 3 ] } intensity={ 4.5 } />
        <ambientLight intensity={ 1.5 } />
        <Float speed={3}>
            <Text position-x={-20} position-y={9} position-z={9} color="white" font='./jersey-15-v4-latin-regular.ttf' scale={3}>

                Deutsch{'\n'}    im{'\n'}Ausland
            </Text>
        </Float>
    </>
}