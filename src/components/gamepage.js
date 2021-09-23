import React, { useEffect, useState } from 'react'
import { gameSubject, initGame, handleMove } from './game'
import inforow from './inforow'
import Board from './board'
import NewButton from './newbutton'
import Coord from './coord'
import { usePubNub } from 'pubnub-react';
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import shortid from 'shortid';


function GamePage() {
    const search = useLocation().search;
    const user = new URLSearchParams(search).get('user');
    const color = new URLSearchParams(search).get('color');
    
    const userinfo = JSON.parse(localStorage.getItem('userinfo'));
    const localuser = userinfo && userinfo.username ? [userinfo.username] : ["You"];
    const localcolor = userinfo && userinfo.color ? [userinfo.color] : ["White"]
    const superuser = user ? user : localuser;
    const supercolor = color ? color : localcolor;
    const [board, setBoard] = useState([])
    const [isGameOver, setIsGameOver] = useState()
    const [result, setResult] = useState()
    const [turn, setTurn] = useState()
    const [history, setHistory] = useState([])
    const [incheck, setIncheck] = useState()
    const [channel,] = useState(userinfo && userinfo.channel ? [userinfo.channel] : ["table1"]);
    const [user1,] = useState(superuser);
    const [color1,] = useState(supercolor);
    const [user2, setUser2] = useState("He/She");
    const [color2, setColor2] = useState("Black");
    const [lobbyChannel, setlobbyChannel] = useState();
    const [gameChannel, setgameChannel] = useState();
    const [roomId, setroomId] = useState();
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
    pubnub.setUUID(superuser);
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
            const userinfo = JSON.parse(localStorage.getItem('userinfo'));
            if (userinfo) {
                userinfo.channel = 'chessgame--' + roomId
                localStorage.setItem(
                    'userinfo', JSON.stringify(userinfo));
            }
            setgameChannel('chessgame--' + roomId)
        }
    };
    useEffect(() => {
        pubnub.addListener({ message: handleMessage });
        pubnub.subscribe({
            channels: [lobbyChannel, gameChannel],
            withPresence: true // Checks the number of people in the channel
        });
        return function cleanup() {
            pubnub.unsubscribeAll();
        }
    }, [pubnub, lobbyChannel, gameChannel]);

    // Create a room channel
    const onPressCreate = (e) => {
        // Create a random name for the channel
        const room=shortid.generate().substring(0, 5)
        setroomId(room);
        setlobbyChannel('chesslobby--'+room);

        // Open the modal
        Swal.fire({
            position: 'top',
            allowOutsideClick: false,
            title: 'Share this room ID with your friend',
            text: roomId,
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

    // The 'Join' button was pressed
    const onPressJoin = (e) => {
        Swal.fire({
            position: 'top',
            input: 'text',
            allowOutsideClick: false,
            inputPlaceholder: 'Enter the room id',
            showCancelButton: true,
            confirmButtonColor: 'rgb(208,33,41)',
            confirmButtonText: 'OK',
            width: 275,
            padding: '0.7em',
            customClass: {
                heightAuto: false,
                popup: 'popup-class',
                confirmButton: 'join-button-class ',
                cancelButton: 'join-button-class'
            }
        }).then((result) => {
            // Check if the user typed a value in the input field
            if (result.value) {
                joinRoom(result.value);
            }
        })
    }
    // Join a room channel
    const joinRoom = (value) => {
        setroomId(value);
        setlobbyChannel('chesslobby--' + value);

        // Check the number of people in the channel
        pubnub.hereNow({
            channels: ['chesslobby--' + value],
        }).then((response) => {
            if (response.totalOccupancy < 2) {
                pubnub.subscribe({
                    channels: ['chesslobby--' + value],
                    withPresence: true
                });

               //setstaff for second user

                pubnub.publish({
                    message: {
                        notRoomCreator: true,
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
    // Reset everything
    const endGame = () => {
        pubnub.unsubscribe({
            channels: [lobbyChannel,gameChannel]
        });
        setlobbyChannel(null);
        setgameChannel(null);
        setroomId(null);

        
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
                        <Board board={board}/>
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
                                {gameChannel} {lobbyChannel}
                            </div>
                            <div className="resp-table-header">
                                <div className="table-header-cell">{user1}</div>
                                <div className="table-header-cell">{user2}</div>
                            </div>
                            <div className="resp-table-header">
                                <div className="table-header-cell">{color1}</div>
                                <div className="table-header-cell">{color2}</div>
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
                                <div className="table-footer-cell"><button
                                    className="create-button "
                                    onClick={(e) => onPressCreate()}
                                > Create
                                </button></div>
                                <button
                                    className="join-button"
                                    onClick={(e) => onPressJoin()}
                                > Join
                                </button>
                            </div>
                            <div className="resp-table-footer">
                                <div className="table-footer-cell">
                                    <NewButton />
                                </div>
                                
                            </div>
                            {/*<div className="resp-table-footer">*/}
                            {/*    <div className="table-footer-cell">White</div>*/}
                            {/*    <div className="table-footer-cell">Black</div>*/}
                            {/*</div>*/}
                        </div>
                    </div>
                </div>
            </div>
     </div>)

}
export default GamePage
