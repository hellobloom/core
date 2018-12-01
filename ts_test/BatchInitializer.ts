import * as BigNumber from "bignumber.js"
import * as Web3 from "web3"
import * as ethereumjsWallet from "ethereumjs-wallet"
const walletTools = require("ethereumjs-wallet")
const { privateToAddress } = require("ethereumjs-util")
import { signAddress } from "./../src/signAddress"
const ethSigUtil = require("eth-sig-util")
const { soliditySha3 } = require("web3-utils")
const uuid = require("uuidv4")
import { bufferToHex } from "ethereumjs-util"
import { hashData } from "./../src/signData"

import {
  AttestationLogicInstance,
  AccountRegistryLogicInstance,
  TokenEscrowMarketplaceInstance,
  MockBLTInstance,
  BatchInitializerInstance
} from "../truffle"
import { EVMThrow } from "./helpers/EVMThrow"
import * as ipfs from "./../src/ipfs"

import { should } from "./test_setup"
import { getFormattedTypedDataAddAddress } from "./helpers/signingLogicLegacy"
import { HashingLogic } from "@bloomprotocol/attestations-lib"

const AttestationLogic = artifacts.require("AttestationLogic")
const TokenEscrowMarketplace = artifacts.require("TokenEscrowMarketplace")
const AccountRegistryLogic = artifacts.require("AccountRegistryLogic")
const BatchInitializer = artifacts.require("BatchInitializer")
const BLT = artifacts.require("MockBLT")

contract("BatchInitializer", function([owner, admin, unrelated]) {
  let registryLogic: AccountRegistryLogicInstance
  let batchInitializer: BatchInitializerInstance
  let attestationLogic: AttestationLogicInstance
  let tokenEscrowMarketplace: TokenEscrowMarketplaceInstance
  let token: MockBLTInstance

  interface addressLink {
    currentAddress: string
    newAddress: string
  }

  interface attestationMigration {
    requester: string
    attester: string
    subject: string
    dataHash: string
  }

  let testLinks: addressLink[] = []
  for (let i = 0; i < 500; i++) {
    testLinks.push({
      currentAddress: ethereumjsWallet.generate().getAddressString(),
      newAddress: ethereumjsWallet.generate().getAddressString()
    })
  }

  let testAttestations: attestationMigration[] = []
  for (let i = 0; i < 500; i++) {
    testAttestations.push({
      requester: ethereumjsWallet.generate().getAddressString(),
      attester: ethereumjsWallet.generate().getAddressString(),
      subject: ethereumjsWallet.generate().getAddressString(),
      dataHash: HashingLogic.generateNonce()
    })
  }

  beforeEach(async () => {
    token = await BLT.new()
    batchInitializer = await BatchInitializer.new("0x0", "0x0")
    registryLogic = await AccountRegistryLogic.new(batchInitializer.address)
    attestationLogic = await AttestationLogic.new(batchInitializer.address, "0x0")
    tokenEscrowMarketplace = await TokenEscrowMarketplace.new(token.address, attestationLogic.address)
    await batchInitializer.setAttestationLogic(attestationLogic.address)
    await batchInitializer.setRegistryLogic(registryLogic.address)
    await batchInitializer.setTokenEscrowMarketplace(tokenEscrowMarketplace.address)
    await batchInitializer.setAdmin(admin)
  })

  describe("Configuration", async () => {
    it("allows the owner to end initialization in attestation logic", async () => {
      await batchInitializer.endInitialization(attestationLogic.address, {from: owner}).should.be.fulfilled
    })
    it("allows the owner to end initialization in registry", async () => {
      await batchInitializer.endInitialization(registryLogic.address, {from: owner}).should.be.fulfilled
    })

    it("Fails if address points to unrelated contract", async () => {
      await batchInitializer.endInitialization(tokenEscrowMarketplace.address, {from: owner}).should.be.rejectedWith(EVMThrow)
    })

    it("does not allow anyone else to end initialization", async () => {
      await batchInitializer.endInitialization(registryLogic.address, {from: unrelated}).should.be.rejectedWith(EVMThrow)
    })

    it("allows the owner to configure contracts", async () => {
      await batchInitializer.setAdmin(unrelated, {from: owner}).should.be.fulfilled
      await batchInitializer.setTokenEscrowMarketplace(unrelated, {from: owner}).should.be.fulfilled
      await batchInitializer.setAttestationLogic(unrelated, {from: owner}).should.be.fulfilled
      await batchInitializer.setRegistryLogic(unrelated, {from: owner}).should.be.fulfilled
    })

    it("Does not allow anyone else to set interface contracts", async () => {
      await batchInitializer.setAdmin(unrelated, {from: admin}).should.be.rejectedWith(EVMThrow)
      await batchInitializer.setTokenEscrowMarketplace(unrelated, {from: admin}).should.be.rejectedWith(EVMThrow)
      await batchInitializer.setAttestationLogic(unrelated, {from: admin}).should.be.rejectedWith(EVMThrow)
      await batchInitializer.setRegistryLogic(unrelated, {from: admin}).should.be.rejectedWith(EVMThrow)
    })

  })

  describe("Batch loading accounts", async () => {
    it("allows the admin to batch load accounts links", async () => {
      const numlinks = 50
      const currentAddresses = testLinks.slice(0, numlinks).map(a => a.currentAddress)
      const newAddresses = testLinks.slice(0, numlinks).map(a => a.newAddress)
      await batchInitializer.batchLinkAddresses(currentAddresses, newAddresses, { from: admin }).should.be.fulfilled
      let i = 0
      for (let link of testLinks.slice(0, numlinks)) {
        i++
        const linkIdA = await registryLogic.linkIds.call(link.currentAddress)
        linkIdA.should.be.bignumber.greaterThan(0)
        linkIdA.should.be.bignumber.equal(new BigNumber(i))
        const linkIdB = await registryLogic.linkIds.call(link.newAddress)
        linkIdB.should.be.bignumber.equal(linkIdA)
      }
    })

    it("Fails if initialization ended", async () => {
      const numlinks = 50
      const currentAddresses = testLinks.slice(0, numlinks).map(a => a.currentAddress)
      const newAddresses = testLinks.slice(0, numlinks).map(a => a.newAddress)
      await batchInitializer.endInitialization(registryLogic.address, {from: owner}).should.be.fulfilled
      await batchInitializer.batchLinkAddresses(currentAddresses, newAddresses, { from: admin }).should.be.rejectedWith(EVMThrow)
    })

    it("Fails if lengths of args are not equal", async () => {
      const numlinks = 50
      const currentAddresses = testLinks.slice(0, numlinks).map(a => a.currentAddress)
      const newAddresses = testLinks.slice(0, numlinks - 1).map(a => a.newAddress)
      await batchInitializer.batchLinkAddresses(currentAddresses, newAddresses, { from: admin }).should.be.rejectedWith(EVMThrow)
    })

    it("Fails if lengths of args are not equal", async () => {
      const numlinks = 50
      const currentAddresses = testLinks.slice(0, numlinks - 1).map(a => a.currentAddress)
      const newAddresses = testLinks.slice(0, numlinks).map(a => a.newAddress)
      await batchInitializer.batchLinkAddresses(currentAddresses, newAddresses, { from: admin }).should.be.rejectedWith(EVMThrow)
    })

    it("Does note allow anyone else to batch load", async () => {
      const numlinks = 50
      const currentAddresses = testLinks.slice(0, numlinks).map(a => a.currentAddress)
      const newAddresses = testLinks.slice(0, numlinks).map(a => a.newAddress)
      await batchInitializer.batchLinkAddresses(currentAddresses, newAddresses, { from: unrelated }).should.be.rejectedWith(EVMThrow)
    })

    interface LinkSkippedArgs {
      currentAddress: string
      newAddress: string
    }

    it("emits and event if it skips already created accounts", async () => {
      let numlinks = 5
      let currentAddresses = testLinks.slice(0, numlinks).map(a => a.currentAddress)
      let newAddresses = testLinks.slice(0, numlinks).map(a => a.newAddress)
      await batchInitializer.batchLinkAddresses(currentAddresses, newAddresses, { from: admin }).should.be.fulfilled
      numlinks = 10
      currentAddresses = testLinks.slice(0, numlinks).map(a => a.currentAddress)
      newAddresses = testLinks.slice(0, numlinks).map(a => a.newAddress)
      const { logs } = ((await batchInitializer.batchLinkAddresses(currentAddresses, newAddresses, { from: admin })) as Web3.TransactionReceipt<
        any
      >) as Web3.TransactionReceipt<LinkSkippedArgs>

      const matchingLog = logs.find(log => log.event === "linkSkipped")

      should.exist(matchingLog)

      logs.length.should.be.equal(5)
      console.log(matchingLog)
    })
  })
  describe("Batch loading attestations", async () => {
    it("allows the admin to batch load attestations", async () => {
      const numAttestations = 250
      const requesters = testAttestations.slice(0, numAttestations).map(a => a.requester)
      const attesters = testAttestations.slice(0, numAttestations).map(a => a.attester)
      const subjects = testAttestations.slice(0, numAttestations).map(a => a.subject)
      const dataHashes = testAttestations.slice(0, numAttestations).map(a => a.dataHash)
      await batchInitializer.batchMigrateAttestations(requesters, attesters, subjects, dataHashes, { from: admin }).should.be.fulfilled
    })
    it("Fails if initialization ended", async () => {
      const numAttestations = 250
      const requesters = testAttestations.slice(0, numAttestations).map(a => a.requester)
      const attesters = testAttestations.slice(0, numAttestations).map(a => a.attester)
      const subjects = testAttestations.slice(0, numAttestations).map(a => a.subject)
      const dataHashes = testAttestations.slice(0, numAttestations).map(a => a.dataHash)
      await batchInitializer.endInitialization(attestationLogic.address, {from: owner}).should.be.fulfilled
      await batchInitializer.batchMigrateAttestations(requesters, attesters, subjects, dataHashes, { from: admin }).should.be.rejectedWith(EVMThrow)
    })

    it("Fails if lengths of args not equal", async () => {
      const numAttestations = 250
      const requesters = testAttestations.slice(0, numAttestations - 1).map(a => a.requester)
      const attesters = testAttestations.slice(0, numAttestations).map(a => a.attester)
      const subjects = testAttestations.slice(0, numAttestations).map(a => a.subject)
      const dataHashes = testAttestations.slice(0, numAttestations).map(a => a.dataHash)
      await batchInitializer.batchMigrateAttestations(requesters, attesters, subjects, dataHashes, { from: admin }).should.be.rejectedWith(EVMThrow)
    })

    it("Fails if lengths of args not equal", async () => {
      const numAttestations = 250
      const requesters = testAttestations.slice(0, numAttestations).map(a => a.requester)
      const attesters = testAttestations.slice(0, numAttestations - 1).map(a => a.attester)
      const subjects = testAttestations.slice(0, numAttestations).map(a => a.subject)
      const dataHashes = testAttestations.slice(0, numAttestations).map(a => a.dataHash)
      await batchInitializer.batchMigrateAttestations(requesters, attesters, subjects, dataHashes, { from: admin }).should.be.rejectedWith(EVMThrow)
    })

    it("Fails if lengths of args not equal", async () => {
      const numAttestations = 250
      const requesters = testAttestations.slice(0, numAttestations).map(a => a.requester)
      const attesters = testAttestations.slice(0, numAttestations).map(a => a.attester)
      const subjects = testAttestations.slice(0, numAttestations - 1).map(a => a.subject)
      const dataHashes = testAttestations.slice(0, numAttestations).map(a => a.dataHash)
      await batchInitializer.batchMigrateAttestations(requesters, attesters, subjects, dataHashes, { from: admin }).should.be.rejectedWith(EVMThrow)
    })

    it("Fails if lengths of args not equal", async () => {
      const numAttestations = 250
      const requesters = testAttestations.slice(0, numAttestations).map(a => a.requester)
      const attesters = testAttestations.slice(0, numAttestations).map(a => a.attester)
      const subjects = testAttestations.slice(0, numAttestations).map(a => a.subject)
      const dataHashes = testAttestations.slice(0, numAttestations - 1).map(a => a.dataHash)
      await batchInitializer.batchMigrateAttestations(requesters, attesters, subjects, dataHashes, { from: admin }).should.be.rejectedWith(EVMThrow)
    })

    it("Fails if lengths of args not equal", async () => {
      const numAttestations = 250
      const requesters = testAttestations.slice(0, numAttestations).map(a => a.requester)
      const attesters = testAttestations.slice(0, numAttestations - 3).map(a => a.attester)
      const subjects = testAttestations.slice(0, numAttestations - 2).map(a => a.subject)
      const dataHashes = testAttestations.slice(0, numAttestations - 1).map(a => a.dataHash)
      await batchInitializer.batchMigrateAttestations(requesters, attesters, subjects, dataHashes, { from: admin }).should.be.rejectedWith(EVMThrow)
    })

    it("Does note allow anyone else to batch load", async () => {
      const numAttestations = 50
      const requesters = testAttestations.slice(0, numAttestations).map(a => a.requester)
      const attesters = testAttestations.slice(0, numAttestations).map(a => a.attester)
      const subjects = testAttestations.slice(0, numAttestations).map(a => a.subject)
      const dataHashes = testAttestations.slice(0, numAttestations).map(a => a.dataHash)
      await batchInitializer
        .batchMigrateAttestations(requesters, attesters, subjects, dataHashes, { from: unrelated })
        .should.be.rejectedWith(EVMThrow)
    })
  })
})
