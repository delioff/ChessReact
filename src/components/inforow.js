import React from 'react'

export default function inforow( move, i ) {
    let row = " ";
    if (move) {
        row = move.fromPosition + '-' + move.position;
    }

    return (
        <td>
            <span>{row}</span>
        </td>
    )
}