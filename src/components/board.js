import React from 'react';
import '../index.css';
import Square from './square.js';

export default class Board 
 extends React.Component {
    renderSquare(i, wb,pos) {
        return(
            <Square
                id={i}
                style={this.props.squares[i] ? this.props.squares[i].style : null}
                value={this.props.squares[i] ? this.props.squares[i].value : null}
                onClick={() => this.props.onClick(i)}
                onDrop={(e) => this.props.onDrop(e,i)}
                onDragStart={(e) => this.props.onDragStart(e,i)}
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
                </div>
           
        );
    }
}

function isEven(num) {
    return num % 2 === 0
}