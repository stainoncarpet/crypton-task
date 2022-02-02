require("@nomiclabs/hardhat-waffle");
require('solidity-coverage');
require("dotenv").config();

const { runTasks } = require("./tasks/index.js");

runTasks();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.11",
  networks: {
    rinkeby: {
      url: process.env.ALCHEMY_API_URL_KEY,
      accounts: [`0x${process.env.METAMASK_PRIVATE_KEY}`]
    },
    ropsten: {
      url: process.env.ALCHEMY_API_URL_KEY,
      accounts: [`0x${process.env.METAMASK_PRIVATE_KEY}`]
    }
  }
};

// npx hardhat run scripts/deploy.js --network rinkeby
// network task - send eth every once in a while to owner's address