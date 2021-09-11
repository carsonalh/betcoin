import React from 'react';

class SignUp extends React.Component {
    state = {
        name: '',
        email: '',
        password: ''
    };

    submit = e => {
        e.preventDefault();
        console.dir(this.state);
    };

    render() {
        return (
            <div className="SignUp">
                <h2>Sign Up</h2>
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

export default SignUp;
