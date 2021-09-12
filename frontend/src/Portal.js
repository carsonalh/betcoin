import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import axios from './axios-instance';
import { ethers } from 'ethers';
import abi from './abi';

class Portal extends React.Component {
    static CONTRACT_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3';
    
    state = {
        friendEmail: '',
        friendStatus: null,
        friends: null,
		pendingBets: null,
        provider: null,
        block: null,
        balance: null,
        contract: null,
        betWithEmail: '',
        betWithJudge: '',
        betDescription: '',
        betAmount: null,
        betOtherAmount: null,
        error: null,
        bets: []
    };

    getPublicKeyFromEmail = email => {
        console.dir(this.state.friends);
        for (const friend of this.state.friends) {
            if (friend.email === email) {
                return friend.publicKey;
            }
        }

        this.setState({ error: 'Not friends with user with email ' + email });

        throw new Error('User not found');
    };

    submitBet = async e => {
        e.preventDefault();

        // TODO
        if (!this.state.contract) {
            return;
        }

        const { contract } = this.state;

        try {
            const toAddress = ethers.utils.computeAddress('0x' + this.getPublicKeyFromEmail(this.state.betWithEmail));
            const judgeAddress = ethers.utils.computeAddress('0x' + this.getPublicKeyFromEmail(this.state.betWithJudge));
            const ourBet = this.state.betAmount;
            const theirBet = this.state.betOtherAmount;
            const description = this.state.betDescription;
            const TIMEOUT = 2 ** 40;
            console.log(toAddress, judgeAddress, ourBet, theirBet, description, TIMEOUT);
            await contract.makeBet(toAddress, judgeAddress, ourBet, theirBet, description, TIMEOUT);
        } catch (e) {
            console.error(e);
        }
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
        const bets = [];
        const numBets = await contract.getLargestID();
        for (let i = 0; i < numBets; ++i) {
            bets.push(
                await contract.getBet(i)
            );
        }
        this.setState({ bets, block, contract, balance: numberBalance });
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
                this.setState({ friends });
            });
    }
    
    render() {
        const redirect = this.props.user ? null : <Redirect to="/" />;
        const friends =
            <ul>
                <h3>Friends</h3>
                {this.state.friends?.map(
                    f => <li key={f.email}>{f.name} ({f.email}){f.pending && ' -- Pending'}</li>
                )}
            </ul>;
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
                {friends || 'You don\'t have any friends yet.'}
                <h3>Create a Bet</h3>
                {this.state.error}
                <form onSubmit={this.submitBet}>
                    <input type="email" placeholder="With? (email)" value={this.state.betWithEmail} onChange={e => this.setState({ betWithEmail: e.target.value })} />
                    <input type="email" placeholder="Judge Email" value={this.state.betWithJudge} onChange={e => this.setState({ betWithJudge: e.target.value })} />
                    <input type="number" placeholder="Amount" value={this.state.betAmount} onChange={e => this.setState({ betAmount: e.target.value })} />
                    <input type="number" placeholder="Their Amount" value={this.state.betOtherAmount} onChange={e => this.setState({ betOtherAmount: e.target.value })} />
                    <input type="text" placeholder="Description..." value={this.state.betDescription} onChange={e => this.setState({ betDescription: e.target.value })} />
                    <input type="submit" value="Create Bet!" />
                </form>
            </div>
        );
    }
}

const mapStateToProps = state => ({ user: state.user.email ? { ...state.user } : null });

export default connect(mapStateToProps, null)(Portal);
