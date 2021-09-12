import React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import postUser from './postUser';
import { setUser } from './store';

import './Login.css';
import lockHead from './lock-head.png';

class Login extends React.Component {
    state = {
        email: '',
        password: '',
        redirect: null,
        error: null
    };

    submit = e => {
        e.preventDefault();

        postUser({
            email: this.state.email,
            password: this.state.password
        })
            .then(user => {
                this.props.setUser(user);
                this.setState({ redirect: <Redirect to="/dashboard" /> });
            })
            .catch(err => {
                this.setState({ error: err.message });
            });
    };

    render() {
        return (
            <div className="Login">
                {this.state.redirect}
                <div className="Menu">
                    <div className="logo">
                        <h1>Betcoin</h1>
                    </div>
                    <Link to="/signup">Sign Up</Link>
                </div>
                <img src={lockHead} className="lock-head" />
                <form onSubmit={this.submit}>
                    <h2>Login</h2>
                    <input
                        type="email"
                        placeholder="Email"
                        value={this.state.email}
                        onChange={e => this.setState({ email: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={this.state.password}
                        onChange={e => this.setState({ password: e.target.value })}
                    />
                    <input type="submit" value="Login" />
                </form>
            </div>
        );
    }
}

export default connect(null, { setUser })(Login);
