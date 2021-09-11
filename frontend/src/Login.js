import React from 'react';

class Login extends React.Component {
    state = {
        email: '',
        password: ''
    };

    submit = e => {
        e.preventDefault();
        console.dir(this.state);
    };

    render() {
        return (
            <div className="Login">
                <h2>Login</h2>
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

export default Login;
