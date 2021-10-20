import React, { useEffect, useState } from 'react'
import BoardColumn from './bgcolumn'

export default function Board({ board,handlemove }) {
    const [currBoard, setCurrBoard] = useState([])
    useEffect(() => {
        setCurrBoard(board)
    }, [board])
    const x=["*","*","*","D","E","L","I","O","F","F","*","*","*"]  
    return (
        <div className="board">
            {currBoard.map
            (
              (piece, i) =>
                (i < 12) ? ((i === 6) ?
                    (
                        <div className="mid">
                        <div className="bgcolumnmidle">
                        
                        </div>
                        <div key={i} className="bgcolumnmm">
                            < BoardColumn
                                piece={piece}
                                        position={i}
                                        handlemove={handlemove}
                            />
                        </div>
                        </div>
                    )
                        :
                    (
                        <div key={i} className="bgcolumn">
                            < BoardColumn
                                piece={piece}
                                    position={i}
                                    handlemove={handlemove}
                            />
                        </div>
                    )
                )
                        :
                        ((i === 18) ?
                    (
                                <div className="mid">
                                    <div className="bgcolumnmidle">

                                    </div>
                                    <div key={i} className="bgcolumnrmm">
                                        < BoardColumn
                                            piece={piece}
                                            position={i}
                                            handlemove={handlemove}
                                        />
                                    </div>
                                </div>
                            ) :
                            (<div key={i} className="bgcolumnr">
                           < BoardColumn
                                piece={piece}
                                    position={i}
                                    handlemove={handlemove}
                                />
                        
                        </div>
                            
                            )
                        )
            )}
           
         </div>
    )
}