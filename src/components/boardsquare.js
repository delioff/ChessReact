import React, { useEffect, useState } from 'react'
import Square from './square'
import Piece from './piece'
import { useDrop } from 'react-dnd'
import { gameSubject } from './game'
import Promote from './promote'
import { ItemTypes } from './constants'
export default function BoardSquare({
    piece,
    black,
    position,
    handlemove,
    handleclick
 }) {
    const [promotion, setPromotion] = useState(null);
    const [, drop] = useDrop({
        accept: ItemTypes.SQUARE,
        drop: (item) => {
            const [fromPosition] = item.id.split('_')
            handlemove(fromPosition, position);
            
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
    function handlelocalclick() {
        handleclick(position)
    }
    return (
        <div className="board-square" ref={drop} onClick={handlelocalclick}>
            <Square black={black}>
                {promotion ? (
                    <Promote promotion={promotion} handlemove={handlemove} />
                ) : piece ? (
                    <Piece piece={piece} position={position} />
                ) : null}
            </Square>
        </div>
    )
}