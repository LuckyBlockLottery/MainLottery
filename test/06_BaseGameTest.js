const RNGContract = artifacts.require("./RNG.sol");
const TestBaseGameContract = artifacts.require("./TestBaseGame.sol");
const TestHourlyGameContract = artifacts.require("./TestHourlyGame.sol");
const ManagementContract = artifacts.require("./Management.sol");

const BigNumber = require('bignumber.js');

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();

function findEvent(logs, eventName) {
    let result = null;
    for (let log of logs) {
        if (log.event === eventName) {
            result = log;
            break;
        }
    }
    return result;
};

contract('BaseGame tests', async (accounts) => {

    let RNG;
    let BaseGame;
    let HourlyGame;
    let oraclizeAddress = accounts[9];
    let Management;

    beforeEach(async function () {
        RNG = await RNGContract.deployed();
        BaseGame = await TestBaseGameContract.deployed();
        HourlyGame = await TestHourlyGameContract.deployed();
        Management = await ManagementContract.deployed();
        await RNG.addAddressToWhitelist(BaseGame.address);
    });

    it('setRNG function', async function () {
        await BaseGame.setContracts(accounts[3], HourlyGame.address, Management.address);
        let rngInBaseGame = await BaseGame.rng.call();

        assert.equal(rngInBaseGame, accounts[3]);

        await BaseGame.setContracts(RNG.address, HourlyGame.address, Management.address);
    });

    it('onlyRNG modifier', async function() {
        let round = 1;
        let randomNumber = 0;
        let err;
        let value = new BigNumber(web3.utils.toWei("1", "ether"));
        try {
            await BaseGame.processRound(round, randomNumber, {value: value});
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

    });

    it('onlyHourlyGame modifier', async function() {
        let err;
        let _participant = accounts[1];
        let value = new BigNumber(web3.utils.toWei("1", "ether"));
        try {
            await BaseGame.buyTickets(_participant, {value: value});
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('setTicketPrice function', async function() {
       await BaseGame.setContracts(RNG.address, accounts[0], Management.address);
        let err;
        try {
            await BaseGame.setTicketPrice(0);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('buyTickets function', async function() {


        let fundsToRNG = new BigNumber(web3.utils.toWei("1", "ether"));

        await RNG.send(fundsToRNG);

        let err;
        try {
            await BaseGame.buyTickets(accounts[0], {value: 0});
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        let baseGameRoundBefore = await BaseGame.currentRound.call();
        let period = 60;

        let ticketPrice = 10;
        let fundsToBaseGame = 1000;
        await BaseGame.setPeriod(period);
        await BaseGame.setContracts(RNG.address, accounts[0], Management.address);
        await BaseGame.setTicketPrice(ticketPrice);

        await BaseGame.buyTickets(accounts[0], {value: fundsToBaseGame});
        let baseGameRound = await BaseGame.currentRound.call();
        assert.equal(baseGameRound.toString(), baseGameRoundBefore.toString(), 'round is not correct');

        await BaseGame.setParticipantsCount(baseGameRoundBefore, new BigNumber(9));

        await BaseGame.buyTickets(accounts[1], {value: fundsToBaseGame});
        await BaseGame.buyTickets(accounts[2], {value: fundsToBaseGame});
        baseGameRound = await BaseGame.currentRound.call();

        assert.equal(baseGameRound.toString(), baseGameRoundBefore.toString(), 'round is not correct');
    });

    it('setOrganiserAddress function', async function() {
        let addr = 0x0;
        let err;
        try {
            await BaseGame.setOrganiser(addr);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        await BaseGame.setContracts(RNG.address, HourlyGame.address, Management.address);
    });

    it('refund function', async function() {
        let baseGameBalanceBefore = web3.eth.getBalance(BaseGame.address);

        await BaseGame.refund(1, {from: accounts[1]});

        let baseGameBalance = web3.eth.getBalance(BaseGame.address);

        assert.equal(baseGameBalanceBefore.toString(), baseGameBalance.toString(), 'balance is not correct');

        await BaseGame.setOraclizeTimeout(0);

        await BaseGame.refund(1, {from: accounts[1]});

        let participantFunds = await BaseGame.getParticipantFunds(1, accounts[1]);
        assert.equal(participantFunds.toString(), '0', 'balance is not correct');

        await BaseGame.setOraclizeTimeout(86400);
    });

    it('setKYCWhitelist function', async function() {
        let addr = 0x0;
        let err;
        try {
            await BaseGame.setKYCWhitelist(addr);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('getGain function', async function() {
        let from = 1;
        let to = 0;
        let err;
        try {
            await BaseGame.getGain(from, to);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        from = 0;
        to = 1;
        try {
            await BaseGame.getGain(from, to);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('check update and callback', async function() {
        await RNG.addAddressToWhitelist(BaseGame.address);
        await RNG.setMyOraclize(oraclizeAddress);
        await BaseGame.setContracts(RNG.address, accounts[0], Management.address);

        let testId = '0x1';
        let valueToOraclize = new BigNumber(web3.utils.toWei("0.05", "ether"));

        await RNG.setTestId(testId);

        let timeout = 100;
        await BaseGame.startGame(timeout, {value: valueToOraclize});

        let ids = await RNG.getRequestsArray();
        let id = ids[ids.length - 1];

        let result = 'result';
        let verify = new BigNumber(1);
        let proof = '0x01';
        await RNG.setVerify(verify.valueOf());

        await BaseGame.setOraclizeTimeout(10);

        let currentRound = await BaseGame.currentRound.call();

        await BaseGame.setParticipantsCount(currentRound, 5);

        await RNG.__callback(id, result, proof, {from: oraclizeAddress});

        await BaseGame.setContracts(accounts[0], accounts[0], Management.address);

        await BaseGame.processRound(currentRound, 0);

        await BaseGame.setContracts(RNG.address, accounts[0], Management.address);

    });

    it('buyBonusTickets function test', async () => {
        let account = accounts[9];
        let tickets = 10;
        await BaseGame.setPeriod(0);
        await BaseGame.setRoundParticipants(1, 10);
        await BaseGame.setStartRoundTime(1, 0);
        let res = await BaseGame.buyBonusTickets(account, tickets);
        let event = await findEvent(res.logs, 'ParticipantAdded');
        assert.equal(event.args.ticketsCount, tickets, 'tickets count is not correct');
    });

    it('checkRoundState function test', async () => {


        await BaseGame.setStartRoundTime(1, 0);
        let res = await BaseGame.checkRoundState(1);

        assert.equal(res.logs[0].args.state.toString(), '4', 'state is not correct');
    });

    it('processRound function when refund test', async () => {
        await BaseGame.setContracts(accounts[0], accounts[0], accounts[0]);

        let res = await BaseGame.processRound(1, 0);

        assert.equal(res.logs.length, 0, 'proccess round is failed');
    });

    it('refund function test', async () => {
        let account = accounts[0];
        let funds = await BaseGame.getParticipantFunds(0, account);
        await BaseGame.setStartRoundTime(0, 0);
        await BaseGame.setRoundState(0, 4);
        let balanceBefore = new BigNumber(await web3.eth.getBalance(BaseGame.address));
        let res = await BaseGame.refund(0);
        let event = await findEvent(res.logs, 'RefundIsSuccess');
        let balanceAfter = new BigNumber(await web3.eth.getBalance(BaseGame.address));
        assert.equal(balanceBefore.minus(balanceAfter).toString(), funds.toString(), 'balance is not correct');
        assert.equal(event.args.funds.toString(), funds.toString(), 'funds is not correct');
        assert.equal(event.args.participant, account, 'address is not correct');


    });


    it('getTicketPrice function test', async () => {
        let price = await BaseGame.ticketPrice.call();

        let res = await BaseGame.getTicketPrice();

        assert.equal(res.toString(), price.toString(), 'price is not correct');
    });

    it('getRoundStartTime function test', async () => {
        let round = await BaseGame.rounds.call(1);
        let res = await BaseGame.getRoundStartTime(1);

        assert.equal(res.toString(), round.startRoundTime.toString(), 'Time is not correct');
    });

});
