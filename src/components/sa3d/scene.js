import React, { useRef,useState } from 'react'
import { useFrame } from 'react-three-fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from "three"


const Scene = () => {
    const meshRef = useRef(null)
    const lightRef = useRef(null)
    //const [hovered, setHover] = useState(false)
    //const [active, setActive] = useState(false)
    useFrame((state, delta) => {
        meshRef.current.rotation.x += delta;
        //const time = state.clock.getElapsedTime;
        //state.camera.position.x = Math.sin(time) * 5;
        //state.camera.position.z = Math.cos(time) * 5;
        //state.camera.lookAt(0, 0, 0);
    });
    return (
        <>
            <OrbitControls enableDamping makeDefault/>
            <directionalLight position={[1, 2, 3]} color={"yelow"} intensity={0.5}/>
            <mesh ref={lightRef} position-x={-2}>
                <sphereGeometry/>
                <meshStandardMaterial color={'hotpink'} />
            </mesh>
            <mesh ref={meshRef}
                position-x={2}
                rotation-x={Math.PI / 4}
                scale={1.5}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color={'orange'} />
            </mesh>
            <mesh position-y={-1.5} rotation-x={Math.PI / 2} scale={10}>
                <planeGeometry/>
                <meshBasicMaterial color={'green'} />
            </mesh>
        </>
    );
};

export default Scene;
