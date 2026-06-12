import React from 'react'
import { Canvas } from 'react-three-fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from "three"
import Terrain from './terrain'
import Polyhedron from './polyhedron'
//import { Stats } from '@react-three/drei'

const Sa3d = () => {
    const polyhedron = [
        new THREE.BoxGeometry(),
        new THREE.SphereGeometry(0.785398),
        new THREE.DodecahedronGeometry(0.785398),
    ]
    return (
        <Canvas style={{height: "90vh", borderColor: "white", borderWidth: "5px", backgroundColor: "black" }}>
            <OrbitControls enableDamping />
            <ambientLight intensity={0.35} />
            <directionalLight position={[10, 20, 6]} intensity={1.1} />
            <hemisphereLight position={[10, 10, 10]} skyColor={"lightBlue"} groundColor={"Brown"} />
            <Terrain heightMapUrl={'/gc.png'} width={300}
                depth={300}
                segments={500}
                heightScale={9}
                yOffset = {-2}/>
            <Polyhedron position={[10,20, 0]} polyhedron={polyhedron} />
            <Polyhedron position={[-4,25, 0]} polyhedron={polyhedron} />
            <Polyhedron position={[3,35, 0]} polyhedron={polyhedron} />
            <Polyhedron position={[1,40, 0]} polyhedron={polyhedron} />
        </Canvas>
    
  );
};

export default Sa3d;
