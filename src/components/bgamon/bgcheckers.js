import React, { useEffect, useState } from 'react'
import BgPiece from './bgpiece'
import BgSquare from './bgsquare'
import { useDrop } from 'react-dnd'
import { move, canmovepiece} from './bggame'
import { ItemTypes } from '../constants'
export default function BoardCheckers({
    piece,
    position
}) {
    const [{ isOver, canDrop }, drop] = useDrop({
        accept: ItemTypes.SQUARE,
        drop: (item) => {
            move(item.id, position)
        },
        //canDrop: (item, monitor) => {
        //    return canmovepiece(item.id, position)
        //},
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop()
        })
    })
    const clname = "squarebg";
    return (
        <div className="boardbg" ref={drop} data-testid={position}>
            
            {piece.map((item, i) => <BgSquare top={clname}><BgPiece piece={item} position={position} /></BgSquare>)}
           
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