pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract BetTest {
	address public better1;
	address public better2;
	address public auditor;
	uint public amount;
	uint public state;
	
	event StartedBet(address by);
	event MadeBet(address by, address to, address _auditor, uint _amount);
	event BetAgreed(address by, address to, address _auditor, uint _amount);
	
    constructor(address _better2, address _auditor, uint _amount) {
		better1 = msg.sender;
		better2 = _better2;
		auditor = _auditor;
		amount = _amount;
		emit MadeBet(msg.sender, better2, auditor, amount);
		state = 1;
		//console.log("Bet sent from %s to %s with auditor %s of amount %s", better1, better2, auditor, amount);
    }
	
	function agreeToBet() public{
		require(msg.sender == better2);
		require(state == 1);
		emit BetAgreed(better1, better2, auditor, amount);
		console.log("Bet agreed by %s", better2);
		state = 2;
	}
	
	function adjudicate(uint decision) public{
		require(msg.sender == auditor);
		require(state == 2);
		if (decision == 1){
			console.log("Auditors decision is True");
		} else {
			console.log("Auditors decision is False");
		}
		state = 3;
	}
	
	function states() public view returns (uint) {
		return state;
	} 
}