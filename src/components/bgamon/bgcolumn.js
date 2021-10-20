import React, { useEffect, useState } from 'react'
import BgPiece from './bgpiece'
import BgSquare from './bgsquare'
import { useDrop } from 'react-dnd'
import { move, canmovepiece} from './bggame'
import { ItemTypes } from '../constants'
export default function BoardColumn({
    piece,
    position,
    handlemove
}) {
    const [{ isOver, canDrop }, drop] = useDrop({
        accept: ItemTypes.SQUARE,
        drop: (item) => {
            handlemove(item.id, position);
        },
        //canDrop: (item, monitor) => {
        //    return canmovepiece(item.id, position)
        //},
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop()
        })
    })
    let bgClass = position < 12 ? "board-squaret" : "board-squareb"
    if (position > 25) {
        bgClass = "square"
    }
    return (
        <div className={bgClass} ref={drop} data-testid={position}>
            <BgSquare>
                {piece.map((item, i) => <BgPiece piece={item} position={position} />)}
           </BgSquare>
           {/*{!isOver && canDrop && <div*/}
           {/*     style={{*/}
           {/*         position: 'absolute',*/}
           {/*         top: 0,*/}
           {/*         left: 0,*/}
           {/*         height: '100%',*/}
           {/*         width: '100%',*/}
           {/*         zIndex: 1,*/}
           {/*         opacity: 0.3,*/}
           {/*         backgroundColor: 'yellow',*/}
           {/*     }}*/}
           {/* />}*/}
           {/* {isOver && !canDrop && <div*/}
           {/*     style={{*/}
           {/*         position: 'absolute',*/}
           {/*         top: 0,*/}
           {/*         left: 0,*/}
           {/*         height: '100%',*/}
           {/*         width: '100%',*/}
           {/*         zIndex: 1,*/}
           {/*         opacity: 0.3,*/}
           {/*         backgroundColor: 'red',*/}
           {/*     }}*/}
           {/*/>}*/}
        </div>
    )
}