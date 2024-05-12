const { HardhatUserConfig } = require('hardhat/config');
const dotenv = require('dotenv');
require('@nomicfoundation/hardhat-toolbox');
require('@nomicfoundation/hardhat-ignition');

dotenv.config();
const {
  RPC_SEPOLIA,
  PRIVKEY1,
  PRIVKEY2,
  PRIVKEY3,
  ETHERSCAN_APIKEY,
} = process.env;

const config = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  defaultNetwork: 'hardhat',
  networks: {
    sepolia: {
      chainId: 11155111,
      url: RPC_SEPOLIA,
      accounts: [`0x${process.env.PRIVKEY1}`],
      },
    },
  etherscan: {
    apiKey: ETHERSCAN_APIKEY,
    },
  };

module.exports = config;
