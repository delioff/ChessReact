import React, { useEffect, useState } from 'react'
import Backgammon from './bgbackend'
import { BehaviorSubject } from 'rxjs'

export const backgamonsubject
    = new BehaviorSubject()

const backgamon = new Backgammon()

export function updateGame() {
    const newGame = {
        board: backgamon.getboard(),
       
    }
    //localStorage.setItem('savedGame', chess.fen())
    backgamonsubject.next(newGame)
}

export function move(i, j) {
    if (backgamon.move(i, j)) {
        updateGame()
    }
}
