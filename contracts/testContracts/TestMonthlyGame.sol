pragma solidity 0.5.6;

import "../MonthlyGame.sol";

contract TestMonthlyGame is MonthlyGame {

    constructor(
        address payable _rng,
        uint _period
    )
        public
        MonthlyGame(_rng, _period)
    {

    }
}
