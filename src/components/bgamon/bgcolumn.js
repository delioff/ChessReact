import React, { useEffect, useState } from 'react'
import BgPiece from './bgpiece'
import BgSquare from './bgsquare'
import { useDrop } from 'react-dnd'
import {move} from './bggame'
import { ItemTypes } from '../constants'
export default function BoardColumn({
    piece,
    position
}) {
    const [{ isOver, canDrop }, drop] = useDrop({
        accept: ItemTypes.SQUARE,
        drop: (item) => {
            move(item.id, position)
        },

        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop()
        })
    })
    const bgClass=position<12?"board-squaret":"board-squareb"
    return (
        <div className={bgClass} ref={drop} data-testid={position}>
            <BgSquare top={position<12}>
                  {piece.map((item, i) => <BgPiece piece={item} position={position} />)}
             </BgSquare>
        </div>
    )
}