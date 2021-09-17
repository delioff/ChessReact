import React, { useEffect, useState } from 'react'
import './App.css'
import { gameSubject, initGame} from './components/game'
import inforow from './components/inforow'
import Board from './components/board'
import NewButton from './components/newbutton'
import Coord from './components/coord'

function App() {
    const [board, setBoard] = useState([])
    const [isGameOver, setIsGameOver] = useState()
    const [result, setResult] = useState()
    const [turn, setTurn] = useState()
    const [history, setHistory] = useState([])
    const [incheck, setIncheck] = useState()
    useEffect(() => {
        initGame()
        const subscribe = gameSubject.subscribe((game) => {
            setBoard(game.board)
            setIsGameOver(game.isGameOver)
            setResult(game.result)
            setTurn(game.turn)
            setHistory(game.history)
            setIncheck(game.incheck)
        })
        return () => subscribe.unsubscribe()
    }, [])
    let inf = [];
    let x = ["a", "b","c", "d","e","f", "g","h"];
    let y = ["8", "7", "6", "5", "4", "3", "2", "1"];
    for (var i = 0; i < history.length; i += 2) {
        if (history[i].color === 'w') {
            inf.push({
                "w": inforow(history[i] ? history[i] : null, i),
                "b": inforow(history[i+1] ? history[i+1] : null, i+1)
            })
        }
        else {
            inf.push({
                "w": inforow(history[i-1] ? history[i-1] : null, i-1),
                "b": inforow(history[i] ? history[i] : null, i)
            })
        }
    
    }
    return (
        <div className="row">
            <div className="column">
                
                <div className="container">
                    
                        <h2 className="vertical-text">
                                 {isGameOver && ("GAME OVER")}
                        </h2>
                        <div className="row">
                            <div className="column">
                                <div className="cord-container">
                                    {y.map((letter, i) => (
                                        <Coord letter={letter} or={("v")}/>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="board-container">
                            <div className="cord-container-x">
                                <div className="row">
                                    {x.map((letter, i) => (
                                        <Coord letter={letter} />
                                    ))}
                                </div>
                            </div>
                            <Board board={board} turn={turn} />
                            <div className="cord-container-x">
                                <div className="row">
                                    {x.map((letter, i) => (
                                        <Coord letter={letter} />
                                    ))}
                                </div>
                             </div>
                         </div>
                        <div className="row">
                            <div className="column">
                               <div className="cord-container">
                                    {y.map((letter, i) => (
                                        <Coord letter={letter} or={("v")}/>
                                    ))}
                                </div>
                        </div>
                    {result && <p className="vertical-text">{result}</p>}
                    <p className="vertical-text">{turn+' '+incheck}</p>
                    </div>
                        
                 </div>
               
                
            </div>
            <div className="column">
                <div className="itemcontainer">
                    <div className="info-container">
                         <div className="resp-table">
                            <div className="resp-table-caption">
                                <NewButton/>
                             </div>
                            <div className="resp-table-header">
                                    <div className="table-header-cell">White</div>
                                    <div className="table-header-cell">Black</div>
                            </div>
                            <div className="resp-table-body">
                                    {inf.map((item, i) => (
                                        <div className="resp-table-row">
                                            {item.w}
                                            {item.b}
                                        </div>
                                    ))}
                            </div>
                            {/*<div className="resp-table-footer">*/}
                            {/*    <div className="table-footer-cell">White</div>*/}
                            {/*    <div className="table-footer-cell">Black</div>*/}
                            {/*</div>*/}
                          </div>
                    </div>
                 </div>
             </div>
            
        </div>
         )
}

export default App
