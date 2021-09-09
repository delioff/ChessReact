import React from 'react';

import '../index.css';
import King from '../pieces/king'
import Board from './board.js';
import FallenSoldierBlock from './fallen-soldier-block.js';
import initialiseChessBoard from '../helpers/board-initialiser.js';

export default class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            squares: initialiseChessBoard(),
            history: [{
                squares: initialiseChessBoard(),
                whiteFallenSoldiers: [],
                blackFallenSoldiers: [],
                player: 1,
                sourceSelection: -1,
                status: '',
                turn: 'white',
                stepnumber: 0
            }],
            whiteFallenSoldiers: [],
            blackFallenSoldiers: [],
            player: 1,
            sourceSelection: -1,
            status: '',
            turn: 'white',
            stepnumber: 0
        };
    }
    handleDrop(e,i) {
        e.preventDefault();
        this.handleClick(i);
    }

    handleDragStart(e,i) {
        this.handleClick(i);
    }

    handleClick(i) {
        const squares = [...this.state.squares];

        if (this.state.sourceSelection === -1) {
            if (!squares[i] || squares[i].player !== this.state.player) {
                this.setState({ status: "Wrong selection. Choose player " + this.state.player + " pieces." });
                if (squares[i]) {
                    squares[i].style = { ...squares[i].style, backgroundColor: "" };
                }
            }
            else {
                squares[i].style = { ...squares[i].style, backgroundColor: "RGB(111,143,114)" }; // Emerald from http://omgchess.blogspot.com/2015/09/chess-board-color-schemes.html
                this.setState({
                    status: "Choose destination for the selected piece",
                    sourceSelection: i
                })
            }
            return
        }

        squares[this.state.sourceSelection].style = { ...squares[this.state.sourceSelection].style, backgroundColor: "" };

        if (squares[i] && squares[i].player === this.state.player) {
            this.setState({
                status: "Wrong selection. Choose valid source and destination again.",
                sourceSelection: -1,
            });
        }
        else {

            const whiteFallenSoldiers = [];
            const blackFallenSoldiers = [];
            const isDestEnemyOccupied = Boolean(squares[i]);
            const isMovePossible = squares[this.state.sourceSelection].isMovePossible(this.state.sourceSelection, i, isDestEnemyOccupied);
            if (isMovePossible) {
                if (squares[i] !== null) {
                    if (squares[i].player === 1) {
                        whiteFallenSoldiers.push(squares[i]);
                    }
                    else {
                        blackFallenSoldiers.push(squares[i]);
                    }
                }

                squares[i] = squares[this.state.sourceSelection];
                squares[this.state.sourceSelection] = null;

                const isCheckMe = this.isCheckForPlayer(squares, this.state.player)

                if (isCheckMe) {
                    this.setState(oldState => ({
                        status: "Wrong selection. Choose valid source and destination again. Now you have a check!",
                        sourceSelection: -1,
                    }))
                } else {
                    const ah = ['a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
                                'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
                                'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
                                'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
                                'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
                                'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
                                'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
                                'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'];
                    let player = this.state.player === 1 ? 2 : 1;
                    let turn = this.state.turn === 'white' ? 'black' : 'white';
                    const history = this.state.history.slice(0, this.state.stepnumber + 1);
                    this.setState(oldState => ({
                        history: history.concat([{
                            sourceSelection: -1,
                            squares,
                            whiteFallenSoldiers: whiteFallenSoldiers,
                            blackFallenSoldiers: blackFallenSoldiers,
                            player,
                            status: 'Turn ' + turn,
                            turn,
                            stepnumber: history.length,
                            move: squares[i].title + ':' + ah[this.state.sourceSelection] + '-' + ah[i]
                        }]),
                        sourceSelection: -1,
                        squares,
                        whiteFallenSoldiers: [...oldState.whiteFallenSoldiers, ...whiteFallenSoldiers],
                        blackFallenSoldiers: [...oldState.blackFallenSoldiers, ...blackFallenSoldiers],
                        player,
                        status: 'Turn ' + turn,
                        turn,
                        stepnumber: history.length,
                        move: squares[i].title+':'+ah[this.state.sourceSelection] +'-' + ah[i]
                    }));
                    
                    
                }
            }
            else {
                this.setState({
                    status: "Wrong selection. Choose valid source and destination again.",
                    sourceSelection: -1,
                });
            }
        }
    }

    getKingPosition(squares, player) {
        return squares.reduce((acc, curr, i) =>
            acc || //King may be only one, if we had found it, returned his position
            ((curr //current squre mustn't be a null
                && (curr.getPlayer() === player)) //we are looking for aspecial king 
                && (curr instanceof King)
                && i), // returned position if all conditions are completed
            null)
    }

    isCheckForPlayer(squares, player) {
        const opponent = player === 1 ? 2 : 1
        const playersKingPosition = this.getKingPosition(squares, player)
        const canPieceKillPlayersKing = (piece, i) => piece.isMovePossible(playersKingPosition, i, squares)
        return squares.reduce((acc, curr, idx) =>
            acc ||
            (curr &&
                (curr.getPlayer() === opponent) &&
                canPieceKillPlayersKing(curr, idx)
                && true),
            false)
    }
    jumpTo(step) {
        const history = this.state.history;
        this.setState(history[step]);
    }
    render() {
        const history = this.state.history.slice(0, this.state.history.length);
        const moves = history.map((step, move) => {
            const player = step.player == 1 ?   "Black":"White";
            const desc = move ? player+' #' + move + ' ' + step.move : 'Go to game start';
            return (
                <li>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });
        return (
            <div className="game">
                <div className="chessboard">
                    <Board
                        squares={this.state.squares}
                        onClick={(i) => this.handleClick(i)}
                        onDrop={(e,i) => this.handleDrop(e,i)}
                        onDragStart={(e,i) => this.handleDragStart(e,i)}
                    />
                </div>
                <div className="game-info">
                    <h3>Turn</h3>
                    <div id="player-turn-box" style={{ backgroundColor: this.state.turn }}>

                    </div>
                    <div className="game-status">{this.state.status}</div>

                    <div >

                        {<FallenSoldierBlock
                            whiteFallenSoldiers={this.state.whiteFallenSoldiers}
                            blackFallenSoldiers={this.state.blackFallenSoldiers}
                        />
                        }
                    </div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }

}


// ========================================