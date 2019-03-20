pragma solidity 0.5.2;

import "../HourlyGame.sol";

contract TestHourlyGame is HourlyGame {

    constructor (
        address payable _rng,
        uint _period,
        address _dailyGame,
        address _weeklyGame,
        address _monthlyGame,
        address _yearlyGame,
        address _jackPot,
        address _superJackPot
    )
        public
        HourlyGame(
            _rng,
            _period,
            _dailyGame,
            _weeklyGame,
            _monthlyGame,
            _yearlyGame,
            _jackPot,
            _superJackPot
        )
    { }

}
