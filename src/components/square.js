import React from 'react';

import '../index.css';

export default function Square(props) {

    return (
        <button className={props.class} onClick={props.onClick} style={props.style}>
            {props.value}
        </button>
    );

}
