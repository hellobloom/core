const ECRecovery = artifacts.require("ECRecovery")
var BLT = artifacts.require("./MockBLT.sol")
var AccountRegistryLogic = artifacts.require("AccountRegistryLogic")
var SigningLogic = artifacts.require("SigningLogic")
var AttestationLogic = artifacts.require("AttestationLogic")
var TokenEscrowMarketplace = artifacts.require("TokenEscrowMarketplace")
var AirdropProxy = artifacts.require("AirdropProxy")
var Poll = artifacts.require("Poll")
var VotingCenter = artifacts.require("VotingCenter")

const adminAddress = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'


module.exports = function(deployer) {

  deployer
    .deploy(ECRecovery)
    .then(() => deployer.link(ECRecovery, AccountRegistryLogic))
    .then(() => deployer.link(ECRecovery, AttestationLogic))
    .then(() => deployer.link(ECRecovery, TokenEscrowMarketplace))
    .then(() => deployer.link(ECRecovery, VotingCenter))
    .then(() => deployer.deploy(BLT))
    .then(() => BLT.deployed())
    .then(blt => (token = blt))
    .then(() => deployer.deploy(AccountRegistryLogic, adminAddress))
    .then(() => AccountRegistryLogic.deployed())
    .then(rl => (registryLogic = rl))

    .then(() => deployer.deploy(AirdropProxy, token.address))
    .then(() => AirdropProxy.deployed())
    .then(ap => (airdropProxy = ap))
    .then(() => airdropProxy.transferOwnership(adminAddress))

    .then(() =>
      deployer.deploy(
        AttestationLogic,
        adminAddress,
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

    .then(() => attestationLogic.setTokenEscrowMarketplace(tokenEscrowMarketplace.address))
    .then(() => attestationLogic.endInitialization())

    ,{
      gas: 4712388,
      gasPrice: 2000000000
    }
}
