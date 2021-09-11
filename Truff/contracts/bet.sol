pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract BetTest {
	address public bank;
	uint public largestID;
	uint public baseLine;
	
	mapping (address => uint) public balances;
	mapping (uint => address) public better1;
	mapping (uint => address) public better2;
	mapping (uint => address) public judge;
	mapping (uint => uint) public amount;
	mapping (uint => uint) public state;
	
	event ProposeBet(uint betID, address to);
	event BetAgreedTo(uint betID, address _auditor);
	event TooLowAccount(address person);
	event Adjudicated(uint betID);
	
    constructor() {
		largestID = 0;
		bank = msg.sender;
    }
	
	function mint(uint _amount) public {
		require(msg.sender == bank);
		baseLine += _amount;
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
		if (balances[msg.sender] + baseLine >= amount[id]) {
			if (balances[better1[id]] + baseLine >= amount[id]) {
				unchecked {
					balances[better1[id]] -= amount[id];
					balances[msg.sender] -= amount[id];
				}
				state[id] = 2;
				emit BetAgreedTo(id, judge[id]);
			} else {
				state[id] = 3;
				emit TooLowAccount(better1[id]);
			}
		} else {
			state[id] = 3;
			emit TooLowAccount(msg.sender);
		}
	}
	
	function adjudicate(uint id, uint decision) public{
		require(msg.sender == judge[id]);
		require(state[id] == 2);
		if (decision == 1){
			unchecked{
				balances[better1[id]] += 2*amount[id];
			}
			console.log("Auditors decision is better1");
		} else if (decision == 2) {
			unchecked{
				balances[better2[id]] += 2*amount[id];
			}
			console.log("Auditors decision is better2");
		} else {
			unchecked{
				balances[better1[id]] += amount[id];
				balances[better2[id]] += amount[id];
			}
			console.log("Auditors decision is undecided (all money back)");
		}
		state[id] = 3;
		emit Adjudicated(id);
	}
	
	function getBalance() public view returns (uint){
		unchecked {
			return balances[msg.sender] + baseLine;
		}
	}
	
	function getState(uint id) public view returns (uint) {
		return state[id];
	} 
	
	function getId() public view returns (uint) {
		return largestID;
	}
}