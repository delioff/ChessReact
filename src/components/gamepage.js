import React, { useEffect, useState } from 'react'
import { gameSubject, initGame, handleMove, resetGame, unduLastMove} from './game'
import inforow from './inforow'
import Board from './board'
import Coord from './coord'
import { usePubNub } from 'pubnub-react';
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import shortid from 'shortid';
import StartForm from './startform'


function GamePage() {
    const search = useLocation().search;
    const ouser = new URLSearchParams(search).get('user');
    const ocolor = new URLSearchParams(search).get('color');
    const room= new URLSearchParams(search).get('room')
    const userinfo = JSON.parse(localStorage.getItem('userinfo'));
    const localuser = userinfo && userinfo.username ? userinfo.username : "You";
    const localcolor = userinfo && userinfo.color ? userinfo.color : "White";
    const [board, setBoard] = useState([])
    const [isGameOver, setIsGameOver] = useState()
    const [result, setResult] = useState()
    const [turn, setTurn] = useState()
    const [history, setHistory] = useState([])
    const [incheck, setIncheck] = useState()
    const [user1,setUser1] = useState(localuser);
    const [color1,setColor1] = useState(ocolor?ocolor:localcolor);
    const [user2, setUser2] = useState(ouser);
    const [lobbyChannel, setlobbyChannel] = useState('chesslobby--'+room);
    const [gameChannel, setgameChannel] = useState('chessgame--'+room);
    const [roomId, setroomId] = useState(room);
    const [isDisabled, setisDisabled] = useState(false);
    useEffect(() => {
        initGame()
        const subscribe = gameSubject.subscribe((game) => {
            setBoard(game.board)
            setIsGameOver(game.isGameOver)
            setResult(game.result)
            setTurn(game.turn)
            setHistory(game.history)
            setIncheck(game.incheck)
        })
        return () => subscribe.unsubscribe()
    }, [])
    const pubnub = usePubNub();
    pubnub.setUUID(user1);
    const handleMessage = event => {
        const message = event.message;
        const chanellname = event.channel;
        if (chanellname === gameChannel) {
            if (typeof message === 'string' || message.hasOwnProperty('text')) {
                const text = message.text || message;
                if (text) {
                    const mes = JSON.parse(text);
                    handleMove(mes.from, mes.to, false);
                }
            }
        }
        if (chanellname === lobbyChannel) {
            if (message.user !== user1) {
                setUser2(message.user)
            }
            if (message.cmd == "JOIN") {
                setgameChannel('chessgame--' + roomId)
            }
            if (message.cmd == "UNDO" && message.user !== user1) {
                Swal.fire({
                    title: "Your oponent want's undo last move!",
                    text: "Do you agree?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, undo!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        pubnub.publish({
                            message: {
                                command: "ACSEPTUNDO",
                                user: user1
                            },
                            channel: 'chesslobby--' + roomId
                        })
                    }
                })
            }
            if (message.cmd == "NENGAME" && message.user !== user1) {
                Swal.fire({
                    title: "Your oponent want's new game!",
                    text: "Do you agree?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, new!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        pubnub.publish({
                            message: {
                                command: "ACSEPTNEWGAME",
                                user: user1
                            },
                            channel: 'chesslobby--' + roomId
                        })
                    }
                })}
            if (message.cmd == "ACEPTNEGAME") {
                resetGame()
            }
            if (message.cmd == "ACSEPTUNDO") {
                unduLastMove()
            }
        }
    };
    useEffect(() => {
        pubnub.addListener({ message: handleMessage });
        pubnub.subscribe({
            channels: [lobbyChannel, gameChannel],
            withPresence: true // Checks the number of people in the channel
        });
        if (room) joinRoom(room, user1);
        return function cleanup() {
            pubnub.unsubscribeAll();
        }
    }, [pubnub, lobbyChannel, gameChannel]);
    
    // Create a room channel
    const onPressCreate = (e) => {
        // Create a random name for the channel
        const room = shortid.generate().substring(0, 5)
        setroomId(room);
        setlobbyChannel('chesslobby--' + room);
        setisDisabled(true);
        // Open the modal
        Swal.fire({
            position: 'top',
            allowOutsideClick: false,
            title: 'Share this room ID with your friend',
            text: room,
            width: 275,
            padding: '0.7em',
            // Custom CSS
            customClass: {
                heightAuto: false,
                title: 'title-class',
                popup: 'popup-class',
                confirmButton: 'button-class'
            }
        })
        // set some staff here 
    }
    // Create a room channel
    const onPressUndo = (e) => {
        pubnub.publish({
            message: {
                command: "UNDO",
                user: user1
            },
            channel: 'chesslobby--' + roomId
        });
    }
    // Create a room channel
    const onPressNewGame = (e) => {
        pubnub.publish({
            message: {
                command: "NEWGAME",
                user: user1
            },
            channel: 'chesslobby--' + roomId
        });
    }
    const handleBaseMove = (fromPosition, position) => {
        if ((turn === "TURN WHITE" && color1 === "White") || (turn === "TURN BLACK" && color1 === "Black")) {
            handleMove(fromPosition, position, true, gameChannel, user1)
        }
        else {
            Swal.fire({
                position: 'top',
                allowOutsideClick: false,
                title: 'Not your turn',
                width: 275,
                padding: '0.7em',
                // Custom CSS
                customClass: {
                    heightAuto: false,
                    title: 'title-class',
                    popup: 'popup-class',
                    confirmButton: 'button-class'
                }
            })
        }
    }
      
    // The 'Join' button was pressed
    const onPressJoin = (e) => {
        Swal.fire({
            title: 'Enter roomid and playername',
            html:
                '<input id="swal-input1" class="swal2-input">' +
                '<input id="swal-input2" class="swal2-input">',
            focusConfirm: false,
            preConfirm: () => {
                return {
                    room:document.getElementById('swal-input1').value,
                    user:document.getElementById('swal-input2').value
                }
            }
        }).then((formValues) => {
            if (formValues.value) {
                joinRoom(formValues.value.room, formValues.value.user);
         }})

        
    }
    const setUserCol = (user, col) => { setUser1(user); setColor1(col);}
    // Join a room channel
    const joinRoom = (value,user) => {
        

        // Check the number of people in the channel
        pubnub.hereNow({
            channels: ['chesslobby--' + value],
        }).then((response) => {
            if (response.totalOccupancy < 2) {
                setroomId(value);
                setlobbyChannel('chesslobby--' + value);
                setgameChannel('chessgame--' + value)
                pubnub.publish({
                    message: {
                        cmd:"JOIN",
                        user:user,
                        notRoomCreator: true
                    },
                    channel: 'chesslobby--' + value
                });
            }
            else {
                // Game in progress
                Swal.fire({
                    position: 'top',
                    allowOutsideClick: false,
                    title: 'Error',
                    text: 'Game in progress. Try another room.',
                    width: 275,
                    padding: '0.7em',
                    customClass: {
                        heightAuto: false,
                        title: 'title-class',
                        popup: 'popup-class',
                        confirmButton: 'button-class'
                    }
                })
            }
        }).catch((error) => {
            console.log(error);
        });
    }
    let inf = [];
    let x = ["a", "b", "c", "d", "e", "f", "g", "h"];
    let y = ["8", "7", "6", "5", "4", "3", "2", "1"];
    for (var i = 0; i < history.length; i += 2) {
        if (history[i].color === 'w') {
            inf.push({
                "w": inforow(history[i] ? history[i] : null, i),
                "b": inforow(history[i + 1] ? history[i + 1] : null, i + 1)
            })
        }
        else {
            inf.push({
                "w": inforow(history[i - 1] ? history[i - 1] : null, i - 1),
                "b": inforow(history[i] ? history[i] : null, i)
            })
        }

    }
    return (
        <div className="row">
            <div className="column">

                <div className="container">

                    <h2 className="vertical-text">
                        {isGameOver && ("GAME OVER")}
                    </h2>
                    <div className="row">
                        <div className="column">
                            <div className="cord-container">
                                {y.map((letter, i) => (
                                    <Coord letter={letter} or={("v")} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="board-container">
                        <div className="cord-container-x">
                            <div className="row">
                                {x.map((letter, i) => (
                                    <Coord letter={letter} />
                                ))}
                            </div>
                        </div>
                        <Board board={board} handlemove={handleBaseMove} />
                        <div className="cord-container-x">
                            <div className="row">
                                {x.map((letter, i) => (
                                    <Coord letter={letter} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="column">
                            <div className="cord-container">
                                {y.map((letter, i) => (
                                    <Coord letter={letter} or={("v")} />
                                ))}
                            </div>
                        </div>
                        {result && <p className="vertical-text">{result}</p>}
                        <p className="vertical-text">{turn + ' ' + incheck}</p>
                    </div>

                </div>


            </div>
            <div className="column">
                <div className="itemcontainer">
                    <div className="info-container">
                        <div className="resp-table">
                            <div className="resp-table-caption">
                                Table {roomId}
                            </div>
                            <div className="resp-table-header">
                                <div className="table-header-cell">{color1 === "White" ? user1 : user2}</div>
                                <div className="table-header-cell">{color1 === "White" ? user2 : user1}</div>
                            </div>
                            <div className="resp-table-header">
                                <div className="table-header-cell">"White"</div>
                                <div className="table-header-cell">"Black"</div>
                            </div>
                            <div className="resp-table-body">
                                {inf.map((item, i) => (
                                    <div className="resp-table-row">
                                        {item.w}
                                        {item.b}
                                    </div>
                                ))}
                            </div>
                            <div className="resp-table-footer">
                                <div className="table-footer-cell">
                                    <button onClick={(e) => onPressNewGame()} >
                                 <span>NEW GAME</span>
                                    </button>
                                 </div>
                                 <div className="table-footer-cell">
                                  
                                    <button onClick={(e) => onPressUndo()}>
                                       <span>UNDO</span>
                                    </button>
                                </div>
                            </div>
                            <div className="resp-table-footer">
                                <div className="table-footer-cell"><button
                                    className="create-button "
                                    onClick={(e) => onPressCreate()}
                                    disabled={isDisabled}
                                > Create
                                </button></div>
                                <button
                                    className="join-button"
                                    onClick={(e) => onPressJoin()}
                                > Join
                                </button>
                            </div>
                           
                        </div>
                        <StartForm User={user1} Color={color1} RoomID={roomId} SetColorUser={setUserCol}/>
                    </div>
                </div>
            </div>
     </div>)

}
export default GamePage
