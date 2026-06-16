import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Canvas } from 'react-three-fiber'
import { OrbitControls } from '@react-three/drei'
import { useControls } from 'leva'
import * as THREE from "three"
import Terrain from './terrain'
import Polyhedron from './polyhedron'
import Tank from './tank'
import Target from './target'
import Bullet from './bullet'
import ExplosionSprite from './explosion-sprite'
import { useKeyboard, useMouse } from './useInput'
//import { Stats } from '@react-three/drei'

// Play explosion sound
const playExplosionSound = () => {
    try {
        const audio = new Audio('/bomb.mp3')
        const playPromise = audio.play()
        if (playPromise !== undefined) {
            playPromise.then(() => {}).catch(() => {})
        }
    } catch (e) {
        // Silently fail
    }
}

// Play fire sound when bullet starts moving.
const playFireSound = () => {
    try {
        const audio = new Audio('/fire.mp3')
        const playPromise = audio.play()
        if (playPromise !== undefined) {
            playPromise.then(() => {}).catch(() => {})
        }
    } catch (e) {
        // Silently fail
    }
}

const Sa3d = () => {
    const targetCount = 3
    const targetSurfaceOffset = 1.75
    const tankSurfaceOffset = 0
    const polyhedron = [
        new THREE.BoxGeometry(),
        new THREE.SphereGeometry(0.785398),
        new THREE.DodecahedronGeometry(0.785398),
    ]
    
    const [bullets, setBullets] = useState([])
    const [explosions, setExplosions] = useState([])
    const [targets, setTargets] = useState([])
    const [tankPosition, setTankPosition] = useState([-5, 8, -15])
    const [hitInfo, setHitInfo] = useState('No impact yet')
    const tankRef = useRef()
    const terrainRef = useRef()
    const keys = useKeyboard()
    const mouse = useMouse()
    const fireDebounceRef = useRef(false)
    const targetIdRef = useRef(1)
    const respawnTimerRef = useRef(null)
    const terrainSpawnReadyRef = useRef(false)
    const terrainClickDebounceRef = useRef(false)

    const {
        bulletSpeed,
        bulletGravity,
        bulletMaxDistance,
        bulletMinY,
        fireCooldownMs,
        inputTickMs,
        craterRadius,
        craterDepth,
    } = useControls('Combat', {
        bulletSpeed: { value: 0.8, min: 0.1, max: 4, step: 0.05 },
        bulletGravity: { value: -0.015, min: -0.2, max: 0, step: 0.001 },
        bulletMaxDistance: { value: 400, min: 50, max: 2000, step: 10 },
        bulletMinY: { value: -50, min: -500, max: 0, step: 1 },
        fireCooldownMs: { value: 200, min: 50, max: 2000, step: 10 },
        inputTickMs: { value: 50, min: 10, max: 200, step: 5 },
        craterRadius: { value: 2, min: 0.5, max: 20, step: 0.1 },
        craterDepth: { value: 3, min: 0.2, max: 20, step: 0.1 },
    })

    const getTerrainPointAt = (x, z) => {
        const terrainMesh = terrainRef.current?.getMesh?.()
        if (!terrainMesh) {
            return new THREE.Vector3(x, -2, z)
        }

        const raycaster = new THREE.Raycaster(
            new THREE.Vector3(x, 200, z),
            new THREE.Vector3(0, -1, 0)
        )
        const hits = raycaster.intersectObject(terrainMesh, true)

        if (hits.length > 0) {
            return hits[0].point.clone()
        }

        return new THREE.Vector3(x, -2, z)
    }

    const createRandomTargets = () => {
        const nextTargets = []
        const halfWidth = 135
        const halfDepth = 135

        for (let i = 0; i < targetCount; i++) {
            const x = (Math.random() * 2 - 1) * halfWidth
            const z = (Math.random() * 2 - 1) * halfDepth
            const terrainPoint = getTerrainPointAt(x, z)

            nextTargets.push({
                id: targetIdRef.current++,
                position: [terrainPoint.x, terrainPoint.y + targetSurfaceOffset, terrainPoint.z],
                color: ['#ff4444', '#ffff00', '#00ff44'][i % 3],
                radius: 1.6,
                centerOffsetY: 1.2,
            })
        }

        return nextTargets
    }

    const settleToHeight = (currentY, targetY) => {
        const delta = targetY - currentY
        if (Math.abs(delta) < 0.01) {
            return targetY
        }

        const maxStep = 0.75
        const nextStep = Math.sign(delta) * Math.min(maxStep, Math.abs(delta) * 0.3)
        return currentY + nextStep
    }

    // Handle tank controls
    useEffect(() => {
        let cancelled = false

        const initializeTargets = () => {
            if (cancelled) return

            if (!terrainSpawnReadyRef.current) {
                if (terrainRef.current?.getMesh?.()) {
                    terrainSpawnReadyRef.current = true
                    setTankPosition((previous) => {
                        const terrainPoint = getTerrainPointAt(previous[0], previous[2])
                        return [previous[0], terrainPoint.y + tankSurfaceOffset, previous[2]]
                    })
                    setTargets(createRandomTargets())
                    return
                }

                requestAnimationFrame(initializeTargets)
                return
            }

            if (targets.length === 0) {
                setTargets(createRandomTargets())
            }
        }

        initializeTargets()

        return () => {
            cancelled = true
        }
    }, [])

    useEffect(() => {
        if (targets.length > 0) {
            return undefined
        }

        if (respawnTimerRef.current) {
            clearTimeout(respawnTimerRef.current)
        }

        respawnTimerRef.current = setTimeout(() => {
            setHitInfo('All targets destroyed. Spawning new random targets.')
            setTargets(createRandomTargets())
        }, 1200)

        return () => {
            if (respawnTimerRef.current) {
                clearTimeout(respawnTimerRef.current)
            }
        }
    }, [targets])

    useEffect(() => {
        const inputLoop = setInterval(() => {
            if (tankRef.current) {
                if (keys.current.ArrowLeft) tankRef.current.rotateLeft()
                if (keys.current.ArrowRight) tankRef.current.rotateRight()
                if (keys.current.ArrowDown) tankRef.current.rotateUp()
                if (keys.current.ArrowUp) tankRef.current.rotateDown()

                if (keys.current.Enter && !fireDebounceRef.current) {
                    fireDebounceRef.current = true
                    tankRef.current.fireVolley()
                    setTimeout(() => {
                        fireDebounceRef.current = false
                    }, fireCooldownMs)
                } else if (keys.current[' ']  && !fireDebounceRef.current) {
                    fireDebounceRef.current = true
                    tankRef.current.fire()
                    setTimeout(() => {
                        fireDebounceRef.current = false
                    }, fireCooldownMs)
                }
            }
        }, inputTickMs)

        return () => clearInterval(inputLoop)
    }, [keys, mouse, fireCooldownMs, inputTickMs])

    useEffect(() => {
        const settleLoop = setInterval(() => {
            if (!terrainRef.current?.getMesh?.()) {
                return
            }

            setTankPosition((previous) => {
                const terrainPoint = getTerrainPointAt(previous[0], previous[2])
                const nextY = settleToHeight(previous[1], terrainPoint.y + tankSurfaceOffset)

                if (Math.abs(nextY - previous[1]) < 0.05) {
                    return previous
                }

                return [previous[0], nextY, previous[2]]
            })

            setTargets((previousTargets) => {
                let changed = false

                const nextTargets = previousTargets.map((target) => {
                    const terrainPoint = getTerrainPointAt(target.position[0], target.position[2])
                    const nextY = settleToHeight(target.position[1], terrainPoint.y + targetSurfaceOffset)

                    if (Math.abs(nextY - target.position[1]) < 0.05) {
                        return target
                    }

                    changed = true
                    return {
                        ...target,
                        position: [target.position[0], nextY, target.position[2]],
                    }
                })

                return changed ? nextTargets : previousTargets
            })
        }, 200)

        return () => clearInterval(settleLoop)
    }, [])

    const handleTerrainPointerDown = (event) => {
        if (event.button !== 2 || terrainClickDebounceRef.current) {
            return
        }

        terrainClickDebounceRef.current = true
        setTimeout(() => {
            terrainClickDebounceRef.current = false
        }, 200)

        event.stopPropagation()
        const hit = event.point
        setTankPosition([hit.x, hit.y + tankSurfaceOffset, hit.z])
        setHitInfo(`Tank moved to x:${hit.x.toFixed(1)} z:${hit.z.toFixed(1)}`)
    }

    // Handle bullet hit and terrain deformation
    const handleBulletHit = (bulletIndex, hitPosition) => {
        if (hitPosition && terrainRef.current) {
            playExplosionSound()
            terrainRef.current.deformTerrainAtPoint(hitPosition, craterRadius, craterDepth)

            let closest = Number.POSITIVE_INFINITY
            let closestId = null
            for (let i = 0; i < targets.length; i++) {
                const target = targets[i]
                const center = new THREE.Vector3(
                    target.position[0],
                    target.position[1] + (target.centerOffsetY ?? 1.2),
                    target.position[2]
                )
                const distance = center.distanceTo(hitPosition)
                if (distance < closest) {
                    closest = distance
                    closestId = target.id
                }
            }

            if (closestId !== null) {
                setHitInfo(`Terrain hit. Closest target #${closestId}: ${closest.toFixed(2)} units`)
            } else {
                setHitInfo('Terrain hit. No targets left.')
            }

            setExplosions((prev) => [
                ...prev,
                {
                    id: Math.random(),
                    position: [hitPosition.x, hitPosition.y + 0.8, hitPosition.z],
                },
            ])
        } else {
            setHitInfo('Shot missed terrain/target and expired.')
        }

        setBullets((prev) => prev.filter((_, i) => i !== bulletIndex))
    }

    const handleTargetHit = (bulletIndex, targetHit) => {
        playExplosionSound()

        const hitTarget = targets.find((t) => t.id === targetHit.targetId)
        if (hitTarget) {
            const center = new THREE.Vector3(
                hitTarget.position[0],
                hitTarget.position[1] + (hitTarget.centerOffsetY ?? 1.2),
                hitTarget.position[2]
            )
            const missDistance = center.distanceTo(targetHit.point)

            setHitInfo(`Target #${targetHit.targetId} hit. Offset from center: ${missDistance.toFixed(2)} units`)
            setTargets((prev) => prev.filter((t) => t.id !== targetHit.targetId))
            setExplosions((prev) => [
                ...prev,
                {
                    id: Math.random(),
                    position: [targetHit.point.x, targetHit.point.y + 0.8, targetHit.point.z],
                },
            ])
        }

        setBullets((prev) => prev.filter((_, i) => i !== bulletIndex))
    }

    const handleTankFire = useCallback((shots, options = {}) => {
        const nextBullets = shots.map((shot) => ({
            id: Math.random(),
            position: [shot.bulletOrigin.x, shot.bulletOrigin.y, shot.bulletOrigin.z],
            direction: shot.direction,
        }))

        setBullets((prev) => [...prev, ...nextBullets])

        if (options.playSound) {
            playFireSound()
        }
    }, [])

    return (
        <div style={{ position: 'relative', height: '90vh' }}>
            <Canvas style={{height: "90vh", borderColor: "white", borderWidth: "5px", backgroundColor: "black" }}>
            <OrbitControls enableDamping />
            <ambientLight intensity={0.35} />
            <directionalLight position={[10, 20, 6]} intensity={1.1} />
            <hemisphereLight position={[10, 10, 10]} skyColor={"lightBlue"} groundColor={"Brown"} />
            <Terrain 
                ref={terrainRef}
                heightMapUrl={'/gc.png'} 
                width={300}
                depth={300}
                segments={200}
                heightScale={9}
                yOffset = {-2}
                onPointerDown={handleTerrainPointerDown}
            />
            
            {/* Tank on terrain - closer to camera */}
            <Tank ref={tankRef} position={tankPosition} onFire={handleTankFire} />
            
            {/* Targets scattered on terrain */}
            {targets.map((target) => (
                <Target
                    key={target.id}
                    position={target.position}
                    color={target.color}
                />
            ))}

            {/* Render bullets */}
            {bullets.map((bullet, idx) => (
                <Bullet
                    key={bullet.id}
                    position={bullet.position}
                    direction={bullet.direction}
                    speed={bulletSpeed}
                    gravity={bulletGravity}
                    maxDistance={bulletMaxDistance}
                    minY={bulletMinY}
                    targets={targets}
                    terrainRef={terrainRef}
                    onHit={(hitPosition) => handleBulletHit(idx, hitPosition)}
                    onTargetHit={(targetHit) => handleTargetHit(idx, targetHit)}
                />
            ))}

            {explosions.map((explosion) => (
                <ExplosionSprite
                    key={explosion.id}
                    position={explosion.position}
                    onDone={() => {
                        setExplosions((prev) => prev.filter((item) => item.id !== explosion.id))
                    }}
                />
            ))}
 
            </Canvas>
            <div
                style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    padding: '8px 10px',
                    background: 'rgba(0,0,0,0.6)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.25)',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    zIndex: 10,
                }}
            >
                {hitInfo}
            </div>
        </div>
    )
}

export default Sa3d;
