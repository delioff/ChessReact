import Piece from './piece.js';
import { isSameDiagonal, isPathClean } from '../helpers'

export default class Bishop extends Piece {
    constructor(player) {
        super(player, (player === 1 ? '♗' : '♝'),"Bishop");
    }

    isMovePossible(src, dest, squares) {
        return isPathClean(this.getSrcToDestPath(src, dest), squares) && isSameDiagonal(src, dest)
    }

    /**
     * get path between src and dest (src and dest exclusive)
     * @param  {num} src  
     * @param  {num} dest 
     * @return {[array]}      
     */
    getSrcToDestPath(src, dest) {
        let path = [], pathStart, pathEnd, incrementBy;
        if (src > dest) {
            pathStart = dest;
            pathEnd = src;
        }
        else {
            pathStart = src;
            pathEnd = dest;
        }
        if (Math.abs(src - dest) % 9 === 0) {
            incrementBy = 9;
            pathStart += 9;
        }
        else {
            incrementBy = 7;
            pathStart += 7;
        }

        for (let i = pathStart; i < pathEnd; i += incrementBy) {
            path.push(i);
        }
        return path;
    }
}