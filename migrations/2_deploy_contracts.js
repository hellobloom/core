var BLT = artifacts.require("./BLT.sol");
// var BLT = artifacts.require("./BLT.sol");
var AccountRegistry = artifacts.require("AccountRegistry");

module.exports = function(deployer) {
  deployer
    .deploy(BLT)
    .then(() => BLT.deployed())
    .then(blt => deployer.deploy(AccountRegistry, blt.address))
    .then(() => AccountRegistry.deployed());
};
