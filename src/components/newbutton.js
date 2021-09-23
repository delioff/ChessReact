import React from 'react'
import { resetGame, unduLastMove} from './game'

export default function newButton() {
     return (
        <div>
            <button onClick={resetGame}>
               <span>NEW GAME</span>
        </button>
        <button onClick={unduLastMove}>
               <span>UNDO</span>
            </button>
         </div>
    )
}