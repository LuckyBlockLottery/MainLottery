const TestHourlyGameContract = artifacts.require("./TestHourlyGame.sol");

contract('Pausable tests', async (accounts) => {

    beforeEach(async function () {
        HourlyGame = await TestHourlyGameContract.deployed();
    });

    it('check pause function', async function() {
        await HourlyGame.pause(true);
        let paused = await HourlyGame.paused.call();
        assert(paused);
    });

    it('check unpause function', async function() {
        await HourlyGame.pause(false);
        let paused = await HourlyGame.paused.call();
        assert(!paused);
    });
});
