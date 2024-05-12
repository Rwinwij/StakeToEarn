const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ElrondModule", (m) => {
  
    const elrondContract = m.contract("Elrond", ["Elrond Token", "ELROND"]);

  return { elrondContract };
});