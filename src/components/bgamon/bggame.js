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
        user: user
    };

    pubnub.publish({
        message: messageObject,
        channel: channel
    });
}
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

export function move(i, j,frompush, channel, user) {
    if (backgamon.move(i, j)) {
        if (frompush) publishMessage(i, j,channel, user);
        updateGame()
        return true;
    }
    return false;
}
export function setdicew(pos, val, p, gameChannel, user) {
    backgamon.setdicesw(pos, val)
    if (p) {
        publishMessage(pos, val, gameChannel, user,"w")
    }
}
export function setdiceb(pos, val, p, gameChannel, user) {
    backgamon.setdicesb(pos, val)
    if (p) {
        publishMessage(pos, val, gameChannel, user,"b")
    }
}
export function canmovepiece(s, d) {
    if (Math.abs(s - d) > 6) return false;
    if (backgamon.canmovepiece(s, d)) return true;
}
export function newGame() {
    backgamon.newgame();
    updateGame();
}