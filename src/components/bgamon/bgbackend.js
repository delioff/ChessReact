/*
 * Copyright (c) 2021, Uncle Toni (delioff@gmail.com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 *----------------------------------------------------------------------------*/
 class Backgammon {
    constructor(initposition) {
        this.DEFAULT_POSITION = 'ww*0*0*0*0*bbbbb*0*bbb*0*0*0*wwwww*bb*0*0*0*0*wwwww*0*www*0*0*0*bbbbb';
        //this.DEFAULT_POSITION = 'bbbbb*bbbb*bb*b*b*bbb*0*0*0*0*0*0*wwwww*ww*www*ww*ww*w*0*0*0*0*0*0';
        this.board = new Array(24).fill(null);
        this.outb = new Array();
        this.outw = new Array();
        this.inputb = new Array();
        this.inputw = new Array();
        this.handleb = new Array();
        this.handlew = new Array();
        this.dicesw = new Array(4).fill(0);
        this.dicesb = new Array(4).fill(0);
        this.mapb = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,11,23,22,21,20,19,18,17,16,15,14,13,12];
        this.mapw = [23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        this.handlemapw = [0, 0, 1, 2, 3, 4, 5];
        this.handlemapb = [0, 12, 13, 14, 15, 16, 17];

        this.turn = 'w';
        if (typeof fen === 'undefined') {
            this.load(this.DEFAULT_POSITION);
        } else {
            this.load(initposition);
        }
     }
     newgame = (initposition) => {
         this.DEFAULT_POSITION = 'ww*0*0*0*0*bbbbb*0*bbb*0*0*0*wwwww*bb*0*0*0*0*wwwww*0*www*0*0*0*bbbbb';
         this.board = new Array(24).fill(null);
         this.outb = new Array();
         this.outw = new Array();
         this.inputb = new Array();
         this.inputw = new Array();
         this.handleb = new Array();
         this.handlew = new Array();
         this.dicesw = new Array(4).fill(0);
         this.dicesb = new Array(4).fill(0);
         this.mapb = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12];
         this.mapw = [23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
         this.handlemapw = [0, 0, 1, 2, 3, 4, 5];
         this.handlemapb = [0, 12, 13, 14, 15, 16, 17];

         this.turn = 'w';
         if (typeof fen === 'undefined') {
             this.load(this.DEFAULT_POSITION);
         } else {
             this.load(initposition);
         }
     }
    load(fen) {
        var tokens = fen.split("*")
        for (var i = 0; i < tokens.length; i++) {
            var toki = tokens[i];
            if (toki === "0") {
                this.board[i] = new Array()
            }
            else {
                this.board[i] = toki.split('');
                //for (var j = 0; j <= toki.length; j++) {

                //    this.board[i].push(toki.charAt(j))
                //}
            }
        }
    }
    getboard=()=> {
        return this.board;
    }
    getturn = () => {
         return this.turn;
    }
     move = (i, j) => {
         if (this.cancollect() && this.collect(i)) {
             return true;
         }
         else
             if (j > 25) return false;
             if (this.islegalmove(i, j)) {

             var source = this.board[i];
             var dest = this.board[j];
             if (source.length>0) {
                 dest.push(source.pop());
                 this.board[i] = source;
                 this.board[j] = dest;
                 if (this.turn === "w" && this.instackw()) { this.dicesw = new Array().fill(0) }
                 if (this.turn === "b" && this.instackb()) { this.dicesb = new Array().fill(0) }
                 this.switchturn();
                 return true;
             }
             return false

         }
         else return false;
         
     }
     setdicesb = (pos, val) => {
         if (this.turn === 'w') return;
         this.dicesb[pos]= val;
         if (this.dicesb[0] === this.dicesb[1]) {
             this.dicesb[2] = val;
             this.dicesb[3] = val;
         }
         if ((this.dicesb[0] !== 0) && (this.dicesb[1] !== 0)) {
             if (this.instackw()) {
                 this.dicesw = new Array(4).fill(0);
                 this.switchturn();
             }
         }
     }
     setdicesw = (pos, val) => {
         if (this.turn === 'b') return;
         this.dicesw[pos] = val;
         if (this.dicesw[0] === this.dicesw[1]) {
             this.dicesw[2] = val;
             this.dicesw[3] = val;
         }
         if ((this.dicesb[0] !== 0) && (this.dicesb[1] !== 0)) {
             if (this.instackb()) {
                 this.dicesb = new Array(4).fill(0);
                 this.switchturn();
             }
         }
     }
     switchturn = () => {
         if (this.turn === 'w') {
             for (var i = 0; i < this.dicesw.length; i++) {
                 if (this.dicesw[i] > 0) return;
             }
         }
         else {
             for (var i = 0; i < this.dicesb.length; i++) {
                 if (this.dicesb[i] > 0) return;
             }
         }
         this.turn === 'w'?this.turn ='b':this.turn ='w';
     }
     checkdice = (s, d) => {
         var rez = false;
         if (this.turn === 'w') {
             for (var i = 0; i < this.dicesw.length; i++) {
                 var source = this.board[s];
                 var dest = this.board[d];
                 if (dest.length > 1 && source && source[source.length - 1] !== dest[dest.length - 1]) {
                         continue;
                 }
                 if (this.dicesw[i] === this.mapw[s] - this.mapw[d]) {
                     rez = true; this.dicesw[i] = 0; break;
                 }
             }
         }
         else {
             for (var i = 0; i < this.dicesb.length; i++) {
                 if (this.dicesb[i] === this.mapb[s] - this.mapb[d]) {
                     var source = this.board[s];
                     var dest = this.board[d];
                     if (dest.length > 1 && source[source.length - 1] !== dest[dest.length - 1]) {
                         continue;
                     }
                     rez = true; this.dicesb[i] = 0; break;
                 }
             }
         }
         return rez
     }
     islegalmove = (s, d) => {
         if (this.dohandle(s, d)) return false;
         if (!this.checkdice(s, d)) return false;
         var source = this.board[s];
         var dest = this.board[d];
         if (source.length > 0) {
             if (this.turn !== source[source.length - 1]) {
                 return false;
             }
             if (dest.length === 1 && source[source.length - 1] !== dest[dest.length - 1]) {
                 dest[dest.length - 1] === "w" ? this.handlew.push(dest.pop()) : this.handleb.push(dest.pop())
             }
             
         }
         
         return true;
     }
     canmovepiece = (s, d) => {
         if (this.thurn === "w") {
             for (var i = 0; i < this.dicesw.length; i++) {
                 var source = this.board[s];
                 var dest = this.board[d];
                 if (dest && dest.length > 1 && source && source[source.length - 1] !== dest[dest.length - 1]) {
                     continue;
                 }
                 if (this.dicesw[i] === this.mapw[s] - this.mapw[d]) {
                     return true; 
                 }
             }
         }
         else {
             for (var i = 0; i < this.dicesb.length; i++) {
                 var source = this.board[s];
                 var dest = this.board[d];
                 if (dest && dest.length > 1 && source && source[source.length - 1] !== dest[dest.length - 1]) {
                     continue;
                 }
                 if (this.dicesw[i] === this.mapb[s] - this.mapb[d]) {
                     return true; 
                 }
             }
         }
         return false;
     }
     instackw = () => {
         if (this.handlew.length > 0) {
             if (this.handlew.length > 1) {
                 var free = 0;
                 for (var j = 0; j < this.dicesw.length; j++) {
                     if (this.dicesw[j] === 0) continue;
                     var d = this.handlemapw[this.dicesw[j]];
                     var dest = this.board[d];
                     if (dest.length === 0) free++;
                     if (dest.length === 1 && dest[dest.length - 1] !== 'w') free++;
                     if (dest.length > 1 && dest[dest.length - 1] === 'w') free++;
                     if (free > 1) return false
                 }
             }
             else {
                 for (var j = 0; j < this.dicesw.length; j++) {
                     if (this.dicesw[j] === 0) continue;
                     var d = this.handlemapw[this.dicesw[j]];
                     var dest = this.board[d];
                     if (dest.length === 0) return false;
                     if (dest.length === 1 && dest[dest.length - 1] !== 'w') return false;
                     if (dest.length > 1 && dest[dest.length - 1] === 'w') return false;
                     if (free > 1) return false
                 }
             }
         }
         else {
             for (var i = 0; i < this.board.length; i++) {
                 var curr = this.board[i];
                 if (curr.length === 0) continue;
                 if (curr.length > 0 && curr[curr.length - 1] !== 'w') continue;
                 for (var j = 0; j < this.dicesw.length; j++) {
                     if (this.dicesw[j] === 0) continue;
                     var d = this.mapw[i] - this.dicesw[j];
                     if (d<0 || d>23) continue
                     var dest = this.board[d];
                     if (dest.length === 0) return false;
                     if (dest.length > 1 && dest[dest.length - 1] === 'w') return false;
                 }
             }
         }
         return true;
     }
     instackb = () => {
         if (this.handleb.length > 0) {
             if (this.handleb.length > 1) {
                 var free = 0;
                 for (var j = 0; j < this.dicesb.length; j++) {
                     if (this.dicesb[j] === 0) continue;
                     var d = this.handlemapb[this.dicesb[j]];
                     var dest = this.board[d];
                     if (dest.length === 0) free++;
                     if (dest.length === 1 && dest[dest.length - 1] !== 'b') free++;
                     if (dest.length > 1 && dest[dest.length - 1] === 'b') free++;
                     if (free > 1) return false
                 }
             }
             else {
                 for (var j = 0; j < this.dicesb.length; j++) {
                     if (this.dicesb[j] === 0) continue;
                     var d = this.handlemapw[this.dicesb[j]];
                     var dest = this.board[d];
                     if (dest.length === 0) return false;
                     if (dest.length === 1 && dest[dest.length - 1] !== 'b') return false;
                     if (dest.length > 1 && dest[dest.length - 1] === 'b') return false;
                     if (free > 1) return false
                 }
             }
         }
         else {
             for (var i = 0; i < this.board.length; i++) {
                 var curr = this.board[i];
                 if (curr.length === 0) continue;
                 if (curr.length > 0 && curr[curr.length - 1] !== 'b') continue;
                 for (var j = 0; j < this.dicesb.length; j++) {
                     if (this.dicesb[j] === 0) continue;
                     var d = this.mapb[i] - this.dicesb[j];
                     if (d < 0 || d > 23) continue;
                     var dest = this.board[d];
                     if (dest.length === 0) return false;
                     if (dest.length > 1 && dest[dest.length - 1] === 'b') return false;
                 }
             }
         }
         return true;
     }
     dohandle = (s, d) => {
         if (this.turn === "w") {
             if (this.handlew.length > 0) {
                 for (var i = 0; i < this.dicesw.length; i++) {
                     if (this.handlemapw[this.dicesw[i]] === d) {
                         var dest = this.board[d];
                         if (dest.length === 0) {
                             dest.push(this.handlew.pop())
                             this.dicesw[i] = 0;
                             return true;
                         }
                         if (dest.length === 1 && dest[dest.length - 1] !== 'w') {
                             this.handleb.push(dest.pop())
                             dest.push(this.handlew.pop())
                             this.dicesw[i] = 0;
                             return true;
                         }
                         if (dest.length === 1 && dest[dest.length - 1] === 'w') {
                             dest.push(this.handlew.pop())
                             this.dicesw[i] = 0;
                             return true;
                         }
                     }
                 }
             }
             else {
                 return false
             }
         }
         else {
             if (this.handleb.length > 0) {
                 for (var i = 0; i < this.dicesb.length; i++) {
                     if (this.handlemapb[this.dicesb[i]] === d) {
                         var dest = this.board[d];
                         if (dest.length === 0) {
                             dest.push(this.handleb.pop());
                             this.dicesb[i] = 0;
                             return true;
                         }
                         if (dest.length === 1 && dest[dest.length - 1] === 'w') {
                             this.handlew.push(dest.pop())
                             dest.push(this.handleb.pop())
                             this.dicesb[i] = 0;
                             return true;
                         }
                         if (dest.length === 1 && dest[dest.length - 1] === 'b') {
                             dest.push(this.handleb.pop())
                             this.dicesb[i] = 0;
                             return true;
                         }
                     }
                 }
             }
             else {
                 return false
             }
         }
         return false;
     }
     cancollectw = () => {
         for (var i = 0; i < this.board.length; i++) {
             if (i > 11 && i < 18) continue
             var dest = this.board[i];
             if (dest.length === 0) continue;
             if (dest.length > 0 && dest[dest.length - 1] === 'w') return false;
         }
         return true;
     }
     cancollectb = () => {
         for (var i = 6; i < this.board.length; i++) {
             var dest = this.board[i];
             if (dest.length === 0) continue;
             if (dest.length > 0 && dest[dest.length - 1] === 'b') return false;
         }
         return true;
     }
     cancollect = () => {
         if (this.turn === "w") return this.cancollectw();
         return this.cancollectb();
     }
     collect = (s) => {
         if (this.turn === "w") return this.collectw(s);
         return this.collectb(s);
     }
     maxoutw = () => {
         for (var i = 17; i > 11; i--) {
             var curr = this.board[i];
             if (curr.length>0) return i-11
         }
         return 0
     }
     maxoutb = () => {
         for (var i = 5; i > 0; i--) {
             var curr = this.board[i];
             if (curr.length>0) return i+1
         }
         return 0
     }
     collectw = (s) => {
         this.dicesw.sort(function (a, b) {
             return a - b;
         })
         for (var j = 0; j < this.dicesw.length; j++) {
             if (this.dicesw[j] === 0) continue;
             var work = this.board[s];
             var curr = this.mapw[s]+1;
             if (curr === this.dicesw[j]) {
                 this.dicesw[j] = 0;
                 this.outw.push(work.pop());
                 this.switchturn();
                 return true;
             }
             if (curr < this.dicesw[j] && this.dicesw[j] >= this.maxoutw()) {
                 this.dicesw[j] = 0;
                 this.outw.push(work.pop());
                 this.switchturn();
                 return true;
             }
         }
         return false;
     }
     collectb = (s) => {
         this.dicesb.sort(function (a, b) {
             return a - b;
         })
         for (var j = 0; j < this.dicesb.length; j++) {
             if (this.dicesb[j] === 0) continue;
             var work = this.board[s];
             var curr = this.mapb[s]+1;
             if (curr<=this.dicesb[j]) {
                 this.dicesb[j] = 0;
                 this.outb.push(work.pop());
                 this.switchturn();
                 return true;
             }
             if (curr < this.dicesb[j] && this.dicesb[j] >= this.maxoutb()) {
                 this.dicesb[j] = 0;
                 this.outb.push(work.pop());
                 this.switchturn();
                 return true;
             }
         }
         return false;
     }
     gameover = () => {
         if (this.outb.length === 15 || this.outw.length === 15) return true;
         return false
     }
}

export default Backgammon;