import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import axios from './axios-instance';
import { ethers } from 'ethers';
import abi from './abi';

class Portal extends React.Component {
    static CONTRACT_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3';
    
    state = {
        friendEmail: null,
        friendStatus: null,
        friends: null,
        provider: null,
        block: null,
        balance: null,
        contract: null
    };

    addFriend = e => {
        e.preventDefault();

        this.setState({ friendStatus: 'loading' });

        axios
            .post(`/users/${this.props.user.id}/friends`, {
                friend: { email: this.state.friendEmail }
            })
            .then(res => {
                this.setState({ friendStatus: 'successful' });
            })
            .catch(err => {
                this.setState({ friendStatus: 'failure' });
            });
    };

    initializeBlockChain = async () => {
        if (!this.state.provider) return;

        const { provider } = this.state;
        const blockNumber = await provider.getBlockNumber();
        const block = await provider.getBlockWithTransactions(blockNumber);
        const wallet = new ethers.Wallet(this.props.user.privateKey, provider);
        const contract = new ethers.Contract(Portal.CONTRACT_ADDRESS, abi, wallet);
        const balance = await contract.getBalance();
        const numberBalance = Number.parseInt(balance._hex, 16);
        this.setState({ block, contract, balance: numberBalance });
    };

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.provider && this.state.provider) {
            this.initializeBlockChain();
        }
    }

    componentDidMount() {
        if (!this.props.user) {
            return;
        }
        
        // http://localhost:8545/ by default
        const provider = new ethers.providers.getDefaultProvider('http://localhost:8545');
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
                My balance is {this.state.balance || 'loading'} <br />
                {
                    this.state.block
                        ?
                        <>
                            <strong>Hash</strong>: {this.state.block.hash.slice(2)} <br />
                            <strong>Transaction Hashes</strong>: <br />
                            <ul>
                                {this.state.block.transactions.map(t => <li key={t.hash}>{t.hash.slice(2)}</li>)}
                            </ul>
                            <strong>Parent Hash</strong>: {this.state.block.parentHash.slice(2)}
                        </>
                        : <p>Loading...</p>
                }
                <h3>Add Friend</h3>
                <form onSubmit={this.addFriend}>
                    <input
                        type="email"
                        value={this.state.friendEmail}
                        onChange={e => this.setState({ friendEmail: e.target.value })}
                    />
                    <input
                        type="submit"
                        value="Add Friend"
                    />
                </form>
                {this.state.friendStatus}
                {this.state.friends || 'You don\'t have any friends yet.'}
            </div>
        );
    }
}

const mapStateToProps = state => ({ user: state.user.email ? { ...state.user } : null });

export default connect(mapStateToProps, null)(Portal);
