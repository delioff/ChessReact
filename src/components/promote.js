import React from 'react'
import Square from './square'
import { retimages } from './images'
const promotionPieces = ['r', 'n', 'b', 'q']

export default function Promote({
    promotion: { from, to, color,},handlemove
}) {
    return (
        <div className="board">
            {promotionPieces.map((p, i) => (
                <div key={i} className="promote-square">
                    <Square black={i % 3 === 0}>
                        <div
                            className="piece-container"
                            onClick={() => handlemove(from, to, p)}
                        >
                            <img
                                src={retimages(p,color)}
                                alt=""
                                className="piece cursor-pointer"
                            />
                        </div>
                    </Square>
                </div>
            ))}
        </div>
    )
}