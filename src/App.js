import React from 'react';
import './App.css';
import { NavLink, Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import GamePage from './components/gamepage'
import ChatPage from './components/chatpage'
import StartForm from './components/startform'
import Footer from './components/foother'
import PubNub from 'pubnub';
import { PubNubProvider} from 'pubnub-react';

const App = () => {
    const pubnub = new PubNub({
        publishKey: "pub-c-e0419b3b-6aa9-4e4f-af8a-8dc193d1805a",
        subscribeKey: "sub-c-ee3e0f22-18b4-11ec-901d-e20c06117408",
    });
    return(<div className='app'>
        <h1>Chess by oncle Tony</h1>
        <Router>
            <Navigation />
            <PubNubProvider client={pubnub}>
            <Main />
             </PubNubProvider>
        </Router>
        <Footer />
    </div>
   )
};

const Navigation = () => (
    
    <nav>
        <ul>
            <li><NavLink exact activeClassName="current" to='/'>Start</NavLink></li>
            <li><NavLink exact activeClassName="current" to='/game'>Game</NavLink></li>
            <li><NavLink exact activeClassName="current" to='/chat'>Chat</NavLink></li>
        </ul>
        </nav>
   
);
const Main = () => (
    <Switch>
        <Route exact path='/' component={StartForm}></Route>
        <Route exact path='/game' component={GamePage}></Route>
        <Route exact path='/chat' component={ChatPage}></Route>
     </Switch>
);

export default App;
