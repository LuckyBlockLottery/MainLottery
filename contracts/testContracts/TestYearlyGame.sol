pragma solidity 0.5.6;

import "../YearlyGame.sol";

contract TestYearlyGame is YearlyGame {

    constructor(
        address payable _rng,
        uint _period
    )
        public
        YearlyGame(_rng, _period)
    {

    }
}
