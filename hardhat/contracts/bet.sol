pragma solidity ^0.8.0;

import "hardhat/console.sol";

struct Bet { 
	address better1;
	address better2;
	address judge;
	uint better1amount;
	uint better2amount;
	string description;
	uint state;
}


contract Bookie {

	uint public constant STATE_PROPOSED = 1;
	uint public constant STATE_CONFIRMED = 2;
	uint public constant STATE_ENDED = 3;
	
	address public bank;
	
	// Largest bet ID
	uint public largestID;
	
	// The amount of coin that people start with
	uint public baseLine;
	
	// The storage of the coins
	mapping (address => uint) public balances;
	
	// Maps taking a bet ID and giving the realted values
	mapping (uint => Bet) public ledger;
	
	event ProposeBet(uint betID, address to);
	event BetAgreedTo(uint betID, address auditor);
	event TooLowAccount(address person);
	event Adjudicated(uint betID);
	event BetDeclined(uint betID, address from);
	event BetWon(uint betID, address winner);
	
    constructor() {
		largestID = 0;
		bank = msg.sender;
    }
	
	function mint(uint _amount) public {
		require(msg.sender == bank, "Only the bank can mint!");
		baseLine += _amount;
	}
	
	// Create a new bet
	function makeBet(address better2, address judge, uint better1amount, uint better2amount, string memory description) public {
		uint id = largestID;
		ledger[id] = Bet(msg.sender, better2, judge, better1amount, better2amount, description, STATE_PROPOSED);
		largestID += 1;
		emit ProposeBet(id, better2);
	}
	
	// Agree to a proposed bet
	function agreeToBet(uint id) public{
		require(ledger[id].state == STATE_PROPOSED, "This bet is not in an accepting state!");
		require(msg.sender == ledger[id].better2, "Only the recipient can accept the bet!");
		
		if (balances[msg.sender] + baseLine >= ledger[id].better2amount) {
			if (balances[ledger[id].better1] + baseLine >= ledger[id].better1amount) {
			
				unchecked {
					balances[ledger[id].better1] -= ledger[id].better1amount;
					balances[msg.sender] -= ledger[id].better2amount;
				}
				
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
	function declineBet(uint id) public{
		require(ledger[id].state == STATE_PROPOSED, "This bet is not in an declining state!");
		require(msg.sender == ledger[id].better2, "Only the recipient can decline the bet!");
		
		ledger[id].state = STATE_ENDED;
		emit BetDeclined(id, ledger[id].better1);
	}
	
	// Adjudicate a confirmed bet. Decision is the party that wins the bet. It should be 1 or 2 to select the respective better.
	function adjudicate(uint id, uint decision) public{
		require(ledger[id].state == STATE_CONFIRMED, "This bet is not in a adjudicating state!");
		require(msg.sender == ledger[id].judge, "Only the judge can adjudicate the bet!");
		
		if (decision == 1) {
			unchecked {
				balances[ledger[id].better1] += ledger[id].better1amount + ledger[id].better2amount;
			}
			emit BetWon(id, ledger[id].better1);
		} else if (decision == 2) {
			unchecked {
				balances[ledger[id].better2] += ledger[id].better1amount + ledger[id].better2amount;
			}
			emit BetWon(id, ledger[id].better2);
		} else {
			unchecked {
				balances[ledger[id].better1] += ledger[id].better1amount;
				balances[ledger[id].better2] += ledger[id].better2amount;
			}
		}
		
		ledger[id].state = STATE_ENDED;
		emit Adjudicated(id);
	}
	
	// Gets the balance of the calling address
	function getBalance() public view returns (uint){
		unchecked {
			return balances[msg.sender] + baseLine;
		}
	}
	
	// Gets the state of the specified bet
	function getState(uint id) public view returns (uint) {
		return ledger[id].state;
	}
	
	function getBet(uint id) public view returns (address, address, address, uint, uint, string memory, uint){
		return (ledger[id].better1, ledger[id].better2, ledger[id].judge, ledger[id].better1amount, ledger[id].better2amount, ledger[id].description, ledger[id].state);
	}
}
