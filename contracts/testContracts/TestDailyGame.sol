pragma solidity 0.5.2;

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
