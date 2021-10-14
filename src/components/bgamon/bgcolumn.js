import React from 'react'
import BgPiece from './bgpiece'
import { useDrop } from 'react-dnd'
import { ItemTypes } from '../constants'
export default function BoardColumn({
    piece,
    position
}) {
    const [{ isOver, canDrop }, drop] = useDrop({
        accept: ItemTypes.SQUARE,
        drop: (item) => {
            const [fromPosition] = item.id.split('_')
        },
       
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop()
        })
    })
   
    return (
        <div ref={drop}>
            
                { piece ? (
                    <BgPiece piece={piece} position={position} />
                ) : null}
  
            

        </div>
    )
}