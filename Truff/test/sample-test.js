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
  it("Should make a bet with adjudication true", async function () {
	const [b1, b2, a] = await ethers.getSigners();
	 
    const Bet = await ethers.getContractFactory("BetTest");
    const bet = await Bet.deploy(b2.address, a.address, 100);
    await bet.deployed();

	expect(await bet.states()).to.equal(1);
	await bet.connect(b2).agreeToBet();
	expect(await bet.states()).to.equal(2);
	
	
	await bet.connect(a).adjudicate(1);
	expect(await bet.states()).to.equal(3);
	
  });
});

describe("BetTest", function () {
  it("Should make a bet with adjudication false", async function () {
	const [b1, b2, a] = await ethers.getSigners();
	 
    const Bet = await ethers.getContractFactory("BetTest");
    const bet = await Bet.deploy(b2.address, a.address, 100);
    await bet.deployed();

	expect(await bet.states()).to.equal(1);
	await bet.connect(b2).agreeToBet();
	expect(await bet.states()).to.equal(2);
	
	
	await bet.connect(a).adjudicate(0);
	expect(await bet.states()).to.equal(3);
	
  });
});

describe("BetTest", function () {
  it("Should throw an error due to better2 being unknown", async function () {
	const [b1, b2, a, theif] = await ethers.getSigners();
	 
    const Bet = await ethers.getContractFactory("BetTest");
    const bet = await Bet.deploy(b2.address, a.address, 100);
    await bet.deployed();

	expect(await bet.states()).to.equal(1);
	await bet.connect(theif).agreeToBet();
	expect(await bet.states()).to.equal(2);
	
  });
});

describe("BetTest", function () {
  it("Should throw an error due to auditor being unknown", async function () {
	const [b1, b2, a, theif] = await ethers.getSigners();
	 
    const Bet = await ethers.getContractFactory("BetTest");
    const bet = await Bet.deploy(b2.address, a.address, 100);
    await bet.deployed();

	expect(await bet.states()).to.equal(1);
	await bet.connect(b2).agreeToBet();
	expect(await bet.states()).to.equal(2);
	
	
	await bet.connect(theif).adjudicate(0);
	expect(await bet.states()).to.equal(3);
	
  });
});