import React, { useEffect, useState } from 'react'
import { backgamonsubject, updateGame, setdiceb, setdicew, newGame, move, undo, resendlastmove} from './bggame'
import Board from './bgboard'
import Dice from "react-dice-roll";
import BoardCheckers from './bgcheckers'
import { usePubNub } from 'pubnub-react';
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import shortid from 'shortid';
import { BrowserView, MobileView } from 'react-device-detect';

function BackamonPage() {
    const search = useLocation().search;
    const ouser = new URLSearchParams(search).get('user');
    const ocolor = new URLSearchParams(search).get('color');
    const room = new URLSearchParams(search).get('room')
    const userinfo = JSON.parse(localStorage.getItem('userinfo'));
    let localuser = userinfo && userinfo.username ? userinfo.username : shortid.generate().substring(0, 5);
    const localcolor = userinfo && userinfo.color ? userinfo.color : "White";
    if (localuser === ouser) localuser = localuser + shortid.generate().substring(0, 5);
    let color = localcolor;
    if (ocolor) {
        color = ocolor === "White" ? "Black" : "White"
    }
    const [user1, setUser1] = useState(localuser);
    const [color1, setColor1] = useState(color);
    const [user2, setUser2] = useState(ouser ? ouser : "Opponent");
    const [lobbyChannel, setlobbyChannel] = useState('chesslobby--' + room);
    const [gameChannel, setgameChannel] = useState('chessgame--' + room);
    const [roomId, setroomId] = useState(room);
    const [board, setBoard] = useState([])
    const [handleb, sethandleb] = useState([])
    const [handlew, sethandlew] = useState([])
    const [outb, setoutb] = useState([])
    const [outw, setoutw] = useState([])
    const [gameover, setgameover] = useState()
    const [turn, setTurn] = useState("w")
    const [disabledw, setdisabledw] = useState(false)
    const [disabledb, setdisabledb] = useState(false)
    const diceRefw = React.useRef(null);
    const diceRefb = React.useRef(null);
    const diceRefwf = React.useRef(null);
    const diceRefbf = React.useRef(null);
    const [cheatvalw1, setcheatvalw1] = useState(2);
    const [cheatvalw2, setcheatvalw2] = useState(2);
    const [cheatvalb1, setcheatvalb1] = useState(2);
    const [cheatvalb2, setcheatvalb2] = useState(2);
    const [user1score, setuser1score] = useState(0);
    const [user2score, setuser2score] = useState(0);
    const [isLooker, setisLooker] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isDisabled, setisDisabled] = useState(false);
    const [isDisabledUndo, setisDisabledUndo] = useState(false);
    const [counmoves, setcounmoves] = useState("");
    const [winner, setwinner] = useState("");
    const [isDisabledNewGame, setisDisabledNewGame] = useState(false);
    useEffect(() => {
        updateGame()
        const subscribe = backgamonsubject.subscribe((game) => {
            setBoard(game.board)
            setTurn(game.turn)
            sethandlew(game.handlew)
            sethandleb(game.handleb)
            setoutb(game.outb)
            setoutw(game.outw)
            setgameover(game.gameover)
            setcounmoves(game.counmoves)
            setwinner(game.winner)
            setuser1score(game.user1score)
            setuser2score(game.user2score)
        })
        return () => subscribe.unsubscribe()
    }, [])
    const pubnub = usePubNub();
    pubnub.setUUID(user1);
    const getIsLocker = () => { return isLooker }
    const handleMessage = event => {
        const message = event.message;
        const chanellname = event.channel;
        if (message.user !== user1) {
            setUser2(message.user)
        }
        let newMessages = [message];
        setMessages(messages => messages.concat(newMessages));
        if (chanellname === gameChannel) {
            if (message.user === user1) return;
            if (typeof message === 'string' || message.hasOwnProperty('text')) {
                const text = message.text || message;
                if (text) {
                    const mes = JSON.parse(text);
                    move(mes.from, mes.to, false, "", "");
                }
            }
        }
        if (chanellname === lobbyChannel) {
            if (message.cmd === "SETDICE") {
                if (typeof message === 'string' || message.hasOwnProperty('text')) {
                    const text = message.text || message;
                    if (text) {
                        const mes = JSON.parse(text);
                        if (mes.dice === "w") {
                            mes.from === 0 ? setcheatvalw1(mes.to) : setcheatvalw2(mes.to)
                            setdicew(mes.from, mes.to, false)
                            mes.from === 0 ? onRollwf0() : onRollwf1()
                        } else {
                            mes.from === 0 ? setcheatvalb1(mes.to) : setcheatvalb2(mes.to)
                            setdiceb(mes.from, mes.to, false)
                            mes.from === 0 ? onRollbf0() : onRollbf1()
                        }
                    }
                }
            }
            if (message.cmd === "JOIN") {
                setgameChannel('chessgame--' + roomId)
            }
            if (message.cmd === "UNDO" && message.user !== user1) {
                if (getIsLocker()) return;
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
                                cmd: "ACCEPTUNDO",
                                user: user1,
                                msg: " Undo accepted"
                            },
                            channel: lobbyChannel
                        })
                    }
                    else {
                        pubnub.publish({
                            message: {
                                cmd: "NOTACCEPTUNDO",
                                user: user1,
                                msg: " Undo aborted"
                            },
                            channel: lobbyChannel
                        })
                    }
                })
            }
            if (message.cmd === "NEWGAME" && message.user !== user1) {
                if (getIsLocker()) return;
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
                                cmd: "ACCEPTNEWGAME",
                                user: user1,
                                msg: " New game accepted"
                            },
                            channel: lobbyChannel
                        })
                    }
                    else {
                        pubnub.publish({
                            message: {
                                cmd: "NOTACCEPTNEWGAME",
                                user: user1,
                                msg: " New game aborted"
                            },
                            channel: lobbyChannel
                        })
                    }
                })
            }
            if (message.cmd === "ACCEPTNEWGAME") {
                setdisabledw(false)
                setdisabledb(false)
                newGame()
                setisDisabledNewGame(false)
            }
            if (message.cmd === "ACCEPTUNDO") {
                undo()
                setisDisabledUndo(false)
            }
            if (message.cmd === "NOTACCEPTNEWGAME") {
                setisDisabledNewGame(false)
            }
            if (message.cmd === "NOTACCEPTUNDO") {
                setisDisabledUndo(false)
            }
            if (message.cmd === "SENDPOSITION" && message.user !== user1) {
                //loadFen(message.fen);
            }
        }
    };
    const joinRoom = (value, user) => {
        // Check the number of people in the channel
        pubnub.hereNow({
            channels: ['chesslobby--' + value],
        }).then((response) => {
            setroomId(value);
            setlobbyChannel('chesslobby--' + value);
            setgameChannel('chessgame--' + value)

            if (response.totalOccupancy < 2) {
                pubnub.publish({
                    message: {
                        cmd: "JOIN",
                        user: user,
                        msg: " join the game"
                    },
                    channel: 'chesslobby--' + value
                });
            }
            else {
                // Game in progress
                setisLooker(true);
                Swal.fire({
                    position: 'top',
                    allowOutsideClick: false,
                    title: 'Error',
                    text: 'Game in progress. Try another room. You can only watch',
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
    useEffect(() => {
        if (room) joinRoom(room, user1);
        pubnub.addListener({ message: handleMessage });
        pubnub.subscribe({
            channels: [lobbyChannel, gameChannel],
            withPresence: true // Checks the number of people in the channel
        });

        return function cleanup() {
            pubnub.unsubscribeAll();
        }
    }, [pubnub, lobbyChannel, gameChannel, user1]);

    // Create a room channel
    const onPressCreate = (e) => {
        // Create a random name for the channel
        setisLooker(false);
        const room = shortid.generate().substring(0, 5)
        setroomId(room);
        setlobbyChannel('chesslobby--' + room);
        setgameChannel('chessgame--' + room);
        setisDisabled(true);
        // Open the modal
        Swal.fire({
            position: 'top',
            allowOutsideClick: false,
            title: 'Share this link with your friend. Also it avalable in expander user details',
            text: window.location.origin + window.location.pathname + "?user=" + user1 + "&color=" + color1 + "&room=" + room,
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
    const onPressRepear = (e) => {
        Swal.fire({
            title: "This feature use to send your position to oponet in case some movements lost in internet or in case to continue saved game:)!",
            text: "Are you sure that you want to use this feature?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, new!'
        }).then((result) => {
            if (result.isConfirmed) {
                pubnub.publish({
                    message: {
                        cmd: "SENDPOSITION",
                        user: user1,
                        msg: " New position send from " + user1,
                        //fen: showFen()
                    },
                    channel: lobbyChannel
                })
            }

        })
    }
    // Create a room channel
    const onPressUndo = (e) => {
        if (isLooker) return;
        //undo();
        if (!((turn === "w" && color1 === "White") || (turn === "b" && color1 === "Black"))) {
            pubnub.publish({
                message: {
                    cmd: "UNDO",
                    user: user1,
                    msg: " whant's undo last move"
                },
                channel: 'chesslobby--' + roomId
            });
            setisDisabledUndo(true);
        }
        else {
            Swal.fire({
                position: 'top',
                allowOutsideClick: false,
                title: isLooker ? "Can't UNDO you are Looker" : "Can't UNDO at this stage",
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
    // Create a room channel
    const onPressNewGame = (e) => {
        //newGame();
        if (isLooker) return;
        pubnub.publish({
            message: {
                cmd: "NEWGAME",
                user: user1,
                msg: " whant's new game"
            },
            channel: 'chesslobby--' + roomId
        });
        setisDisabledNewGame(true);

    }
    const handleBaseMove = (fromPosition, position) => {
        if (isLooker) return;
        //move(fromPosition, position, false, gameChannel, user1)
        if ((turn === "w" && color1 === "White") || (turn === "b" && color1 === "Black")) {
            move(fromPosition, position, true, gameChannel, user1)
        }
        else {
            Swal.fire({
                position: 'top',
                allowOutsideClick: false,
                title: 'Not your turn!',
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

    const onPressLF = (e) => {
        if (isLooker) return;
        Swal.fire({
            title: 'Enter Fen',
            html:
                '<input id="swal-input1" class="swal2-input">',
            focusConfirm: false,
            preConfirm: () => {
                return {
                    filename: document.getElementById('swal-input1').value,

                }
            }
        }).then((formValues) => {
            if (formValues.value) {
                //if (!loadFen(formValues.value.filename)) {
                //    // Game in progress
                //    Swal.fire({
                //        position: 'top',
                //        allowOutsideClick: false,
                //        title: 'Error',
                //        text: 'Game ' + formValues.value.filename + ' not valid fen. Try another name.',
                //        width: 275,
                //        padding: '0.7em',
                //        customClass: {
                //            heightAuto: false,
                //            title: 'title-class',
                //            popup: 'popup-class',
                //            confirmButton: 'button-class'
                //        }
                //    })
                //}
            }
        })
    }
    // Create a room channel
    const onPressSF = (e) => {
        if (isLooker) return;
        resendlastmove(gameChannel,user1)
        // Open the modal
        //Swal.fire({
        //    position: 'top',
        //    allowOutsideClick: false,
        //    title: 'Share this room ID with your friend',
        //    text: "",//showFen(),
        //    width: 275,
        //    padding: '0.7em',
        //    // Custom CSS
        //    customClass: {
        //        heightAuto: false,
        //        title: 'title-class',
        //        popup: 'popup-class',
        //        confirmButton: 'button-class'
        //    }
        //})
        // set some staff here 
    }
    //// The 'Join' button was pressed
    //const onPressJoin = (e) => {
    //    Swal.fire({
    //        title: 'Enter roomid and playername',
    //        html:
    //            '<input id="swal-input1" class="swal2-input">' +
    //            '<input id="swal-input2" class="swal2-input">',
    //        focusConfirm: false,
    //        preConfirm: () => {
    //            return {
    //                room:document.getElementById('swal-input1').value,
    //                user:document.getElementById('swal-input2').value
    //            }
    //        }
    //    }).then((formValues) => {
    //        if (formValues.value) {
    //            joinRoom(formValues.value.room, formValues.value.user);
    //     }})


    //}
    // The 'Save' button was pressed
    const onPressSave = (e) => {
        Swal.fire({
            title: 'Enter name of the game',
            html:
                '<input id="swal-input1" class="swal2-input">',
            focusConfirm: false,
            preConfirm: () => {
                return {
                    filename: document.getElementById('swal-input1').value,

                }
            }
        }).then((formValues) => {
            if (formValues.value) {
                //saveGame(formValues.value.filename);
            }
        })
    }
    // The 'Load' button was pressed
    const onPressLoad = (e) => {
        if (isLooker) return;
        Swal.fire({
            title: 'Enter name of the game',
            html:
                '<input id="swal-input1" class="swal2-input">',
            focusConfirm: false,
            preConfirm: () => {
                return {
                    filename: document.getElementById('swal-input1').value,

                }
            }
        }).then((formValues) => {
            if (formValues.value) {
                //if (!loadGame(formValues.value.filename)) {
                //    // Game in progress
                //    Swal.fire({
                //        position: 'top',
                //        allowOutsideClick: false,
                //        title: 'Error',
                //        text: 'Game ' + formValues.value.filename + ' not found. Try another name.',
                //        width: 275,
                //        padding: '0.7em',
                //        customClass: {
                //            heightAuto: false,
                //            title: 'title-class',
                //            popup: 'popup-class',
                //            confirmButton: 'button-class'
                //        }
                //    })
                //}
            }
        })
    }
    const setUserCol = (user, col) => { setUser1(user); setColor1(col); }
    const onRollw = () => {
        if (diceRefw && diceRefw.current) {
            setdisabledw(true);
            diceRefw.current.style.pointerEvents = "auto";
            diceRefw.current.children[0].click();
            diceRefw.current.children[1].click();
            diceRefw.current.style.pointerEvents = "none";
        }
    };
    const onRollb = () => {
        if (diceRefb && diceRefb.current) {
            setdisabledb(true);
            diceRefb.current.style.pointerEvents = "auto";
            diceRefb.current.children[0].click();
            diceRefb.current.children[1].click();
            diceRefb.current.style.pointerEvents = "none";
        }
    };
    const onRollwf0 = () => {
        if (diceRefwf && diceRefwf.current) {
            setdisabledb(false);
            diceRefwf.current.style.pointerEvents = "auto";
            diceRefwf.current.children[0].click();
            diceRefwf.current.style.pointerEvents = "none";
        }
    };
    const onRollwf1 = () => {
        if (diceRefwf && diceRefwf.current) {
            setdisabledb(false);
            diceRefwf.current.style.pointerEvents = "auto";
            diceRefwf.current.children[1].click();
            diceRefwf.current.style.pointerEvents = "none";
        }
    };
    const onRollbf0 = () => {
        if (diceRefbf && diceRefbf.current) {
            setdisabledw(false);
            diceRefbf.current.style.pointerEvents = "auto";
            diceRefbf.current.children[0].click();
            diceRefbf.current.style.pointerEvents = "none";
        }
    };
    const onRollbf1 = () => {
        if (diceRefbf && diceRefbf.current) {
            setdisabledw(false);
            diceRefbf.current.style.pointerEvents = "auto";
            diceRefbf.current.children[1].click();
            diceRefbf.current.style.pointerEvents = "none";
        }
    };
    const onNewGame = () => {
        newGame();
    };
    const onSetDiceb = (pos, val) => {
        //setdiceb(pos, val, false, lobbyChannel, user1)
        setdiceb(pos, val, true, lobbyChannel, user1)
    };
    const onSetDicew = (pos, val) => {
        //setdicew(pos, val, false, lobbyChannel, user1)
        setdicew(pos, val, true, lobbyChannel, user1)
    };
    return (
        <div>
         <div className="container">
                <div className="leftbox">
                    {turn === "w" ? (<p className="textw">Turn White {counmoves}</p>) : (<p className="textw">Turn Black {counmoves}</p>)}
                    
                <div className="check-container">
                    < BoardCheckers
                    piece={handleb}
                            position={31}
                            handlemove={handleBaseMove}
                    />
                    </div>
                    {/*<button className="buttongreen" onClick={onRollb} disabled={turn === "w"}>Roll!</button>*/}
                    {/* <div ref={diceRefb} style={{pointerEvents: "none"}}>*/}
                    {/*    <Dice size={100} onRoll={(value) => onSetDiceb(0,value)} rollingTime={500}/>*/}
                    {/*    <Dice size={100} onRoll={(value) => onSetDiceb(1,value)} rollingTime={1000}/>*/}
                    {/* </div>*/}
                    <button className="buttongreen" onClick={onRollb} disabled={color1 === "White" || turn === "w" || disabledb}>Roll!</button>
                    {color1 === "White" ? (
                        <div ref={diceRefbf} style={{pointerEvents: "none"}} >
                            <Dice size={100} cheatValue={cheatvalb1} rollingTime={500} />
                            <Dice size={100} cheatValue={cheatvalb2} rollingTime={500}/>
                        </div>
                    ) : (
                     <div ref={diceRefb} style={{pointerEvents: "none"}}>
                        <Dice size={100} onRoll={(value) => onSetDiceb(0,value)} rollingTime={500}/>
                        <Dice size={100} onRoll={(value) => onSetDiceb(1,value)} rollingTime={1000}/>
                     </div>
                     )}
                <div className="check-container">
                    < BoardCheckers
                    piece={outb}
                            position={41}
                            handlemove={handleBaseMove}
                    />
                </div>
            </div>
                <div className="middlebox">
                    {gameover ? (<div><p className="textw">Gameover Winner {winner}</p></div>) : null}
                <div className="bg-container">
                        <Board board={board} handlemove={handleBaseMove}/>
                </div>
            </div>
            <div className="rightbox">
                    {turn === "w" ? (<div><p className="textb">Turn White {counmoves}</p> </div>) : (<p className="textb">Turn Black {counmoves}</p>)}
                <div className="check-container">
                    <BoardCheckers
                    piece={handlew}
                            position={32}
                            handlemove={handleBaseMove}
                    />
                    </div>
                    {/*<button className="buttongreen" onClick={onRollw} disabled={turn === "b" }>Roll!</button>*/}
                    {/*    <div ref={diceRefw} style={{pointerEvents:"none"}}>*/}
                    {/*        <Dice size={100} onRoll={(value) => onSetDicew(0, value)} rollingTime={500}/>*/}
                    {/*        <Dice size={100} onRoll={(value) => onSetDicew(1, value)} rollingTime={1000}/>*/}
                    {/*    </div>*/}
                    <button className="buttongreen" onClick={onRollw} disabled={color1 !== "White" || turn === "b" || disabledw}>Roll!</button>
                    {color1 === "White" ? ((<div>
                        <div ref={diceRefw} style={{pointerEvents:"none"}}>
                            <Dice size={100} onRoll={(value) => onSetDicew(0, value)} rollingTime={500}/>
                            <Dice size={100} onRoll={(value) => onSetDicew(1, value)} rollingTime={1000}/>
                        </div></div>
                    )) : (<div ref={diceRefwf} style={{ pointerEvents: "none" }}>
                            <Dice size={100} cheatValue={cheatvalw1} rollingTime={500}/>
                            <Dice size={100} cheatValue={cheatvalw2} rollingTime={500}/>
                        </div>)}
                
                <div className="check-container">
                    <BoardCheckers
                    piece={outw}
                            position={42}
                            handlemove={handleBaseMove}
                    />
                </div>
            </div>
             
            </div>
            <div className="resp-table">
                    <div className="resp-table-header">
                        <div className="table-header-cell">
                            
                            <div className="board-square">
                                <div className="square-user-white">{user1score}</div>
                             </div>
     
                        </div>
                        <div className="table-header-cell">{color1 === "White" ? user1 : user2}</div>
                        <div className="table-header-cell">
                           
                            <div className="board-square">
                                <div className="square-user-black">{user2score}</div>
                             </div>
                            
                        </div>
                        <div className="table-header-cell">{color1 === "White" ? user2 : user1}</div>
                    </div>
                    
                 </div>
            <div className="resp-table-footer">
                <div className="table-footer-cell">
                    <button className="buttongreen"
                        onClick={(e) => onPressNewGame()}
                        disabled={isDisabledNewGame}
                    >
                        NEW GAME
                    </button>
                </div>
                <div className="table-footer-cell">
                    <button
                        className="buttongreen"
                        onClick={(e) => onPressUndo()}
                        disabled={isDisabledUndo}>
                        UNDO
                    </button>
                </div>
                <div className="table-footer-cell">
                    <button
                        className="buttongreen"
                        onClick={(e) => onPressCreate()}
                        disabled={isDisabled}
                    > CREATE
                    </button>
                </div>
                <div className="table-footer-cell">
                    <button
                        className="buttongreen"
                        onClick={(e) => onPressRepear()}
                    > REPEAR POSITION
                    </button>
                </div>
                <div className="table-footer-cell">
                    <button
                        className="buttongreen"
                        onClick={(e) => onPressLF()}

                    > LOAD FROM FEN
                    </button></div>
                <div className="table-footer-cell">
                    <button
                        className="buttongreen"
                        onClick={(e) => onPressSF()}

                    > RESEND LAST MOVE
                    </button>
                </div>
                <div className="table-footer-cell">
                    <button
                    className="buttongreen"
                    onClick={(e) => onPressSave()}
                > SAVE
                    </button>
                </div>
                <div className="table-footer-cell">
                    <button
                        className="buttongreen"
                        onClick={(e) => onPressLoad()}
                    > LOAD
                    </button>
                </div>
            </div>
            <BrowserView>
                <div className="log">
                    <div className="resp-table">
                        <div className="resp-table-caption">
                            Game log Table {roomId}
                        </div>
                        {messages.map((item, i) => (
                            <div className="resp-table-row">
                                <div className="table-body-cell">{item.user}</div>
                                <div className="table-body-cell">{item.msg}</div>
                            </div>
                        ))}

                        <div className="resp-table-row">
                            <div className="table-body-cell">Channels {isLooker ? (<span>Looker</span>) : (<span>Player</span>)}</div>
                            <div className="table-body-cell">{lobbyChannel}</div>
                            <div className="table-body-cell">{gameChannel}</div>
                        </div>


                    </div>
                 </div>
            </BrowserView>
        </div >
        )
}
export default BackamonPage
