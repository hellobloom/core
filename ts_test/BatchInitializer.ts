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
const BatchInitializer = artifacts.require("BatchInitializer")
const BLT = artifacts.require("MockBLT")

contract("BatchInitializer", function([owner, admin, unrelated]) {
  let batchInitializer: BatchInitializerInstance
  let attestationLogic: AttestationLogicInstance
  let tokenEscrowMarketplace: TokenEscrowMarketplaceInstance
  let token: MockBLTInstance

  interface attestationMigration {
    requester: string
    attester: string
    subject: string
    dataHash: string
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
    batchInitializer = await BatchInitializer.new("0x0")
    attestationLogic = await AttestationLogic.new(batchInitializer.address, "0x0")
    tokenEscrowMarketplace = await TokenEscrowMarketplace.new(token.address, attestationLogic.address)
    await batchInitializer.setAttestationLogic(attestationLogic.address)
    await batchInitializer.setTokenEscrowMarketplace(tokenEscrowMarketplace.address)
    await batchInitializer.setAdmin(admin)
  })

  describe("Configuration", async () => {
    it("allows the owner to end initialization in attestation logic", async () => {
      await batchInitializer.endInitialization(attestationLogic.address, {from: owner}).should.be.fulfilled
    })

    it("Fails if address points to unrelated contract", async () => {
      await batchInitializer.endInitialization(tokenEscrowMarketplace.address, {from: owner}).should.be.rejectedWith(EVMThrow)
    })

    it("does not allow anyone else to end initialization", async () => {
      await batchInitializer.endInitialization(attestationLogic.address, {from: unrelated}).should.be.rejectedWith(EVMThrow)
    })

    it("allows the owner to configure contracts", async () => {
      await batchInitializer.setAdmin(unrelated, {from: owner}).should.be.fulfilled
      await batchInitializer.setTokenEscrowMarketplace(unrelated, {from: owner}).should.be.fulfilled
      await batchInitializer.setAttestationLogic(unrelated, {from: owner}).should.be.fulfilled
    })

    it("Sets TEM in attestationLogic", async () => {
      const addressBefore = await attestationLogic.tokenEscrowMarketplace.call()
      addressBefore.should.be.equal(tokenEscrowMarketplace.address)
      await batchInitializer.setTokenEscrowMarketplace(unrelated, {from: owner}).should.be.fulfilled
      const addressAfter = await attestationLogic.tokenEscrowMarketplace.call()
      addressAfter.should.be.equal(unrelated)
    })

    it("Does not allow anyone else to set interface contracts", async () => {
      await batchInitializer.setAdmin(unrelated, {from: admin}).should.be.rejectedWith(EVMThrow)
      await batchInitializer.setTokenEscrowMarketplace(unrelated, {from: admin}).should.be.rejectedWith(EVMThrow)
      await batchInitializer.setAttestationLogic(unrelated, {from: admin}).should.be.rejectedWith(EVMThrow)
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
