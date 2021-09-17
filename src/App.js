import React, { useEffect, useState } from 'react'
import './App.css'
import { gameSubject, initGame} from './components/game'
import inforow from './components/inforow'
import Board from './components/board'
import NewButton from './components/newbutton'

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
    for (var i = 0; i < history.length; i += 2) {
        if (history.color === 'b') {
            inf.push({
                "w": inforow(history[i], i),
                "b": inforow(history[i + 1] ? history[i + 1] : null, i + 1)
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
                    
                    <div className="board-container">
                        <Board board={board} turn={turn} />
                    </div>
                    {result && <p className="vertical-text">{result}</p>}
                    <p className="vertical-text">{turn+' '+incheck}</p>
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
