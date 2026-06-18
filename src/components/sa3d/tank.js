import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { useFrame } from 'react-three-fiber'
import * as THREE from 'three'
import { useControls } from 'leva'

const Tank = forwardRef(({ position = [0, 0, 0], onFire }, ref) => {
    const tankRef = useRef()
    const turretRef = useRef()
    const barrelRef = useRef()

    const targetAngleHRef = useRef(0)
    const targetAngleVRef = useRef(0)
    const currentAngleHRef = useRef(0)
    const currentAngleVRef = useRef(0)
    const controlledPositionRef = useRef(new THREE.Vector3(position[0], position[1], position[2]))

    const {
        tankPosX,
        tankPosY,
        tankPosZ,
        bodyTopRadius,
        bodyBottomRadius,
        bodyHeight,
        bodyColor,
        turretTopRadius,
        turretBottomRadius,
        turretHeight,
        turretColor,
        barrelLength,
        barrelRadius,
        barrelColor,
        trackOffset,
        trackWidth,
        trackHeight,
        trackDepth,
        trackColor,
        turnStep,
        elevStep,
        minElevation,
        maxElevation,
        cannonAnimSpeed,
    } = useControls('Tank', {
        bodyTopRadius: { value: 0.8, min: 0.2, max: 2, step: 0.05 },
        bodyBottomRadius: { value: 0.9, min: 0.2, max: 2, step: 0.05 },
        bodyHeight: { value: 0.6, min: 0.2, max: 2, step: 0.05 },
        bodyColor: { value: '#2d5016' },

        turretTopRadius: { value: 0.5, min: 0.1, max: 1.5, step: 0.05 },
        turretBottomRadius: { value: 0.55, min: 0.1, max: 1.5, step: 0.05 },
        turretHeight: { value: 0.4, min: 0.1, max: 1.5, step: 0.05 },
        turretColor: { value: '#1a2f0b' },

        barrelLength: { value: 1.2, min: 0.3, max: 4, step: 0.05 },
        barrelRadius: { value: 0.15, min: 0.03, max: 0.6, step: 0.01 },
        barrelColor: { value: '#1a1a1a' },

        trackOffset: { value: 1.0, min: 0.2, max: 3.0, step: 0.05 },
        trackWidth: { value: 0.2, min: 0.05, max: 1.0, step: 0.01 },
        trackHeight: { value: 0.3, min: 0.05, max: 1.0, step: 0.01 },
        trackDepth: { value: 1.8, min: 0.3, max: 4.0, step: 0.05 },
        trackColor: { value: '#0a0a0a' },

        turnStep: { value: 0.1, min: 0.01, max: 0.4, step: 0.01 },
        elevStep: { value: 0.1, min: 0.01, max: 0.4, step: 0.01 },
        minElevation: { value: -Math.PI / 3, min: -1.4, max: 0, step: 0.01 },
        maxElevation: { value: Math.PI / 6, min: 0, max: 1.4, step: 0.01 },
        cannonAnimSpeed: { value: 7, min: 1, max: 20, step: 0.5 },
    })

    useEffect(() => {
        controlledPositionRef.current.set(position[0], position[1], position[2])
    }, [position])

    const buildShots = React.useCallback((horizontalMultiplier, verticalMultiplier) => {
        const basePosition = controlledPositionRef.current
        let barrelTip = new THREE.Vector3(basePosition.x + barrelLength, basePosition.y + 1.1, basePosition.z)
        let direction = new THREE.Vector3(1, 0, 0)

        // Use the real rendered barrel transform so the projectile starts at the visible muzzle.
        if (barrelRef.current) {
            barrelRef.current.updateWorldMatrix(true, false)
            barrelTip = barrelRef.current.localToWorld(new THREE.Vector3(barrelLength, 0, 0))

            const forwardPoint = barrelRef.current.localToWorld(new THREE.Vector3(barrelLength + 1, 0, 0))
            direction = forwardPoint.sub(barrelTip).normalize()

        }

        if (horizontalMultiplier !== 0 || verticalMultiplier !== 0) {
            const worldUp = new THREE.Vector3(0, 1, 0)
            const right = new THREE.Vector3().crossVectors(direction, worldUp)

            if (right.lengthSq() < 1e-6) {
                right.set(0, 0, 1).cross(direction)
            }

            right.normalize()

            const yaw = horizontalMultiplier * turnStep
            const pitch = verticalMultiplier * elevStep

            direction = direction.clone()
                .applyAxisAngle(worldUp, yaw)
                .applyAxisAngle(right, pitch)
                .normalize()
        }

        return [{ bulletOrigin: barrelTip, direction }]
    }, [barrelLength, turnStep, elevStep])

    useImperativeHandle(ref, () => ({
        rotateLeft: () => { targetAngleHRef.current += turnStep },
        rotateRight: () => { targetAngleHRef.current -= turnStep },
        rotateUp: () => {
            targetAngleVRef.current = Math.max(targetAngleVRef.current - elevStep, minElevation)
        },
        rotateDown: () => {
            targetAngleVRef.current = Math.min(targetAngleVRef.current + elevStep, maxElevation)
        },
        fire: () => {
            if (onFire) {
                const shots = buildShots(0, 0)
                onFire(shots, { playSound: true })
            }
        },
        fireVolley: () => {
            if (onFire) {
                const shots = [
                    ...buildShots(0, 0),
                    ...buildShots(-1, 0),
                    ...buildShots(1, 0),
                    ...buildShots(0, -1),
                    ...buildShots(0, 1),
                ].slice(0, 5)

                onFire(shots, { playSound: true })
            }
        },
        getPosition: () => {
            if (tankRef.current) {
                return tankRef.current.getWorldPosition(new THREE.Vector3())
            }
            return controlledPositionRef.current.clone()
        },
        getAimDirection: () => {
            const shot = buildShots(0, 0)[0]
            return shot.direction.clone()
        },
        getTurretAngle: () => currentAngleHRef.current,
        getBarrelAngle: () => currentAngleVRef.current,
    }), [
        onFire,
        buildShots,
        turnStep,
        elevStep,
        minElevation,
        maxElevation,
        barrelLength,
    ])

    useFrame((state, delta) => {
        if (tankRef.current) {
            tankRef.current.position.copy(controlledPositionRef.current)
        }

        const alpha = Math.min(1, cannonAnimSpeed * delta)
        currentAngleHRef.current = THREE.MathUtils.lerp(currentAngleHRef.current, targetAngleHRef.current, alpha)
        currentAngleVRef.current = THREE.MathUtils.lerp(currentAngleVRef.current, targetAngleVRef.current, alpha)

        if (turretRef.current) {
            turretRef.current.rotation.y = currentAngleHRef.current
        }
        if (barrelRef.current) {
            barrelRef.current.rotation.z = currentAngleVRef.current
        }
    })

    return (
        <group ref={tankRef} position={position} castShadow>
            {/* Tank body - cylinder */}
            <mesh position={[0, 0.5, 0]} castShadow>
                <cylinderGeometry args={[bodyTopRadius, bodyBottomRadius, bodyHeight, 8]} />
                <meshStandardMaterial color={bodyColor} roughness={0.7} metalness={0.3} />
            </mesh>

            {/* Turret group - rotates horizontally */}
            <group ref={turretRef}>
                {/* Tank turret - smaller cylinder on top */}
                <mesh position={[0, 1.1, 0]} castShadow>
                    <cylinderGeometry args={[turretTopRadius, turretBottomRadius, turretHeight, 8]} />
                    <meshStandardMaterial color={turretColor} roughness={0.7} metalness={0.3} />
                </mesh>

                {/* Barrel group - rotates vertically */}
                <group ref={barrelRef} position={[0, 1.1, 0]}>
                    {/* Tank barrel - long thin cone */}
                    <mesh position={[barrelLength * 0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                        <coneGeometry args={[barrelRadius, barrelLength, 8]} />
                        <meshStandardMaterial color={barrelColor} roughness={0.8} metalness={0.4} />
                    </mesh>
                </group>
            </group>

            {/* Tracks visual - two side boxes */}
            <mesh position={[-trackOffset, 0.3, 0]} castShadow>
                <boxGeometry args={[trackWidth, trackHeight, trackDepth]} />
                <meshStandardMaterial color={trackColor} roughness={0.9} metalness={0.2} />
            </mesh>
            <mesh position={[trackOffset, 0.3, 0]} castShadow>
                <boxGeometry args={[trackWidth, trackHeight, trackDepth]} />
                <meshStandardMaterial color={trackColor} roughness={0.9} metalness={0.2} />
            </mesh>
        </group>
    )
})

Tank.displayName = 'Tank'
export default Tank
