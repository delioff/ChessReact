import React from 'react'
import { resetGame, unduLastMove} from './game1'

export default function NewButton() {
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