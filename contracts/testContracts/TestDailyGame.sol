pragma solidity 0.5.6;

import "../DailyGame.sol";


contract TestDailyGame is DailyGame {

    constructor(
        address payable _rng,
        uint _period
    )
        public
        DailyGame(_rng, _period)
    {

    }
}
