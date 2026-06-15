import React, { useRef, useImperativeHandle, forwardRef } from 'react'
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
        tankPosX: { value: position[0], min: -150, max: 150, step: 1 },
        tankPosY: { value: position[1], min: -20, max: 80, step: 0.5 },
        tankPosZ: { value: position[2], min: -150, max: 150, step: 1 },

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
                    ...buildShots(-0.5, -0.5),
                    ...buildShots(-0.5, 0.5),
                    ...buildShots(0.5, -0.5),
                    ...buildShots(0.5, 0.5
                        
                    ),
                ].slice(0, 5)

                onFire(shots, { playSound: true })
            }
        },
        getPosition: () => new THREE.Vector3(tankPosX, tankPosY, tankPosZ),
        getTurretAngle: () => currentAngleHRef.current,
        getBarrelAngle: () => currentAngleVRef.current,
    }), [
        onFire,
        tankPosX,
        tankPosY,
        tankPosZ,
        turnStep,
        elevStep,
        minElevation,
        maxElevation,
        barrelLength,
    ])

    const buildShots = (horizontalMultiplier, verticalMultiplier) => {
        const basePosition = new THREE.Vector3(tankPosX, tankPosY, tankPosZ)
        const horizontalAngle = currentAngleHRef.current + (horizontalMultiplier * turnStep)
        const verticalAngle = currentAngleVRef.current + (verticalMultiplier * elevStep)

        const muzzleOffset = new THREE.Vector3(barrelLength * 0.5, 1.1, 0)
        muzzleOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), horizontalAngle)
        muzzleOffset.applyAxisAngle(new THREE.Vector3(1, 0, 0), verticalAngle)
        const barrelTip = basePosition.clone().add(muzzleOffset)

        const direction = new THREE.Vector3(1, 0, 0)
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), horizontalAngle)
        direction.applyAxisAngle(new THREE.Vector3(1, 0, 0), verticalAngle)
        direction.normalize()

        return [{ bulletOrigin: barrelTip, direction }]
    }

    useFrame((state, delta) => {
        const alpha = Math.min(1, cannonAnimSpeed * delta)
        currentAngleHRef.current = THREE.MathUtils.lerp(currentAngleHRef.current, targetAngleHRef.current, alpha)
        currentAngleVRef.current = THREE.MathUtils.lerp(currentAngleVRef.current, targetAngleVRef.current, alpha)

        if (turretRef.current) {
            turretRef.current.rotation.y = currentAngleHRef.current
        }
        if (barrelRef.current) {
            barrelRef.current.rotation.x = currentAngleVRef.current
        }
    })

    return (
        <group ref={tankRef} position={[tankPosX, tankPosY, tankPosZ]} castShadow>
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
