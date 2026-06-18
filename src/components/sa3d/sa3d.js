import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useControls } from 'leva'
import * as THREE from "three"
import Scene from './scene'
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
    const textureUrl = '/texturesky.png'
    const mapSize = 170
    const worldHalfExtent = 150
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
    const [cameraMode, setCameraMode] = useState('main')
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

    const [quickBulletSpeed, setQuickBulletSpeed] = useState(bulletSpeed)
    const [quickTurnStep, setQuickTurnStep] = useState(0.1)
    const [quickElevStep, setQuickElevStep] = useState(0.1)

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key.toLowerCase() === 'c') {
                event.preventDefault()
                setCameraMode((previous) => (previous === 'main' ? 'tank' : 'main'))
            }
        }

        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])

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

    const triggerTankControl = (action) => {
        if (!tankRef.current) {
            return
        }

        if (action === 'turnMinus') tankRef.current.rotateLeft()
        if (action === 'turnPlus') tankRef.current.rotateRight()
        if (action === 'elevMinus') tankRef.current.rotateUp()
        if (action === 'elevPlus') tankRef.current.rotateDown()
        if (action === 'fire') tankRef.current.fire()
        if (action === 'volley') tankRef.current.fireVolley()
    }

    const clampValue = (value, min, max) => Math.max(min, Math.min(max, value))
    const adjustQuickValue = (name, direction) => {
        if (name === 'bulletSpeed') {
            setQuickBulletSpeed((previous) => clampValue(previous + (direction * 0.05), 0.1, 4))
            return
        }

        if (name === 'turnStep') {
            setQuickTurnStep((previous) => clampValue(previous + (direction * 0.01), 0.01, 0.4))
            return
        }

        if (name === 'elevStep') {
            setQuickElevStep((previous) => clampValue(previous + (direction * 0.01), 0.01, 0.4))
        }
    }

    const toMinimapPoint = (x, z) => {
        const nx = (x + worldHalfExtent) / (worldHalfExtent * 2)
        const nz = (z + worldHalfExtent) / (worldHalfExtent * 2)

        const px = Math.max(0, Math.min(mapSize, nx * mapSize))
        const py = Math.max(0, Math.min(mapSize, (1 - nz) * mapSize))
        return [px, py]
    }

    const [tankMapX, tankMapY] = toMinimapPoint(tankPosition[0], tankPosition[2])
    const aimDirection = tankRef.current?.getAimDirection?.()
    const aimFlat = aimDirection
        ? new THREE.Vector2(aimDirection.x, aimDirection.z)
        : new THREE.Vector2(1, 0)

    if (aimFlat.lengthSq() < 1e-6) {
        aimFlat.set(1, 0)
    }
    aimFlat.normalize()

    const headingDx = aimFlat.x
    const headingDy = -aimFlat.y
    const headingLength = 14
    const headingBaseLength = 7
    const headingHalfWidth = 3

    const headingTipX = tankMapX + (headingDx * headingLength)
    const headingTipY = tankMapY + (headingDy * headingLength)
    const baseCenterX = tankMapX + (headingDx * headingBaseLength)
    const baseCenterY = tankMapY + (headingDy * headingBaseLength)

    const perpX = -headingDy
    const perpY = headingDx
    const headingLeftX = baseCenterX + (perpX * headingHalfWidth)
    const headingLeftY = baseCenterY + (perpY * headingHalfWidth)
    const headingRightX = baseCenterX - (perpX * headingHalfWidth)
    const headingRightY = baseCenterY - (perpY * headingHalfWidth)

    return (
        <div style={{ position: 'relative', height: '90vh' }}>
            <Scene
                textureUrl={textureUrl}
                camera={{ position: [0, 20, 40], fov: 60 }}
                cameraMode={cameraMode}
                tankRef={tankRef}
            >
            <ambientLight intensity={0.35} />
            <directionalLight position={[10, 20, 6]} intensity={1.1} />
            <hemisphereLight position={[10, 10, 10]} skyColor={"lightBlue"} groundColor={"Brown"} />
            <Terrain 
                ref={terrainRef}
                heightMapUrl={'/gc.png'} 
                width={300}
                depth={300}
                segments={100}
                heightScale={9}
                yOffset = {-2}
                onPointerDown={handleTerrainPointerDown}
            />
            
            {/* Tank on terrain - closer to camera */}
            <Tank
                ref={tankRef}
                position={tankPosition}
                onFire={handleTankFire}
                turnStepOverride={quickTurnStep}
                elevStepOverride={quickElevStep}
            />
            
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
                    speed={quickBulletSpeed}
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
            </Scene>
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

            <div
                style={{
                    position: 'absolute',
                    left: 12,
                    bottom: 12,
                    background: 'rgba(10,12,18,0.78)',
                    border: '1px solid rgba(255,255,255,0.35)',
                    boxShadow: '0 8px 22px rgba(0,0,0,0.35)',
                    borderRadius: 8,
                    padding: 10,
                    color: '#e8eef9',
                    zIndex: 12,
                    width: 190,
                    fontFamily: 'monospace',
                }}
            >
                <div style={{ fontSize: 12, marginBottom: 8, opacity: 0.9 }}>
                    Quick Controls
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 12 }}>Bullet Speed</span>
                    <button
                        onClick={() => adjustQuickValue('bulletSpeed', -1)}
                        style={{ border: '1px solid rgba(255,255,255,0.35)', borderRadius: 4, background: '#1c1f2b', color: '#f4f8ff', cursor: 'pointer', width: 32, height: 26 }}
                    >
                        -
                    </button>
                    <span style={{ fontSize: 12, textAlign: 'center', minWidth: 40 }}>{quickBulletSpeed.toFixed(2)}</span>
                    <button
                        onClick={() => adjustQuickValue('bulletSpeed', 1)}
                        style={{ border: '1px solid rgba(255,255,255,0.35)', borderRadius: 4, background: '#1c1f2b', color: '#f4f8ff', cursor: 'pointer', width: 32, height: 26 }}
                    >
                        +
                    </button>

                    <span style={{ fontSize: 12 }}>Turn Step</span>
                    <button
                        onClick={() => adjustQuickValue('turnStep', -1)}
                        style={{ border: '1px solid rgba(255,255,255,0.35)', borderRadius: 4, background: '#1c1f2b', color: '#f4f8ff', cursor: 'pointer', width: 32, height: 26 }}
                    >
                        -
                    </button>
                    <span style={{ fontSize: 12, textAlign: 'center', minWidth: 40 }}>{quickTurnStep.toFixed(2)}</span>
                    <button
                        onClick={() => adjustQuickValue('turnStep', 1)}
                        style={{ border: '1px solid rgba(255,255,255,0.35)', borderRadius: 4, background: '#1c1f2b', color: '#f4f8ff', cursor: 'pointer', width: 32, height: 26 }}
                    >
                        +
                    </button>

                    <span style={{ fontSize: 12 }}>Elev Step</span>
                    <button
                        onClick={() => adjustQuickValue('elevStep', -1)}
                        style={{ border: '1px solid rgba(255,255,255,0.35)', borderRadius: 4, background: '#1c1f2b', color: '#f4f8ff', cursor: 'pointer', width: 32, height: 26 }}
                    >
                        -
                    </button>
                    <span style={{ fontSize: 12, textAlign: 'center', minWidth: 40 }}>{quickElevStep.toFixed(2)}</span>
                    <button
                        onClick={() => adjustQuickValue('elevStep', 1)}
                        style={{ border: '1px solid rgba(255,255,255,0.35)', borderRadius: 4, background: '#1c1f2b', color: '#f4f8ff', cursor: 'pointer', width: 32, height: 26 }}
                    >
                        +
                    </button>

                    <span style={{ fontSize: 12 }}>Turn</span>
                    <button
                        onClick={() => triggerTankControl('turnMinus')}
                        style={{ border: '1px solid rgba(255,255,255,0.35)', borderRadius: 4, background: '#1c1f2b', color: '#f4f8ff', cursor: 'pointer', width: 32, height: 26 }}
                    >
                        -
                    </button>
                    <span style={{ fontSize: 12, textAlign: 'center', minWidth: 40 }}>now</span>
                    <button
                        onClick={() => triggerTankControl('turnPlus')}
                        style={{ border: '1px solid rgba(255,255,255,0.35)', borderRadius: 4, background: '#1c1f2b', color: '#f4f8ff', cursor: 'pointer', width: 32, height: 26 }}
                    >
                        +
                    </button>

                    <span style={{ fontSize: 12 }}>Elevation</span>
                    <button
                        onClick={() => triggerTankControl('elevMinus')}
                        style={{ border: '1px solid rgba(255,255,255,0.35)', borderRadius: 4, background: '#1c1f2b', color: '#f4f8ff', cursor: 'pointer', width: 32, height: 26 }}
                    >
                        -
                    </button>
                    <span style={{ fontSize: 12, textAlign: 'center', minWidth: 40 }}>now</span>
                    <button
                        onClick={() => triggerTankControl('elevPlus')}
                        style={{ border: '1px solid rgba(255,255,255,0.35)', borderRadius: 4, background: '#1c1f2b', color: '#f4f8ff', cursor: 'pointer', width: 32, height: 26 }}
                    >
                        +
                    </button>
                </div>

                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button
                        onClick={() => triggerTankControl('fire')}
                        style={{ flex: 1, border: '1px solid rgba(255,255,255,0.35)', borderRadius: 4, background: '#2a3d24', color: '#f4f8ff', cursor: 'pointer', height: 28 }}
                    >
                        Fire
                    </button>
                    <button
                        onClick={() => triggerTankControl('volley')}
                        style={{ flex: 1, border: '1px solid rgba(255,255,255,0.35)', borderRadius: 4, background: '#3a2a24', color: '#f4f8ff', cursor: 'pointer', height: 28 }}
                    >
                        Volley
                    </button>
                </div>
            </div>

            <div
                style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: mapSize,
                    background: 'rgba(10,12,18,0.75)',
                    border: '1px solid rgba(255,255,255,0.35)',
                    boxShadow: '0 8px 22px rgba(0,0,0,0.35)',
                    borderRadius: 8,
                    padding: 8,
                    color: '#e8eef9',
                    zIndex: 12,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                        fontFamily: 'monospace',
                        fontSize: 12,
                    }}
                >
                    <span>Map</span>
                    <button
                        onClick={() => setCameraMode((previous) => (previous === 'main' ? 'tank' : 'main'))}
                        style={{
                            border: '1px solid rgba(255,255,255,0.35)',
                            background: cameraMode === 'tank' ? '#274b87' : '#1c1f2b',
                            color: '#f4f8ff',
                            borderRadius: 4,
                            padding: '2px 6px',
                            cursor: 'pointer',
                            fontFamily: 'monospace',
                            fontSize: 11,
                        }}
                    >
                        {cameraMode === 'tank' ? 'Tank Cam' : 'Main Cam'}
                    </button>
                </div>

                <svg width={mapSize} height={mapSize} style={{ display: 'block', background: 'rgba(15,20,30,0.9)', borderRadius: 6 }}>
                    <rect x="0" y="0" width={mapSize} height={mapSize} fill="rgba(38,53,78,0.55)" />
                    <line x1={mapSize / 2} y1="0" x2={mapSize / 2} y2={mapSize} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                    <line x1="0" y1={mapSize / 2} x2={mapSize} y2={mapSize / 2} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

                    {targets.map((target) => {
                        const [tx, ty] = toMinimapPoint(target.position[0], target.position[2])
                        return <circle key={`map-target-${target.id}`} cx={tx} cy={ty} r="4" fill={target.color} opacity="0.95" />
                    })}

                    <line
                        x1={tankMapX}
                        y1={tankMapY}
                        x2={headingTipX}
                        y2={headingTipY}
                        stroke="#7ef2c4"
                        strokeWidth="2"
                        opacity="0.9"
                    />
                    <polygon
                        points={`${headingTipX},${headingTipY} ${headingLeftX},${headingLeftY} ${headingRightX},${headingRightY}`}
                        fill="#7ef2c4"
                        opacity="0.95"
                    />
                    <circle cx={tankMapX} cy={tankMapY} r="5" fill="#39d98a" />
                </svg>

                <div style={{ marginTop: 6, fontFamily: 'monospace', fontSize: 11, opacity: 0.9 }}>
                    C: switch camera
                </div>
            </div>
        </div>
    )
}

export default Sa3d;
