const ECDSA = artifacts.require("ECDSA")
var BLT = artifacts.require("./MockBLT.sol")
var AccountRegistryLogic = artifacts.require("AccountRegistryLogic")
var SigningLogic = artifacts.require("SigningLogic")
var AttestationLogic = artifacts.require("AttestationLogic")
var TokenEscrowMarketplace = artifacts.require("TokenEscrowMarketplace")
var AirdropProxy = artifacts.require("AirdropProxy")
var Poll = artifacts.require("Poll")
var VotingCenter = artifacts.require("VotingCenter")
var BatchInitializer = artifacts.require("BatchInitializer")

var zeroAddress = '0x0000000000000000000000000000000000000000'

module.exports = function(deployer) {

  deployer
    .deploy(ECDSA)
    .then(() => deployer.link(ECDSA, AccountRegistryLogic))
    .then(() => deployer.link(ECDSA, AttestationLogic))
    .then(() => deployer.link(ECDSA, TokenEscrowMarketplace))
    .then(() => deployer.link(ECDSA, VotingCenter))
    .then(() => deployer.link(ECDSA, Poll))
    .then(() => deployer.deploy(BLT))
    .then(() => BLT.deployed())
    .then(blt => (token = blt))
    .then(() => deployer.deploy(BatchInitializer, zeroAddress, zeroAddress))
    .then(() => BatchInitializer.deployed())
    .then(bi => (batchInitializer = bi))
    .then(() => deployer.deploy(AccountRegistryLogic, batchInitializer.address))
    .then(() => AccountRegistryLogic.deployed())
    .then(rl => (registryLogic = rl))

    .then(() => deployer.deploy(AirdropProxy, token.address))
    .then(() => AirdropProxy.deployed())
    .then(ap => (airdropProxy = ap))

    .then(() =>
      deployer.deploy(
        AttestationLogic,
        batchInitializer.address,
        zeroAddress
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

    .then(() => batchInitializer.setRegistryLogic(registryLogic.address))
    .then(() => batchInitializer.setAttestationLogic(attestationLogic.address))
    .then(() => batchInitializer.setTokenEscrowMarketplace(tokenEscrowMarketplace.address))

    ,{
      gas: 4712388,
      gasPrice: 2000000000
    }
}
