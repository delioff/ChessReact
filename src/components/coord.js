import React from 'react'

export default function Coord({ letter, or }) {
    const classname = or ? "cord-square" : "cord-square-x"
    return (
        <div className={classname}>
            <div className="piece-container">
                <span className="vertical-text-cord">{letter}</span>
            </div>
        </div>
    )
}