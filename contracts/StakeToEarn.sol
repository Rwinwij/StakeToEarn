// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

error StakeToEarn_ERC20TransferFailed();
error Constructor_ERC20ApproveFailed();
error Constructor_ERC20TransferFailed();

contract StakeToEarn is ReentrancyGuard {
    uint256 public constant TOTAL_ALLOCATED_REWARD = 1e7;
    uint256 public constant DAILY_EMISSION = 1000;
    uint256 public constant SECONDS_PER_DAY = 15; //only for testing purposes
    //uint256 public constant SECONDS_PER_DAY = 86400; //24hours * 60 minutes * 60 seconds;
    
    IERC20 public immutable ERC20Token;
    uint256 cumulativeRewardPerToken;
    uint256 lastTimeStamp;

    uint256 totalStakedTokens;

    mapping (address => uint256) userTokenBalance;
    mapping (address => uint256) userReward;
    mapping (address => uint256) rewardPerTokenPaid;

    event Stake(address indexed user, uint256 indexed amount);
    event Unstake(address indexed user, uint256 indexed amount);
    event Claim(address indexed user);

    constructor (address stakingToken) {
        ERC20Token = IERC20(stakingToken);

        // Transfer tokens to this contract from the sender
        uint256 amount = TOTAL_ALLOCATED_REWARD * 10**18;
        bool approve = ERC20Token.approve(address(this), amount);
        if (!approve) {
            revert Constructor_ERC20ApproveFailed();
        }
        bool transfer_from = ERC20Token.transferFrom(msg.sender, address(this), amount);
        if (!transfer_from) {
            revert Constructor_ERC20TransferFailed();
        }
    }

    function _cumulativeRewardPerToken () internal view returns (uint256) {
        if (totalStakedTokens == 0) {
            return cumulativeRewardPerToken;
        }

        return cumulativeRewardPerToken + 
               (block.timestamp - lastTimeStamp) * DAILY_EMISSION * 1e18 / 
               (SECONDS_PER_DAY * totalStakedTokens);
    }

    modifier updateReward(address account) {
        cumulativeRewardPerToken = _cumulativeRewardPerToken();  
        lastTimeStamp = block.timestamp;
        userReward[account] += reward(account);
        rewardPerTokenPaid[account] = cumulativeRewardPerToken; //update the last accumulated reward per token paid to the staker
        _;
    }

    //staking function that accepts amount as parameter
    function stake (uint256 amount) external updateReward(msg.sender) nonReentrant {
        userTokenBalance[msg.sender] += amount;
        totalStakedTokens += amount;
        //transfer the ERC20 token from the user to this contract
        bool success = ERC20Token.transferFrom(msg.sender, address(this), amount);
        if (!success) {
            revert StakeToEarn_ERC20TransferFailed();
        }
        emit Stake(msg.sender, amount);
    }

    //unstaking function that accepts amount as parameter
    function unstake (uint256 amount) external updateReward(msg.sender) nonReentrant {
        userTokenBalance[msg.sender] -= amount;
        totalStakedTokens -= amount;
        bool success = ERC20Token.transfer(msg.sender, amount);
        if (!success) {
            revert StakeToEarn_ERC20TransferFailed();
        }
        emit Unstake(msg.sender, amount);
    }

    //rewards function that returns the rewards that hasn’t been claimed by a user
    function reward(address account) public view returns (uint256) {
        uint256 unclaimedRewardPerToken = _cumulativeRewardPerToken() - rewardPerTokenPaid[account];
        return (userTokenBalance[account] * unclaimedRewardPerToken) / 1e18;
    }

    //claim function to claim the rewards from the allocated rewards token
    function claim () external updateReward(msg.sender) nonReentrant {
        uint256 user_reward = userReward[msg.sender];
        userReward[msg.sender] = 0; //update the user reward before transfer to prevent re-entrancy attack
        emit Claim(msg.sender);
        bool success = ERC20Token.transfer(msg.sender, user_reward);
        if (!success) {
            revert StakeToEarn_ERC20TransferFailed();
        }
    }
}
