pragma solidity 0.5.6;

import "./Manageable.sol";
import "./SafeMath.sol";


interface iHourlyGame {
    function getCurrentRound() external view returns (uint);
    function buyBonusTickets(
        address _participant,
        uint _hourlyTicketsCount,
        uint _dailyTicketsCount,
        uint _weeklyTicketsCount,
        uint _monthlyTicketsCount,
        uint _yearlyTicketsCount,
        uint _jackPotTicketsCount,
        uint _superJackPotTicketsCount
    ) external payable;
}

interface iAllGame {
    function getCurrentRound() external view returns (uint);
}

/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
interface IERC20 {
    function balanceOf(address who) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract ProxyBonusContract is Manageable {
    using SafeMath for uint;

    IERC20 public token;

    address hourlyGame;
    address dailyGame;
    address weeklyGame;
    address monthlyGame;
    address yearlyGame;
    address jackPot;
    address superJackPot;

    mapping(address => uint) gameLimits;

    // Game => round => amount
    mapping(address => mapping (uint => uint)) public ticketRoundAmount;

    uint public betLimit = 100;

    constructor (
        address _token,
        address _hourlyGame,
        address _dailyGame,
        address _weeklyGame,
        address _monthlyGame,
        address _yearlyGame,
        address _jackPot,
        address _superJackPot
    )
    public
    {
        require(_token != address(0));

        require(_hourlyGame != address(0), "");

        require(_dailyGame != address(0), "");
        require(_weeklyGame != address(0), "");
        require(_monthlyGame != address(0), "");
        require(_yearlyGame != address(0), "");
        require(_jackPot != address(0), "");
        require(_superJackPot != address(0), "");

        token = IERC20(_token);

        hourlyGame = _hourlyGame;
        dailyGame = _dailyGame;
        weeklyGame = _weeklyGame;
        monthlyGame = _monthlyGame;
        yearlyGame = _yearlyGame;
        jackPot = _jackPot;
        superJackPot = _superJackPot;
    }

    function buyTickets(address _participant, uint _luckyBacksAmount) public {
        require(_luckyBacksAmount > 0, "");
        require(token.transferFrom(msg.sender, address(this), _luckyBacksAmount), "");
        require(_luckyBacksAmount <= betLimit);

        uint hourlyTicketsAmount = calcAmount(hourlyGame, _luckyBacksAmount);
        uint dailyTicketsAmount = calcAmount(dailyGame, _luckyBacksAmount);
        uint weeklyTicketsAmount = calcAmount(weeklyGame, _luckyBacksAmount);
        uint monthlyTicketsAmount = calcAmount(monthlyGame, _luckyBacksAmount);
        uint yearlyTicketsAmount = calcAmount(yearlyGame, _luckyBacksAmount);
        uint jackPotTicketsAmount = calcAmount(jackPot, _luckyBacksAmount);
        uint superJackPotTicketsAmount = calcAmount(superJackPot, _luckyBacksAmount);

        iHourlyGame(hourlyGame).buyBonusTickets(
            _participant,
            hourlyTicketsAmount,
            dailyTicketsAmount,
            weeklyTicketsAmount,
            monthlyTicketsAmount,
            yearlyTicketsAmount,
            jackPotTicketsAmount,
            superJackPotTicketsAmount
        );
    }

    function calcAmount(address _game, uint _luckyBacksAmount) public returns (uint) {
        uint ticketsAmount = _luckyBacksAmount;
        uint currentRoundTicketsAmount = getRoundTicketsAmount(_game);
        uint gameRoundLimit = getRoundLimit(_game);

        if (currentRoundTicketsAmount.add(ticketsAmount) > gameRoundLimit) {
            ticketsAmount = gameRoundLimit.sub(currentRoundTicketsAmount);
        }

        addRoundTicketsAmount(_game, ticketsAmount);

        return ticketsAmount;
    }

    function getRoundTicketsAmount(address _game) public view returns (uint) {
        uint currentRound = iAllGame(_game).getCurrentRound();
        return ticketRoundAmount[_game][currentRound];
    }

    function addRoundTicketsAmount(address _game, uint _amount) internal {
        uint currentRound = iAllGame(_game).getCurrentRound();
        ticketRoundAmount[_game][currentRound] =  ticketRoundAmount[_game][currentRound].add(_amount);
    }

    function changeToken(address _token) public onlyManager {
        token = IERC20(_token);
    }

    function changeAllRoundLimits(
        uint _hourlyRoundLimit,
        uint _dailyRoundLimit,
        uint _weeklyRoundLimit,
        uint _monthlyRoundLimit,
        uint _yearlyRoundLimit,
        uint _jackPotRoundLimit,
        uint _superJackPotRoundLimit
    )
    public
    onlyManager
    {
        changeRoundLimit(hourlyGame,_hourlyRoundLimit);
        changeRoundLimit(dailyGame, _dailyRoundLimit);
        changeRoundLimit(weeklyGame, _weeklyRoundLimit);
        changeRoundLimit(monthlyGame, _monthlyRoundLimit);
        changeRoundLimit(yearlyGame, _yearlyRoundLimit);
        changeRoundLimit(jackPot, _jackPotRoundLimit);
        changeRoundLimit(superJackPot, _superJackPotRoundLimit);
    }

    function changeRoundLimit(address _game, uint _roundLimit) public onlyManager {
        gameLimits[_game] = _roundLimit;
    }

    function getRoundLimit(address _game) public view returns (uint) {
        return gameLimits[_game];
    }

    function setBetLimit(uint _betLimit) public onlyManager {
        betLimit = _betLimit;
    }
}
