pragma solidity 0.5.6;


import "./BaseGame.sol";


contract DailyGame is BaseGame {

    constructor(
        address payable _rng,
        uint _period
    )
        public
        BaseGame(_rng, _period)
    {

    }

}
