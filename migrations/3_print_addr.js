var fs = require('fs')

var BLT = artifacts.require('./MockBLT.sol')
var AccountRegistryLogic = artifacts.require('AccountRegistryLogic')
var AttestationLogic = artifacts.require('AttestationLogic')
var TokenEscrowMarketplace = artifacts.require('TokenEscrowMarketplace')
var VotingCenter = artifacts.require('VotingCenter')
var AirdropProxy = artifacts.require('AirdropProxy')
var BatchAttestationLogic = artifacts.require("BatchAttestationLogic")

module.exports = function (deployer) {
  var contractEnv = {}

  deployer
    .then(() => AccountRegistryLogic.deployed())
    .then(a => console.log('ACCOUNT_REGISTRY_LOGIC_ADDRESS: ', a.address, '\n'))
    .then(() => VotingCenter.deployed())
    .then(a => console.log('VOTING_CENTER_ADDRESS: ', a.address))
    .then(() => BLT.deployed())
    .then(a => console.log('BLT_ADDRESS: ', a.address))
    .then(() => AttestationLogic.deployed())
    .then(a => console.log('ATTESTATION_LOGIC_ADDRESS: ', a.address))
    .then(() => TokenEscrowMarketplace.deployed())
    .then(a => console.log('TOKEN_ESCROW_MARKETPLACE_ADDRESS: ', a.address))
    .then(() => AirdropProxy.deployed())
    .then(a => console.log('AIRDROP_PROXY_ADDRESS: ', a.address))
    .then(() => BatchAttestationLogic.deployed())
    .then(a => console.log('BATCH_ATTESTATION_LOGIC_ADDRESS: ', a.address))
}
