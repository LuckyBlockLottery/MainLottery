pragma solidity 0.5.6;

import "./Manageable.sol";
import "./SafeMath.sol";


interface iHourlyGame {
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

    constructor (
        address _token,
        address _hourlyGame
    )
    public
    {
        require(_token != address(0));
        require(_hourlyGame != address(0), "");

        token = IERC20(_token);
        hourlyGame = _hourlyGame;
    }

    function buyTickets(address _participant, uint _luckyBacksAmount) public {
        require(_luckyBacksAmount > 0, "");
        require(token.transferFrom(msg.sender, address(this), _luckyBacksAmount), "");

        uint amount = _luckyBacksAmount.div(10**18);

        iHourlyGame(hourlyGame).buyBonusTickets(
            _participant,
            amount,
            amount,
            amount,
            amount,
            amount,
            amount,
            amount
        );
    }

    function changeToken(address _token) public onlyManager {
        token = IERC20(_token);
    }
}
