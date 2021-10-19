import React, { useEffect, useState } from 'react'
import Backgammon from './bgbackend'
import { BehaviorSubject } from 'rxjs'

export const backgamonsubject
    = new BehaviorSubject()

const backgamon = new Backgammon()

export function updateGame() {
    const newGame = {
        board: backgamon.getboard(),
        turn: backgamon.getturn(),
        handleb: backgamon.handleb,
        handlew: backgamon.handlew,
        outb: backgamon.outb,
        outw: backgamon.outw,
        gameover:backgamon.gameover()
    }
    //localStorage.setItem('savedGame', chess.fen())
    backgamonsubject.next(newGame)
}

export function move(i, j) {
    if (backgamon.move(i, j)) {
        updateGame()
    }
}
export function setdicew(pos, val) {
   backgamon.setdicesw(pos,val)
}
export function setdiceb(pos, val) {
   backgamon.setdicesb(pos, val)
}
export function canmovepiece(s, d) {
    if (Math.abs(s - d) > 6) return false;
    if (backgamon.canmovepiece(s, d)) return true;
}
export function newGame() {
    backgamon.newgame();
    updateGame();
}