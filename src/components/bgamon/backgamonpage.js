import React, { useEffect, useState } from 'react'
import { backgamonsubject, updateGame, setdiceb, setdicew,newGame} from './bggame'
import Board from './bgboard'
import Dice from "react-dice-roll";
import BoardCheckers from './bgcheckers'

function BackamonPage() {
   
    const [board, setBoard] = useState([])
    const [handleb, sethandleb] = useState([])
    const [handlew, sethandlew] = useState([])
    const [outb, setoutb] = useState([])
    const [outw, setoutw] = useState([])
    const [gameover, setgameover] = useState()
    const [turn, setTurn] = useState("w")
    const [disabledw, setdisabledw] = useState(false)
    const [disabledb, setdisabledb] = useState(false)
    const diceRefw = React.useRef(null);
    const diceRefb = React.useRef(null);
    useEffect(() => {
        updateGame()
        const subscribe = backgamonsubject.subscribe((game) => {
            setBoard(game.board)
            setTurn(game.turn)
            sethandlew(game.handlew)
            sethandleb(game.handleb)
            setoutb(game.outb)
            setoutw(game.outw)
            setgameover(game.gameover)
        })
        return () => subscribe.unsubscribe()
    }, [])
    
    const onRollw = () => {
        if (diceRefw && diceRefw.current) {
            setdisabledb(false);
            setdisabledw(true);
            diceRefw.current.style.pointerEvents = "auto";
            diceRefw.current.children[0].click();
            diceRefw.current.children[1].click();
            diceRefw.current.style.pointerEvents = "none";
        }
    };
    const onRollb = () => {
        if (diceRefb && diceRefb.current) {
            setdisabledb(true);
            setdisabledw(false);
            diceRefb.current.style.pointerEvents = "auto";
            diceRefb.current.children[0].click();
            diceRefb.current.children[1].click();
            diceRefb.current.style.pointerEvents = "none";
        }
    };
    const onNewGame = () => {
        newGame();
    };
    return (
         <div className="container">
            <div className="leftbox">
                {turn === "w" ? null : (<p className="textw">Turn Black</p>)}
                <div className="check-container">
                    < BoardCheckers
                    piece={handleb}
                    position={31}
                    />
                 </div>
                {turn === "w" ? null : (<button className="buttongreen" onClick={onRollw} disabled={disabledw}>Roll!</button>)}
                <div ref={diceRefw} style={{ pointerEvents: "none" }}>
                    <Dice size={100} onRoll={(value) => setdiceb(0,value) } />
                    <Dice size={100} onRoll={(value) => setdiceb(1,value) } />
                </div>
                
                <div className="check-container">
                    < BoardCheckers
                    piece={outb}
                    position={41}
                    />
                </div>
            </div>
            <div className="middlebox">
                {gameover ? (<div><p className="textw">Gameover Winner {turn === "w" ? ("White"):("Black")}</p><button className="buttongreen" onClick={onNewGame}>New Game!</button></div>) : null}
                <div className="bg-container">
                    <Board board={board} />
                </div>
            </div>
            <div className="rightbox">
                {turn === "w" ? (<p className="textb">Turn White</p>) : null}
                <div className="check-container">
                    <BoardCheckers
                    piece={handlew}
                    position={32}
                    />
                </div>
                {turn === "w" ? (<button className="buttongreen" onClick={onRollb} disabled={turn === "w"} disabled={disabledb}>Roll!</button>) : null}
                <div ref={diceRefb} style={{ pointerEvents: "none" }}>
                    <Dice size={100} onRoll={(value) => setdicew(0,value)  } />
                    <Dice size={100} onRoll={(value) => setdicew(1, value)} />
                 </div>
                
                <div className="check-container">
                    <BoardCheckers
                    piece={outw}
                    position={42}
                    />
                </div>
            </div>
         </div>
        )
}
export default BackamonPage
