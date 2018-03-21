const ECRecovery = artifacts.require("ECRecovery");
var BLT = artifacts.require("./BLT.sol");
var AccountRegistry = artifacts.require("AccountRegistry");
var InviteCollateralizer = artifacts.require("InviteCollateralizer");
var Poll = artifacts.require("Poll");

module.exports = function(deployer) {
  deployer.deploy(ECRecovery);
  deployer.link(ECRecovery, AccountRegistry);
  deployer
    .deploy(BLT, "0x0")
    .then(() => BLT.deployed())
    .then(blt => (token = blt))
    .then(() =>
      deployer.deploy(
        InviteCollateralizer,
        token.address,
        "0x9d217bcBD0Bfae4D7f8f12c7702108D162e3Ab79"
      )
    )
    .then(() => InviteCollateralizer.deployed())
    .then(c => (collateralizer = c))
    .then(blt =>
      deployer.deploy(AccountRegistry, blt.address, collateralizer.address)
    )
    .then(() => AccountRegistry.deployed());
};
