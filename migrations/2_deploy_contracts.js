const ECRecovery = artifacts.require("ECRecovery")
var BLT = artifacts.require("./MockBLT.sol")
var SigningLogic = artifacts.require("SigningLogic")
var AttestationLogic = artifacts.require("AttestationLogic")
var TokenEscrowMarketplace = artifacts.require("TokenEscrowMarketplace")
var AirdropProxy = artifacts.require("AirdropProxy")
var Poll = artifacts.require("Poll")
var VotingCenter = artifacts.require("VotingCenter")
var BatchInitializer = artifacts.require("BatchInitializer")

module.exports = function(deployer) {

  deployer
    .deploy(ECRecovery)
    .then(() => deployer.link(ECRecovery, AttestationLogic))
    .then(() => deployer.link(ECRecovery, TokenEscrowMarketplace))
    .then(() => deployer.link(ECRecovery, VotingCenter))
    .then(() => deployer.link(ECRecovery, Poll))
    .then(() => deployer.deploy(BLT))
    .then(() => BLT.deployed())
    .then(blt => (token = blt))
    .then(() => deployer.deploy(BatchInitializer, '0x0'))
    .then(() => BatchInitializer.deployed())
    .then(bi => (batchInitializer = bi))

    .then(() => deployer.deploy(AirdropProxy, token.address))
    .then(() => AirdropProxy.deployed())
    .then(ap => (airdropProxy = ap))

    .then(() =>
      deployer.deploy(
        AttestationLogic,
        batchInitializer.address,
        "0x0"
      ))
    .then(() => AttestationLogic.deployed())
    .then(al => (attestationLogic = al))

    .then(() => deployer.deploy(
      TokenEscrowMarketplace,
      token.address,
      attestationLogic.address,
    ))
    .then(() => TokenEscrowMarketplace.deployed())
    .then(te => (tokenEscrowMarketplace = te))

    .then(() => batchInitializer.setAttestationLogic(attestationLogic.address))
    .then(() => batchInitializer.setTokenEscrowMarketplace(tokenEscrowMarketplace.address))

    ,{
      gas: 4712388,
      gasPrice: 2000000000
    }
}
