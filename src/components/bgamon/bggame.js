import React, { useEffect, useState } from 'react'
import Backgammon from './bgbackend'
import { BehaviorSubject } from 'rxjs'
import PubNub from 'pubnub';

export const backgamonsubject
    = new BehaviorSubject()

const backgamon = new Backgammon()
//Publishing messages via PubNub
function publishMessage(from, to, channel, user,dice) {
    const pubnub = new PubNub({
        publishKey: "pub-c-e0419b3b-6aa9-4e4f-af8a-8dc193d1805a",
        subscribeKey: "sub-c-ee3e0f22-18b4-11ec-901d-e20c06117408",
        uuid: user
    });
    let messageObject = {
        text: JSON.stringify({ from: from, to: to, user: user,dice:dice}),
        user: user,
        cmd: "SETDICE",
        msg: dice?"Set Dice " + dice + " " +from+" "+to:"Move piece from " + from+" to "+to
    };

    pubnub.publish({
        message: messageObject,
        channel: channel
    });
}
function getWinner() {
    if (backgamon.gameover()) {
        if (backgamon.outw.length === 15) return "White"
        if (backgamon.outb.length === 15) return "Black"
    }
}
function getPointResult(color) {
    if (backgamon.gameover()) {
        if (color === 'w') {
            if (backgamon.outw.length === 15 && backgamon.outb.length === 0) return 2
            if (backgamon.outw.length === 15 && backgamon.outb.length > 0) return 1
        }
        else {
            if (backgamon.outb.length === 15 && backgamon.outw.length === 0) return 2
            if (backgamon.outb.length === 15 && backgamon.outw.length > 0) return 1
        }
    }
    return 0;
}
export function updateGame() {
    const currgame = backgamonsubject.getValue()
    const curruserscore1 = currgame && currgame.user1score ? currgame.user1score : 0
    const curruserscore2 = currgame && currgame.user2score ? currgame.user2score : 0
    const newGame = {
        board: backgamon.board,
        turn: backgamon.turn,
        handleb: backgamon.handleb,
        handlew: backgamon.handlew,
        outb: backgamon.outb,
        outw: backgamon.outw,
        gameover: backgamon.gameover(),
        user1score: curruserscore1 + getPointResult("w"),
        user2score: curruserscore2 + getPointResult("b"),
        counmoves: backgamon.counmoves(),
        winner: getWinner()
    }
    //sessionStorage.setItem('savedGame', chess.fen())
    backgamonsubject.next(newGame)
}
export function resendlastmove(channel, user) {
    const move = backgamon.getlastmove()
    if (move) publishMessage(move.i,move.j,channel, user)
}
export function move(i, j, frompush, channel, user) {
    if (backgamon.gameover()) return false;
    if (backgamon.move(i, j)) {
        if (frompush)  publishMessage(i,j,channel, user);
        updateGame()
        return true;
    }
    return false;
}
export function setdicew(pos, val, p, gameChannel, user) {
    if (backgamon.gameover()) return false;
    backgamon.setdicesw(pos, val)
    if (p) {
        publishMessage(pos, val, gameChannel, user,"w")
    }
    updateGame();
}
export function setdiceb(pos, val, p, gameChannel, user) {
    if (backgamon.gameover()) return false;
    backgamon.setdicesb(pos, val)
    if (p) {
        publishMessage(pos, val, gameChannel, user,"b")
    }
    updateGame();
}
export function canmovepiece(s, d) {
    if (Math.abs(s - d) > 6) return false;
    if (backgamon.canmovepiece(s, d)) return true;
}
export function newGame() {
    backgamon.newgame();
    updateGame();
}
export function undo() {
    backgamon.undo();
    updateGame();
}