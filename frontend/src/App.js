import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import SignUp from './SignUp';
import Login from './Login';
import Portal from './Portal';
import Home from './Home';

class App extends React.Component {
    render() {
        return (
            <>
                <Switch>
                    <Route path="/signup" exact component={SignUp} />
                    <Route path="/login" exact component={Login} />
                    <Route path="/dashboard" exact component={Portal} />
                    <Route path="/" exact component={Home} />
                    <Route path="*">
                        <Redirect to="/signup" />
                    </Route>
                </Switch>
            </>
        );
    }
}

export default App;
