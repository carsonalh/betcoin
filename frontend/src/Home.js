import React from 'react';
import {Link} from 'react-router-dom';

import './Home.css';
import hero from './hero.png';
import logo from './logo.png';

function Home(props) {
    return (
        <div className="Home">
            <div className="header">
                <div className="title">
                    <h1>Betcoin</h1>
                    <p>
                        Cryptocurrency, Gambling<br />
                        Good separate<br />
                        Better together
                    </p>
                </div>
                <img src={logo} alt="Betcoin logo" />
            </div>
            <img src={hero} alt="Hero" />
            <div className="sign-up">
                <Link to="/signup">
                    <button>Sign Up Today</button>
                </Link>
            </div>
        </div>
    );
}

export default Home;
