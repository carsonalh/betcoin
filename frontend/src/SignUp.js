import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import axios from './axios-instance';
import store, { setUser } from './store';
import postUser from './postUser';

class SignUp extends React.Component {
    state = {
        name: '',
        email: '',
        password: '',
        error: null,
        redirect: null
    };

    submit = e => {
        e.preventDefault();

        postUser({
            email: this.state.email,
            name: this.state.name,
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
            <div className="SignUp">
                {this.state.redirect}
                <div className="Menu">
                    <ul>
                        <li><Link to="/login">Login Instead</Link></li>
                    </ul>
                </div>
                <h2>Sign Up</h2>
                {this.state.error}
                <form onSubmit={this.submit}>
                    <input
                        type="text"
                        placeholder="Name"
                        value={this.state.name}
                        onChange={e => this.setState({ name: e.target.value })}
                    />
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
                    <input type="submit" value="Sign Up" />
                </form>
            </div>
        );
    }
}

export default connect(null, { setUser })(SignUp);
