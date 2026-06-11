import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from 'react-three-fiber'
import { useControls } from 'leva' 
import * as THREE from "three"
//import { Stats } from '@react-three/drei'
function Polyhedron({ position, polyhedron }) {
    const ref = useRef()
    const [coef, setcoef] = useState(1)
    const [count, setCount] = useState(0)
    const [speedz, setSpeedZ] = useState(1)
    const [speedx, setSpeedX] = useState(1)
    const [speedy, setSpeedY] = useState(1)
    useControls({
        rotationSpeedX: {
            value: 1,
            min: 0,
            max: 20,
            onchange: (value) => {
                setSpeedX(value);
            }
        },
        rotationSpeedY: {
            value: 1,
            min: 0,
            max: 20,
            onchange: (value) => {
                setSpeedY(value);
            }
        },
        moveSpeed: {
            value: 0.5,
            min: 0,
            max: 5,
            onchange: (value) => {
                setSpeedZ(value);
            }
        }
    })
   // console.log(polyhedron)

    useFrame((state, delta) => {
        ref.current.rotation.x += speedx * delta;
        ref.current.rotation.y += speedy * delta;

        if (ref.current.position.z > 50) {
            setcoef(-1);
        }
        if (ref.current.position.z < -50) {
            setcoef(1);
        }
           ref.current.position.z += coef * speedz 
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
