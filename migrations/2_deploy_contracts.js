const ECDSA = artifacts.require("ECDSA")
var BLT = artifacts.require("./MockBLT.sol")
var AccountRegistryLogic = artifacts.require("AccountRegistryLogic")
var AttestationLogic = artifacts.require("AttestationLogic")
var BatchAttestationLogic = artifacts.require("BatchAttestationLogic")
var TokenEscrowMarketplace = artifacts.require("TokenEscrowMarketplace")
var AirdropProxy = artifacts.require("AirdropProxy")
var Poll = artifacts.require("Poll")
var VotingCenter = artifacts.require("VotingCenter")
var BatchInitializer = artifacts.require("BatchInitializer")

var zeroAddress = '0x0000000000000000000000000000000000000000'

const ipfs = require('./../src/ipfs')

module.exports = function (deployer) {

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

    .then(() => deployer.deploy(
      BatchAttestationLogic
    ))

    .then(() => batchInitializer.setRegistryLogic(registryLogic.address))
    .then(() => batchInitializer.setAttestationLogic(attestationLogic.address))
    .then(() => batchInitializer.setTokenEscrowMarketplace(tokenEscrowMarketplace.address))
    .then(() => batchInitializer.endInitialization(registryLogic.address))
    .then(() => batchInitializer.endInitialization(attestationLogic.address))

    .then(() => web3.eth.getAccounts())
    .then(acct => accounts = acct)

    .then(() => {
      // Give every user in the testrpc 100 BLT to make development easier
      return Promise.all(
        accounts.map(address => {
          token.gift(address, web3.utils.toWei('100', 'ether'))
        })
      )
    })
    .then(() => {
      // Give the airdropProxy BLT to airdrop
      token.gift(airdropProxy.address, web3.utils.toWei('100', 'ether'))
    })
    .then(() => {
      // Allow the escrow marketplace to spend 50 BLT for each user
      return Promise.all(
        accounts.map(address => {
          return token.approve(
            tokenEscrowMarketplace.address,
            web3.utils.toWei('50', 'ether'),
            {
              from: address,
            }
          )
        })
      )
    })
    .then(() => {
      // deposit tokens into marketplace for each user
      return Promise.all(
        accounts.map(address => {
          return tokenEscrowMarketplace.moveTokensToEscrowLockup(
            web3.utils.toWei('50', 'ether'),
            {
              from: address,
            }
          )
        })
      )
    })
    .then(() => deployer.deploy(VotingCenter))
    .then(() => VotingCenter.deployed())
    .then(vc => (votingCenter = vc))
    .then(() => {
      const pollTxs = []
      for (let i = 0; i < 5; i++) {
        const multihash = ipfs.toHex(
          'QmQZsTGeNPWDcoGcUvjEh2UpzYUQ6igoazSk2736Bt19VT'
        )
        const pollName = 'Bloom Poll'
        const daysUntilEnd = 600
        pollTxs.push(
          votingCenter.createPoll(
            pollName,
            1,
            multihash,
            4,
            Math.floor(+new Date() / 1000 + 5),
            Math.floor(+new Date() / 1000 + 60 * 60 * 24 * daysUntilEnd)
          )
        )
      }
      return Promise.all(pollTxs)
    })
    .then(() => new Promise(resolve => setTimeout(() => resolve(), 10000)))
    .then(() => votingCenter.allPolls.call())
    .then(pAddr => Promise.all(pAddr.map(Poll.at)))
    .then(polls => {
      const voteTxs = []
      polls.forEach(poll => {
        console.log(poll)
        accounts.forEach(account => {
          // Leave one account having not yet voted
          if (
            account.toLowerCase() !== '0x5bd995a55218baa26a6f25904bcc77805e11a337'
          ) {
            voteTxs.push(
              poll.vote(Math.floor(Math.random() * 3) + 1, { from: account })
            )
          }
        })
      })
      return Promise.all(voteTxs)
    })

    , {
      gas: 4712388,
      gasPrice: 2000000000
    }
}
