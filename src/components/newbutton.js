import React from 'react'
import {resetGame} from './game'

export default function newButton() {
    const handleClick=(e)=> {
        e.preventDefault();
        resetGame();
    }
    return (
        <button onClick={(e) => handleClick(e)}>
               <span>NEW GAME</span>
        </button>
    )
}