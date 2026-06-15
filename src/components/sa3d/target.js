import React, { useRef } from 'react'
import { useFrame } from 'react-three-fiber'
import * as THREE from 'three'

function Target({ position = [0, 0, 0], color = '#ff4444' }) {
    const targetRef = useRef()

    useFrame((state) => {
        if (targetRef.current) {
            // Rotate for visual interest
            targetRef.current.rotation.z += 0.02
        }
    })

    return (
        <group ref={targetRef} position={position} castShadow>
            {/* Target main cone */}
            <mesh position={[0, 1.5, 0]} castShadow>
                <coneGeometry args={[1.2, 2.0, 8]} />
                <meshStandardMaterial color={color} roughness={0.6} metalness={0.4} emissive={color} emissiveIntensity={0.2} />
            </mesh>

            {/* Target ring 1 - larger */}
            <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[1.0, 0.15, 8, 8]} />
                <meshStandardMaterial color={color} roughness={0.5} metalness={0.5} emissive={color} emissiveIntensity={0.1} />
            </mesh>

            {/* Target ring 2 - medium */}
            <mesh position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[0.6, 0.12, 8, 8]} />
                <meshStandardMaterial color={color} roughness={0.5} metalness={0.5} emissive={color} emissiveIntensity={0.15} />
            </mesh>

            {/* Target ring 3 - small center */}
            <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[0.3, 0.1, 8, 8]} />
                <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} emissive={color} emissiveIntensity={0.3} />
            </mesh>
        </group>
    )
}

export default Target
