import React, { useEffect, useState } from 'react'
import BoardSquare from './boardsquare'
export default function Board({ board, color, handlemove }) {
    const [currBoard, setCurrBoard] = useState([])
    const [currSelection, setCurrSelection] = useState(null)
    useEffect(() => {
        setCurrBoard(
            color === 'White' ? board.flat() : board.flat().reverse()
        )
    }, [board, color])
    let x = ["a", "b", "c", "d", "e", "f", "g", "h"];
    if (color !== "White") x = ["h", "g", "f", "e", "d", "c", "b", "a"]

    function getXYPosition(i) {
        const x = color === 'White' ? i % 8 : Math.abs((i % 8) - 7)
        const y =
            color === 'White'
                ? Math.abs(Math.floor(i / 8) - 7)
                : Math.floor(i / 8)
        return { x, y }
    }

    function isBlack(i) {
        const { x, y } = getXYPosition(i)
        return (x + y) % 2 === 1
    }

    function getPosition(i) {
        const { x, y } = getXYPosition(i)
        const letter = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][
            x
        ]
        return `${letter}${y + 1}`
    }
    function getCordPosition(i) {
        const { x, y } = getXYPosition(i)
        const letter = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][
            x
        ]
        return { letter: letter, y: y + 1 }
    }
    function handleclick(fromto) {
        if (currSelection) {
            handlemove(currSelection, fromto)
            setCurrSelection(null);
        }
        else {
            setCurrSelection(fromto);
        }
    }
    return (
        <div className="board">
            <div className="cord-squarexxx"></div>
            {x.map((x, i) => <div className="cord-squareyy">
                <div className="piece-container">
                    <span className="vertical-text-cord">{x}
                    </span>
                </div>
            </div>)}
            <div className="cord-squarexxx"></div>
            {currBoard.map((piece, i) =>
                (i % 8 === 0) ? (
                    <>
                        <div className="cord-squarexx">
                            <div className="piece-container">
                                <span className="vertical-text-cord">{getCordPosition(i).y}
                                </span>
                            </div>
                        </div>
                        <div key={i} className="square">
                            <BoardSquare
                                piece={piece}
                                black={isBlack(i)}
                                position={getPosition(i)}
                                handlemove={handlemove}
                                handleclick={handleclick}
                            />
                        </div>
                    </>
                ) : (i % 8 === 7) ? (
                    <><div key={i} className="square">
                        <BoardSquare
                            piece={piece}
                            black={isBlack(i)}
                            position={getPosition(i)}
                            handlemove={handlemove}
                            handleclick={handleclick}
                        />
                    </div>
                        <div className="cord-squarexx">
                            <div className="piece-container">
                                <span className="vertical-text-cord">{getCordPosition(i).y}
                                </span>
                            </div>
                        </div>
                    </>
                ) : (<div key={i} className="square">
                    <BoardSquare
                        piece={piece}
                        black={isBlack(i)}
                        position={getPosition(i)}
                        handlemove={handlemove}
                        handleclick={handleclick}
                    />
                </div>
                )
            )}
            <div className="cord-squarexxx"></div>
            {x.map((x, i) =>
                <div className="cord-squareyy">
                    <div className="piece-container">
                        <span className="vertical-text-cord">{x}
                        </span>
                    </div>
                </div>)}
            <div className="cord-squarexxx"></div>
        </div>
    )
}