import React, { useEffect, useState } from 'react'
import BoardColumn from './bgcolumn'

export default function Board({ board }) {
    const [currBoard, setCurrBoard] = useState([])
    useEffect(() => {
        setCurrBoard(board)
    }, [board])
    let x = ["1", "2", "3", "4", "5", "6", "7", "8","9","10","11","12"];
    let y = ["13", "14", "15", "16", "17", "18", "19", "20","21","22","23","24"]
    
    return (
        <div className="board">
            {x.map((x, i) => <div className="cord-bg">
                <div className="piece-container">
                    <span>{x}
                    </span>
                </div>
            </div>)}
            {currBoard.map((piece, i) =>
                (i < 12) ? (
                    <div key={i} className="bgcolumn">
                        < BoardColumn
                            piece={piece}
                            position={i}
                        />
                    </div>) :
                    (<div key={i} className="bgcolumnr">
                        < BoardColumn
                            piece={piece}
                            position={i}
                        />
                    </div>)
            )}
            {y.map((x, i) =>
                <div className="cord-bg">
                    <div className="piece-container">
                        <span >{x}
                        </span>
                    </div>
                </div>)}
         </div>
    )
}