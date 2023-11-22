import React, { useEffect, useState } from 'react'
import { gameSubject, initGame, handleMove, resetGame, unduLastMove, saveGame, loadGame} from './game1'
import inforow from './inforow'
import Board from './board1'
import Coord from './coord'
import Swal from "sweetalert2";
import { useLocation } from "react-router-dom";
import { BrowserView, MobileView } from 'react-device-detect';

function HomePage() {
    const search = useLocation().search;
    const ocolor = new URLSearchParams(search).get('color');
    const userinfo = JSON.parse(localStorage.getItem('userinfo'));
    const localcolor = userinfo && userinfo.color ? userinfo.color : "White";
    let color = localcolor;
    if (ocolor) {
        color = ocolor === "White" ? "Black" : "White"
    }
    const [board, setBoard] = useState([])
    const [isGameOver, setIsGameOver] = useState()
    const [result, setResult] = useState()
    const [turn, setTurn] = useState()
    const [history, setHistory] = useState([])
    const [incheck, setIncheck] = useState()
    const [color1, setColor1] = useState(color);
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
    
    
    const handleBaseMove = (fromPosition, position) => {
             handleMove(fromPosition, position, false,)
    }
      
   
    let inf = [];
    for (var i = 0; i < history.length; i += 2) {
        if (history[i].color === 'w') {
            inf.push({
                "w": inforow(history[i] ? history[i] : null, i),
                "b": inforow(history[i + 1] ? history[i + 1] : null, i + 1)
            })
        }
        else {
            inf.push({
                "w": inforow(history[i - 1] ? history[i - 1] : null, i - 1),
                "b": inforow(history[i] ? history[i] : null, i)
            })
        }

    }
    // Create a room channel
    const onPressUndo = (e) => {
        unduLastMove()
    }
    // Create a room channel
    const onPressNewGame = (e) => {
        resetGame()
    }
    // The 'Reverse' button was pressed
    const onPressReverse = (e) => {
        color1 === "White" ? setColor1("Black"):setColor1("White")
    }   
    // The 'Save' button was pressed
    const onPressSave = (e) => {
        Swal.fire({
            title: 'Enter name of the game',
            html:
                '<input id="swal-input1" class="swal2-input">',
            focusConfirm: false,
            preConfirm: () => {
                return {
                    filename: document.getElementById('swal-input1').value,

                }
            }
        }).then((formValues) => {
            if (formValues.value) {
                saveGame(formValues.value.filename);
            }
        })
    }
    // The 'Load' button was pressed
    const onPressLoad = (e) => {
        Swal.fire({
            title: 'Enter name of the game',
            html:
                '<input id="swal-input1" class="swal2-input">',
            focusConfirm: false,
            preConfirm: () => {
                return {
                    filename: document.getElementById('swal-input1').value,

                }
            }
        }).then((formValues) => {
            if (formValues.value) {
                if (!loadGame(formValues.value.filename)) {
                    // Game in progress
                    Swal.fire({
                        position: 'top',
                        allowOutsideClick: false,
                        title: 'Error',
                        text: 'Game ' + formValues.value.filename + ' not found. Try another name.',
                        width: 275,
                        padding: '0.7em',
                        customClass: {
                            heightAuto: false,
                            title: 'title-class',
                            popup: 'popup-class',
                            confirmButton: 'button-class'
                        }
                    })
                }
            }
        })
    }
    return (
        <div>
        <BrowserView>
        <div className="row">
            <div className="column">
                <div className="container">
                    <h2 className="vertical-text">
                        {isGameOver && ("GAME OVER")}
                    </h2>
                    <div className="board-container">
                        <Board board={board} handlemove={handleBaseMove} color={color1}/>
                    </div>
                    <div className="row">
                        {result && <p className="vertical-text">{result}</p>}
                        <p className="vertical-text">{turn + ' ' + incheck}</p>
                    </div>
                </div>
            </div>
            <div className="column">
                <div className="itemcontainer">
                    <div className="info-container">
                        <div className="resp-table">
                            <div className="resp-table-caption">
                                Table 
                            </div>
                            <div className="resp-table-header">
                                <div className="table-header-cell">"White"</div>
                                <div className="table-header-cell">"Black"</div>
                            </div>
                            <div className="resp-table-body">
                                {inf.map((item, i) => (
                                    <div className="resp-table-row">
                                        {item.w}
                                        {item.b}
                                    </div>
                                ))}
                            </div>
                         </div>
                    </div>
                </div>
            </div>
            </div>
            <div className="resp-table">
            <div className="resp-table-footer">
                <div className="table-footer-cell">
                    <button className="buttongreen"
                        onClick={(e) => onPressNewGame()}

                    >
                        NEW GAME
                    </button>
                </div>
                <div className="table-footer-cell">

                    <button
                        className="buttongreen"
                        onClick={(e) => onPressUndo()}
                    >
                        UNDO
                    </button>
                </div>
           
                <div className="table-footer-cell">
                    <button
                        className="buttongreen"
                        onClick={(e) => onPressSave()}
                    > SAVE
                    </button>
                </div>
                <div className="table-footer-cell">
                    <button
                        className="buttongreen"
                        onClick={(e) => onPressLoad()}
                    > LOAD
                    </button>
                </div>
           
           
                <div className="table-footer-cell">
                    <button
                        className="buttongreen"
                        onClick={(e) => onPressReverse()}
                    > REVERSE BOARD
                    </button>
                </div>
                </div>
                </div>
            </BrowserView>
            <MobileView>
                <div className="containermob">
                    <h6>
                        <p className="hor-text">{turn + ' ' + incheck}</p>
                    </h6>
                    <div className="board-container">
                        <Board board={board} handlemove={handleBaseMove} color={color1} />
                    </div>
                    <h6 className="hor-text">
                        {isGameOver && ("GAME OVER")}
                    </h6>
                    <h6>
                        {result && <p className="hor-text">{result}</p>}
                    </h6>
                </div>
                <div className="resp-table">
                    <div className="resp-table-footer">
                        <div className="table-footer-cell">
                            <button className="buttongreen"
                                onClick={(e) => onPressNewGame()}
                            >
                                NEW 
                            </button>
                        
                            <button
                                className="buttongreen"
                                onClick={(e) => onPressUndo()}
                            >
                                UNDO
                            </button></div>
                        <div className="table-footer-cell">
                            <button
                                className="buttongreen"
                                onClick={(e) => onPressReverse()}
                            > REVERSE
                            </button>
                            <button
                                className="buttongreen"
                                onClick={(e) => onPressLoad()}
                            > LOAD
                            </button>
                            <button
                                className="buttongreen"
                                onClick={(e) => onPressSave()}
                            > SAVE
                            </button>
                        </div>
                    </div>
                </div>
            </MobileView>

         </div>   )

}
export default HomePage
