const RNGContract = artifacts.require("./RNG.sol");
const TestBaseGameContract = artifacts.require("./TestBaseGame.sol");
const TestHourlyGameContract = artifacts.require("./TestHourlyGame.sol");
const TestDailyGameContract = artifacts.require("./TestDailyGame.sol");
const TestWeeklyGameContract = artifacts.require("./TestWeeklyGame.sol");
const TestMonthlyGameContract = artifacts.require("./TestMonthlyGame.sol");
const TestYearlyGameContract = artifacts.require("./TestYearlyGame.sol");
const TestSuperJackPotContract = artifacts.require("./TestSuperJackPot.sol");
const JackPotCheckerContract = artifacts.require("./JackPotChecker.sol");
const KYCWhitelistContract = artifacts.require("./KYCWhitelist.sol");

contract('Constructors tests', async (accounts) => {

    let RNG;
    let BaseGame;
    let HourlyGame;
    let DailyGame;
    let WeeklyGame;
    let MonthlyGame;
    let YearlyGame;
    let SuperJackPot;
    let JackPotChecker;
    let KYCWhitelist;

    let failRNG = 0;
    let failBaseGame = 0;
    let failHourlyGame = 0;
    let failDailyGame = 0;
    let failWeeklyGame = 0;
    let failMonthlyGame = 0;
    let failYearlyGame = 0;
    let failSuperJackPot = 0;
    let failJackPotChecker = 0;
    let failKYCWhitelist = 0;

    let failPeriod = 10;
    let period = 65;

    beforeEach(async function () {
        RNG = await RNGContract.deployed();
        BaseGame = await TestBaseGameContract.deployed();
        HourlyGame = await TestHourlyGameContract.deployed();
        DailyGame = await TestDailyGameContract.deployed();
        WeeklyGame = await TestWeeklyGameContract.deployed();
        MonthlyGame = await TestMonthlyGameContract.deployed();
        YearlyGame = await TestYearlyGameContract.deployed();
        SuperJackPot = await TestSuperJackPotContract.deployed();
        JackPotChecker = await JackPotCheckerContract.deployed();
        KYCWhitelist = await KYCWhitelistContract.deployed();
    });

    it('BaseGame constructor test', async function() {
        let err;
        try {
            BaseGame = BaseGame.new(failRNG, period);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        try {
            BaseGame = BaseGame.new(RNG.address, failPeriod);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('HourlyGame constructor test', async function() {
        let err;
        try {
            HourlyGame = HourlyGame.new(
                RNG.address,
                period,
                failDailyGame,
                failWeeklyGame,
                failMonthlyGame,
                failYearlyGame,
                failSuperJackPot
            );
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        try {
            HourlyGame = HourlyGame.new(
                RNG.address,
                period,
                DailyGame.address,
                failWeeklyGame,
                failMonthlyGame,
                failYearlyGame,
                failSuperJackPot
            );
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        try {
            HourlyGame = HourlyGame.new(
                RNG.address,
                period,
                DailyGame.address,
                WeeklyGame.address,
                failMonthlyGame,
                failYearlyGame,
                failSuperJackPot
            );
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        try {
            HourlyGame = HourlyGame.new(
                RNG.address,
                period,
                DailyGame.address,
                WeeklyGame.address,
                MonthlyGame.address,
                failYearlyGame,
                failSuperJackPot
            );
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        try {
            HourlyGame = HourlyGame.new(
                RNG.address,
                period,
                DailyGame.address,
                WeeklyGame.address,
                MonthlyGame.address,
                YearlyGame.address,
                failSuperJackPot
            );
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });

    it('SuperJackPot constructor test', async function() {
        let err;
        try {
            SuperJackPot = SuperJackPot.new(RNG.address, period, failJackPotChecker);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });
});
