pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract BetTest {
	address public bank;
	uint public largestID;
	mapping (address => uint) public balances;
	mapping (uint => address) public better1;
	mapping (uint => address) public better2;
	mapping (uint => address) public judge;
	mapping (uint => uint) public amount;
	mapping (uint => uint) public state;
	
	event ProposeBet(uint betID, address to);
	event BetAgreedTo(uint betID, address _auditor);
	
    constructor() {
		largestID = 0;
		bank = msg.sender;
    }
	
	function makeBet(address _better2, address _judge, uint _amount) public {
		uint id = largestID;
		better1[id] = msg.sender;
		better2[id] = _better2;
		judge[id] = _judge;
		amount[id] = _amount;
		largestID += 1;
		state[id] = 1;
		emit ProposeBet(id, _better2);
	}
	
	function agreeToBet(uint id) public{
		require(msg.sender == better2[id]);
		require(state[id] == 1);
		state[id] = 2;
		emit BetAgreedTo(id, judge[id]);
	}
	
	function adjudicate(uint id, uint decision) public{
		require(msg.sender == judge[id]);
		require(state[id] == 2);
		if (decision == 1){
			console.log("Auditors decision is True");
		} else {
			console.log("Auditors decision is False");
		}
		state[id] = 3;
	}
	
	function getState(uint id) public view returns (uint) {
		return state[id];
	} 
	
	function getId() public view returns (uint) {
		return largestID;
	}
}