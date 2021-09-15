import React from 'react'
import { useDrag, DragPreviewImage } from 'react-dnd'
import { ItemTypes } from './constants'
import { retimages } from './images'

export default function Piece({
    piece: { type, color },
    position,
}) {
    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemTypes.SQUARE,
        item: {
            type: ItemTypes.SQUARE ,
            id: `${position}_${type}_${color}`,
        },
        collect: (monitor) => {
            return { isDragging: !!monitor.isDragging() }
        },
    })
    const pieceImg = retimages(type, color);
    return (
        <>
            <DragPreviewImage connect={preview} src={pieceImg} />
            <div
                className="piece-container"
                ref={drag}
                style={{ opacity: isDragging ? 0 : 1 }}
            >
                <img src={pieceImg} alt="" className="piece" />
            </div>
        </>
    )
}