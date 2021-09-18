import React, { useEffect, useState } from 'react'
import './App.css'
import { gameSubject, initGame} from './components/game'
import inforow from './components/inforow'
import Board from './components/board'
import NewButton from './components/newbutton'
import Coord from './components/coord'
//This is a hook I created to reduce some of the bloat we get with watching inputs for changes.
import useInput from './useInput';

//Lets us import PubNub for our chat infrastructure capabailites.
import PubNub from 'pubnub';

//Material UI Components
import { Card, CardActions, CardContent, List, ListItem, Button, Typography, Input } from '@material-ui/core';

function App() {
    const [board, setBoard] = useState([])
    const [isGameOver, setIsGameOver] = useState()
    const [result, setResult] = useState()
    const [turn, setTurn] = useState()
    const [history, setHistory] = useState([])
    const [incheck, setIncheck] = useState()
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
    let inf = [];
    let x = ["a", "b","c", "d","e","f", "g","h"];
    let y = ["8", "7", "6", "5", "4", "3", "2", "1"];
    for (var i = 0; i < history.length; i += 2) {
        if (history[i].color === 'w') {
            inf.push({
                "w": inforow(history[i] ? history[i] : null, i),
                "b": inforow(history[i+1] ? history[i+1] : null, i+1)
            })
        }
        else {
            inf.push({
                "w": inforow(history[i-1] ? history[i-1] : null, i-1),
                "b": inforow(history[i] ? history[i] : null, i)
            })
        }
    
    }
    //Set a default channel incase someone navigates to the base url without
    //specificfying a channel name parameter.
    let defaultChannel = "Global";
    //Access the parameters provided in the URL
    let query = window.location.search.substring(1);
    let params = query.split("&");
    for (let i = 0; i < params.length; i++) {
        var pair = params[i].split("=");
        //If the user input a channel then the default channel is now set
        //If not, we still navigate to the default channel.
        if (pair[0] === "channel" && pair[1] !== "") {
            defaultChannel = decodeURI(pair[1]);
        }
    }

    //Set the states using useState hook,
    //We have our messages, a message adding buffer, our channel,the username, and
    //temp channel and message using the useInput hook. We access what the
    //user is currently typing with those hooks.
    const [channel, setChannel] = useState(defaultChannel);
    const [messages, setMessages] = useState([]);
    const [username,] = useState(['user', new Date().getTime()].join('-'));
    const tempChannel = useInput();
    const tempMessage = useInput();
    //This is where we set up PubNub and handle events that come through. Reruns on channel name update!
    useEffect(() => {
        console.log("setting up pubnub");
        const pubnub = new PubNub({
            publishKey: "pub-c-e0419b3b-6aa9-4e4f-af8a-8dc193d1805a",
            subscribeKey: "sub-c-ee3e0f22-18b4-11ec-901d-e20c06117408",
            uuid: username
        });


        pubnub.addListener({
            status: function (statusEvent) {
                if (statusEvent.category === "PNConnectedCategory") {
                    console.log("Connected to PubNub!")
                }
            },
            message: function (msg) {
                if (msg.message.text) {
                    console.log(msg.message.text)
                    let newMessages = [];
                    newMessages.push({
                        uuid: msg.message.uuid,
                        text: msg.message.text
                    });
                    setMessages(messages => messages.concat(newMessages))
                }
            }
        });
        //Subscribes to the channel in our state
        pubnub.subscribe({
            channels: [channel]
        });
        pubnub.history(
            {
                channel: channel,
                count: 10, // 100 is the default
                stringifiedTimeToken: true // false is the default
            }, function (status, response) {
                let newMessages = [];
                if (response && response.messages) {
                    for (let i = 0; i < response.messages.length; i++) {
                        newMessages.push({
                            uuid: response.messages[i].entry.uuid,
                            text: response.messages[i].entry.text
                        });
                    }
                    setMessages(messages => messages.concat(newMessages));
                }
            }
        );
        return function cleanup() {
            console.log("shutting down pubnub");
            pubnub.unsubscribeAll();
            setMessages([]);
        }
    }, [channel, username]);
    //Adding back browser button listener
    useEffect(() => {
        window.addEventListener("popstate", goBack);

        return function cleanup() {
            window.removeEventListener("popstate", goBack);
        }
    }, []);

    function handleKeyDown(event) {
        if (event.target.id === "messageInput") {
            if (event.key === 'Enter') {
                publishMessage();
            }
        } else if (event.target.id === "channelInput") {
            if (event.key === 'Enter') {
                //Navigates to new channels
                const newChannel = tempChannel.value.trim();
                if (newChannel) {
                    if (channel !== newChannel) {
                        //If the user isnt trying to navigate to the same channel theyre on
                        setChannel(newChannel);
                        let newURL = window.location.origin + "?channel=" + newChannel;
                        window.history.pushState(null, '', newURL);
                        tempChannel.setValue('');
                    }
                } else {
                    //If the user didnt put anything into the channel Input
                    if (channel !== "Global") {
                        //If the user isnt trying to navigate to the same channel theyre on
                        setChannel("Global");
                        let newURL = window.location.origin;
                        window.history.pushState(null, '', newURL);
                        tempChannel.setValue('');
                    }
                }
            }
        }

    }

    //Publishing messages via PubNub
    function publishMessage() {
        if (tempMessage.value) {
            let messageObject = {
                text: tempMessage.value,
                uuid: username
            };

            const pubnub = new PubNub({
                publishKey: "pub-c-e0419b3b-6aa9-4e4f-af8a-8dc193d1805a",
                subscribeKey: "sub-c-ee3e0f22-18b4-11ec-901d-e20c06117408",
                uuid: username
            });
            pubnub.publish({
                message: messageObject,
                channel: channel
            });
            tempMessage.setValue('');
        }
    }
    function goBack() {
        //Access the parameters provided in the URL
        let query = window.location.search.substring(1);
        if (!query) {
            setChannel("Global")
        } else {
            let params = query.split("&");
            for (let i = 0; i < params.length; i++) {
                var pair = params[i].split("=");
                //If the user input a channel then the default channel is now set
                //If not, we still navigate to the default channel.
                if (pair[0] === "channel" && pair[1] !== "") {
                    setChannel(decodeURI(pair[1]))
                }
            }
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
                                        <Coord letter={letter} or={("v")}/>
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
                            <Board board={board} turn={turn} />
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
                                        <Coord letter={letter} or={("v")}/>
                                    ))}
                                </div>
                        </div>
                    {result && <p className="vertical-text">{result}</p>}
                    <p className="vertical-text">{turn+' '+incheck}</p>
                    </div>
                        
                 </div>
               
                
            </div>
            <div className="column">
                <Card >
                    <CardContent>
                        <div className="top">
                            <Typography variant="h4" inline >
                                PubNub React Chat
                            </Typography>
                            <Input
                                style={{ width: '100px' }}
                                className="channel"
                                id="channelInput"
                                onKeyDown={handleKeyDown}
                                placeholder={channel}
                                onChange={tempChannel.onChange}
                                value={tempChannel.value}
                            />
                        </div>
                        <div >
                            <Log messages={messages} />
                        </div>
                    </CardContent>
                    <CardActions>
                        <Input
                            placeholder="Enter a message"
                            fullWidth={true}
                            id="messageInput"
                            value={tempMessage.value}
                            onChange={tempMessage.onChange}
                            onKeyDown={handleKeyDown}
                            inputProps={{ 'aria-label': 'Message Field', }}
                            autoFocus={true}
                        />
                        <Button
                            size="small"
                            color="primary"
                            onClick={publishMessage}
                        >
                            Submit
                        </Button>
                    </CardActions>
                </Card>
                <div className="itemcontainer">
                    <div className="info-container">
                         <div className="resp-table">
                            <div className="resp-table-caption">
                                <NewButton/>
                             </div>
                            <div className="resp-table-header">
                                    <div className="table-header-cell">White</div>
                                    <div className="table-header-cell">Black</div>
                            </div>
                            <div className="resp-table-body">
                                    {inf.map((item, i) => (
                                        <div className="resp-table-row">
                                            {item.w}
                                            {item.b}
                                        </div>
                                    ))}
                            </div>
                            {/*<div className="resp-table-footer">*/}
                            {/*    <div className="table-footer-cell">White</div>*/}
                            {/*    <div className="table-footer-cell">Black</div>*/}
                            {/*</div>*/}
                          </div>
                    </div>
                 </div>
             </div>
            
        </div>
         )
}
//Log functional component that is the list of messages
function Log(props) {

    return (
        <List component="nav">
            <ListItem>
                <Typography component="div">
                    {props.messages.map((item, index) => (
                        <Message key={index} uuid={item.uuid} text={item.text} />
                    ))}
                </Typography>
            </ListItem>
        </List>
    )
};

//Our message functional component that formats each message.
function Message(props) {
    return (
        <div >
            {props.uuid}: {props.text}
        </div>
    );
}
export default App
