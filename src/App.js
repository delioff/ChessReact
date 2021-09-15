import React, { useEffect, useState } from 'react'
import './App.css'
import { gameSubject, initGame, resetGame } from './components/game'
import inforow from './components/inforow'
import Board from './components/board'

function App() {
    const [board, setBoard] = useState([])
    const [isGameOver, setIsGameOver] = useState()
    const [result, setResult] = useState()
    const [turn, setTurn] = useState()
    const [history, setHistory] = useState([])
    useEffect(() => {
        initGame()
        const subscribe = gameSubject.subscribe((game) => {
            setBoard(game.board)
            setIsGameOver(game.isGameOver)
            setResult(game.result)
            setTurn(game.turn)
            setHistory(game.history)
        })
        return () => subscribe.unsubscribe()
    }, [])
    let inf = [];
    for (var i = 0; i < history.length; i += 2) {
        inf.push({
            "w": inforow(history[i], i),
            "b": inforow(history[i + 1] ? history[i + 1] : null, i+1)
        })
    }
    return (
        <div className="row">
            <div className="column">
                <div className="container">
                   
                        <h2 className="vertical-text">
                             {isGameOver && ("GAME OVER")}
                            <button onClick={resetGame}>
                                <span className="vertical-text"> NEW GAME</span>
                            </button>
                        </h2>
                    
                    <div className="board-container">
                        <Board board={board} turn={turn} />
                    </div>
                    {result && <p className="vertical-text">{result}</p>}
                </div>
               
            </div>
            <div className="column">
                <div className="itemcontainer">
                    <table class="blueTable">
                        <thead>
                            <tr>
                                <th>White</th>
                                <th>Black</th>
                            </tr>
                        </thead>
                        <tbody>
                            
                            {inf.map((item, i) => (
                                <tr>
                                    {item.w}
                                    {item.b}
                                </tr>
                            ))}
                            
                        </tbody>
                    </table>
                    <div className="board-row"></div>
                </div>
             </div>  
         </div>
    )
}

export default App
