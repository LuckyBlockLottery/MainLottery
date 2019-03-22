pragma solidity 0.5.6;

import "../WeeklyGame.sol";

contract TestWeeklyGame is WeeklyGame {

    constructor(
        address payable _rng,
        uint _period
    )
        public
        WeeklyGame(_rng, _period)
    {

    }
}
