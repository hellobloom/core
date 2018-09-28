import * as Web3 from "web3"
import * as BigNumber from "bignumber.js"
import * as ethereumjsWallet from "ethereumjs-wallet"

import { EVMThrow } from "./helpers/EVMThrow"
import { should } from "./test_setup"
import {
  AccreditationRepoInstance,
} from "../contracts"

const AccreditationRepo = artifacts.require("AccreditationRepo")

contract("AccreditationRepo", function (
  [alice, bob, mockAdmin, accreditedAttester, nonAccreditedAttester]
) {
  let accreditationRepo: AccreditationRepoInstance

  const aliceWallet = ethereumjsWallet.fromPrivateKey(
    new Buffer(
      "c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3",
      "hex"
    )
  )
  const alicePrivkey = aliceWallet.getPrivateKey()

  const bobWallet = ethereumjsWallet.fromPrivateKey(
    new Buffer(
      "ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f",
      "hex"
    )
  )
  const bobPrivkey = bobWallet.getPrivateKey()

  let aliceId: BigNumber.BigNumber
  let bobId: BigNumber.BigNumber

  // Sanity check
  if (alice != aliceWallet.getAddressString()) {
    throw new Error("Mnemonic used for truffle tests out of sync?")
  }

  // Sanity check
  if (bob != bobWallet.getAddressString()) {
    throw new Error("Mnemonic used for truffle tests out of sync?")
  }

  beforeEach(async () => {
    accreditationRepo = await AccreditationRepo.new(mockAdmin)
    await accreditationRepo.grantAccreditation(accreditedAttester, {from: mockAdmin})
  })

  context("Checking Accreditation", () => {
    it("Returns true if attester is accredited", async () => {
      const accreditationCheck = await accreditationRepo.accreditations(accreditedAttester).should.be.fulfilled
      accreditationCheck.should.be.equal(true)
    })

    it("Returns false if attester is not accredited", async () => {
      const accreditationCheck = await accreditationRepo.accreditations(nonAccreditedAttester).should.be.fulfilled
      accreditationCheck.should.be.equal(false)
    })
  })

  context("Granting Accreditation", () => {
    it("Allows admin to grant new accreditations", async () => {
      await accreditationRepo.grantAccreditation(nonAccreditedAttester, {from: mockAdmin}).should.be.fulfilled
      const accreditationCheck = await accreditationRepo.accreditations(nonAccreditedAttester)
      accreditationCheck.should.be.equal(true)
    })

    it("Fails if already accredited", async () => {
      await accreditationRepo.grantAccreditation(nonAccreditedAttester, {from: mockAdmin}).should.be.fulfilled
      await accreditationRepo.grantAccreditation(nonAccreditedAttester, {from: mockAdmin}).should.be.rejectedWith(EVMThrow)
    })

    it("Fails if called by non admin", async () => {
      await accreditationRepo.grantAccreditation(nonAccreditedAttester, {from: bob}).should.be.rejectedWith(EVMThrow)
      const accreditationCheck = await accreditationRepo.accreditations(nonAccreditedAttester)
      accreditationCheck.should.be.equal(false)
    })
  })

  context("Revoking Accreditation", () => {
    it("Allows admin to revoke accreditations", async () => {
      await accreditationRepo.revokeAccreditation(accreditedAttester, {from: mockAdmin}).should.be.fulfilled
      const accreditationCheck = await accreditationRepo.accreditations(accreditedAttester)
      accreditationCheck.should.be.equal(false)
    })

    it("Fails if already not accredited", async () => {
      await accreditationRepo.revokeAccreditation(nonAccreditedAttester, {from: mockAdmin}).should.be.rejectedWith(EVMThrow)
    })

    it("Fails if called by non admin", async () => {
      await accreditationRepo.revokeAccreditation(accreditedAttester, {from: bob}).should.be.rejectedWith(EVMThrow)
      const accreditationCheck = await accreditationRepo.accreditations(accreditedAttester)
      accreditationCheck.should.be.equal(true)
    })
  })

  describe("configuring the admin", async () => {
    let adminBefore: string

    beforeEach(async () => {
      adminBefore = await accreditationRepo.admin.call()
    })

    it("allows the owner to change the admin", async () => {
      await accreditationRepo.setAdmin(
        bob
      )
      const adminAfter = await accreditationRepo.admin()

      adminBefore.should.be.equal(mockAdmin)
      adminAfter.should.be.equal(bob)
    })

    it("doesn't allow anyone else to change the admin", async () => {
      await accreditationRepo
        .setAdmin(alice, {
          from: bob
        })
        .should.be.rejectedWith(EVMThrow)
      const adminAfter = await accreditationRepo.admin()

      adminBefore.should.be.equal(mockAdmin)
      adminAfter.should.be.equal(mockAdmin)
    })
  })

})
