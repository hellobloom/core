const ECRecovery = artifacts.require("ECRecovery")
var BLT = artifacts.require("./MockBLT.sol")
var AccountRegistry = artifacts.require("AccountRegistry")
var AccountRegistryBatchAdmin = artifacts.require("AccountRegistryBatchAdmin")
var AccountRegistryLogic = artifacts.require("AccountRegistryLogic")
var SigningLogic = artifacts.require("SigningLogic")
var SigningLogicLegacy = artifacts.require("SigningLogicLegacy")
var AttestationRepo = artifacts.require("AttestationRepo")
var AttestationLogic = artifacts.require("AttestationLogic")
var TokenEscrowMarketplace = artifacts.require("TokenEscrowMarketplace")
var AttestationLogicUpgradeMode = artifacts.require("AttestationLogicUpgradeMode")
var AirdropProxy = artifacts.require("AirdropProxy")
var Poll = artifacts.require("Poll")

const adminAddress = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'


module.exports = function(deployer) {
  deployer.deploy(ECRecovery)
  deployer.link(ECRecovery, SigningLogic)
  deployer.link(ECRecovery, SigningLogicLegacy)
  deployer.link(ECRecovery, AttestationRepo)

  deployer
    .deploy(BLT)
    .then(() => BLT.deployed())
    .then(blt => (token = blt))
    .then(() => deployer.deploy(SigningLogic))
    .then(() => SigningLogic.deployed())
    .then(s => (signingLogic = s))

    .then(() => deployer.deploy(AccountRegistry, "0x0"))
    .then(() => AccountRegistry.deployed())
    .then(r => (registry = r))

    .then(() => deployer.deploy(AccountRegistryLogic, signingLogic.address, registry.address))
    .then(() => AccountRegistryLogic.deployed())
    .then(rl => (registryLogic = rl))

    .then(() => deployer.deploy(AccountRegistryBatchAdmin, registry.address, registryLogic.address))
    .then(() => AccountRegistryBatchAdmin.deployed())
    .then(rba => (registryBatchAdmin = rba))

    .then(() => deployer.deploy(AirdropProxy, token.address))
    .then(() => AirdropProxy.deployed())
    .then(ap => (airdropProxy = ap))
    .then(() => airdropProxy.transferOwnership(adminAddress))

    .then(() => deployer.deploy(
      AttestationRepo,
      token.address,
      "0x0"
    ))
    .then(() => AttestationRepo.deployed())
    .then(ar => (attestationRepo = ar))
    .then(() =>
      deployer.deploy(
        AttestationLogic,
        registry.address,
        attestationRepo.address,
        signingLogic.address,
        "0x0",
      ))
    .then(() => AttestationLogic.deployed())
    .then(al => (attestationLogic = al))

    .then(() => deployer.deploy(
      TokenEscrowMarketplace,
      token.address,
      registry.address,
      signingLogic.address,
      attestationLogic.address,
    ))
    .then(() => TokenEscrowMarketplace.deployed())
    .then(te => (tokenEscrowMarketplace = te))

    .then(() => deployer.deploy(
      AttestationLogicUpgradeMode,
      registry.address,
      attestationRepo.address,
    ))
    .then(() => AttestationLogicUpgradeMode.deployed())
    .then(a => attestationLogicUpgradeMode = a)
    .then(() => registry.setRegistryLogic(registryLogic.address))

    .then(() => registryLogic.createAccount(adminAddress))
    .then(() => registryLogic.setRegistryAdmin(adminAddress))
    .then(() => registryLogic.transferOwnership(adminAddress))
    .then(() => registry.transferOwnership(adminAddress))

    .then(() => tokenEscrowMarketplace.setMarketplaceAdmin(adminAddress))
    .then(() => tokenEscrowMarketplace.transferOwnership(adminAddress))
    
    .then(() => attestationLogicUpgradeMode.transferOwnership(adminAddress))

    .then(() => attestationLogic.setTokenEscrowMarketplace(tokenEscrowMarketplace.address))
    .then(() => attestationLogic.transferOwnership(adminAddress))

    .then(() => attestationRepo.setAttestationLogic(attestationLogic.address))
    .then(() => attestationRepo.transferOwnership(adminAddress))
    ,{
      gas: 4712388,
      gasPrice: 2000000000
    }
}
