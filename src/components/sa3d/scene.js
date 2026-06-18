import React, { useRef } from 'react'
import { Canvas, useLoader, useFrame, useThree } from 'react-three-fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const SkyDome = ({ textureUrl }) => {
    const texture = useLoader(THREE.TextureLoader, textureUrl)

    return (
        <mesh scale={[-1, 1, 1]}>
            <sphereGeometry args={[500, 32, 32]} />
            <meshBasicMaterial map={texture} side={THREE.BackSide} />
        </mesh>
    )
}

const CameraController = ({ cameraMode, tankRef }) => {
    const { camera } = useThree()
    const lookAtRef = useRef(new THREE.Vector3())
    const desiredPosRef = useRef(new THREE.Vector3())

    useFrame((_, delta) => {
        if (cameraMode !== 'tank' || !tankRef?.current) {
            return
        }

        const tankPosition = tankRef.current.getPosition?.()
        const aimDirection = tankRef.current.getAimDirection?.()
        if (!tankPosition || !aimDirection) {
            return
        }

        const up = new THREE.Vector3(0, 1, 0)
        const followOffset = aimDirection.clone().multiplyScalar(-9).add(up.clone().multiplyScalar(4))

        desiredPosRef.current.copy(tankPosition).add(followOffset)
        lookAtRef.current.copy(tankPosition).add(aimDirection.clone().multiplyScalar(20)).add(up)

        const lerpAlpha = Math.min(1, delta * 5)
        camera.position.lerp(desiredPosRef.current, lerpAlpha)
        camera.lookAt(lookAtRef.current)
    })

    return null
}

const Scene = ({
    children,
    textureUrl = '/texturesky.png',
    camera = { position: [0, 20, 40], fov: 60 },
    cameraMode = 'main',
    tankRef,
    style = {},
    canvasStyle = {},
}) => {
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
            <Canvas
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', ...canvasStyle }}
                camera={camera}
            >
                <OrbitControls enableDamping enabled={cameraMode === 'main'} />
                <CameraController cameraMode={cameraMode} tankRef={tankRef} />
                <SkyDome textureUrl={textureUrl} />
                {children}
            </Canvas>
        </div>
    )
}

export default Scene