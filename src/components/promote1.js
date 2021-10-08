import React from 'react'
import Square from './square'
import { move } from './game1'
import { retimages } from './images'
const promotionPieces = ['r', 'n', 'b', 'q']

export default function Promote({
    promotion: { from, to, color },
}) {
    return (
        <div className="board">
            {promotionPieces.map((p, i) => (
                <div key={i} className="promote-square">
                    <Square black={i % 3 === 0}>
                        <div
                            className="piece-container"
                            onClick={() => move(from, to, p)}
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