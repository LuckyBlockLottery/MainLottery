pragma solidity 0.5.2;


import "./BaseGame.sol";


contract IChecker {
    function update() public payable;
}


contract SuperJackPot is BaseGame {

    IChecker public checker;
    uint constant public SUPERJACKPOT_ORGANISER_SHARE = 20;          // 20% to organiser
    uint constant public SUPERJACKPOT_WINNER_SHARE = 80;             // 80% to winner

    modifier onlyChecker {
        require(msg.sender == address(checker), "");
        _;
    }

    constructor(
        address payable _rng,
        uint _period,
        address _checker
    )
        public
        BaseGame(_rng, _period) {
            require(_checker != address(0), "");

            checker = IChecker(_checker);
    }

    function () external payable {

    }

    function processGame() public payable onlyChecker {
        rounds[currentRound].state = RoundState.WAIT_RESULT;
        emit RoundStateChanged(currentRound, rounds[currentRound].state);
        iRNG(rng).update.value(msg.value)(currentRound, rounds[currentRound].nonce, 0);
        currentRound = currentRound.add(1);
        rounds[currentRound].startRoundTime = getCurrentTime();
        rounds[currentRound].state = RoundState.ACCEPT_FUNDS;
        emit RoundStateChanged(currentRound, rounds[currentRound].state);
    }

    function startGame(uint _startPeriod) public payable onlyGameContract {
        _startPeriod;
        currentRound = 1;
        uint time = getCurrentTime();
        rounds[currentRound].startRoundTime = time;
        rounds[currentRound].state = RoundState.ACCEPT_FUNDS;
        emit RoundStateChanged(currentRound, rounds[currentRound].state);
        emit GameStarted(time);
        checker.update.value(msg.value)();
    }

    function setChecker(address _checker) public onlyOwner {
        require(_checker != address(0), "");

        checker = IChecker(_checker);
    }

    function processRound(uint _round, uint _randomNumber) public payable onlyRng returns (bool) {
        rounds[_round].random = _randomNumber;
        rounds[_round].winningTickets.push(_randomNumber.mod(rounds[_round].ticketsCount));

        address winner = getWinner(
            _round,
            0,
            (rounds[_round].tickets.length).sub(1),
            rounds[_round].winningTickets[0]
        );

        rounds[_round].winners.push(winner);
        rounds[_round].winnersFunds[winner] = rounds[_round].roundFunds;
        rounds[_round].state = RoundState.SUCCESS;

        emit RoundStateChanged(_round, rounds[_round].state);
        emit RoundProcecced(_round, rounds[_round].winners, rounds[_round].winningTickets, rounds[_round].roundFunds);

        return true;
    }

    function buyTickets(address _participant) public payable onlyGameContract {
        require(msg.value > 0, "");

        uint ticketsCount = msg.value.div(ticketPrice);
        addParticipant(_participant, ticketsCount);

        updateRoundFundsAndParticipants(_participant, msg.value);
    }

    function getGain(uint _fromRound, uint _toRound) public {
        transferGain(msg.sender, _fromRound, _toRound);
    }

    function sendGain(address payable _participant, uint _fromRound, uint _toRound) public onlyManager {
        transferGain(_participant, _fromRound, _toRound);
    }

    function transferGain(address payable _participant, uint _fromRound, uint _toRound) internal {
        require(_fromRound <= _toRound, "");
        require(_participant != address(0), "");

        uint funds;

        for (uint i = _fromRound; i <= _toRound; i++) {

            if (rounds[i].state == RoundState.SUCCESS
                && rounds[i].sendGain[_participant] == false) {

                rounds[i].sendGain[_participant] = true;
                funds = funds.add(getWinningFunds(i, _participant));
            }
        }

        require(funds > 0, "");

        uint fundsToOrganiser = funds.mul(SUPERJACKPOT_ORGANISER_SHARE).div(100);
        uint fundsToWinner = funds.mul(SUPERJACKPOT_WINNER_SHARE).div(100);

        _participant.transfer(fundsToWinner);
        organiser.transfer(fundsToOrganiser);

        emit Withdraw(_participant, fundsToWinner, _fromRound, _toRound);
        emit Withdraw(organiser, fundsToOrganiser, _fromRound, _toRound);

    }
}
