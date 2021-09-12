import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import axios from './axios-instance';
import { ethers } from 'ethers';
import abi from './abi';

import "./Portal.css";

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
        address: null,
        bets: []
    };

    refresh = async e => {
        e.preventDefault();

        if (!this.state.contract)
            return;

        await this.intializeUserState();
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

    acceptBet = async (e, id) => {
        e.preventDefault();

        // TODO
        if (!this.state.contract) {
            return;
        }

        const { contract } = this.state;

        try {
            await contract.agreeToBet(id);
        } catch (e) {
            console.error(e);
        }
    };

    rejectBet = async (e, id) => {
        e.preventDefault();

        // TODO
        if (!this.state.contract) {
            return;
        }

        const { contract } = this.state;

        try {
            await contract.declineBet(id);
        } catch (e) {
            console.error(e);
        }
    };

    acceptJudgement = async (e, id) => {
        e.preventDefault();

        // TODO
        if (!this.state.contract) {
            return;
        }
        const { contract } = this.state;

        try {
            await contract.adjudicate(id, 1);
        } catch (e) {
            console.error(e);
        }
    };

    rejectJudgment = async (e, id) => {
        e.preventDefault();

        // TODO
        if (!this.state.contract) {
            return;
        }

        const { contract } = this.state;

        try {
            await contract.declineBet(id, 2);
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

    intializeUserState = async () => {
        if (!this.state.contract) {
            return;
        }

        const { contract } = this.state;
        
        const bets = [];
        const numBets = await contract.getLargestID();
        for (let i = 0; i < numBets; ++i) {
            let bet = await contract.getBet(i);
            bets.push({ better1id: bet[0], better2id: bet[1], judgeid: bet[2], better1amount: parseInt(bet[3]._hex), better2amount: parseInt(bet[4]._hex), description: bet[5], state: parseInt(bet[6]._hex), id: i }
            );
        }

        const balance = await contract.getBalance();
        const numberBalance = Number.parseInt(balance._hex, 16);

        this.setState({ bets, balance: numberBalance });
    };

    initializeBlockChain = async () => {
        if (!this.state.provider) return;

        const { provider } = this.state;
        const blockNumber = await provider.getBlockNumber();
        const block = await provider.getBlockWithTransactions(blockNumber);
        const wallet = new ethers.Wallet(this.props.user.privateKey, provider);
        this.state.address = ethers.utils.computeAddress(wallet.publicKey);
        const contract = new ethers.Contract(Portal.CONTRACT_ADDRESS, abi, wallet);
        this.setState({ block, contract });
    };

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.provider && this.state.provider) {
            this.initializeBlockChain();
        }
        if (!prevState.contract && this.state.contract) {
            // Only called when the contract is set
            this.intializeUserState();
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
                const friends = res.data.friends.map(friend => {
                    const { publicKey } = friend;
                    console.log('publicKey', publicKey);
                    friend.address = ethers.utils.computeAddress('0x' + publicKey);
                    return { ...friend };
                });
                console.dir(friends);

                this.setState({ friends });
            });
    }

    getNameFromAddress = address => {
        if (!this.state.friends) {
            return;
        }

        const index = this.state.friends.map(friend => friend.address).indexOf(address);
        if (index < 0)
            return address;
        return this.state.friends[index].name;
    };

    render() {
        const redirect = this.props.user ? null : <Redirect to="/" />;
        const friends = this.state.friends?.map(
            f => <li key={f.email} className={f.pending && "pending"}>{f.name} -- {f.email}{f.pending && ' (Pending)'}</li>
        );
        const pendingBets =
            <ul>
                <h3>Pending Bets</h3>
                {this.state.bets?.filter(b => b.better2id == this.state.address && b.state == 1
                ).map(
                    b => <li key={b.id}>From:{this.getNameFromAddress(b.better1id)}, with judge:{this.getNameFromAddress(b.judgeid)}, desc:{b.description}, Them: {b.better1amount} BC You: {b.better2amount} BC
                        <form onSubmit={(e) =>
                            this.acceptBet(e, b.id)}>
                            <input type="submit" value="Accept" />
                        </form>
                        <form onSubmit={(e) =>
                            this.rejectBet(e, b.id)}>
                            <input type="submit" value="Reject" />
                        </form>

                    </li>
                )}
            </ul>;
        const pendingJudgements =
            <ul>
                <h3>Pending Judgements</h3>
                {this.state.bets?.filter(b => b.judgeid == this.state.address && b.state == 2
                ).map(
                    b => <li key={b.id}> Party 1:{b.better1id}, Party 2:{b.better2id}, desc:{b.description}
                        <form onSubmit={(e) =>
                            this.acceptJudgement(e, b.id)}>
                            <input type="submit" value="Party 1" />
                        </form>
                        <form onSubmit={(e) =>
                            this.rejectJudgement(e, b.id)}>
                            <input type="submit" value="Party 2" />
                        </form>
                    </li>
                )}
            </ul>;

        return (
            <>
                <div className="Menu">
                    <div className="logo">
                        <h1>Betcoin</h1>
                    </div>
                    <a href="#">Signed in as {this.props.user?.name}</a>
                </div>
                <div className="Portal">
                    {redirect}
                    <button className="refresh" onClick={this.refresh}>Refresh</button>
                    <h3>Balance</h3>
                    <span className="balance">{this.state.balance && this.state.balance + ' BC' || 'loading'}</span>
                    <h3>My Public Key</h3>
                    <span className="key">{this.props.user?.publicKey && this.props.user.publicKey.slice(0, 30) + '...'}</span>
                    <h3>Friends</h3>
                    <ul className="friends">
                    {friends?.length
                        ? friends
                        : <li>You do not have any friends yet</li>}
                    </ul>
                    <form onSubmit={this.addFriend}>
                        <input
                            type="email"
                            placeholder="Email..."
                            value={this.state.friendEmail}
                            onChange={e => this.setState({ friendEmail: e.target.value })}
                        />
                        <input
                            type="submit"
                            value="Add"
                        />
                    </form>
                    <h2>Incoming</h2>
                    {pendingBets || 'No bets pending'}
                    {pendingJudgements || 'No judgements pending'}
                    <h2>New Bet</h2>
                    <form onSubmit={this.submitBet}>
                        <input type="email" placeholder="With? (email)" value={this.state.betWithEmail} onChange={e => this.setState({ betWithEmail: e.target.value })} />
                        <input type="email" placeholder="Judge Email" value={this.state.betWithJudge} onChange={e => this.setState({ betWithJudge: e.target.value })} />
                        <input type="number" placeholder="Amount" value={this.state.betAmount} onChange={e => this.setState({ betAmount: e.target.value })} />
                        <input type="number" placeholder="Their Amount" value={this.state.betOtherAmount} onChange={e => this.setState({ betOtherAmount: e.target.value })} />
                        <input type="text" placeholder="Description..." value={this.state.betDescription} onChange={e => this.setState({ betDescription: e.target.value })} />
                        <input type="submit" value="Create Bet!" />
                    </form>
                    <h2>Most Recent Block</h2>
                    {
                        this.state.block
                            ?
                            <>
                                <h4>Hash</h4>
                                <span className="key">{this.state.block.hash.slice(2)}</span>
                                <h4>Parent Hash</h4>
                                <span className="key">{this.state.block.parentHash.slice(2)}</span>
                                <h4>Last Transaction</h4>
                                <span className="key">{
                                    this.state.block.transactions.length
                                    ? this.state.block.transactions[this.state.block.transactions.length - 1].hash
                                    : 'No hashes in block yet'
                                }</span>
                            </>
                            : <p>Loading...</p>
                    }
                    {this.state.friendStatus}
                    {this.state.error}
                </div>
            </>
        );
    }
}

const mapStateToProps = state => ({ user: state.user.email ? { ...state.user } : null });

export default connect(mapStateToProps, null)(Portal);
