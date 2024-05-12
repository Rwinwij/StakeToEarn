const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("StakeToEarnModule1", (m) => {
  
    const stakeToEarnContract = m.contract("StakeToEarn", ["0xd21550cA1Eb4972258eA2CEA5b5fca990D83Dc5e"]);

  return { stakeToEarnContract };
});