import * as BigNumber from "bignumber.js";
import * as Web3 from "web3";
import * as ethereumjsWallet from "ethereumjs-wallet";
const walletTools = require("ethereumjs-wallet");
const { privateToAddress } = require("ethereumjs-util");
import { signAddress } from "./../src/signAddress";
const ethSigUtil = require("eth-sig-util");
const { soliditySha3 } = require("web3-utils");
const uuid = require('uuidv4')
import { bufferToHex } from "ethereumjs-util";
import { hashData } from "./../src/signData";

import {
  SigningLogicInstance,
  AccountRegistryLogicInstance,
  AccountRegistryInstance
} from "../contracts"
// import { AccountRegistryInstance} from "./../truffle";
import { EVMThrow } from "./helpers/EVMThrow";
import * as ipfs from "./../src/ipfs";

import { should } from "./test_setup";

const AccountRegistry = artifacts.require("AccountRegistry");
const SigningLogic = artifacts.require("SigningLogic");
const AccountRegistryLogic = artifacts.require("AccountRegistryLogic");

contract("AccountRegistry", function ([owner, alice, bob, unclaimed, unclaimedB]) {
  let registry: AccountRegistryInstance;
  let signingLogic: SigningLogicInstance;
  let registryLogic: AccountRegistryLogicInstance;

  let invitePrivateKey: Buffer;
  let invitePublicAddress: string;
  let inviterSecret: string;
  let recipientSecret: string;

  const aliceWallet = ethereumjsWallet.fromPrivateKey(
    new Buffer(
      "ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f",
      "hex"
    )
  );
  const alicePrivkey = aliceWallet.getPrivateKey();

  const bobWallet = ethereumjsWallet.fromPrivateKey(
    new Buffer(
      "0dbbe8e4ae425a6d2687f1a7e3ba17bc98c673636790f1b8ad91193c05875ef1",
      "hex"
    )
  );
  const bobPrivkey = bobWallet.getPrivateKey();

  const unclaimedWallet = ethereumjsWallet.fromPrivateKey(
    new Buffer(
      "c88b703fb08cbea894b6aeff5a544fb92e78a18e19814cd85da83b71f772aa6c",
      "hex"
    )
  );
  const unclaimedPrivkey = unclaimedWallet.getPrivateKey();

  const unclaimedWalletB = ethereumjsWallet.fromPrivateKey(
    new Buffer(
      "388c684f0ba1ef5017716adb5d21a053ea8e90277d0868337519f97bede61418",
      "hex"
    )
  );
  const unclaimedPrivkeyB = unclaimedWalletB.getPrivateKey();

  let aliceId: BigNumber.BigNumber;
  let bobId: BigNumber.BigNumber;

  // Sanity check
  if (alice != aliceWallet.getAddressString()) {
    throw new Error("Mnemonic used for truffle tests out of sync?");
  }

  // Sanity check
  if (bob != bobWallet.getAddressString()) {
    throw new Error("Mnemonic used for truffle tests out of sync?");
  }

  // Sanity check
  if (unclaimed != unclaimedWallet.getAddressString()) {
    throw new Error("Mnemonic used for truffle tests out of sync?");
  }

  // Sanity check
  if (unclaimedB != unclaimedWalletB.getAddressString()) {
    throw new Error("Mnemonic used for truffle tests out of sync?");
  }

  const signFor = (user: string) =>
    signAddress({
      address: user,
      privKey: invitePrivateKey
    });

  beforeEach(async () => {
    signingLogic = await SigningLogic.new();

    registry = await AccountRegistry.new("0x0");
    registryLogic = await AccountRegistryLogic.new(
      signingLogic.address,
      registry.address
    );
    await registry.setRegistryLogic(registryLogic.address);
    await registryLogic.createAccount(owner);

    invitePrivateKey = walletTools.generate().getPrivateKey();
    invitePublicAddress =
      "0x" + privateToAddress(invitePrivateKey).toString("hex");
    inviterSecret = signFor(owner);
    recipientSecret = signFor(alice);
  });

  describe("configuring the registry logic", async () => {
    let differentRegistryLogic: AccountRegistryLogicInstance;
    let registryLogicAddressBefore: string;

    beforeEach(async () => {
      differentRegistryLogic = await AccountRegistryLogic.new(signingLogic.address, registry.address);
      registryLogicAddressBefore = await registry.accountRegistryLogic.call();
    });

    it("allows the owner to change the registry logic", async () => {
      await registry.setRegistryLogic(differentRegistryLogic.address);
      const registryLogicAddressAfter = await registry.accountRegistryLogic.call();

      registryLogicAddressBefore.should.be.equal(registryLogic.address);
      registryLogicAddressAfter.should.be.equal(
        differentRegistryLogic.address
      );
    });

    it("doesn't allow anyone else to change the signing logic", async () => {
      await registry
        .setRegistryLogic(differentRegistryLogic.address, {
          from: alice
        })
        .should.be.rejectedWith(EVMThrow);
      const registryLogicAddressAfter = await registry.accountRegistryLogic.call();

      registryLogicAddressBefore.should.be.equal(registryLogic.address);
      registryLogicAddressAfter.should.be.equal(registryLogic.address);
    });
  });

  describe("Acting as Account Registry Logic", async () => {
    beforeEach(async () => {
      registry.setRegistryLogic(owner);
    });
    it("Allows registry logic to create a new account", async () => {
      await registry.createNewAccount(alice).should.be.fulfilled
    });


    it("Does not allow duplicate accounts to be created", async () => {
      await registry.createNewAccount(alice)
      await registry.createNewAccount(alice).should.be.rejectedWith(EVMThrow)
    });

    it("Does not allow anyone else to create accounts", async () => {
      await registry.createNewAccount(alice, { from: bob }).should.be.rejectedWith(EVMThrow)
    });

    it("Allows registry logic to add additional address to account", async () => {
      await registry.createNewAccount(alice)
      await registry.addAddressToAccount(unclaimed, alice).should.be.fulfilled
      const newId = await registry.accountIdForAddress.call(unclaimed)
      const aliceId = await registry.accountIdForAddress.call(alice)
      newId.should.bignumber.equal(aliceId)
    });


    it("Does not allow address to be added if it belongs to another account", async () => {
      await registry.createNewAccount(alice)
      await registry.createNewAccount(unclaimed)
      await registry.addAddressToAccount(unclaimed, alice).should.rejectedWith(EVMThrow)
    });

    it("Does not allow anyone else to add additional addresses", async () => {
      await registry.createNewAccount(alice)
      await registry.addAddressToAccount(unclaimed, alice, {from: alice}).should.rejectedWith(EVMThrow)
    });

    it("Allows registry logic to remove a new address from an account", async () => {
      await registry.createNewAccount(alice)
      await registry.addAddressToAccount(unclaimed, alice).should.be.fulfilled
      await registry.removeAddressFromAccount(unclaimed).should.be.fulfilled
      await registry.accountIdForAddress(unclaimed).should.be.rejectedWith(EVMThrow)
      const unclaimedExists = await registry.addressBelongsToAccount(unclaimed)
      unclaimedExists.should.equal(false)
    });

    it("Does not allow anyone else to remove address from account", async () => {
      await registry.createNewAccount(alice)
      await registry.addAddressToAccount(unclaimed, alice).should.be.fulfilled
      await registry.removeAddressFromAccount(unclaimed, {from: alice}).should.be.rejectedWith(EVMThrow)
      await registry.accountIdForAddress(unclaimed).should.be.fulfilled
      const unclaimedExists = await registry.addressBelongsToAccount(unclaimed)
      unclaimedExists.should.equal(true)
    });


    it("Allows registry logic to remove the original address from an account", async () => {
      await registry.createNewAccount(alice)
      const aliceId = await registry.accountIdForAddress.call(alice)
      await registry.addAddressToAccount(unclaimed, alice).should.be.fulfilled
      await registry.removeAddressFromAccount(alice).should.be.fulfilled
      await registry.accountIdForAddress(alice).should.be.rejectedWith(EVMThrow)
      const aliceExists = await registry.addressBelongsToAccount(alice)
      aliceExists.should.equal(false)
      const unclaimedId = await registry.accountIdForAddress.call(unclaimed)
      unclaimedId.should.bignumber.equal(aliceId)
    });

    it("Does not allow anyone else to remove an address from an account", async () => {
      await registry.createNewAccount(alice)
      await registry.addAddressToAccount(unclaimed, alice).should.be.fulfilled
      await registry.removeAddressFromAccount(unclaimed, { from: alice }).should.be.rejectedWith(EVMThrow)
    });

    it("Allows only address to be removed from an account", async () => {
      await registry.createNewAccount(alice)
      await registry.removeAddressFromAccount(alice).should.be.fulfilled
    });
  });
});
