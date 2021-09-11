const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Bet", function () {
    it("Should make money when minted and show it in all accounts", async function () {
        const [bank, person] = await ethers.getSigners();
        const baseline = 50;

        const Bet = await ethers.getContractFactory("Bet");
        const bet = await Bet.deploy();
        await bet.deployed();

        await bet.mint(baseline);
        expect(await bet.connect(person).getBalance()).to.equal(baseline);
    });

    it("Should make a bet with adjudication for better 1, transferring funds", async function () {
        const [bank, better1, better2, judge] = await ethers.getSigners();

        const id = 0;
        const baseline = 50;
        const amount1 = 50;
        const amount2 = 5;

        const Bet = await ethers.getContractFactory("Bet");
        const bet = await Bet.deploy();
        await bet.deployed();

        await bet.mint(baseline);

        await bet.connect(better1).makeBet(better2.address, judge.address, amount1, amount2, "Desc");
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

    it("Should make a bet with adjudication for better 2, transferring funds", async function () {
        const [bank, better1, better2, judge] = await ethers.getSigners();

        const id = 0;
        const baseline = 50;
        const amount1 = 50;
        const amount2 = 5;

        const Bet = await ethers.getContractFactory("Bet");
        const bet = await Bet.deploy();
        await bet.deployed();

        await bet.mint(baseline);

        await bet.connect(better1).makeBet(better2.address, judge.address, amount1, amount2, "Desc");
        expect(await bet.getState(id)).to.equal(1);

        await bet.connect(better2).agreeToBet(id);
        expect(await bet.getState(id)).to.equal(2);

        expect(await bet.connect(better1).getBalance()).to.equal(baseline - amount1);
        expect(await bet.connect(better2).getBalance()).to.equal(baseline - amount2);

        await bet.connect(judge).adjudicate(id, 2);
        expect(await bet.getState(id)).to.equal(3);
        expect(await bet.connect(better1).getBalance()).to.equal(baseline - amount1);
        expect(await bet.connect(better2).getBalance()).to.equal(baseline + amount1);

    });

    it("Should make a bet with undecided adjudication, giving funds back", async function () {
        const [bank, better1, better2, judge] = await ethers.getSigners();

        const id = 0;
        const baseline = 50;
        const amount1 = 50;
        const amount2 = 5;

        const Bet = await ethers.getContractFactory("Bet");
        const bet = await Bet.deploy();
        await bet.deployed();

        await bet.mint(baseline);

        await bet.connect(better1).makeBet(better2.address, judge.address, amount1, amount2, "Desc");
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

    it("Should not allow a thief to accept someone else's bet", async function () {
        const [bank, better1, better2, judge, thief] = await ethers.getSigners();

        const id = 0;
        const baseline = 50;
        const amount = 50;

        const Bet = await ethers.getContractFactory("Bet");
        const bet = await Bet.deploy();
        await bet.deployed();

        await bet.mint(baseline);

        await bet.connect(better1).makeBet(better2.address, judge.address, amount, amount, "Desc");
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

        const Bet = await ethers.getContractFactory("Bet");
        const bet = await Bet.deploy();
        await bet.deployed();

        await bet.mint(baseline);

        await bet.connect(better1).makeBet(better2.address, judge.address, amount, amount, "Desc");
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

        const Bet = await ethers.getContractFactory("Bet");
        const bet = await Bet.deploy();
        await bet.deployed();

        await bet.mint(baseline);

        await bet.connect(better1).makeBet(better2.address, judge.address, amount, amount, "Desc");
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

        const Bet = await ethers.getContractFactory("Bet");
        const bet = await Bet.deploy();
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

        const Bet = await ethers.getContractFactory("Bet");
        const bet = await Bet.deploy();
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
