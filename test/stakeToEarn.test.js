const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { moveBlocks } = require("./utils/move-blocks")
const { moveTime } = require("./utils/move-time")

const SECONDS_IN_A_DAY = 15 //hardcoded in the smart contract for demo, need to update in the future
const SECONDS_IN_A_YEAR = SECONDS_IN_A_DAY * 364

describe("stakeToEarn Unit Tests", function () {
          let staking, elrondToken, deployer, stakeAmount
          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["elrondToken", "staking"])
              staking = await ethers.getContract("StakeToEarn")
              elrondToken = await ethers.getContract("Elrond")
              stakeAmount = ethers.utils.parseEther("100000")
          })

          describe("constructor", () => {
              it("sets the rewards token address correctly", async () => {
                  const response = await staking.ERC20Token()
                  assert.equal(response, elrondToken.address)
              })
          })
          describe("rewardPerToken", () => {
              it("Returns the reward amount of 1 token based time spent locked up", async () => {
                  await elrondToken.approve(staking.address, stakeAmount)
                  await staking.stake(stakeAmount)
                  await moveTime(SECONDS_IN_A_DAY)
                  await moveBlocks(1)
                  let reward = await staking.rewardPerToken()
                  console.log("reward1 = ",reward)
                  let expectedReward = "1000"
                  assert.equal(reward.toString(), expectedReward)

                  await moveTime(SECONDS_IN_A_YEAR)
                  await moveBlocks(1)
                  reward = await staking.rewardPerToken()
                  onsole.log("reward2 = ",reward)
                  expectedReward = "31536"
                  assert.equal(reward.toString(), expectedReward)
              })
          })
          describe("stake", () => {
              it("Moves tokens from the user to the staking contract", async () => {
                  await elrondToken.approve(staking.address, stakeAmount)
                  await staking.stake(stakeAmount)
                  await moveTime(SECONDS_IN_A_DAY)
                  await moveBlocks(1)
                  const earned = await staking.earned(deployer.address)
                  const expectedEarned = "8600000"
                  assert.equal(expectedEarned, earned.toString())
              })
          })
          describe("unstake", () => {
              it("Moves tokens from the staking contract to the user", async () => {
                  await elrondToken.approve(staking.address, stakeAmount)
                  await staking.stake(stakeAmount)
                  await moveTime(SECONDS_IN_A_DAY)
                  await moveBlocks(1)
                  const balanceBefore = await elrondToken.balanceOf(deployer.address)
                  await staking.unstake(stakeAmount)
                  const balanceAfter = await elrondToken.balanceOf(deployer.address)
                  const earned = await staking.earned(deployer.address)
                  const expectedEarned = "8600000"
                  assert.equal(expectedEarned, earned.toString())
                  assert.equal(balanceBefore.add(stakeAmount).toString(), balanceAfter.toString())
              })
          })
          describe("claim", () => {
              it("Users can claim their rewards", async () => {
                  await elrondToken.approve(staking.address, stakeAmount)
                  await staking.stake(stakeAmount)
                  await moveTime(SECONDS_IN_A_DAY)
                  await moveBlocks(1)
                  const earned = await staking.earned(deployer.address)
                  const balanceBefore = await elrondToken.balanceOf(deployer.address)
                  await staking.claim()
                  const balanceAfter = await elrondToken.balanceOf(deployer.address)
                  assert.equal(balanceBefore.add(earned).toString(), balanceAfter.toString())
              })
          })
      })