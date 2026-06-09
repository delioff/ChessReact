import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from 'react-three-fiber'
import * as THREE from "three"
//import { Stats } from '@react-three/drei'
function Polyhedron({ position, polyhedron }) {
    const ref = useRef()
    const [coef, setcoef] = useState(1)
    const [count, setCount] = useState(0)

    console.log(polyhedron)

    useFrame((state, delta) => {
        ref.current.rotation.x += 0.5 * delta
        ref.current.rotation.y += 0.5 * delta
        if (ref.current.position.z > 3) {
            setcoef(-1);
        }
        if (ref.current.position.z < -10) {
            setcoef(1);
        }
        ref.current.position.z =  ref.current.position.z + coef*0.01
        })

    return (
        <mesh
            position={position}
            ref={ref}
            onPointerDown={() => {
                setCount((count + 1) % 3)
            }}
            geometry={polyhedron[count]}
        >
            <meshBasicMaterial color={'white'} wireframe/>
        </mesh>
    )
}
const Sa3d = () => {
    const polyhedron = [
        new THREE.BoxGeometry(),
        new THREE.SphereGeometry(0.785398),
        new THREE.DodecahedronGeometry(0.785398),
    ]
    return (
        <Canvas style={{height: "90vh", borderColor: "white", borderWidth: "5px", backgroundColor: "black" }}>
            <hemisphereLight position={[10, 10, 10]} skyColor={"lightBlue"} groundColor={"Brown"} />
            <Polyhedron position={[-1,-1, 0]} polyhedron={polyhedron} />
            <Polyhedron position={[-1,1, 0]} polyhedron={polyhedron} />
            <Polyhedron position={[1,-1, 0]} polyhedron={polyhedron} />
            <Polyhedron position={[1,1, 0]} polyhedron={polyhedron} />
        </Canvas>
    
  );
};

export default Sa3d;
