import React, { useEffect, useState } from 'react'
import { BrowserView, MobileView } from 'react-device-detect';

function SaPage() {
    //const search = useLocation().search;
    //const ocolor = new URLSearchParams(search).get('color');
    //const userinfo = JSON.parse(localStorage.getItem('userinfo'));
    //const localcolor = userinfo && userinfo.color ? userinfo.color : "White";
    //let color = localcolor;
    //if (ocolor) {
    //    color = ocolor === "White" ? "Black" : "White"
    //}
    //const [board, setBoard] = useState([])
    //const [isGameOver, setIsGameOver] = useState()
    //const [result, setResult] = useState()
    //const [turn, setTurn] = useState()
    //const [history, setHistory] = useState([])
    //const [incheck, setIncheck] = useState()
    //const [color1, setColor1] = useState(color);
    //useEffect(() => {
    //    initGame()
    //    const subscribe = gameSubject.subscribe((game) => {
    //        setBoard(game.board)
    //        setIsGameOver(game.isGameOver)
    //        setResult(game.result)
    //        setTurn(game.turn)
    //        setHistory(game.history)
    //        setIncheck(game.incheck)
    //    })
    //    return () => subscribe.unsubscribe()
    //}, [])
    
    
    //const handleBaseMove = (fromPosition, position) => {
    //         handleMove(fromPosition, position, false,)
    //}
      
   
    //let inf = [];
    //for (var i = 0; i < history.length; i += 2) {
    //    if (history[i].color === 'w') {
    //        inf.push({
    //            "w": inforow(history[i] ? history[i] : null, i),
    //            "b": inforow(history[i + 1] ? history[i + 1] : null, i + 1)
    //        })
    //    }
    //    else {
    //        inf.push({
    //            "w": inforow(history[i - 1] ? history[i - 1] : null, i - 1),
    //            "b": inforow(history[i] ? history[i] : null, i)
    //        })
    //    }

    //}
    //// Create a room channel
    //const onPressUndo = (e) => {
    //    unduLastMove()
    //}
    //// Create a room channel
    //const onPressNewGame = (e) => {
    //    resetGame()
    //}
    //// The 'Reverse' button was pressed
    //const onPressReverse = (e) => {
    //    color1 === "White" ? setColor1("Black"):setColor1("White")
    //}   
    //// The 'Save' button was pressed
    //const onPressSave = (e) => {
    //    Swal.fire({
    //        title: 'Enter name of the game',
    //        html:
    //            '<input id="swal-input1" class="swal2-input">',
    //        focusConfirm: false,
    //        preConfirm: () => {
    //            return {
    //                filename: document.getElementById('swal-input1').value,

    //            }
    //        }
    //    }).then((formValues) => {
    //        if (formValues.value) {
    //            saveGame(formValues.value.filename);
    //        }
    //    })
    //}
    //// The 'Load' button was pressed
    //const onPressLoad = (e) => {
    //    Swal.fire({
    //        title: 'Enter name of the game',
    //        html:
    //            '<input id="swal-input1" class="swal2-input">',
    //        focusConfirm: false,
    //        preConfirm: () => {
    //            return {
    //                filename: document.getElementById('swal-input1').value,

    //            }
    //        }
    //    }).then((formValues) => {
    //        if (formValues.value) {
    //            if (!loadGame(formValues.value.filename)) {
    //                // Game in progress
    //                Swal.fire({
    //                    position: 'top',
    //                    allowOutsideClick: false,
    //                    title: 'Error',
    //                    text: 'Game ' + formValues.value.filename + ' not found. Try another name.',
    //                    width: 275,
    //                    padding: '0.7em',
    //                    customClass: {
    //                        heightAuto: false,
    //                        title: 'title-class',
    //                        popup: 'popup-class',
    //                        confirmButton: 'button-class'
    //                    }
    //                })
    //            }
    //        }
    //    })
    //}
    //// The 'Load' button was pressed
    //const onPressLoadFen = (e) => {
    //    Swal.fire({
    //        title: 'Enter name of the game',
    //        html:
    //            '<input id="swal-input1" class="swal2-input">',
    //        focusConfirm: false,
    //        preConfirm: () => {
    //            return {
    //                filename: document.getElementById('swal-input1').value,

    //            }
    //        }
    //    }).then((formValues) => {
    //        if (formValues.value) {
    //            if (!loadFen(formValues.value.filename)) {
    //                // Game in progress
    //                Swal.fire({
    //                    position: 'top',
    //                    allowOutsideClick: false,
    //                    title: 'Error',
    //                    text: 'Game ' + formValues.value.filename + ' not found. Try another name.',
    //                    width: 275,
    //                    padding: '0.7em',
    //                    customClass: {
    //                        heightAuto: false,
    //                        title: 'title-class',
    //                        popup: 'popup-class',
    //                        confirmButton: 'button-class'
    //                    }
    //                })
    //            }
    //        }
    //    })
    //}
    return (
        <div>
            <BrowserView>
                <iframe
                    src="entry.html"
                    width="100%"
                    height="600"
                    title="Tanks Main"
                    style={{ border: 'none' }}
                    sandbox="allow-scripts allow-popups"
                />
        </BrowserView>
            <MobileView>
                <iframe
                    src="entry.html"
                    width="100%"
                    height="600"
                    title="Tanks Main"
                    style={{ border: 'none' }}
                    sandbox="allow-scripts allow-popups"
                />
        </MobileView>
        </div>   )

}
export default SaPage
