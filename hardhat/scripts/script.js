// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
	// Hardhat always runs the compile task when running scripts with its command
	// line interface.
	//
	// If this script is run directly using `node` you may want to call compile
	// manually to make sure everything is compiled
	// await hre.run('compile');

	// We get the contract to deploy
	
	
	// Start everyone with 100 betcoins
	const baseline = 100;

	const Bookie = await ethers.getContractFactory("Bookie");
	const bet = await Bookie.deploy();
	await bet.deployed();

	await bet.mint(baseline);
	console.log(bet.address);
	
	// From this point on, we enter testing...
	let provider = ethers.getDefaultProvider("http://localhost:8545");
	// Wallet address is the first address always created on the local network (its constant between restarts)
	let signer = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);
	let myAddress = await signer.getAddress();
	// NOTE THAT bet.address WILL NOT BE ABLE TO ACCESSED IN APP HOWEVER,  SHOULD BE CONSTANT BETWEEN RESTARTS
	let contract = new ethers.Contract(bet.address, [
		{
		  "inputs": [],
		  "stateMutability": "nonpayable",
		  "type": "constructor"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "betID",
			  "type": "uint256"
			}
		  ],
		  "name": "Adjudicated",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "betID",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "address",
			  "name": "auditor",
			  "type": "address"
			}
		  ],
		  "name": "BetAgreedTo",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "betID",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "address",
			  "name": "from",
			  "type": "address"
			}
		  ],
		  "name": "BetDeclined",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "betID",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "address",
			  "name": "better1",
			  "type": "address"
			},
			{
			  "indexed": false,
			  "internalType": "address",
			  "name": "better2",
			  "type": "address"
			}
		  ],
		  "name": "BetRefunded",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "betID",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "address",
			  "name": "winner",
			  "type": "address"
			}
		  ],
		  "name": "BetWon",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "betID",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "address",
			  "name": "to",
			  "type": "address"
			}
		  ],
		  "name": "ProposeBet",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": false,
			  "internalType": "address",
			  "name": "person",
			  "type": "address"
			}
		  ],
		  "name": "TooLowAccount",
		  "type": "event"
		},
		{
		  "inputs": [],
		  "name": "MAX",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "STATE_CONFIRMED",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "STATE_ENDED",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "STATE_PROPOSED",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "id",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "decision",
			  "type": "uint256"
			}
		  ],
		  "name": "adjudicate",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "id",
			  "type": "uint256"
			}
		  ],
		  "name": "agreeToBet",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "",
			  "type": "address"
			}
		  ],
		  "name": "balances",
		  "outputs": [
			{
			  "internalType": "int256",
			  "name": "",
			  "type": "int256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "bank",
		  "outputs": [
			{
			  "internalType": "address",
			  "name": "",
			  "type": "address"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "baseLine",
		  "outputs": [
			{
			  "internalType": "int256",
			  "name": "",
			  "type": "int256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "id",
			  "type": "uint256"
			}
		  ],
		  "name": "declineBet",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "getBalance",
		  "outputs": [
			{
			  "internalType": "int256",
			  "name": "",
			  "type": "int256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "id",
			  "type": "uint256"
			}
		  ],
		  "name": "getBet",
		  "outputs": [
			{
			  "internalType": "address",
			  "name": "",
			  "type": "address"
			},
			{
			  "internalType": "address",
			  "name": "",
			  "type": "address"
			},
			{
			  "internalType": "address",
			  "name": "",
			  "type": "address"
			},
			{
			  "internalType": "int256",
			  "name": "",
			  "type": "int256"
			},
			{
			  "internalType": "int256",
			  "name": "",
			  "type": "int256"
			},
			{
			  "internalType": "string",
			  "name": "",
			  "type": "string"
			},
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "getLargestID",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "id",
			  "type": "uint256"
			}
		  ],
		  "name": "getState",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "id",
			  "type": "uint256"
			}
		  ],
		  "name": "getTimeoutRefund",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "largestID",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "name": "ledger",
		  "outputs": [
			{
			  "internalType": "address",
			  "name": "better1",
			  "type": "address"
			},
			{
			  "internalType": "address",
			  "name": "better2",
			  "type": "address"
			},
			{
			  "internalType": "address",
			  "name": "judge",
			  "type": "address"
			},
			{
			  "internalType": "int256",
			  "name": "better1amount",
			  "type": "int256"
			},
			{
			  "internalType": "int256",
			  "name": "better2amount",
			  "type": "int256"
			},
			{
			  "internalType": "string",
			  "name": "description",
			  "type": "string"
			},
			{
			  "internalType": "uint256",
			  "name": "state",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "time",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "better2",
			  "type": "address"
			},
			{
			  "internalType": "address",
			  "name": "judge",
			  "type": "address"
			},
			{
			  "internalType": "int256",
			  "name": "better1amount",
			  "type": "int256"
			},
			{
			  "internalType": "int256",
			  "name": "better2amount",
			  "type": "int256"
			},
			{
			  "internalType": "string",
			  "name": "description",
			  "type": "string"
			},
			{
			  "internalType": "uint256",
			  "name": "time",
			  "type": "uint256"
			}
		  ],
		  "name": "makeBet",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "int256",
			  "name": "_amount",
			  "type": "int256"
			}
		  ],
		  "name": "mint",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		}
	  ], signer);
	 // addresses are the second and third address always created on the local network. Time is set to never run out
	 await contract.makeBet('0x70997970c51812dc3a010c7d01b50e0d17dc79c8', '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc', 5, 10, "This is a description", 2**40 - 1);
	 // agreeOnBet(), declineBet(), and adjudicate() should all work similarly
	 
	 // Cheat to get bet ID without listening
	 let betID = await contract.getLargestID()-1;
	 console.log("The id of this bet is " + betID);
	 
	 let balance = await contract.getBalance();
	 console.log("The balance of this user is " + balance);
	 
	 // You also have getBet()
	 console.log(await contract.getBet(betID));

	 for (const address of require('./addresses')) {
		 // From Pub(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266) send 0.1 ETH to `address`
	 }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
