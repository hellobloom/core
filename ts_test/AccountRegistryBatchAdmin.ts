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
  SigningLogicLegacyInstance,
  AccountRegistryLogicInstance,
  AccountRegistryInstance,
  AccountRegistryBatchAdminInstance,
} from "../contracts"
import { EVMThrow } from "./helpers/EVMThrow";
import * as ipfs from "./../src/ipfs";

import { should } from "./test_setup";
import { getFormattedTypedDataAddAddress } from "./helpers/signingLogicLegacy";

const AccountRegistry = artifacts.require("AccountRegistry");
const SigningLogic = artifacts.require("SigningLogicLegacy");
const AccountRegistryLogic = artifacts.require("AccountRegistryLogic");
const AccountRegistryBatchAdmin = artifacts.require("AccountRegistryBatchAdmin");

contract("AccountRegistryLogic", function ([owner, alice, bob, unclaimed]) {
  let registry: AccountRegistryInstance;
  let signingLogic: SigningLogicLegacyInstance;
  let registryLogic: AccountRegistryLogicInstance;
  let registryBatchAdmin: AccountRegistryBatchAdminInstance;

  let testAccounts: string[] = []
  for (let i = 0; i < 500; i++) {
    testAccounts.push(ethereumjsWallet.generate().getAddressString())
  }

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

  beforeEach(async () => {
    signingLogic = await SigningLogic.new();

    registry = await AccountRegistry.new("0x0");
    registryLogic = await AccountRegistryLogic.new(
      signingLogic.address,
      registry.address
    );
    registryBatchAdmin = await AccountRegistryBatchAdmin.new(
      registry.address,
      registryLogic.address
    )
    await registry.setRegistryLogic(registryLogic.address);
    await registryLogic.setRegistryAdmin(registryBatchAdmin.address);
  });

  describe("Batch loading", async () => {
    it("allows the admin to batch load accounts", async () => {
      await registryBatchAdmin.batchCreateAccount(testAccounts.slice(0, 105), {from: owner}).should.be.fulfilled
      await testAccounts.slice(0, 105).map(async account => {
        await registry.addressBelongsToAccount.call(account).then(exists => exists.should.equal(true))
      })
    });

    it("Does note allow anyone else to batch load", async () => {
      await registryBatchAdmin.batchCreateAccount(testAccounts.slice(0, 105), {from: alice}).should.be.rejectedWith(EVMThrow)
    });

    interface AddressSkippedArgs {
      skippedAddress: string;
    }

    it("emits and event if it skips already created accounts", async () => {
      await registryBatchAdmin.batchCreateAccount(testAccounts.slice(0, 5), {from: owner}).should.be.fulfilled
      const {logs} = ((await registryBatchAdmin.batchCreateAccount(
        testAccounts.slice(0, 10),
        {from: owner})
      ) as Web3.TransactionReceipt<any>) as Web3.TransactionReceipt<
        AddressSkippedArgs
      >;

      console.log(logs)

      const matchingLog = logs.find(
        log => log.event === 'addressSkipped'
      )

      should.exist(matchingLog);

      console.log(matchingLog)
    });

  })

});
