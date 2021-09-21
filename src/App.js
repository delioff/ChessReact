import React from 'react';
import './App.css';
import { NavLink, Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import GamePage from './components/gamepage'
import ChatPage from './components/chatpage'
import StartForm from './components/startform'

const App = () => (
    <div className='app'>
        <h1>Chess by oncle Tony</h1>
        <Router>
            <Navigation />
            <Main />
        </Router>
    </div>
);

const Navigation = () => (
    
    <nav>
        <ul>
            <li><NavLink exact activeClassName="current" to='/'>Start</NavLink></li>
            <li><NavLink exact activeClassName="current" to='/game'>Game</NavLink></li>
            <li><NavLink exact activeClassName="current" to='/chat'>Chat</NavLink></li>
        </ul>
        </nav>
   
);

//const Home = () => (
//    <div className='home'>
//        <h1>Welcome to my portfolio website</h1>
//        <p> Feel free to browse around and learn more about me.</p>
//    </div>
//);

//const About = () => (
//    <div className='about'>
//        <h1>About Me</h1>
//        <p>Ipsum dolor dolorem consectetur est velit fugiat. Dolorem provident corporis fuga saepe distinctio ipsam? Et quos harum excepturi dolorum molestias?</p>
//        <p>Ipsum dolor dolorem consectetur est velit fugiat. Dolorem provident corporis fuga saepe distinctio ipsam? Et quos harum excepturi dolorum molestias?</p>
//    </div>
//);

//const Contact = () => (
//    <div className='contact'>
//        <h1>Contact Me</h1>
//        <p>You can reach me via email: <strong>hello@example.com</strong></p>
//    </div>
//);

const Main = () => (
    <Switch>
        <Route exact path='/' component={StartForm}></Route>
        <Route exact path='/game' component={GamePage}></Route>
        <Route exact path='/chat' component={ChatPage}></Route>
     </Switch>
);

export default App;
