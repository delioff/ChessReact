import React, { useEffect, useState } from 'react'
import { useDrag, DragPreviewImage } from 'react-dnd'
import { ItemTypes } from '../constants'
import { retbgimages } from '../images'

export default function BgPiece({
    piece,
    position,
}) {
    const [CurrPiece, setCurrPiece] = useState([])
    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemTypes.SQUARE,
        item: {
            type: ItemTypes.SQUARE ,
            id: position,
        },
        collect: (monitor) => {
            return { isDragging: !!monitor.isDragging() }
        },
    })

    return (
        <>
            <DragPreviewImage connect={preview} src={retbgimages(piece)} />
            <div
                        ref={drag}
                        style={{ opacity: isDragging ? 0 : 1 }}
                    >
                    <img src={retbgimages(piece)} alt="" className="piece" />
             </div>
        </>
    )
}