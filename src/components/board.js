import React from 'react';

import '../index.css';
import Square from './square.js';

export default class Board 
 extends React.Component {
    renderSquare(i, wb,pos) {
        return(
                <Square
                style={this.props.squares[i] ? this.props.squares[i].style : null}
                value={this.props.squares[i] ? this.props.squares[i].value : null}
                onClick={() => this.props.onClick(i)}
                class={wb ? "white" : "black"}
                 />)

    }

    render() {
        const board = [];
        for (let i = 0; i < 8; i++) {
            const squareRows = [];
            for (let j = 0; j < 8; j++) {
                const squareShade = (isEven(i) && isEven(j)) || (!isEven(i) && !isEven(j)) ? true : false;
                board.push(this.renderSquare((i * 8) + j, squareShade));
            }

        }
        return (
            <div>
                {board}
                {/*{this.renderSquare(0,'♜',1,"a8")}*/}
                {/*{this.renderSquare(1,'♞',0,"a8")}*/}
                {/*{this.renderSquare(2,'♝',1,"a8")}*/}
                {/*{this.renderSquare(3,'♛',0,"a8")}*/}
                {/*{this.renderSquare(4,'♚',1,"a8")}*/}
                {/*{this.renderSquare(5,'♝',0,"a8")}*/}
                {/*{this.renderSquare(6,'♞',1,"a8")}*/}
                {/*{this.renderSquare(7,'♜',0,"a8")}*/}

                {/*{this.renderSquare(8,'♟',0,"a7")}*/}
                {/*{this.renderSquare(9,'♟',1,"a7")}*/}
                {/*{this.renderSquare(10,'♟',0,"a7")}*/}
                {/*{this.renderSquare(11,'♟',1,"a7")}*/}
                {/*{this.renderSquare(12,'♟',0,"a7")}*/}
                {/*{this.renderSquare(13,'♟',1,"a7")}*/}
                {/*{this.renderSquare(14,'♟',0,"a7")}*/}
                {/*{this.renderSquare(15,'♟',1,"a7")}*/}

                {/*{this.renderSquare(16, '', 1,"a6")}*/}
                {/*{this.renderSquare(17, '', 0,"a6")}*/}
                {/*{this.renderSquare(18, '', 1,"a6")}*/}
                {/*{this.renderSquare(19, '', 0,"a6")}*/}
                {/*{this.renderSquare(20, '', 1,"a6")}*/}
                {/*{this.renderSquare(21, '', 0,"a6")}*/}
                {/*{this.renderSquare(22, '', 1,"a6")}*/}
                {/*{this.renderSquare(23, '', 0,"a6")}*/}

                {/*{this.renderSquare(24, '', 0,"a5")}*/}
                {/*{this.renderSquare(25, '', 1,"a5")}*/}
                {/*{this.renderSquare(26, '', 0,"a5")}*/}
                {/*{this.renderSquare(27, '', 1,"a5")}*/}
                {/*{this.renderSquare(28, '', 0,"a5")}*/}
                {/*{this.renderSquare(29, '', 1,"a5")}*/}
                {/*{this.renderSquare(30, '', 0,"a5")}*/}
                {/*{this.renderSquare(31, '', 1,"a5")}*/}


                {/*{this.renderSquare(32, '', 1,"a4")}*/}
                {/*{this.renderSquare(33, '', 0,"a4")}*/}
                {/*{this.renderSquare(34, '', 1,"a4")}*/}
                {/*{this.renderSquare(35, '', 0,"a4")}*/}
                {/*{this.renderSquare(36, '', 1,"a4")}*/}
                {/*{this.renderSquare(37, '', 0,"a4")}*/}
                {/*{this.renderSquare(38, '', 1,"a4")}*/}
                {/*{this.renderSquare(39, '', 0,"a4")}*/}

                {/*{this.renderSquare(40, '', 0,"a3")}*/}
                {/*{this.renderSquare(41, '', 1,"a3")}*/}
                {/*{this.renderSquare(42, '', 0,"a3")}*/}
                {/*{this.renderSquare(43, '', 1,"a3")}*/}
                {/*{this.renderSquare(44, '', 0,"a3")}*/}
                {/*{this.renderSquare(45, '', 1,"a3")}*/}
                {/*{this.renderSquare(47, '', 0,"a3")}*/}
                {/*{this.renderSquare(48, '', 1,"a3")}*/}

                {/*{this.renderSquare(49, '♙', 1,"a2")}*/}
                {/*{this.renderSquare(50, '♙', 0,"a2")}*/}
                {/*{this.renderSquare(51, '♙', 1,"a2")}*/}
                {/*{this.renderSquare(52, '♙', 0,"a2")}*/}
                {/*{this.renderSquare(53, '♙', 1,"a2")}*/}
                {/*{this.renderSquare(54, '♙', 0,"a2")}*/}
                {/*{this.renderSquare(55, '♙', 1,"a2")}*/}
                {/*{this.renderSquare(56, '♙', 0,"a2")}*/}

                {/*{this.renderSquare(52, '♖', 0,"a1")}*/}
                {/*{this.renderSquare(53, '♘', 1,"a1")}*/}
                {/*{this.renderSquare(54, '♗', 0,"a1")}*/}
                {/*{this.renderSquare(55, '♕', 1,"a1")}*/}
                {/*{this.renderSquare(60, '♔', 0,"a1")}*/}
                {/*{this.renderSquare(61, '♗', 1,"a1")}*/}
                {/*{this.renderSquare(62, '♘', 0,"a1")}*/}
                {/*{this.renderSquare(63, '♖', 1,"a1")}*/}


            </div>
        );
    }
}

function isEven(num) {
    return num % 2 === 0
}