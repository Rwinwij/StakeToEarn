// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StakeToEarn {
    uint public constant TOTAL_SUPPLY = 1e7;
    uint public constant DAILY_REWARD = 1000;

    uint totalStakedTokens;
    mapping (address => uint) userStakedBalance;

    //staking function that accepts amount as parameter
    function stake (uint amount) public {

    }

    //unstaking function that accepts amount as parameter
    function unstake (uint amount) public {

    }

    //rewards function that returns the rewards that hasn’t been claimed
    function reward () public view returns (uint) {
        return 0;
    }

    //claim function to claim the rewards from the allocated rewards token
    function claim () public {

    }
}
