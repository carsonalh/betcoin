import React from 'react';
import { connect } from 'react-redux';

class Portal extends React.Component {
    render() {
        return (
            <div className="Portal">
                Signed in as {this.props.user.name} <br />
                My public key {this.props.user.publicKey}
            </div>
        );
    }
}

const mapStateToProps = state => ({ user: { ...state.user } });

export default connect(mapStateToProps, null)(Portal);
