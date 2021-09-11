const { expect } = require("chai");
const { ethers } = require("hardhat");

/*describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});*/

describe("BetTest", function () {
	it("Should make money when minted and show it in all accounts", async function () {
		const [bank, person] = await ethers.getSigners();
		const baseline = 50;
		 
		const Bet = await ethers.getContractFactory("BetTest");
		const bet = await Bet.deploy();
		await bet.deployed();

		await bet.mint(baseline);
	expect(await bet.connect(person).getBalance()).to.equal(baseline);
	});
	
  it("Should make a bet with adjudication for better 1, transferring funds", async function () {
	const [bank, better1, better2, judge] = await ethers.getSigners();
	 
	const id = 0;
	const baseline = 50;
	const amount = 50;
	 
    const Bet = await ethers.getContractFactory("BetTest");
    const bet = await Bet.deploy();
    await bet.deployed();

	await bet.mint(baseline);

	await bet.connect(better1).makeBet(better2.address, judge.address, amount);
	expect(await bet.getState(id)).to.equal(1);
	
	await bet.connect(better2).agreeToBet(id);
	expect(await bet.getState(id)).to.equal(2);
	
	expect(await bet.connect(better1).getBalance()).to.equal(baseline - amount);
	expect(await bet.connect(better2).getBalance()).to.equal(baseline - amount);
	
	await bet.connect(judge).adjudicate(id, 1);
	expect(await bet.getState(id)).to.equal(3);
	expect(await bet.connect(better1).getBalance()).to.equal(baseline + amount);
	expect(await bet.connect(better2).getBalance()).to.equal(baseline - amount);
	
  });
	
  it("Should make a bet with adjudication for better 2, transferring funds", async function () {
	const [bank, better1, better2, judge] = await ethers.getSigners();
	 
	const id = 0;
	const baseline = 50;
	const amount = 50;
	 
    const Bet = await ethers.getContractFactory("BetTest");
    const bet = await Bet.deploy();
    await bet.deployed();

	await bet.mint(baseline);

	await bet.connect(better1).makeBet(better2.address, judge.address, amount);
	expect(await bet.getState(id)).to.equal(1);
	
	await bet.connect(better2).agreeToBet(id);
	expect(await bet.getState(id)).to.equal(2);
	
	expect(await bet.connect(better1).getBalance()).to.equal(baseline - amount);
	expect(await bet.connect(better2).getBalance()).to.equal(baseline - amount);
	
	await bet.connect(judge).adjudicate(id, 2);
	expect(await bet.getState(id)).to.equal(3);
	expect(await bet.connect(better1).getBalance()).to.equal(baseline - amount);
	expect(await bet.connect(better2).getBalance()).to.equal(baseline + amount);
	
  });
	
  it("Should make a bet with undecided adjudication, giving funds back", async function () {
	const [bank, better1, better2, judge] = await ethers.getSigners();
	 
	const id = 0;
	const baseline = 50;
	const amount = 50;
	 
    const Bet = await ethers.getContractFactory("BetTest");
    const bet = await Bet.deploy();
    await bet.deployed();

	await bet.mint(baseline);

	await bet.connect(better1).makeBet(better2.address, judge.address, amount);
	expect(await bet.getState(id)).to.equal(1);
	
	await bet.connect(better2).agreeToBet(id);
	expect(await bet.getState(id)).to.equal(2);
	
	expect(await bet.connect(better1).getBalance()).to.equal(baseline - amount);
	expect(await bet.connect(better2).getBalance()).to.equal(baseline - amount);
	
	await bet.connect(judge).adjudicate(id, 0);
	expect(await bet.getState(id)).to.equal(3);
	expect(await bet.connect(better1).getBalance()).to.equal(baseline);
	expect(await bet.connect(better2).getBalance()).to.equal(baseline);
	
  });
	
  it("Should not allow a thief to accept someone else's bet", async function () {
	const [bank, better1, better2, judge, thief] = await ethers.getSigners();
	 
	const id = 0;
	const baseline = 50;
	const amount = 50;
	 
    const Bet = await ethers.getContractFactory("BetTest");
    const bet = await Bet.deploy();
    await bet.deployed();

	await bet.mint(baseline);

	await bet.connect(better1).makeBet(better2.address, judge.address, amount);
	expect(await bet.getState(id)).to.equal(1);
	error = false;
	try{
		await bet.connect(thief).agreeToBet(id);
	}catch(e){
		error = true;
		expect(e.toString().includes("Only the recipient can accept the bet!")).to.equal(true);
	}
	expect(error).to.equal(true);
  });
	
  it("Should not allow a thief to adjudicate someone else's bet", async function () {
	const [bank, better1, better2, judge, thief] = await ethers.getSigners();
	 
	const id = 0;
	const baseline = 50;
	const amount = 50;
	 
    const Bet = await ethers.getContractFactory("BetTest");
    const bet = await Bet.deploy();
    await bet.deployed();

	await bet.mint(baseline);

	await bet.connect(better1).makeBet(better2.address, judge.address, amount);
	expect(await bet.getState(id)).to.equal(1);
	
	await bet.connect(better2).agreeToBet(id);
	expect(await bet.getState(id)).to.equal(2);
	
	expect(await bet.connect(better1).getBalance()).to.equal(baseline - amount);
	expect(await bet.connect(better2).getBalance()).to.equal(baseline - amount);
	
	error = false;
	try{
		await bet.connect(thief).adjudicate(id, 0);
	}catch(e){
		error = true;
		expect(e.toString().includes("Only the judge can adjudicate the bet!")).to.equal(true);
	}
	expect(error).to.equal(true);
  });
});