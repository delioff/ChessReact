import React from 'react';
import './App.css';
import { NavLink, Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import GamePage from './components/gamepage'
import ChatPage from './components/chatpage'
import HomePage from './components/homepage'
import BackamonPage from './components/bgamon/backgamonpage'
import Footer from './components/foother'
import PubNub from 'pubnub';
import { PubNubProvider } from 'pubnub-react';
import { BrowserView, MobileView } from 'react-device-detect';


const App = () => {
    const pubnub = new PubNub({
        publishKey: "pub-c-e0419b3b-6aa9-4e4f-af8a-8dc193d1805a",
        subscribeKey: "sub-c-ee3e0f22-18b4-11ec-901d-e20c06117408",
    });
    return(<div className='app'>
        <h1>Chess by uncle Tony</h1>
        <Router>
            <Navigation />
            <PubNubProvider client={pubnub}>
            <Main />
             </PubNubProvider>
        </Router>
        <BrowserView>
            <Footer />
        </BrowserView> 
    </div>
   )
};

const Navigation = () => (
    
    <nav>
        <ul>
            <li><NavLink exact activeClassName="current" to='/'>Training</NavLink></li>
            <li><NavLink exact activeClassName="current" to='/game'>Game</NavLink></li>
            <li><NavLink exact activeClassName="current" to='/chat'>Chat</NavLink></li>
            <li><NavLink exact activeClassName="current" to='/bg'>Backgammon</NavLink></li>
        </ul>
        </nav>
   
);
const Main = () => (
    <Switch>
        <Route exact path='/' component={HomePage}></Route>
        <Route exact path='/game' component={GamePage}></Route>
        <Route exact path='/chat' component={ChatPage}></Route>
        <Route exact path='/bg' component={BackamonPage}></Route>
     </Switch>
);

export default App;
