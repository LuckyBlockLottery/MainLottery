pragma solidity 0.5.2;


import "./BaseGame.sol";


contract WeeklyGame is BaseGame {

    constructor(
        address payable _rng,
        uint _period
    )
        public
        BaseGame(_rng, _period) {

    }
}
