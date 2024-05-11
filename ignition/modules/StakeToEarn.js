const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("Apollo", (m) => {
  const apollo = m.contract("StakeToEarn");

  //m.call(apollo, "launch", []);

  return { apollo };
});