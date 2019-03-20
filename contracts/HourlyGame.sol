pragma solidity 0.5.2;


import "./BaseGame.sol";


contract iBaseGame {
    function getPeriod() public view returns (uint);
    function buyTickets(address _participant) public payable;
    function startGame(uint _startPeriod) public payable;
    function setTicketPrice(uint _ticketPrice) public;
    function buyBonusTickets(address _participant, uint _ticketsCount) public;
}

contract iJackPotChecker {
    function getPrice() public view returns (uint);
}


contract HourlyGame is BaseGame {
    address payable public checker;
    uint public serviceMinBalance = 1 ether;

    uint public BET_PRICE;

    uint constant public HOURLY_GAME_SHARE = 30;                       //30% to hourly game
    uint constant public DAILY_GAME_SHARE = 10;                        //10% to daily game
    uint constant public WEEKLY_GAME_SHARE = 5;                        //5% to weekly game
    uint constant public MONTHLY_GAME_SHARE = 5;                       //5% to monthly game
    uint constant public YEARLY_GAME_SHARE = 5;                        //5% to yearly game
    uint constant public JACKPOT_GAME_SHARE = 10;                 //10% to jackpot game
    uint constant public SUPER_JACKPOT_GAME_SHARE = 15;                 //15% to superJackpot game
    uint constant public GAME_ORGANISER_SHARE = 20;                    //20% to game organiser
    uint constant public SHARE_DENOMINATOR = 100;                        //denominator for share

    bool public paused;

    address public dailyGame;
    address public weeklyGame;
    address public monthlyGame;
    address public yearlyGame;
    address public jackPot;
    address public superJackPot;

    event TransferFunds(address to, uint funds);

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
        BaseGame(_rng, _period)
    {
        require(_dailyGame != address(0), "");
        require(_weeklyGame != address(0), "");
        require(_monthlyGame != address(0), "");
        require(_yearlyGame != address(0), "");
        require(_jackPot != address(0), "");
        require(_superJackPot != address(0), "");

        dailyGame = _dailyGame;
        weeklyGame = _weeklyGame;
        monthlyGame = _monthlyGame;
        yearlyGame = _yearlyGame;
        jackPot = _jackPot;
        superJackPot = _superJackPot;
    }

    function () external payable {
        buyTickets(msg.sender);
    }

    function buyTickets(address _participant) public payable {
        require(!paused, "");
        require(msg.value > 0, "");

        uint ETHinUSD = iJackPotChecker(checker).getPrice();
        BET_PRICE = uint(100).mul(10**18).div(ETHinUSD);    // BET_PRICE is $1 in wei

        uint funds = msg.value;
        uint extraFunds = funds.mod(BET_PRICE);

        if (extraFunds > 0) {
            organiser.transfer(extraFunds);
            emit TransferFunds(organiser, extraFunds);
            funds = funds.sub(extraFunds);
        }

        uint fundsToOrginiser = funds.mul(GAME_ORGANISER_SHARE).div(SHARE_DENOMINATOR);

        fundsToOrginiser = transferToServices(rng, fundsToOrginiser, serviceMinBalance);
        fundsToOrginiser = transferToServices(checker, fundsToOrginiser, serviceMinBalance);

        if (fundsToOrginiser > 0) {
            organiser.transfer(fundsToOrginiser);
            emit TransferFunds(organiser, fundsToOrginiser);
        }

        updateRoundTimeAndState();
        addParticipant(_participant, funds.div(BET_PRICE));
        updateRoundFundsAndParticipants(_participant, funds.mul(HOURLY_GAME_SHARE).div(SHARE_DENOMINATOR));

        if (getCurrentTime() > rounds[currentRound].startRoundTime.add(period)
            && rounds[currentRound].participantCount >= 10
        ) {
            _restartGame();
        }

        iBaseGame(dailyGame).buyTickets.value(funds.mul(DAILY_GAME_SHARE).div(SHARE_DENOMINATOR))(_participant);
        iBaseGame(weeklyGame).buyTickets.value(funds.mul(WEEKLY_GAME_SHARE).div(SHARE_DENOMINATOR))(_participant);
        iBaseGame(monthlyGame).buyTickets.value(funds.mul(MONTHLY_GAME_SHARE).div(SHARE_DENOMINATOR))(_participant);
        iBaseGame(yearlyGame).buyTickets.value(funds.mul(YEARLY_GAME_SHARE).div(SHARE_DENOMINATOR))(_participant);
        iBaseGame(jackPot).buyTickets.value(funds.mul(JACKPOT_GAME_SHARE).div(SHARE_DENOMINATOR))(_participant);
        iBaseGame(superJackPot).buyTickets.value(funds.mul(SUPER_JACKPOT_GAME_SHARE).div(SHARE_DENOMINATOR))(_participant);

    }

    function buyBonusTickets(
        address _participant,
        uint _hourlyTicketsCount,
        uint _dailyTicketsCount,
        uint _weeklyTicketsCount,
        uint _monthlyTicketsCount,
        uint _yearlyTicketsCount,
        uint _jackPotTicketsCount,
        uint _superJackPotTicketsCount
    )
        public
        payable
        onlyManager
    {
        require(!paused, "");

        updateRoundTimeAndState();
        addParticipant(_participant, _hourlyTicketsCount);
        updateRoundFundsAndParticipants(_participant, uint(0));

        if (getCurrentTime() > rounds[currentRound].startRoundTime.add(period)
            && rounds[currentRound].participantCount >= 10
        ) {
            _restartGame();
        }

        iBaseGame(dailyGame).buyBonusTickets(_participant, _dailyTicketsCount);
        iBaseGame(weeklyGame).buyBonusTickets(_participant, _weeklyTicketsCount);
        iBaseGame(monthlyGame).buyBonusTickets(_participant, _monthlyTicketsCount);
        iBaseGame(yearlyGame).buyBonusTickets(_participant, _yearlyTicketsCount);
        iBaseGame(jackPot).buyBonusTickets(_participant, _jackPotTicketsCount);
        iBaseGame(superJackPot).buyBonusTickets(_participant, _superJackPotTicketsCount);
    }

    function setChecker(address payable _checker) public onlyOwner {
        require(_checker != address(0), "");

        checker = _checker;
    }

    function setMinBalance(uint _minBalance) public onlyOwner {
        require(_minBalance >= 1 ether, "");

        serviceMinBalance = _minBalance;
    }

    function pause(bool _paused) public onlyOwner {
        paused = _paused;
    }

    function transferToServices(address payable _service, uint _funds, uint _minBalance) internal returns (uint) {
        uint result = _funds;
        if (_service.balance < _minBalance) {
            uint lack = _minBalance.sub(_service.balance);
            if (_funds > lack) {
                _service.transfer(lack);
                emit TransferFunds(_service, lack);
                result = result.sub(lack);
            } else {
                _service.transfer(_funds);
                emit TransferFunds(_service, _funds);
                result = uint(0);
            }
        }
        return result;
    }
}
