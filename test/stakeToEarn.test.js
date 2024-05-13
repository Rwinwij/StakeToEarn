const { ethers } = require("hardhat");
const { expect } = require("chai");
const { moveBlocks } = require("./utils/move-blocks");
const { moveTime } = require("./utils/move-time");

const DAILY_EMISSION = 1000;
const ALLOCATED_REWARDS = ethers.parseUnits("10000000",18);
const TOKEN_DECIMALS = 18;
const SECONDS_IN_A_DAY = 15; //hardcoded in the smart contract for demo, need to update in the future
const SECONDS_IN_A_YEAR = SECONDS_IN_A_DAY * 365;

describe("stakeToEarn Unit Tests", function () {
  let staking, elrondToken, stakeAmount;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    stakeAmount = 250;

    // deploy with script
    elrondToken = await (await ethers.getContractFactory("Elrond"))
      .connect(owner)
      .deploy("Elrond Token", "ELROND");

    staking = await (await ethers.getContractFactory("StakeToEarn"))
      .connect(owner)
      .deploy(await elrondToken.getAddress());
  });

  describe("Stake", () => {
    it("Moves tokens from the user to the staking contract", async () => {
      await elrondToken
        .connect(owner)
        .approve(staking.getAddress(), ethers.MaxInt256);
      await staking.connect(owner).stake(stakeAmount);

      const userStaked = await staking.connect(owner).userTokenBalance(owner);
      expect(stakeAmount).to.equal(userStaked);

      const totalStaked = await staking.connect(owner).totalStakedTokens();
      expect(stakeAmount).to.equal(totalStaked);
    });
  });

  describe("Stake Reward", () => {
    it("Returns the correct amount of reward token to a user based on the time locked/staked", async () => {
      await elrondToken
        .connect(owner)
        .approve(staking.getAddress(), ethers.MaxInt256);
      await staking.connect(owner).stake(stakeAmount);
      await moveTime(SECONDS_IN_A_DAY);
      await moveBlocks(1);
      const userRewardWei = await staking.connect(owner).reward(owner.address);
      const userReward = userRewardWei / BigInt(10 ** TOKEN_DECIMALS);
      expect(DAILY_EMISSION).to.equal(userReward);

      await moveTime(SECONDS_IN_A_YEAR);
      await moveBlocks(1);
      const userRewardWei2 = await staking.connect(owner).reward(owner.address);
      const userReward2 = userRewardWei2 / BigInt(10 ** TOKEN_DECIMALS);
      expect(DAILY_EMISSION * 366).to.equal(userReward2);
    });
  });

  describe("Unstake", () => {
    it("User Reward shall not change after he/she Unstake ALL his/her tokens", async () => {
      await elrondToken
        .connect(owner)
        .approve(staking.getAddress(), ethers.MaxInt256);

      await staking.connect(owner).stake(stakeAmount);

      await moveTime(SECONDS_IN_A_DAY);
      await moveBlocks(1);

      const userRewardWei = await staking.connect(owner).reward(owner.address);
      const userReward = userRewardWei / BigInt(10 ** TOKEN_DECIMALS);
      expect(DAILY_EMISSION).to.equal(userReward);

      await moveTime(SECONDS_IN_A_YEAR);
      await moveBlocks(1);

      const userRewardWei2 = await staking.connect(owner).reward(owner.address);
      const userReward2 = userRewardWei2 / BigInt(10 ** TOKEN_DECIMALS);
      expect(DAILY_EMISSION * 366).to.equal(userReward2);

      /*   UNSTAKE  */
      await staking.connect(owner).unstake(stakeAmount);
      /*   UNSTAKE  */
      const user_reward_at_unstake_wei = await staking
        .connect(owner)
        .userReward(owner.address);
      const user_reward_at_unstake =
        user_reward_at_unstake_wei / BigInt(10 ** TOKEN_DECIMALS);

      await moveTime(SECONDS_IN_A_YEAR);
      await moveBlocks(1);

      const user_reward_year_after_unstake_wei = await staking
        .connect(owner)
        .userReward(owner.address);
      const user_reward_year_after_unstake =
        user_reward_year_after_unstake_wei / BigInt(10 ** TOKEN_DECIMALS);

      expect(user_reward_at_unstake).to.equal(user_reward_year_after_unstake);
    });
  });

  describe("claim", () => {
    it("Claimed Rewards equal to users staked balance + reward", async () => {
      await elrondToken
        .connect(owner)
        .approve(staking.getAddress(), ethers.MaxInt256);

      //Store some balance on the contract
      await elrondToken
        .connect(owner)
        .transfer(staking.getAddress(), ALLOCATED_REWARDS);

      const user_balance_before_staking = await elrondToken.connect(owner).balanceOf(owner);
      //console.log(user_balance)

      await staking.connect(owner).stake(stakeAmount);

      await moveTime(SECONDS_IN_A_YEAR);
      await moveBlocks(1);

      /*   UNSTAKE  */
      await staking.connect(owner).unstake(stakeAmount);
      /*   UNSTAKE  */
      const user_reward_at_unstake_wei = await staking
        .connect(owner)
        .userReward(owner.address);
      const user_reward_at_unstake =
        user_reward_at_unstake_wei / BigInt(10 ** TOKEN_DECIMALS);

      /*   CLAIM  */
      await staking.connect(owner).claim();
      /*   CLAIM  */

      const user_balance_after_claim = await elrondToken.connect(owner).balanceOf(owner);
      console.log(user_balance_after_claim)

      const expectedBalance = user_balance_before_staking + user_reward_at_unstake_wei;
      expect(expectedBalance).to.equal(user_balance_after_claim);
    });
  });
});
