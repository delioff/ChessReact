import React from 'react'

export default function inforow( move, i ) {
    let row = " ";
    if (move) {
        row = move.fromPosition + '-' + move.position;
    }

    return (
        <div className="table-body-cell">
            {row}
        </div>
    )
}