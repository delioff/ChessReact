import React from 'react'

export default function Square({ children, top }) {
    return (
        <div className={top}>
            {children}
        </div>
    )
}