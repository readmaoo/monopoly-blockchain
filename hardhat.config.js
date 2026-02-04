require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = "bdb15c218132b9983dad481cad463559c9cd9314de1dbd5629bf89d62c15c741"; 

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 31337
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY", // Или Alchemy URL
      accounts: [PRIVATE_KEY], 
    },
  }
};
