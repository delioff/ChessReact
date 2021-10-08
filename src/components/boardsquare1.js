import React, { useEffect, useState } from 'react'
import Square from './square'
import Piece from './piece'
import { useDrop } from 'react-dnd'
import { gameSubject, canMovePiece } from './game1'
import Promote from './promote1'
import { ItemTypes } from './constants'
export default function BoardSquare({
    piece,
    black,
    position,
    handlemove,
    handleclick
}) {
    const [promotion, setPromotion] = useState(null);
    const [{ isOver, canDrop }, drop] = useDrop({
        accept: ItemTypes.SQUARE,
        drop: (item) => {
            const [fromPosition] = item.id.split('_')
            handlemove(fromPosition, position);

        },
        canDrop: (item, monitor) => {
            const [fromPosition] = item.id.split('_')
            return canMovePiece(fromPosition, position)
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop()
        })
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
        <div className="board-square" ref={drop} onClick={handlelocalclick} data-testid={position} >
            <Square black={black}>
                {promotion ? (
                    <Promote promotion={promotion} handlemove={handlemove} />
                ) : piece ? (
                    <Piece piece={piece} position={position} />
                ) : null}
            </Square>

            {!isOver && canDrop && <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: '100%',
                    zIndex: 1,
                    opacity: 0.3,
                    backgroundColor: 'yellow',
                }}
            />}
            {isOver && canDrop && <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: '100%',
                    zIndex: 1,
                    opacity: 0.3,
                    backgroundColor: 'green',
                }}
            />}
            {isOver && !canDrop && <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: '100%',
                    zIndex: 1,
                    opacity: 0.3,
                    backgroundColor: 'red',
                }}
            />}
        </div>
    )
}