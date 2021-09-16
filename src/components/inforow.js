import React from 'react'

export default function inforow( move, i ) {
    let row = " ";
    if (move) {
        row = move.piece.toUpperCase() +':' +move.from + '-' + move.to;
        if (move.captured) row += ':' + move.san;
    }

    return (
        <div className="table-body-cell">
            {row}
        </div>
    )
}