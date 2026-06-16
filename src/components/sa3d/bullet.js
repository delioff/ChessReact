import React, { useRef, useEffect } from 'react'
import { useFrame } from 'react-three-fiber'
import * as THREE from 'three'

function Bullet({
    position,
    direction,
    speed = 0.5,
    gravity = -0.015,
    maxDistance = 400,
    minY = -50,
    terrainRef,
    targets = [],
    onHit,
    onTargetHit,
}) {
    const bulletRef = useRef()
    const velocityRef = useRef(null)
    if (!velocityRef.current) {
        velocityRef.current = direction.clone().multiplyScalar(speed)
    }
    const distanceTraveledRef = useRef(0)
    const raycasterRef = useRef(new THREE.Raycaster())
    const hitTriggeredRef = useRef(false)

    useEffect(() => {
        // Initialize velocity with direction and speed
        velocityRef.current.copy(direction).multiplyScalar(speed)
    }, [direction, speed])

    useFrame(() => {
        if (bulletRef.current) {
            if (hitTriggeredRef.current) return
            const oldPos = bulletRef.current.position.clone()

            // Apply gravity to vertical velocity
            velocityRef.current.y += gravity

            // Update position based on velocity
            const newPos = oldPos.clone()
            newPos.add(velocityRef.current)
            bulletRef.current.position.copy(newPos)

            const segment = newPos.clone().sub(oldPos)
            const segmentLength = segment.length()
            const segmentDir = segmentLength > 0 ? segment.clone().normalize() : new THREE.Vector3(0, 0, 0)

            let terrainHit = null

            const terrainMesh = terrainRef?.current?.getMesh?.()
            if (terrainMesh && segmentLength > 0) {
                raycasterRef.current.set(oldPos, segmentDir)
                raycasterRef.current.near = 0
                raycasterRef.current.far = segmentLength

                const hits = raycasterRef.current.intersectObject(terrainMesh, true)
                if (hits.length > 0) {
                    terrainHit = hits[0]
                }
            }

            let closestTargetHit = null
            for (let i = 0; i < targets.length; i++) {
                const target = targets[i]
                const center = new THREE.Vector3(
                    target.position[0],
                    target.position[1] + (target.centerOffsetY ?? 1.2),
                    target.position[2]
                )
                const radius = target.radius ?? 1.6

                if (segmentLength <= 0) continue

                const m = oldPos.clone().sub(center)
                const b = m.dot(segmentDir)
                const c = m.dot(m) - radius * radius

                if (c > 0 && b > 0) continue

                const discriminant = b * b - c
                if (discriminant < 0) continue

                let t = -b - Math.sqrt(discriminant)
                if (t < 0) t = 0
                if (t > segmentLength) continue

                if (!closestTargetHit || t < closestTargetHit.distance) {
                    closestTargetHit = {
                        targetId: target.id,
                        distance: t,
                        point: oldPos.clone().addScaledVector(segmentDir, t),
                    }
                }
            }

            const terrainDistance = terrainHit ? oldPos.distanceTo(terrainHit.point) : Number.POSITIVE_INFINITY
            const targetDistance = closestTargetHit ? closestTargetHit.distance : Number.POSITIVE_INFINITY

            if (closestTargetHit && targetDistance <= terrainDistance) {
                hitTriggeredRef.current = true
                if (onTargetHit) onTargetHit(closestTargetHit)
                return
            }

            if (terrainHit) {
                hitTriggeredRef.current = true
                onHit(terrainHit.point.clone())
                return
            }

            distanceTraveledRef.current += speed

            // Remove bullet if it traveled too far or fell too far below terrain.
            if (distanceTraveledRef.current > maxDistance || bulletRef.current.position.y < minY) {
                hitTriggeredRef.current = true
                onHit(null)
            }
        }
    })

    return (
        <mesh
            ref={bulletRef}
            position={position}
            castShadow
        >
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial
                color="#ffaa00"
                emissive="#ff6600"
                emissiveIntensity={0.8}
                metalness={0.6}
                roughness={0.3}
            />
        </mesh>
    )
}

export default Bullet
