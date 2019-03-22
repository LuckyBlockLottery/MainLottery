pragma solidity 0.5.6;


import "../BaseGame.sol";

contract TestBaseGame is BaseGame {

    constructor(
        address payable _rng,
        uint _period
    )
        public
        BaseGame(_rng, _period)
    {

    }

    function setPeriod(uint _period) public onlyOwner {
        period = _period;
    }

    function setOraclizeTimeout(uint _timeout) public onlyOwner {
        ORACLIZE_TIMEOUT = _timeout;
    }

    function setParticipantsCount(uint _round, uint _count) public  {
        rounds[_round].participantCount = _count;
    }

}
