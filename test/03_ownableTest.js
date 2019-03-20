const TestBaseGameContract = artifacts.require("./TestBaseGame.sol");

contract('Ownable tests', async (accounts) => {

    beforeEach(async function () {
        BaseGame = await TestBaseGameContract.deployed();
    });

    it('check owner function', async function() {
        let owner = await BaseGame.owner();

        assert.equal(owner, accounts[0]);
    });

    it('check transferOwnership function', async function() {
        let newOwner = accounts[5];
        await BaseGame.transferOwnership(newOwner);
        let owner = await BaseGame.owner();
        assert.equal(owner, newOwner);
    });

    it('check transferOwnership function from not owner', async function() {
        let newOwner = accounts[0];
        let err;
        try {
            await BaseGame.transferOwnership(newOwner);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);

        await BaseGame.transferOwnership(newOwner, {from: accounts[5]});
        let owner = await BaseGame.owner();
        assert.equal(owner, newOwner);
    });

    it('check transferOwnership function with zero address', async function() {
        let newOwner = 0;
        let err;
        try {
            await BaseGame.transferOwnership(newOwner);
        } catch (error) {
            err = error;
        }
        assert.ok(err instanceof Error);
    });
});
