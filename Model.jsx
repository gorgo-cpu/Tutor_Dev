import { useLoader } from "@react-three/fiber";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

export default function Model() {
    const fbx = useLoader(FBXLoader, './School.fbx');
    return <primitive object={fbx} scale={0.01} position-y={0} position-x={6} />
}