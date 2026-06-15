import React, { useEffect, useRef } from 'react'

// Custom hook for keyboard input
export function useKeyboard() {
    const keys = useRef({
        ArrowLeft: false,
        ArrowRight: false,
        ArrowUp: false,
        ArrowDown: false,
        Enter: false,
        ' ': false,
    })

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key in keys.current) {
                keys.current[e.key] = true
                e.preventDefault()
            }
        }

        const handleKeyUp = (e) => {
            if (e.key in keys.current) {
                keys.current[e.key] = false
                e.preventDefault()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    return keys
}

// Custom hook for mouse input
export function useMouse() {
    const mouseState = useRef({
        rightClicked: false,
    })

    useEffect(() => {
        const handleMouseDown = (e) => {
            if (e.button === 2) {
                mouseState.current.rightClicked = true
                e.preventDefault()
            }
        }

        const handleMouseUp = (e) => {
            if (e.button === 2) {
                mouseState.current.rightClicked = false
                e.preventDefault()
            }
        }

        window.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('mouseup', handleMouseUp)
        window.addEventListener('contextmenu', (e) => e.preventDefault())

        return () => {
            window.removeEventListener('mousedown', handleMouseDown)
            window.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('contextmenu', () => {})
        }
    }, [])

    return mouseState
}
