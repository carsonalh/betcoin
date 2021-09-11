import React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import postUser from './postUser';
import { setUser } from './store';

class Login extends React.Component {
    state = {
        email: '',
        password: '',
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
                <div className="Menu">
                    <ul>
                        <li><Link to="/signup">Sign Up Instead</Link></li>
                    </ul>
                </div>
                <h2>Login</h2>
                {this.state.error}
                <form onSubmit={this.submit}>
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
