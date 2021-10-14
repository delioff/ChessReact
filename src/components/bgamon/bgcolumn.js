import React, { useEffect, useState } from 'react'
import BgPiece from './bgpiece'
import { useDrop } from 'react-dnd'
import { ItemTypes } from '../constants'
import { move } from './bggame'
export default function BoardColumn({
    piece,
    position
}) {
    const [CurrPiece, setCurrPiece] = useState([])
    useEffect(() => {
        setCurrPiece(piece?piece.split(""):[])
    }, [piece])
    const [{ isOver, canDrop }, drop] = useDrop({
        accept: ItemTypes.SQUARE,
        drop: (item) => {
             move(item.id,position)
        },
       
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop()
        })
    })
   
    return (
        <div ref={drop} data-testid={position}>
            <div>
                {CurrPiece.map((item, i) => (<BgPiece piece={item} position={position} />))}
             </div>
        </div>
    )
}