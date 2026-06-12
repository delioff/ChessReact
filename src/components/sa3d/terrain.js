import React, { useEffect, useState } from 'react'
import * as THREE from "three"

function Terrain({
    heightMapUrl = '/gc.png',
    width = 30,
    depth = 30,
    segments = 180,
    heightScale = 6,
    yOffset = -2,
}) {
    const [geometry, setGeometry] = useState(null)

    useEffect(() => {
        let isCancelled = false
        const image = new Image()

        image.crossOrigin = 'anonymous'
        image.src = heightMapUrl

        image.onload = () => {
            if (isCancelled) return

            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')
            if (!context) return

            canvas.width = image.width
            canvas.height = image.height
            context.drawImage(image, 0, 0)

            const imageData = context.getImageData(0, 0, image.width, image.height).data
            const nextGeometry = new THREE.PlaneGeometry(width, depth, segments, segments)
            const vertices = nextGeometry.attributes.position

            for (let i = 0; i < vertices.count; i++) {
                const x = vertices.getX(i)
                const y = vertices.getY(i)

                const u = (x / width) + 0.5
                const v = 1 - ((y / depth) + 0.5)

                const pixelX = Math.min(image.width - 1, Math.max(0, Math.floor(u * (image.width - 1))))
                const pixelY = Math.min(image.height - 1, Math.max(0, Math.floor(v * (image.height - 1))))
                const pixelIndex = (pixelY * image.width + pixelX) * 4

                const r = imageData[pixelIndex]
                const g = imageData[pixelIndex + 1]
                const b = imageData[pixelIndex + 2]
                const grayscale = (r + g + b) / 3
                const normalizedHeight = grayscale / 255

                // White becomes highest and black becomes deepest.
                const elevation = (normalizedHeight * 2 - 1) * heightScale
                vertices.setZ(i, elevation)
            }

            vertices.needsUpdate = true
            nextGeometry.computeVertexNormals()

            setGeometry((previousGeometry) => {
                if (previousGeometry) previousGeometry.dispose()
                return nextGeometry
            })
        }

        return () => {
            isCancelled = true
            setGeometry((previousGeometry) => {
                if (previousGeometry) previousGeometry.dispose()
                return null
            })
        }
    }, [depth, heightMapUrl, heightScale, segments, width])

    if (!geometry) return null

    return (
        <mesh geometry={geometry} rotation-x={-Math.PI / 2} position={[0, yOffset, 0]} receiveShadow >
            <meshStandardMaterial color={'#efd1b5'} roughness={0.9} metalness={0.05} />
        </mesh>
    )
}

export default Terrain
