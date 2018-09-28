var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer) {
  deployer
  .then(() => deployer.deploy(Migrations,
    {
      gas: 300000,
      gasPrice: 5000000000
    }
  )
  .then(() => new Promise(resolve => setTimeout(() => resolve(), 10000)))
)
};
