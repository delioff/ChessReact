import React, { useEffect, useState } from 'react'
import Square from './square'
import Piece from './piece'
import { useDrop } from 'react-dnd'
import { handleMove } from './game'
import { gameSubject } from './game'
import Promote from './promote'
import { ItemTypes } from './constants'
export default function BoardSquare({
    piece,
    black,
    position,
}) {
    const [promotion, setPromotion] = useState(null);
    const [, drop] = useDrop({
        accept: ItemTypes.SQUARE,
        drop: (item) => {
            const [fromPosition] = item.id.split('_')
            handleMove(fromPosition, position);
        },
    })
    useEffect(() => {
        const subscribe = gameSubject.subscribe(
            ({ pendingPromotion }) =>
                pendingPromotion && pendingPromotion.to === position
                    ? setPromotion(pendingPromotion)
                    : setPromotion(null)
        )
        return () => subscribe.unsubscribe()
    }, [position])
    return (
        <div className="board-square" ref={drop}>
            <Square black={black}>
                {promotion ? (
                    <Promote promotion={promotion} />
                ) : piece ? (
                    <Piece piece={piece} position={position} />
                ) : null}
            </Square>
        </div>
    )
}