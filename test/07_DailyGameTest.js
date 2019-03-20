const TestHourlyGameContract = artifacts.require("./TestHourlyGame.sol");
const TestDailyGameContract = artifacts.require("./TestDailyGame.sol");

const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('DailyGame tests', async (accounts) => {

    let HourlyGame;
    let DailyGame;

    beforeEach(async function () {
        HourlyGame = await TestHourlyGameContract.deployed();
        DailyGame = await TestDailyGameContract.deployed();
    });

});
