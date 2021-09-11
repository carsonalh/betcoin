import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import axios from './axios-instance';
import { ethers } from 'ethers';

class Portal extends React.Component {
    state = {
        friends: null,
        provider: null,
        block: null
    };

    initializeBlockChain = async () => {
        if (!this.state.provider) return;

        const { provider } = this.state;
        const blockNumber = await provider.getBlockNumber();
        const block = await provider.getBlockWithTransactions(blockNumber);
        this.setState({ block });
    };

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.provider && this.state.provider) {
            this.initializeBlockChain();
        }
    }

    componentDidMount() {
        // http://localhost:8545/ by default
        const provider = new ethers.providers.JsonRpcProvider();
        this.setState({ provider });

        axios
            .get(`/users/${this.props.user.id}/friends`)
            .then(res => {
                const { friends } = res.data;
                this.setState({
                    friends:
                        <ul>
                            <h3>Friends</h3>
                            {friends.map(
                                f => <li key={f.email}>{f.name} ({f.email}){f.pending && ' -- Pending'}</li>
                            )}
                        </ul>
                });
            });
    }
    
    render() {
        const redirect = this.props.user ? null : <Redirect to="/" />;
        return (
            <div className="Portal">
                {redirect}
                Signed in as {this.props.user?.name} <br />
                My public key {this.props.user?.publicKey} <br />
                {
                    this.state.block
                    ?
                    <>
                    <strong>Hash</strong>: {this.state.block.hash.slice(2)} <br />
                    <strong>Parent Hash</strong>: {this.state.block.parentHash.slice(2)}
                    </>
                    : <p>Loading...</p>
                }
                {this.state.friends || 'You don\'t have any friends yet.'}
            </div>
        );
    }
}

const mapStateToProps = state => ({ user: state.user.email ? { ...state.user } : null });

export default connect(mapStateToProps, null)(Portal);
