import React, { useEffect, useState } from 'react'
import {backgamonsubject,updateGame} from './bggame'
import Board from './bgboard'


function BackamonPage() {
   
    const [board, setBoard] = useState([])
   
    useEffect(() => {
        updateGame()
        const subscribe = backgamonsubject.subscribe((game) => {
            setBoard(game.board)
        })
        return () => subscribe.unsubscribe()
    }, [])
    
 
    return (
        <div>
           
             <div className="container">

                   
                    
                    <div className="board-container">
                        
                    <Board board={board} />
                        
                    </div>
                   

                </div>
           </div>  
            )

}
export default BackamonPage
