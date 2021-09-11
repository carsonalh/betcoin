const { expect } = require("chai");
const { ethers } = require("hardhat");
 
const MAX_TIME = 2**40 - 1;
 
describe("Bookie", function () {
    it("Should take money when minted and show it in all accounts", async function () {
        const [bank, person] = await ethers.getSigners();
        const baseline = 50;

        const Bookie = await ethers.getContractFactory("Bookie");
        const bet = await Bookie.deploy();
        await bet.deployed();

        await bet.mint(baseline);
        expect(await bet.connect(person).getBalance()).to.equal(baseline);
    });

    it("Should not take a bet of no wager", async function () {
        const [bank, better1, better2, judge] = await ethers.getSigners();

        const id = 0;
        const baseline = 50;
        const amount1 = 0;
        const amount2 = 0;

        const Bookie = await ethers.getContractFactory("Bookie");
        const bet = await Bookie.deploy();
        await bet.deployed();

        await bet.mint(baseline);

        error = false;
        try {
			await bet.connect(better1).makeBet(better2.address, judge.address, 0, 0, "Desc", MAX_TIME);
        } catch (e) {
            error = true;
            expect(e.toString().includes("A positive amount is needed to bet!")).to.equal(true);
        }
        expect(error).to.equal(true);

    });

    it("Should take a bet with adjudication for better 1, transferring funds", async function () {
        const [bank, better1, better2, judge] = await ethers.getSigners();

        const id = 0;
        const baseline = 50;
        const amount1 = 50;
        const amount2 = 5;

        const Bookie = await ethers.getContractFactory("Bookie");
        const bet = await Bookie.deploy();
        await bet.deployed();

        await bet.mint(baseline);

        await bet.connect(better1).makeBet(better2.address, judge.address, amount1, amount2, "Desc", MAX_TIME);
        expect(await bet.getState(id)).to.equal(1);

        await bet.connect(better2).agreeToBet(id);
        expect(await bet.getState(id)).to.equal(2);

        expect(await bet.connect(better1).getBalance()).to.equal(baseline - amount1);
        expect(await bet.connect(better2).getBalance()).to.equal(baseline - amount2);

        await bet.connect(judge).adjudicate(id, 1);
        expect(await bet.getState(id)).to.equal(3);
        expect(await bet.connect(better1).getBalance()).to.equal(baseline + amount2);
        expect(await bet.connect(better2).getBalance()).to.equal(baseline - amount2);

    });

    it("Should take a bet with adjudication for better 2, transferring funds", async function () {
        const [bank, better1, better2, judge] = await ethers.getSigners();

        const id = 0;
        const baseline = 50;
        const amount1 = 50;
        const amount2 = 5;

        const Bookie = await ethers.getContractFactory("Bookie");
        const bet = await Bookie.deploy();
        await bet.deployed();

        await bet.mint(baseline);

        await bet.connect(better1).makeBet(better2.address, judge.address, amount1, amount2, "Desc", MAX_TIME);
        expect(await bet.getState(id)).to.equal(1);

        //expect(await bet.connect(better2).agreeToBet(id)).to.emit("BetAgreedTo").withArgs(2, judge);
		await bet.connect(better2).agreeToBet(id);
        expect(await bet.getState(id)).to.equal(2);

        expect(await bet.connect(better1).getBalance()).to.equal(baseline - amount1);
        expect(await bet.connect(better2).getBalance()).to.equal(baseline - amount2);

        await bet.connect(judge).adjudicate(id, 2);
        expect(await bet.getState(id)).to.equal(3);
        expect(await bet.connect(better1).getBalance()).to.equal(baseline - amount1);
        expect(await bet.connect(better2).getBalance()).to.equal(baseline + amount1);
		
		

    });

    it("Should take a bet with undecided adjudication, giving funds back", async function () {
        const [bank, better1, better2, judge] = await ethers.getSigners();

        const id = 0;
        const baseline = 50;
        const amount1 = 50;
        const amount2 = 5;

        const Bookie = await ethers.getContractFactory("Bookie");
        const bet = await Bookie.deploy();
        await bet.deployed();

        await bet.mint(baseline);

        await bet.connect(better1).makeBet(better2.address, judge.address, amount1, amount2, "Desc", MAX_TIME);
        expect(await bet.getState(id)).to.equal(1);

        await bet.connect(better2).agreeToBet(id);
        expect(await bet.getState(id)).to.equal(2);

        expect(await bet.connect(better1).getBalance()).to.equal(baseline - amount1);
        expect(await bet.connect(better2).getBalance()).to.equal(baseline - amount2);

        await bet.connect(judge).adjudicate(id, 0);
        expect(await bet.getState(id)).to.equal(3);
        expect(await bet.connect(better1).getBalance()).to.equal(baseline);
        expect(await bet.connect(better2).getBalance()).to.equal(baseline);

    });

    it("Should take multiple bets and not fail", async function () {
        const [bank, better1, better2, judge] = await ethers.getSigners();
		
		const id1 = 0;
		const id2 = 1;
		const id3 = 2;
        const baseline = 50;
        const amount1 = 5;
        const amount2 = 7;

        const Bookie = await ethers.getContractFactory("Bookie");
        const bet = await Bookie.deploy();
        await bet.deployed();

        await bet.mint(baseline);

        await bet.connect(better1).makeBet(better2.address, judge.address, amount1, amount2, "Desc", MAX_TIME);
        expect(await bet.getState(id1)).to.equal(1);

        await bet.connect(better1).makeBet(better2.address, judge.address, amount1, amount2, "Desc", MAX_TIME);
        expect(await bet.getState(id2)).to.equal(1);

        await bet.connect(better2).agreeToBet(id1);
        expect(await bet.getState(id1)).to.equal(2);
        expect(await bet.connect(better1).getBalance()).to.equal(baseline - amount1);
        expect(await bet.connect(better2).getBalance()).to.equal(baseline - amount2);
		
        await bet.connect(better1).makeBet(better2.address, judge.address, amount1, amount2, "Desc", MAX_TIME);
        expect(await bet.getState(id3)).to.equal(1);

        await bet.connect(better2).agreeToBet(id2);
        expect(await bet.getState(id2)).to.equal(2);
        expect(await bet.connect(better1).getBalance()).to.equal(baseline - 2*amount1);
        expect(await bet.connect(better2).getBalance()).to.equal(baseline - 2*amount2);

        await bet.connect(judge).adjudicate(id1, 1);
        expect(await bet.getState(id1)).to.equal(3);
        expect(await bet.connect(better1).getBalance()).to.equal(baseline - amount1 + amount2);
        expect(await bet.connect(better2).getBalance()).to.equal(baseline - 2*amount2);

        await bet.connect(better2).agreeToBet(id3);
        expect(await bet.getState(id3)).to.equal(2);
        expect(await bet.connect(better1).getBalance()).to.equal(baseline - 2*amount1 + amount2);
        expect(await bet.connect(better2).getBalance()).to.equal(baseline - 3*amount2);

        await bet.connect(judge).adjudicate(id2, 3);
        expect(await bet.getState(id2)).to.equal(3);
        expect(await bet.connect(better1).getBalance()).to.equal(baseline - amount1 + amount2);
        expect(await bet.connect(better2).getBalance()).to.equal(baseline - 2*amount2);

        await bet.connect(judge).adjudicate(id3, 2);
        expect(await bet.getState(id3)).to.equal(3);
        expect(await bet.connect(better1).getBalance()).to.equal(baseline - amount1 + amount2);
        expect(await bet.connect(better2).getBalance()).to.equal(baseline + amount1 - amount2);

    });

    it("Should not allow a refund early", async function () {
        const [bank, better1, better2, judge] = await ethers.getSigners();

        const id = 0;
        const baseline = 50;
        const amount = 50;

        const Bookie = await ethers.getContractFactory("Bookie");
        const bet = await Bookie.deploy();
        await bet.deployed();

        await bet.mint(baseline);

        await bet.connect(better1).makeBet(better2.address, judge.address, amount, amount, "Desc", MAX_TIME);
        expect(await bet.getState(id)).to.equal(1);
        error = false;
        try {
            await bet.connect(better2).getTimeoutRefund(id);
        } catch (e) {
            error = true;
            expect(e.toString().includes("It is too early to refund!")).to.equal(true);
        }
        expect(error).to.equal(true);
    });

    it("Should not allow a thief to accept someone else's bet", async function () {
        const [bank, better1, better2, judge, thief] = await ethers.getSigners();

        const id = 0;
        const baseline = 50;
        const amount = 50;

        const Bookie = await ethers.getContractFactory("Bookie");
        const bet = await Bookie.deploy();
        await bet.deployed();

        await bet.mint(baseline);

        await bet.connect(better1).makeBet(better2.address, judge.address, amount, amount, "Desc", MAX_TIME);
        expect(await bet.getState(id)).to.equal(1);
        error = false;
        try {
            await bet.connect(thief).agreeToBet(id);
        } catch (e) {
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

        const Bookie = await ethers.getContractFactory("Bookie");
        const bet = await Bookie.deploy();
        await bet.deployed();

        await bet.mint(baseline);

        await bet.connect(better1).makeBet(better2.address, judge.address, amount, amount, "Desc", MAX_TIME);
        expect(await bet.getState(id)).to.equal(1);

        await bet.connect(better2).agreeToBet(id);
        expect(await bet.getState(id)).to.equal(2);

        expect(await bet.connect(better1).getBalance()).to.equal(baseline - amount);
        expect(await bet.connect(better2).getBalance()).to.equal(baseline - amount);

        error = false;
        try {
            await bet.connect(thief).adjudicate(id, 0);
        } catch (e) {
            error = true;
            expect(e.toString().includes("Only the judge can adjudicate the bet!")).to.equal(true);
        }
        expect(error).to.equal(true);
    });

    it("Should not allow adjudication before the bet proposal is accepted", async function () {
        const [bank, better1, better2, judge] = await ethers.getSigners();

        const id = 0;
        const baseline = 50;
        const amount = 50;

        const Bookie = await ethers.getContractFactory("Bookie");
        const bet = await Bookie.deploy();
        await bet.deployed();

        await bet.mint(baseline);

        await bet.connect(better1).makeBet(better2.address, judge.address, amount, amount, "Desc", MAX_TIME);
        expect(await bet.getState(id)).to.equal(1);

        error = false;
        try {
            await bet.connect(judge).adjudicate(id, 0);
        } catch (e) {
            error = true;
            expect(e.toString().includes("This bet is not in a adjudicating state!")).to.equal(true);
        }
        expect(error).to.equal(true);
    });

    it("Should not allow adjudication of non-existent bets", async function () {
        const [bank, better1, better2, judge] = await ethers.getSigners();

        const id = 0;
        const baseline = 50;
        const amount = 50;

        const Bookie = await ethers.getContractFactory("Bookie");
        const bet = await Bookie.deploy();
        await bet.deployed();

        error = false;
        try {
            await bet.connect(judge).adjudicate(100, 0);
        } catch (e) {
            error = true;
            expect(e.toString().includes("This bet is not in a adjudicating state!")).to.equal(true);
        }
        expect(error).to.equal(true);
    });

    it("Should not allow agreement of non-existent bets", async function () {
        const [bank, better1, better2, judge] = await ethers.getSigners();

        const id = 0;
        const baseline = 50;
        const amount = 50;

        const Bookie = await ethers.getContractFactory("Bookie");
        const bet = await Bookie.deploy();
        await bet.deployed();

        error = false;
        try {
            await bet.connect(better2).agreeToBet(100);
        } catch (e) {
            error = true;
            expect(e.toString().includes("This bet is not in an accepting state!")).to.equal(true);
        }
        expect(error).to.equal(true);
    });
});
