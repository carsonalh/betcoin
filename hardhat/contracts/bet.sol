//SPDX-License-Identifier: CC-BY-NC-4.0
pragma solidity ^0.8.0;

import "hardhat/console.sol";

struct Bet { 
	address better1;
	address better2;
	address judge;
	int256 better1amount;
	int256 better2amount;
	string description;
	uint256 state;
	uint256 time;
}


contract Bookie {

	uint256 public constant STATE_PROPOSED = 1;
	uint256 public constant STATE_CONFIRMED = 2;
	uint256 public constant STATE_ENDED = 3;
	
	uint256 public constant MAX = 2**256 - 1;
	
	address public bank;
	
	// Largest bet ID
	uint256 public largestID;
	
	// The amount of coin that people start with
	int256 public baseLine;
	
	// The storage of the coins
	mapping (address => int256) public balances;
	
	// Maps taking a bet ID and giving the related values
	mapping (uint256 => Bet) public ledger;
	
	event ProposeBet(uint256 betID, address to);
	event BetAgreedTo(uint256 betID, address auditor);
	event TooLowAccount(address person);
	event Adjudicated(uint256 betID);
	event BetDeclined(uint256 betID, address from);
	event BetWon(uint256 betID, address winner);
	event BetRefunded(uint256 betID, address better1, address better2);
	
    constructor() {
		bank = msg.sender;
    }
	
	function mint(int256 _amount) public {
		require(msg.sender == bank, "Only the bank can mint!");
		baseLine += _amount;
	}
	
	// Create a new bet with time limit. Time = 2**256 - 1 will mean that it will go on until the sun collapses
	function makeBet(address better2, address judge, int256 better1amount, int256 better2amount, string memory description, uint256 time) public {
		require(better1amount > 0 && better2amount > 0, "A positive amount is needed to bet!");
		uint256 id = largestID;
		ledger[id] = Bet(msg.sender, better2, judge, better1amount, better2amount, description, STATE_PROPOSED, time);
		largestID += 1;
		emit ProposeBet(id, better2);
	}
	
	// Agree to a proposed bet
	function agreeToBet(uint256 id) public{
		if (block.timestamp > ledger[id].time){
			ledger[id].state = STATE_ENDED;
		}
		require(ledger[id].state == STATE_PROPOSED, "This bet is not in an accepting state!");
		require(msg.sender == ledger[id].better2, "Only the recipient can accept the bet!");
		if (balances[msg.sender] + baseLine >= ledger[id].better2amount) {
			if (balances[ledger[id].better1] + baseLine >= ledger[id].better1amount) {
				balances[ledger[id].better1] -= ledger[id].better1amount;
				balances[msg.sender] -= ledger[id].better2amount;
				
				ledger[id].state = STATE_CONFIRMED;
				emit BetAgreedTo(id, ledger[id].judge);
			} else {
				ledger[id].state = STATE_ENDED;
				emit TooLowAccount(ledger[id].better1);
			}
		} else {
			ledger[id].state = STATE_ENDED;
			emit TooLowAccount(msg.sender);
		}
	}
	
	// Decline a proposed bet
	function declineBet(uint256 id) public{
		if (block.timestamp > ledger[id].time){
			ledger[id].state = STATE_ENDED;
		}
		require(ledger[id].state == STATE_PROPOSED, "This bet is not in an declining state!");
		require(msg.sender == ledger[id].better2, "Only the recipient can decline the bet!");
		
		ledger[id].state = STATE_ENDED;
		emit BetDeclined(id, ledger[id].better1);
	}
	
	// Adjudicate a confirmed bet. Decision is the party that wins the bet. It should be 1 or 2 to select the respective better.
	function adjudicate(uint256 id, uint256 decision) public{
		require(ledger[id].state == STATE_CONFIRMED, "This bet is not in a adjudicating state!");
		require(msg.sender == ledger[id].judge, "Only the judge can adjudicate the bet!");
		
		if (decision == 1) {
			balances[ledger[id].better1] += ledger[id].better1amount + ledger[id].better2amount;
			emit BetWon(id, ledger[id].better1);
		} else if (decision == 2) {
			balances[ledger[id].better2] += ledger[id].better1amount + ledger[id].better2amount;
			emit BetWon(id, ledger[id].better2);
		} else {
			balances[ledger[id].better1] += ledger[id].better1amount;
			balances[ledger[id].better2] += ledger[id].better2amount;
		}
		
		ledger[id].state = STATE_ENDED;
		emit Adjudicated(id);
	}
	
	// Request to get your money back if timeout has occured
	function getTimeoutRefund(uint256 id) public {
		require(msg.sender == ledger[id].better1 || msg.sender == ledger[id].better2, "You must be one of the betters to request a timeout refund!");
		require(block.timestamp > ledger[id].time, "It is too early to refund!");
		balances[ledger[id].better1] += ledger[id].better1amount;
		balances[ledger[id].better2] += ledger[id].better2amount;
		emit BetRefunded(id, ledger[id].better1, ledger[id].better2);
	}
	
	// Gets the balance of the calling address
	function getBalance() public view returns (int){
		return balances[msg.sender] + baseLine;
	}
	
	// Gets the state of the specified bet
	function getState(uint256 id) public view returns (uint) {
		return ledger[id].state;
	}
	
	function getBet(uint256 id) public view returns (address, address, address, int, int, string memory, uint){
		return (ledger[id].better1, ledger[id].better2, ledger[id].judge, ledger[id].better1amount, ledger[id].better2amount, ledger[id].description, ledger[id].state);
	}
	
	function getLargestID() public view returns (uint256){
		return largestID;
	}
}
