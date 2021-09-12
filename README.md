
![Betcoin: Cryptocurrency, Gambling - Good separate, Better together](landing.jpg)
## Will he pay up?
You're at the bar with your mate. He swears that he can fit 42 pretzels in his mouth. Obviously, you call his bluff and bet him $10. This happens every week, but he always bails with the cash. How can you ensure he pays this time? With a blockchain of course!

## What is Betcoin?
Betcoin is a new Ethereum-powered cryptocurrency specifically made for betting so that your sleazy friends can never cheat you. There is no way to trade Betcoin except via a bet. With each bet on the Ethereum blockchain, the world can watch and validate your drunken wagers.

## How it works:
1. Add your friend
2. Make a bet, setting an adjudicator (say, the bartender)
3. Get your friend to agree to the bet (or they can reject it if they think it is unfair)
4. The Betcoin gets put into a pot
5. Let the adjudicator decide (and get your winnings)
!![Betcoin - Powered by Ethereum](power.jpg)
## Prototype Design
![Login Page](prototype1.jpg)
![Main Page](prototype2.jpg)

## The Nitty-Gritty
The stack:
- Front end - React
- Back end (for naming system) - MySql
- Block chain - Solidity, Hardhat
### The Blockchain
This project hosts a smart contract on Ethereum network (called `bookie`) which manages a token called Betcoin. This only runs on a test network (to avoid transaction fees while testing), but would able to be run on the mainnet (the actual Ethereum network). In this way, bets are decentralised and could be made, accepted, rejected or adjudicated by a 3rd party client. Bets can have different amounts put in for each person, can have time limits (not implemented in the current front-end) and can be refunded (if the adjudicator decides).
### The Database

We use two tables in our database: a *users* table which stores information about our users' names, email addresses, passwords (hashed, we're not savages), and private key on the blockchain; and a *friends* table which stores which users are friends with which other users. None of this stuff is strictly necessary but it makes for a more usable product.

