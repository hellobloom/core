import "./test_setup"
import * as BigNumber from "bignumber.js"
import { AirdropProxyInstance } from "../contracts"
import { should } from "./test_setup"
import { MockBLTInstance } from "./../contracts"
import { EVMThrow } from "./helpers/EVMThrow"

const BLT = artifacts.require("MockBLT")
const AirdropProxy = artifacts.require("AirdropProxy")

contract("AirdropProxy", function([owner, alice, bob]) {
  let airdropProxy: AirdropProxyInstance
  let token: MockBLTInstance

  beforeEach(async () => {
    token = await BLT.new()
    airdropProxy = await AirdropProxy.new(token.address)
  })

  it("lets the owner add a manager", async () => {
    await airdropProxy.addManager(alice, { from: owner }).should.be.fulfilled
  })

  it("doesn't let a non-owner add a manager", async () => {
    await airdropProxy.addManager(alice, { from: bob }).should.be.rejectedWith(EVMThrow)
  })

  it("lets a manager send 8 BLT", async () => {
    await token.gift(airdropProxy.address, web3.toWei(new BigNumber("10"), "ether")).should.be.fulfilled

    await airdropProxy.addManager(alice, { from: owner }).should.be.fulfilled
    await airdropProxy.airdrop(bob, 8, { from: alice }).should.be.fulfilled
  })

  it("doesn't let a manager send 20 BLT", async () => {
    await token.gift(airdropProxy.address, web3.toWei(new BigNumber("10"), "ether")).should.be.fulfilled

    await airdropProxy.addManager(alice, { from: owner }).should.be.fulfilled

    await airdropProxy.airdrop(bob, web3.toWei(new BigNumber("20"), "ether"), { from: alice }).should.be.rejectedWith(EVMThrow)
  })

  it("doesn't let a non-manager send anything", async () => {
    await token.gift(airdropProxy.address, web3.toWei(new BigNumber("10"), "ether")).should.be.fulfilled

    await airdropProxy.airdrop(bob, 0.05, { from: alice }).should.be.rejectedWith(EVMThrow)
  })
})
