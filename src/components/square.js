import React from 'react';
import { ItemTypes } from './constants'
import '../index.css';

export default function Square(props) {
     return (
         <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={props.onDrop}
             className={props.class} onClick={props.onClick} style={props.style}>
             <div className="st"
                 draggable
                 onDragStart={props.onDragStart}>
                {props.value}
            </div>
        </div>
    );

}
