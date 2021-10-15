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
        this.BLACK = 'b';
        this.board = new Array(24).fill(null);
       
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
     move = (i, j) => {
         if (this.islegalmove(i, j)) {
             var source = this.board[i];
             var dest = this.board[j];

             if (source.length>0) {
                
                 dest.push(source.pop());
                 this.board[i] = source;
                 this.board[j] = dest;
                 return true;
             }
             return false

         }
         else return false;
         
     }
     islegalmove = (i,j) => {
         return true;
     }
}

export default Backgammon;