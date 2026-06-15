import React, { useMemo, useRef } from 'react'
import { useFrame } from 'react-three-fiber'
import * as THREE from 'three'

function ExplosionSprite({ position, onDone, size = 5, duration = 0.45 }) {
    const spriteRef = useRef()
    const materialRef = useRef()
    const elapsedRef = useRef(0)

    const texture = useMemo(() => {
        return new THREE.TextureLoader().load('/bomba.png')
    }, [])

    useFrame((_, delta) => {
        if (!spriteRef.current || !materialRef.current) return

        elapsedRef.current += delta
        const t = Math.min(1, elapsedRef.current / duration)
        const animatedScale = size * (0.7 + t * 1.1)

        spriteRef.current.scale.set(animatedScale, animatedScale, 1)
        materialRef.current.opacity = 1 - t

        if (t >= 1 && onDone) {
            onDone()
        }
    })

    return (
        <sprite ref={spriteRef} position={position} renderOrder={20}>
            <spriteMaterial
                ref={materialRef}
                attach="material"
                map={texture}
                transparent
                depthWrite={false}
            />
        </sprite>
    )
}

export default ExplosionSprite
