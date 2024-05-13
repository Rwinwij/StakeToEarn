// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

error StakeToEarn_ERC20TransferFailed();

contract StakeToEarn is ReentrancyGuard {
    uint256 public constant TOTAL_ALLOCATED_REWARD = 1e7;
    uint256 public constant DAILY_EMISSION = 1000;
    uint256 public constant SECONDS_PER_DAY = 15; //only for testing purposes
    //uint256 public constant SECONDS_PER_DAY = 86400; //24hours * 60 minutes * 60 seconds;

    IERC20 public immutable ERC20Token;
    uint256 public immutable ERC20Decimals;

    /** Declare all as PUBLIC for easier debugging, once stable will change to private/internal */
    uint256 public cumulativeRewardPerToken; //scaled by erc-20 decimals for precision
    uint256 public lastTimeStamp;
    uint256 public totalStakedTokens;

    mapping (address => uint256) public userTokenBalance;
    mapping (address => uint256) public userReward; //scaled by erc-20 decimals for precision
    mapping (address => uint256) public lastRewardPerToken; //scaled by erc-20 decimals for precision
    /** ************************************************************************************ */

    event Stake(address indexed user, uint256 indexed amount);
    event Unstake(address indexed user, uint256 indexed amount);
    event Claim(address indexed user);

    constructor (address erc20Token) {
        ERC20Token = IERC20(erc20Token);
        ERC20Decimals = 10 ** ERC20Token.decimals();
    }

    function allocateRewardToken () external {
        // Transfer tokens to this contract from the sender
        uint256 amount = TOTAL_ALLOCATED_REWARD * ERC20Decimals;

        bool transfer_from = ERC20Token.transferFrom(msg.sender, address(this), amount);
        if (!transfer_from) {
            revert StakeToEarn_ERC20TransferFailed();
        }
    }

    function _cumulativeRewardPerToken () internal view returns (uint256) {
        if (totalStakedTokens == 0) {
            return cumulativeRewardPerToken;
        }

        return cumulativeRewardPerToken + 
               (block.timestamp - lastTimeStamp) * DAILY_EMISSION * ERC20Decimals / 
               (SECONDS_PER_DAY * totalStakedTokens);
    }

    modifier updateReward(address account) {
        cumulativeRewardPerToken = _cumulativeRewardPerToken();  
        lastTimeStamp = block.timestamp;
        userReward[account] += reward(account);
        lastRewardPerToken[account] = cumulativeRewardPerToken; //update the last accumulated reward per token paid to the staker
        _;
    }

    //staking function that accepts amount as parameter
    function stake (uint256 amount) external updateReward(msg.sender) nonReentrant {
        userTokenBalance[msg.sender] += amount;
        totalStakedTokens += amount;
        //transfer the ERC20 token from the user to this contract
        bool success = ERC20Token.transferFrom(msg.sender, address(this), amount*ERC20Decimals);
        if (!success) {
            revert StakeToEarn_ERC20TransferFailed();
        }
        emit Stake(msg.sender, amount);
    }

    //unstaking function that accepts amount as parameter
    function unstake (uint256 amount) external updateReward(msg.sender) nonReentrant {
        userTokenBalance[msg.sender] -= amount;
        totalStakedTokens -= amount;
        bool success = ERC20Token.transfer(msg.sender, amount*ERC20Decimals);
        if (!success) {
            revert StakeToEarn_ERC20TransferFailed();
        }
        emit Unstake(msg.sender, amount);
    }

    //rewards function that returns the rewards that hasn’t been claimed by a user
    function reward(address account) public view returns (uint256) {
        uint256 unclaimedRewardPerToken = _cumulativeRewardPerToken() - lastRewardPerToken[account];
        return (userTokenBalance[account] * unclaimedRewardPerToken);
    }

    //claim function to claim the rewards from the allocated rewards token
    function claim () external updateReward(msg.sender) nonReentrant {
        uint256 user_reward = userReward[msg.sender];
        userReward[msg.sender] = 0; //update the user reward before transfer to prevent re-entrancy attack
        emit Claim(msg.sender);
        bool success = ERC20Token.transfer(msg.sender, user_reward); //user reward is already scaled by 18 decimals for precision
        if (!success) {
            revert StakeToEarn_ERC20TransferFailed();
        }
    }
}
