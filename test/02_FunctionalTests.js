const RNGContract = artifacts.require("./RNG.sol");
const TestBaseGameContract = artifacts.require("./TestBaseGame.sol");
const TestHourlyGameContract = artifacts.require("./TestHourlyGame.sol");
const TestDailyGameContract = artifacts.require("./TestDailyGame.sol");
const TestWeeklyGameContract = artifacts.require("./TestWeeklyGame.sol");
const TestMonthlyGameContract = artifacts.require("./TestMonthlyGame.sol");
const TestYearlyGameContract = artifacts.require("./TestYearlyGame.sol");
const TestJackPotContract = artifacts.require("./TestJackPot.sol");
const TestSuperJackPotContract = artifacts.require("./TestSuperJackPot.sol");
const JackPotCheckerContract = artifacts.require("./JackPotChecker.sol");
const KYCWhitelistContract = artifacts.require("./KYCWhitelist.sol");
const ManagementContract = artifacts.require("./Management.sol");

const BigNumber = require('bignumber.js');

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('Functional tests', async (accounts) => {

    let RNG;
    let BaseGame;
    let HourlyGame;
    let DailyGame;
    let WeeklyGame;
    let MonthlyGame;
    let YearlyGame;
    let JackPot;
    let SuperJackPot;
    let JackPotChecker;
    let KYCWhitelist;
    let Management;

    let oraclizeAddress = accounts[9];
    let lotteryOrganiser = accounts[8];

    let BasePeriod = 121;
    let HourlyPeriod = 61;
    let DailyPeriod = 121;
    let WeeklyPeriod = 181;
    let MonthlyPeriod = 240;
    let YearlyPeriod = 300;
    let JackPotPeriod = 61;
    let SuperJackPotPeriod = 61;

    beforeEach(async function () {
        RNG = await RNGContract.deployed();
        BaseGame = await TestBaseGameContract.deployed();
        HourlyGame = await TestHourlyGameContract.deployed();
        DailyGame = await TestDailyGameContract.deployed();
        WeeklyGame = await TestWeeklyGameContract.deployed();
        MonthlyGame = await TestMonthlyGameContract.deployed();
        YearlyGame = await TestYearlyGameContract.deployed();
        JackPot = await TestJackPotContract.deployed();
        SuperJackPot = await TestSuperJackPotContract.deployed();
        JackPotChecker = await JackPotCheckerContract.deployed();
        KYCWhitelist = await KYCWhitelistContract.deployed();
        Management = await ManagementContract.deployed();
    });

    it('set initial state', async function() {
        await RNG.addAddressToWhitelist(BaseGame.address);
        await RNG.addAddressesToWhitelist([HourlyGame.address]);
        await RNG.addAddressToWhitelist(DailyGame.address);
        await RNG.addAddressToWhitelist(WeeklyGame.address);
        await RNG.addAddressToWhitelist(MonthlyGame.address);
        await RNG.addAddressToWhitelist(YearlyGame.address);
        await RNG.addAddressToWhitelist(SuperJackPot.address);
        await RNG.addAddressToWhitelist(JackPot.address);

        await RNG.setMyOraclize(oraclizeAddress);

        await JackPotChecker.setContracts(JackPot.address, SuperJackPot.address);

        await HourlyGame.setContracts(RNG.address, HourlyGame.address, Management.address);
        await DailyGame.setContracts(RNG.address, HourlyGame.address, Management.address);
        await WeeklyGame.setContracts(RNG.address, HourlyGame.address, Management.address);
        await MonthlyGame.setContracts(RNG.address, HourlyGame.address, Management.address);
        await YearlyGame.setContracts(RNG.address, HourlyGame.address, Management.address);
        await JackPot.setContracts(RNG.address, HourlyGame.address, Management.address);
        await SuperJackPot.setContracts(RNG.address, HourlyGame.address, Management.address);

        await HourlyGame.setOrganiser(lotteryOrganiser);
        await HourlyGame.setChecker(JackPotChecker.address);

        await JackPotChecker.setPrice(10000);

    });

    it('check initial state', async function() {
        let BasePeriodFromContract = await BaseGame.getPeriod();
        let HourlyPeriodFromContract = await HourlyGame.getPeriod();
        let DailyPeriodFromContract = await DailyGame.getPeriod();
        let WeeklyPeriodFromContract = await WeeklyGame.getPeriod();
        let MonthlyPeriodFromContract = await MonthlyGame.getPeriod();
        let YearlyPeriodFromContract = await YearlyGame.getPeriod();
        let JackPotPeriodFromContract = await JackPot.getPeriod();
        let SuperJackPotPeriodFromContract = await SuperJackPot.getPeriod();

        assert.equal(BasePeriod, BasePeriodFromContract, "Base period is not correct");
        assert.equal(HourlyPeriod, HourlyPeriodFromContract, "Hourly period is not correct");
        assert.equal(DailyPeriod, DailyPeriodFromContract, "Daily period is not correct");
        assert.equal(WeeklyPeriod, WeeklyPeriodFromContract, "Weekly period is not correct");
        assert.equal(MonthlyPeriod, MonthlyPeriodFromContract, "Monthly period is not correct");
        assert.equal(YearlyPeriod, YearlyPeriodFromContract, "Yearly period is not correct");
        assert.equal(JackPotPeriod, JackPotPeriodFromContract, "JackPot period is not correct");
        assert.equal(SuperJackPotPeriod, SuperJackPotPeriodFromContract, "SuperJackPot period is not correct");

        let BaseGameInWhitelist = await RNG.whitelist.call(BaseGame.address);
        let HourlyGameInWhitelist = await RNG.whitelist.call(HourlyGame.address);
        let DailyGameInWhitelist = await RNG.whitelist.call(DailyGame.address);
        let WeeklyGameInWhitelist = await RNG.whitelist.call(WeeklyGame.address);
        let MonthlyGameInWhitelist = await RNG.whitelist.call(MonthlyGame.address);
        let YearlyGameInWhitelist = await RNG.whitelist.call(YearlyGame.address);
        let JackPotGameInWhitelist = await RNG.whitelist.call(JackPot.address);
        let SuperJackPotGameInWhitelist = await RNG.whitelist.call(SuperJackPot.address);

        assert.equal(BaseGameInWhitelist, true, "BaseGame in not added to whitelist");
        assert.equal(HourlyGameInWhitelist, true, "HourlyGame in not added to whitelist");
        assert.equal(DailyGameInWhitelist, true, "DailyGame in not added to whitelist");
        assert.equal(WeeklyGameInWhitelist, true, "WeeklyGame in not added to whitelist");
        assert.equal(MonthlyGameInWhitelist, true, "MonthlyGame in not added to whitelist");
        assert.equal(YearlyGameInWhitelist, true, "YearlyGame in not added to whitelist");
        assert.equal(JackPotGameInWhitelist, true, "JackPotGame in not added to whitelist");
        assert.equal(SuperJackPotGameInWhitelist, true, "SuperJackPotGame in not added to whitelist");

        let RNGInBaseGame = await BaseGame.rng.call();
        let RNGInHourlyGame = await HourlyGame.rng.call();
        let RNGInDailyGame = await DailyGame.rng.call();
        let RNGInWeeklyGame = await WeeklyGame.rng.call();
        let RNGInMonthlyGame = await MonthlyGame.rng.call();
        let RNGInYearlyGame = await YearlyGame.rng.call();
        let RNGInJackPotGame = await JackPot.rng.call();
        let RNGInSuperJackPotGame = await SuperJackPot.rng.call();


        assert.equal(RNGInBaseGame, RNG.address, "RNG address in Base lottery is not correct");
        assert.equal(RNGInHourlyGame, RNG.address, "RNG address in Hourly lottery is not correct");
        assert.equal(RNGInDailyGame, RNG.address, "RNG address in DailyGame is not correct");
        assert.equal(RNGInWeeklyGame, RNG.address, "RNG address in WeeklyGame is not correct");
        assert.equal(RNGInMonthlyGame, RNG.address, "RNG address in MonthlyGame is not correct");
        assert.equal(RNGInYearlyGame, RNG.address, "RNG address in YearlyGame is not correct");
        assert.equal(RNGInJackPotGame, RNG.address, "RNG address in JackPotGame lottery is not correct");
        assert.equal(RNGInSuperJackPotGame, RNG.address, "RNG address in SuperJackPotGame lottery is not correct");

        let organiserAddressInHourlyGame = await HourlyGame.organiser.call();
        assert.equal(organiserAddressInHourlyGame, lotteryOrganiser, 'organiser address is not correct');

        let checkerAddressInHourlyGame = await HourlyGame.checker.call();
        assert.equal(checkerAddressInHourlyGame, JackPotChecker.address, 'JackPotChecker address is not correct');

    });

    it('check update and callback', async function() {
        await BaseGame.setContracts(RNG.address, accounts[0], Management.address);

        let HourlyGameInBaseGame = await BaseGame.hourlyGame.call();

        assert.equal(HourlyGameInBaseGame, accounts[0], "Hourly lottery is not correct");

        let testId = '0x01';
        let round = 1;
        let valueToOraclize = new BigNumber(web3.utils.toWei("0.05", "ether"));
        let OraclizeDemand = new BigNumber(web3.utils.toWei("0.02", "ether"));

        let RNGBalanceBefore = await web3.eth.getBalance(RNG.address);
        assert.equal(RNGBalanceBefore, 0, "Balance isn't 0!");

        await RNG.setTestId(testId);

        let timeout = 0;
        await BaseGame.startGame(timeout, {value: valueToOraclize});

        let ids = await RNG.getRequestsArray();
        let id = ids[ids.length-1];
        let request = await RNG.getRequest(id);

        assert.equal(request[0], BaseGame.address, "request address is not correct");
        assert.equal(request[1], round, "request round is not correct");

        let RNGbalanceAfter = await web3.eth.getBalance(RNG.address);
        assert.equal(RNGbalanceAfter, (RNGBalanceBefore+valueToOraclize-OraclizeDemand), "Balance isn't correct!");

        let result = 'result';
        let verify =  new BigNumber(1);
        let proof = '0x02';
        await RNG.setVerify(verify);

        await RNG.__callback(id, result, proof, {from: oraclizeAddress});

        let err;
        try {
            await RNG.__callback(id, result, proof);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        verify =  new BigNumber(0);
        await RNG.setVerify(verify);
    });


    it('setMinBalance and getRNGMinBalance function from owner >= 1 ether', async function() {
        await HourlyGame.setMinBalance(web3.utils.toWei("1.1", "ether"));
        let _balance = await HourlyGame.serviceMinBalance.call();
        assert.equal(web3.utils.toWei("1.1", "ether"), _balance);

    });

    it('setMinBalance function from owner < 1 ether', async function() {
        let err;
        try {
            await HourlyGame.setMinBalance(web3.utils.toWei("0.1", "ether"));
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('setMinBalance function from not owner', async function() {
        let err;
        try {
            await HourlyGame.setMinBalance(web3.utils.toWei("2", "ether"), {from: accounts[3]});
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('check startGames function', async function(){
        let round = 1;
        let value = new BigNumber(web3.utils.toWei("1", "ether"));
        await Management.startGames({value: value});
        let ids = await RNG.getRequestsArray();

        let id = ids[ids.length-5];
        let request = await RNG.getRequest(id);
        assert.equal(request[0], HourlyGame.address, "request address is not correct");
        assert.equal(request[1], round, "request round is not correct");

        id = ids[ids.length-4];
        request = await RNG.getRequest(id);
        assert.equal(request[0], DailyGame.address, "request address is not correct");
        assert.equal(request[1], round, "request round is not correct");

        id = ids[ids.length-3];
        request = await RNG.getRequest(id);
        assert.equal(request[0], WeeklyGame.address, "request address is not correct");
        assert.equal(request[1], round, "request round is not correct");

        id = ids[ids.length-2];
        request = await RNG.getRequest(id);
        assert.equal(request[0], MonthlyGame.address, "request address is not correct");
        assert.equal(request[1], round, "request round is not correct");

        id = ids[ids.length-1];
        request = await RNG.getRequest(id);
        assert.equal(request[0], YearlyGame.address, "request address is not correct");
        assert.equal(request[1], round, "request round is not correct");
    });

    it('check buyTickets function', async function() {
        let startHourlyGameBalance = await web3.eth.getBalance(HourlyGame.address);
        let startDailyGameBalance = await web3.eth.getBalance(DailyGame.address);
        let startWeeklyGameBalance = await web3.eth.getBalance(WeeklyGame.address);
        let startMonthlyGameBalance = await web3.eth.getBalance(MonthlyGame.address);
        let startYearlyGameBalance = await web3.eth.getBalance(YearlyGame.address);
        let startJackPotBalance = await web3.eth.getBalance(JackPot.address);
        let startSuperJackPotBalance = await web3.eth.getBalance(SuperJackPot.address);
        let fundsToHourlyGame = new BigNumber(web3.utils.toWei("1", "ether"));
        let extra = new BigNumber(web3.utils.toWei("0.003", "ether"));

        let dailyPercent = 10;
        let weeklyPercent = 5;
        let monthlyPercent = 5;
        let yearlyPercent = 5;
        let jackPotPercent = 10;
        let superJackPotPercent = 15;
        let organiserPercent = 20;
        let sumPercent =
            dailyPercent +
            weeklyPercent +
            monthlyPercent +
            yearlyPercent +
            jackPotPercent +
            superJackPotPercent +
            organiserPercent
        ;

        let balanceRNG = await web3.eth.getBalance(RNG.address);
        let balanceChecker = await web3.eth.getBalance(JackPotChecker.address);
        let RNGMinBalance = await HourlyGame.serviceMinBalance.call();
        let checkerMinBalance = await HourlyGame.serviceMinBalance.call();

        let fundsToRNG = RNGMinBalance-(balanceRNG)-(new BigNumber(web3.utils.toWei("0.004", "ether")));
        let fundsToChecker = checkerMinBalance-balanceChecker-(new BigNumber(web3.utils.toWei("0.004", "ether")));

        await RNG.send(fundsToRNG);
        await JackPotChecker.send(fundsToChecker);

        let fundsToHourlyGameWithExtra = new BigNumber(web3.utils.toWei("0.011", "ether"));
        await HourlyGame.sendTransaction({from: accounts[1], value: fundsToHourlyGameWithExtra});

        await RNG.withdraw(accounts[1], (new BigNumber(web3.utils.toWei("0.1", "ether"))));

        balanceRNG = await web3.eth.getBalance(RNG.address);
        fundsToRNG = RNGMinBalance-(balanceRNG)-(new BigNumber(web3.utils.toWei("0.002", "ether")));
        await RNG.send(fundsToRNG);

        fundsToHourlyGameWithExtra = new BigNumber(web3.utils.toWei("0.02", "ether"));
        await HourlyGame.sendTransaction({from: accounts[1], value: fundsToHourlyGameWithExtra});

        fundsToRNG = RNGMinBalance-(balanceRNG);
        fundsToChecker = checkerMinBalance-(balanceChecker);

        if (fundsToRNG > 0) await RNG.send(fundsToRNG);
        if (fundsToChecker > 0) await JackPotChecker.send(fundsToChecker);
        let startOrganiserBalance = await web3.eth.getBalance(lotteryOrganiser);

        fundsToHourlyGameWithExtra = new BigNumber(web3.utils.toWei("1.003", "ether"));
        await HourlyGame.sendTransaction({from: accounts[1], value: fundsToHourlyGameWithExtra});

        let fundsToOrganiser = fundsToHourlyGame*(organiserPercent)/(100);
        let organiserBalance = await web3.eth.getBalance(lotteryOrganiser);
        assert.equal(fundsToOrganiser, organiserBalance-(startOrganiserBalance)-(extra));

        fundsToHourlyGame = new BigNumber(web3.utils.toWei("1.03", "ether"));


        let HourlyGameBalance = await (web3.eth.getBalance(HourlyGame.address))-(startHourlyGameBalance);
        let DailyGameBalance = await (web3.eth.getBalance(DailyGame.address))-(startDailyGameBalance);
        let WeeklyGameBalance = await (web3.eth.getBalance(WeeklyGame.address))-(startWeeklyGameBalance);
        let MonthlyGameBalance = await (web3.eth.getBalance(MonthlyGame.address))-(startMonthlyGameBalance);
        let YearlyGameBalance = await (web3.eth.getBalance(YearlyGame.address))-(startYearlyGameBalance);
        let JackPotBalance = (await web3.eth.getBalance(JackPot.address))-startJackPotBalance;
        let SuperJackPotBalance = (await web3.eth.getBalance(SuperJackPot.address))-startSuperJackPotBalance;

        assert.equal(HourlyGameBalance, fundsToHourlyGame*(100-sumPercent)/(100));
        assert.equal(DailyGameBalance*(100)/(dailyPercent), HourlyGameBalance*(100)/(100-sumPercent));
        assert.equal(WeeklyGameBalance*(100)/(weeklyPercent), HourlyGameBalance*(100)/(100-sumPercent));
        assert.equal(MonthlyGameBalance*(100)/(monthlyPercent), HourlyGameBalance*(100)/(100-sumPercent));
        assert.equal(YearlyGameBalance*(100)/(yearlyPercent), HourlyGameBalance*(100)/(100-sumPercent));
        assert.equal(JackPotBalance*100/jackPotPercent, HourlyGameBalance*(100)/(100-sumPercent));
        assert.equal(SuperJackPotBalance*100/superJackPotPercent, HourlyGameBalance*(100)/(100-sumPercent));

        let round = 1;
        let ticketsOnHourlyGame = await HourlyGame.getTicketsCount(round);
        let ticketsOnDailyGame = await DailyGame.getTicketsCount(round);
        let ticketsOnWeeklyGame = await WeeklyGame.getTicketsCount(round);
        let ticketsOnMonthlyGame = await MonthlyGame.getTicketsCount(round);
        let ticketsOnYearlyGame = await YearlyGame.getTicketsCount(round);
        let ticketsOnJackPot = await JackPot.getTicketsCount(round);
        let ticketsOnSuperJackPot = await SuperJackPot.getTicketsCount(round);

        assert.equal(ticketsOnHourlyGame.toString(), ticketsOnDailyGame.toString());
        assert.equal(ticketsOnHourlyGame.toString(), ticketsOnWeeklyGame.toString());
        assert.equal(ticketsOnHourlyGame.toString(), ticketsOnMonthlyGame.toString());
        assert.equal(ticketsOnHourlyGame.toString(), ticketsOnYearlyGame.toString());
        assert.equal(ticketsOnHourlyGame.toString(), ticketsOnJackPot.toString());
        assert.equal(ticketsOnHourlyGame.toString(), ticketsOnSuperJackPot.toString());
    });

    it('check process lottery', async function() {
        let fundsToHourlyGame = new BigNumber(web3.utils.toWei("1", "ether"));
        let value = new BigNumber(web3.utils.toWei("1", "ether"));
        let round = new BigNumber(1);

        await HourlyGame.sendTransaction({from: accounts[0], value: fundsToHourlyGame/(2)});
        await HourlyGame.sendTransaction({from: accounts[0], value: fundsToHourlyGame/(2)});
        await HourlyGame.sendTransaction({from: accounts[2], value: fundsToHourlyGame});
        await HourlyGame.sendTransaction({from: accounts[3], value: fundsToHourlyGame});
        await HourlyGame.sendTransaction({from: accounts[4], value: fundsToHourlyGame});
        await HourlyGame.sendTransaction({from: accounts[5], value: fundsToHourlyGame});
        await HourlyGame.sendTransaction({from: accounts[6], value: fundsToHourlyGame});
        await HourlyGame.sendTransaction({from: accounts[7], value: fundsToHourlyGame});
        await HourlyGame.sendTransaction({from: accounts[8], value: fundsToHourlyGame});
        await HourlyGame.sendTransaction({from: accounts[9], value: fundsToHourlyGame});

        await HourlyGame.restartGame({value: value});

        let result = 'TestResult1';
        let proof = '0x01';
        let verify = new BigNumber(0);
        let ids = await RNG.getRequestsArray();
        let id = ids[ids.length-1];
        await RNG.__callback(id, result, proof, {from: oraclizeAddress});

        let funds1 = new BigNumber(await HourlyGame.getWinningFunds(round, accounts[0]));
        let funds2 = new BigNumber(await HourlyGame.getWinningFunds(round, accounts[1]));
        let funds3 = new BigNumber(await HourlyGame.getWinningFunds(round, accounts[2]));
        let funds4 = new BigNumber(await HourlyGame.getWinningFunds(round, accounts[3]));
        let funds5 = new BigNumber(await HourlyGame.getWinningFunds(round, accounts[4]));
        let funds6 = new BigNumber(await HourlyGame.getWinningFunds(round, accounts[5]));
        let funds7 = new BigNumber(await HourlyGame.getWinningFunds(round, accounts[6]));
        let funds8 = new BigNumber(await HourlyGame.getWinningFunds(round, accounts[7]));
        let funds9 = new BigNumber(await HourlyGame.getWinningFunds(round, accounts[8]));
        let funds10 = new BigNumber(await HourlyGame.getWinningFunds(round, accounts[9]));
        let funds = new BigNumber(await HourlyGame.getRoundFunds(round));
        let totalFunds = funds1.plus(funds2).plus(funds3).plus(funds4).plus(funds5).plus(funds6).plus(funds7).plus(funds8).plus(funds9).plus(funds10);
        assert.equal(totalFunds.toString(), funds.toString());

        await DailyGame.restartGame({value: value});

        result = 'TestResult2';
        ids = await RNG.getRequestsArray();
        id = ids[ids.length-1];
        await RNG.__callback(id, result, proof, {from: oraclizeAddress});

        funds1 = new BigNumber(await DailyGame.getWinningFunds(1, accounts[0]));
        funds2 = new BigNumber(await DailyGame.getWinningFunds(1, accounts[1]));
        funds3 = new BigNumber(await DailyGame.getWinningFunds(1, accounts[2]));
        funds4 = new BigNumber(await DailyGame.getWinningFunds(1, accounts[3]));
        funds5 = new BigNumber(await DailyGame.getWinningFunds(1, accounts[4]));
        funds6 = new BigNumber(await DailyGame.getWinningFunds(1, accounts[5]));
        funds7 = new BigNumber(await DailyGame.getWinningFunds(1, accounts[6]));
        funds8 = new BigNumber(await DailyGame.getWinningFunds(1, accounts[7]));
        funds9 = new BigNumber(await DailyGame.getWinningFunds(1, accounts[8]));
        funds10 = new BigNumber(await DailyGame.getWinningFunds(1, accounts[9]));
        funds = await DailyGame.getRoundFunds(1);
        totalFunds = funds1.plus(funds2).plus(funds3).plus(funds4).plus(funds5).plus(funds6).plus(funds7).plus(funds8).plus(funds9).plus(funds10);
        assert.equal(totalFunds.toString(), funds.toString());

        await WeeklyGame.restartGame({value: value});

        result = 'TestResult3';
        ids = await RNG.getRequestsArray();
        id = ids[ids.length-1];
        await RNG.__callback(id, result, proof, {from: oraclizeAddress});

        funds1 = new BigNumber(await WeeklyGame.getWinningFunds(1, accounts[0]));
        funds2 = new BigNumber(await WeeklyGame.getWinningFunds(1, accounts[1]));
        funds3 = new BigNumber(await WeeklyGame.getWinningFunds(1, accounts[2]));
        funds4 = new BigNumber(await WeeklyGame.getWinningFunds(1, accounts[3]));
        funds5 = new BigNumber(await WeeklyGame.getWinningFunds(1, accounts[4]));
        funds6 = new BigNumber(await WeeklyGame.getWinningFunds(1, accounts[5]));
        funds7 = new BigNumber(await WeeklyGame.getWinningFunds(1, accounts[6]));
        funds8 = new BigNumber(await WeeklyGame.getWinningFunds(1, accounts[7]));
        funds9 = new BigNumber(await WeeklyGame.getWinningFunds(1, accounts[8]));
        funds10 = new BigNumber(await WeeklyGame.getWinningFunds(1, accounts[9]));
        funds = await WeeklyGame.getRoundFunds(1);
        totalFunds = funds1.plus(funds2).plus(funds3).plus(funds4).plus(funds5).plus(funds6).plus(funds7).plus(funds8).plus(funds9).plus(funds10);
        assert.equal(totalFunds.toString(), funds.toString());

        await MonthlyGame.restartGame({value: value});

        result = 'TestResult4';
        ids = await RNG.getRequestsArray();
        id = ids[ids.length-1];
        await RNG.__callback(id, result, proof, {from: oraclizeAddress});

        funds1 = new BigNumber(await MonthlyGame.getWinningFunds(1, accounts[0]));
        funds2 = new BigNumber(await MonthlyGame.getWinningFunds(1, accounts[1]));
        funds3 = new BigNumber(await MonthlyGame.getWinningFunds(1, accounts[2]));
        funds4 = new BigNumber(await MonthlyGame.getWinningFunds(1, accounts[3]));
        funds5 = new BigNumber(await MonthlyGame.getWinningFunds(1, accounts[4]));
        funds6 = new BigNumber(await MonthlyGame.getWinningFunds(1, accounts[5]));
        funds7 = new BigNumber(await MonthlyGame.getWinningFunds(1, accounts[6]));
        funds8 = new BigNumber(await MonthlyGame.getWinningFunds(1, accounts[7]));
        funds9 = new BigNumber(await MonthlyGame.getWinningFunds(1, accounts[8]));
        funds10 = new BigNumber(await MonthlyGame.getWinningFunds(1, accounts[9]));
        funds = await MonthlyGame.getRoundFunds(1);
        totalFunds = funds1.plus(funds2).plus(funds3).plus(funds4).plus(funds5).plus(funds6).plus(funds7).plus(funds8).plus(funds9).plus(funds10);
        assert.equal(totalFunds.toString(), funds.toString());

        await YearlyGame.restartGame({value: value});

        result = 'TestResult5';
        ids = await RNG.getRequestsArray();
        id = ids[ids.length-1];
        await RNG.__callback(id, result, proof, {from: oraclizeAddress});

        funds1 = new BigNumber(await YearlyGame.getWinningFunds(1, accounts[0]));
        funds2 = new BigNumber(await YearlyGame.getWinningFunds(1, accounts[1]));
        funds3 = new BigNumber(await YearlyGame.getWinningFunds(1, accounts[2]));
        funds4 = new BigNumber(await YearlyGame.getWinningFunds(1, accounts[3]));
        funds5 = new BigNumber(await YearlyGame.getWinningFunds(1, accounts[4]));
        funds6 = new BigNumber(await YearlyGame.getWinningFunds(1, accounts[5]));
        funds7 = new BigNumber(await YearlyGame.getWinningFunds(1, accounts[6]));
        funds8 = new BigNumber(await YearlyGame.getWinningFunds(1, accounts[7]));
        funds9 = new BigNumber(await YearlyGame.getWinningFunds(1, accounts[8]));
        funds10 = new BigNumber(await YearlyGame.getWinningFunds(1, accounts[9]));
        funds = await YearlyGame.getRoundFunds(1);
        totalFunds = funds1.plus(funds2).plus(funds3).plus(funds4).plus(funds5).plus(funds6).plus(funds7).plus(funds8).plus(funds9).plus(funds10);
        assert.equal(totalFunds.toString(), funds.toString());

        await SuperJackPot.restartGame({value: value});

        result = 'TestResult6';
        ids = await RNG.getRequestsArray();
        id = ids[ids.length-1];
        await RNG.__callback(id, result, proof, {from: oraclizeAddress});

        funds1 = new BigNumber(await SuperJackPot.getWinningFunds(1, accounts[0]));
        funds2 = new BigNumber(await SuperJackPot.getWinningFunds(1, accounts[1]));
        funds3 = new BigNumber(await SuperJackPot.getWinningFunds(1, accounts[2]));
        funds4 = new BigNumber(await SuperJackPot.getWinningFunds(1, accounts[3]));
        funds5 = new BigNumber(await SuperJackPot.getWinningFunds(1, accounts[4]));
        funds6 = new BigNumber(await SuperJackPot.getWinningFunds(1, accounts[5]));
        funds7 = new BigNumber(await SuperJackPot.getWinningFunds(1, accounts[6]));
        funds8 = new BigNumber(await SuperJackPot.getWinningFunds(1, accounts[7]));
        funds9 = new BigNumber(await SuperJackPot.getWinningFunds(1, accounts[8]));
        funds10 = new BigNumber(await SuperJackPot.getWinningFunds(1, accounts[9]));
        funds = await SuperJackPot.getRoundFunds(1);
        totalFunds = funds1.plus(funds2).plus(funds3).plus(funds4).plus(funds5).plus(funds6).plus(funds7).plus(funds8).plus(funds9).plus(funds10);
        assert.equal(totalFunds.toString(), funds.toString());
    });

    it('getRoundParticipants function', async function() {
        let participants = await HourlyGame.getRoundParticipants(1);
        assert.equal(participants[0], accounts[1], 'participant is not correct');
        assert.equal(participants[1], accounts[1], 'participant is not correct');
        assert.equal(participants[2], accounts[1], 'participant is not correct');
        assert.equal(participants[3], accounts[0], 'participant is not correct');
        assert.equal(participants[4], accounts[0], 'participant is not correct');
        assert.equal(participants[5], accounts[2], 'participant is not correct');
        assert.equal(participants[6], accounts[3], 'participant is not correct');
    });

    it('getRoundWinners function', async function() {
        let winnersCount = 10;
        let winners = await HourlyGame.getRoundWinners(1);

        assert.equal(winners.length, winnersCount, 'count of winners is not correct');
    });

    it('getRoundwinningTickets function', async function() {
        let winningTicketsCount = 10;
        let round = 1;
        let allTicketsCount = HourlyGame.getTicketsCount(round);
        let tickets = await HourlyGame.getRoundWinningTickets(round);

        assert.equal(tickets.length, winningTicketsCount, 'count of winners is not correct');

        for (let i = 0; i < winningTicketsCount; i++) {
            assert(tickets[i] < allTicketsCount, 'winning ticket is not correct');
        }
    });

    // it('setWinnersWhiteList function', async function() {
    //     let err;
    //     try {
    //         await HourlyGame.setKYCWhitelist(0);
    //     } catch (error) {
    //         err = error;
    //     }
    //     assert.ok(err instanceof Error);
    //
    //     await HourlyGame.setKYCWhitelist(KYCWhitelist.address);
    // });

    // it('addWinner function', async function() {
    //     await KYCWhitelist.addManager(accounts[3]);
    //
    //     let err;
    //     try {
    //         await KYCWhitelist.addParticipant(accounts[1]);
    //     } catch (error) {
    //         err = error;
    //     }
    //     assert.ok(err instanceof Error);
    //
    //     try {
    //         await KYCWhitelist.addParticipant(0, {from: accounts[3]});
    //     } catch (error) {
    //         err = error;
    //     }
    //     assert.ok(err instanceof Error);
    //
    //     await KYCWhitelist.addParticipant(accounts[1], {from: accounts[3]});
    //     await KYCWhitelist.addParticipant(accounts[2], {from: accounts[3]});
    //     await KYCWhitelist.addParticipant(accounts[5], {from: accounts[3]});
    // });

    // it('removeWinner function', async function() {
    //     await KYCWhitelist.addManager(accounts[3]);
    //
    //     let err;
    //     try {
    //         await KYCWhitelist.removeParticipant(accounts[1]);
    //     } catch (error) {
    //         err = error;
    //     }
    //     assert.ok(err instanceof Error);
    //
    //     try {
    //         await KYCWhitelist.removeParticipant(0, {from: accounts[3]});
    //     } catch (error) {
    //         err = error;
    //     }
    //     assert.ok(err instanceof Error);
    //
    //
    //     await KYCWhitelist.removeParticipant(accounts[5], {from: accounts[3]});
    //
    // });

    it('getGain function', async function() {
        it('getGain function', async function() {
            let round = 1;
            let account1BalanceBefore = new BigNumber(web3.eth.getBalance(accounts[1]));
            let account2BalanceBefore = new BigNumber(web3.eth.getBalance(accounts[3]));
            let hourlyGameBalanceBefore = new BigNumber(web3.eth.getBalance(HourlyGame.address));

            await HourlyGame.getGain(round, round, {from: accounts[1]});
            await HourlyGame.getGain(round, round, {from: accounts[3]});

            let err;
            try {
                await HourlyGame.getGain(round, round, {from: accounts[1]});
            } catch (error) {
                err = error;
            }
            assert.ok(err instanceof Error);

            let account1Balance = new BigNumber(web3.eth.getBalance(accounts[1]));
            let account2Balance = new BigNumber(web3.eth.getBalance(accounts[3]));
            let hourlyGameBalance = new BigNumber(web3.eth.getBalance(HourlyGame.address));

            assert(account2BalanceBefore.toString(), account2Balance.toString(), 'balance is not correct');
            assert((account1Balance.minus(account1BalanceBefore)).toString(),
                (hourlyGameBalanceBefore.minus(hourlyGameBalance)).toString(), 'balance is not correct');
        });

    });

    it('sendGain function', async function() {
        let round = 1;
        let account2BalanceBefore = new BigNumber(web3.eth.getBalance(accounts[2]));
        let hourlyGameBalanceBefore = new BigNumber(web3.eth.getBalance(HourlyGame.address));
        let err;
        try {
            await HourlyGame.sendGain(accounts[2], round, round);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        await HourlyGame.addManager(accounts[0]);
        await HourlyGame.sendGain(accounts[2], round, round);

        try {
            await HourlyGame.sendGain(accounts[2], round, round);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        let account2Balance = new BigNumber(web3.eth.getBalance(accounts[2]));
        let hourlyGameBalance = new BigNumber(web3.eth.getBalance(HourlyGame.address));


        assert((account2Balance.minus(account2BalanceBefore)).toString(),
            (hourlyGameBalanceBefore.minus(hourlyGameBalance)).toString(), 'balance is not correct');
    });


    it('buyBonusTickets function', async function() {


        await HourlyGame.buyBonusTickets(accounts[0], 10, 10, 10, 10, 10, 10, 10);
    });



});
