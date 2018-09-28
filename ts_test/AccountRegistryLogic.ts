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
  AccountRegistryInstance
} from "../contracts"
import { EVMThrow } from "./helpers/EVMThrow";
import * as ipfs from "./../src/ipfs";

import { should } from "./test_setup";
import { getFormattedTypedDataAddAddress } from "./helpers/signingLogicLegacy";

const AccountRegistry = artifacts.require("AccountRegistry");
const SigningLogic = artifacts.require("SigningLogicLegacy");
const AccountRegistryLogic = artifacts.require("AccountRegistryLogic");

contract("AccountRegistryLogic", function ([owner, alice, bob, unclaimed, unclaimedB]) {
  let registry: AccountRegistryInstance;
  let signingLogic: SigningLogicLegacyInstance;
  let registryLogic: AccountRegistryLogicInstance;

  let invitePrivateKey: Buffer;
  let invitePublicAddress: string;
  let inviterSecret: string;
  let recipientSecret: string;

  // Keys come from default ganache mnemonic

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

  const nonce = uuid()
  const differentNonce = uuid()
  const nonceHash = bufferToHex(hashData(nonce))
  const differentNonceHash = bufferToHex(hashData(differentNonce))

    const newAddressSig = ethSigUtil.signTypedDataLegacy(
      unclaimedPrivkey,
      {data: getFormattedTypedDataAddAddress(
        alice,
        nonceHash
      )}
    )

    const senderSig = ethSigUtil.signTypedDataLegacy(
      alicePrivkey,
      {data: getFormattedTypedDataAddAddress(
        unclaimed,
        nonceHash
      )}
    )

  describe("Invitations", async () => {
    it("allows existing users to create invites", async () => {
      const inviteExistsBefore = await registryLogic.pendingInvites(invitePublicAddress);
      inviteExistsBefore.should.equal(false)
      await registryLogic.createInvite(inviterSecret).should.be.fulfilled;
      const inviteExistsAfter = await registryLogic.pendingInvites(invitePublicAddress);
      inviteExistsAfter.should.equal(true)
    });

    interface InviteEventArgs {
      inviter: string;
      inviteAddress: string;
    }

    it("emits an event when an invite is created", async () => {
      const { logs } = ((await registryLogic.createInvite(inviterSecret)
      ) as Web3.TransactionReceipt<any>) as Web3.TransactionReceipt<
        InviteEventArgs
      >;
      
      const matchingLog = logs.find(
        log => log.event === "InviteCreated"
      );

      should.exist(matchingLog);
      if (!matchingLog) return;

      matchingLog.args.inviter.should.equal(owner);
      matchingLog.args.inviteAddress.should.equal(invitePublicAddress)
    });

    it("does not allow people to accept invites if they are already a user", async () => {
      await registryLogic.createAccount(alice);

      await registryLogic.createInvite(inviterSecret);
      await registryLogic
        .acceptInvite(recipientSecret, { from: alice })
        .should.be.rejectedWith(EVMThrow);
    });

    it("fails if the inviter provided during acceptInvite is wrong", async () => {
      await registryLogic.createInvite(inviterSecret);
      await registryLogic
        .acceptInvite(recipientSecret, { from: bob })
        .should.be.rejectedWith(EVMThrow);
    });

    it("accepts the invite if the secret and owner are both correct", async () => {
      (await registry.addressBelongsToAccount(alice)).should.be.false;

      await registryLogic.createInvite(inviterSecret);
      await registryLogic.acceptInvite(recipientSecret, { from: alice });

      (await registry.addressBelongsToAccount(alice)).should.be.true;
    });

    interface InviteAcceptedEventArgs {
      recipient: string;
      inviteAddress: string;
    }

    it("emits an event when an invite is accepted", async () => {
      await registryLogic.createInvite(inviterSecret);
      const { logs } = ((await registryLogic.acceptInvite(recipientSecret, {
        from: alice
      })
      ) as Web3.TransactionReceipt<any>) as Web3.TransactionReceipt<
        InviteAcceptedEventArgs
      >;

      const matchingLog = logs.find(
        log => log.event === "InviteAccepted"
      );

      should.exist(matchingLog);
      if (!matchingLog) return;

      matchingLog.args.recipient.should.equal(alice)
      matchingLog.args.inviteAddress.should.equal(invitePublicAddress)

    });
  });

  describe("configuring the signing logic", async () => {
    let differentSigningLogic: SigningLogicLegacyInstance;
    let signingLogicAddressBefore: string;

    beforeEach(async () => {
      differentSigningLogic = await SigningLogic.new();
      signingLogicAddressBefore = await registryLogic.signingLogic.call();
    });

    it("allows the owner to change the signing logic", async () => {
      await registryLogic.setSigningLogic(differentSigningLogic.address);
      const signingLogicAddressAfter = await registryLogic.signingLogic();

      signingLogicAddressBefore.should.be.equal(signingLogic.address);
      signingLogicAddressAfter.should.be.equal(
        differentSigningLogic.address
      );
    });

    it("doesn't allow anyone else to change the signing logic", async () => {
      await registryLogic
        .setSigningLogic(differentSigningLogic.address, {
          from: alice
        })
        .should.be.rejectedWith(EVMThrow);
      const signingLogicAddressAfter = await registryLogic.signingLogic();

      signingLogicAddressBefore.should.be.equal(signingLogic.address);
      signingLogicAddressAfter.should.be.equal(signingLogic.address);
    });
  });


  // FIXED
  describe("invitation admin", async () => {
    it("allows the invite admin to instantly create an account for people", async () => {
      (await registry.addressBelongsToAccount(bob)).should.be.false;

      await registryLogic.createAccount(bob);

      (await registry.addressBelongsToAccount(bob)).should.be.true;
    });

    interface CreationEventArgs {
      accountId: BigNumber.BigNumber;
      newUser: string;
    }
    it("Emits an event when an account is created", async () => {
      const { logs } = ((await registryLogic.createAccount(alice)
      ) as Web3.TransactionReceipt<any>) as Web3.TransactionReceipt<
        CreationEventArgs
      >;
      const aliceId = await registry.accountIdForAddress.call(alice)

      const matchingLog = logs.find(
        log => log.event === "AccountCreated"
      );

      should.exist(matchingLog);
      if (!matchingLog) return;

      matchingLog.args.accountId.should.bignumber.equal(aliceId);
      matchingLog.args.newUser.should.equal(alice);
    });

    it("does not allow anyone else to instantly create accounts", async () => {
      await registryLogic
        .createAccount(bob, { from: alice })
        .should.be.rejectedWith(EVMThrow);
    });

    it("throws an error if the user already has an account", async () => {
      await registryLogic.createAccount(bob).should.be.fulfilled;
      await registryLogic.createAccount(bob).should.be.rejectedWith(EVMThrow);
    });

    it("throws an error if the new user address is 0", async () => {
      await registryLogic.createAccount("0x0").should.be.rejectedWith(EVMThrow);
    });

    it("supports changing the invite admin", async () => {
      await registryLogic
        .createAccount(bob, { from: alice })
        .should.be.rejectedWith(EVMThrow);

      await registryLogic.setRegistryAdmin(alice);

      await registryLogic.createAccount(bob, { from: alice }).should.be.fulfilled;
    });

    it("only allows the owner to change the invite admin", async () => {
      await registryLogic
        .setRegistryAdmin(alice, { from: alice })
        .should.be.rejectedWith(EVMThrow);
    });

    it("does not allow setting the invite admin to zero", async () => {
      await registryLogic.setRegistryAdmin("0x0").should.be.rejectedWith(EVMThrow);
    });
  });

  describe("Adding multiple accounts", async () => {
    beforeEach(async () => {
      await Promise.all([
        registryLogic.createAccount(alice),
        registryLogic.createAccount(bob),
      ]);
      [aliceId, bobId] = await Promise.all([
        registry.accountIdForAddress.call(alice),
        registry.accountIdForAddress.call(bob),
      ]);
    });
    it("Allows a user to add an unclaimed address to their account", async () => {
      await registryLogic.addAddressToAccount(unclaimed, newAddressSig, senderSig, nonceHash, { from: alice }).should.be.fulfilled
    })
    it("Adds new address to same accountId", async () => {
      await registryLogic.addAddressToAccount(unclaimed, newAddressSig, senderSig, nonceHash, { from: alice }).should.be.fulfilled
      const newId = await registry.accountIdForAddress.call(unclaimed)
      newId.should.bignumber.equal(aliceId)
    })
    it("Allows second address to add another address", async () => {
      await registryLogic.addAddressToAccount(unclaimed, newAddressSig, senderSig, nonceHash, { from: alice }).should.be.fulfilled
      await registryLogic.addAddressToAccount(unclaimedB, 
      ethSigUtil.signTypedDataLegacy(
        unclaimedPrivkeyB,
        {data: getFormattedTypedDataAddAddress(
          unclaimed,
          differentNonceHash
        )}
      ),
      ethSigUtil.signTypedDataLegacy(
       unclaimedPrivkey,
        {data: getFormattedTypedDataAddAddress(
          unclaimedB,
          differentNonceHash
        )}
      ), differentNonceHash, { from: unclaimed }).should.be.fulfilled
    })

    it("Does not allow address to be added if does not match the sender sig", async () => {
      await registryLogic.addAddressToAccount(
        unclaimed,
        newAddressSig,
        ethSigUtil.signTypedDataLegacy(
          alicePrivkey,
          {data: getFormattedTypedDataAddAddress(
            unclaimedB,
            nonceHash
          )}
        ),
        nonceHash
      ).should.rejectedWith(EVMThrow)
    });

    it("Does not allow address to be added if does not match the newAddress sig", async () => {
      await registryLogic.addAddressToAccount(
        unclaimed,
        ethSigUtil.signTypedDataLegacy(
          unclaimedPrivkey,
          {data: getFormattedTypedDataAddAddress(
            bob,
            nonceHash
          )}
        ),
        senderSig,
        nonceHash
      ).should.rejectedWith(EVMThrow)
    });

    it("Fails if sig does not match newAddress", async () => {
      await registryLogic.addAddressToAccount(unclaimedB, newAddressSig, senderSig, nonceHash, { from: alice }).should.be.rejectedWith(EVMThrow)
    })

    interface AdditionEventArgs {
      accountId: BigNumber.BigNumber;
      newAddress: string;
    }

    it("Emits an event when an address is added", async () => {
      const { logs } = ((await registryLogic.addAddressToAccount(unclaimed, newAddressSig, senderSig, nonceHash, {from: alice}).should.be.fulfilled
      ) as Web3.TransactionReceipt<any>) as Web3.TransactionReceipt<
        AdditionEventArgs
      >;

      const aliceId = await registry.accountIdForAddress.call(alice)
      const matchingLog = logs.find(
        log => log.event === "AddressAdded"
      );

      should.exist(matchingLog);
      if (!matchingLog) return;

      matchingLog.args.accountId.should.bignumber.equal(aliceId);
      matchingLog.args.newAddress.should.equal(unclaimed);
    });

    it("Does not allow sigs to be replayed", async () => {
      await registryLogic.addAddressToAccount(unclaimed, newAddressSig, senderSig, nonceHash, {from: alice}).should.be.fulfilled
      await registryLogic.removeAddressFromAccountFor(unclaimed).should.be.fulfilled
      await registryLogic.addAddressToAccount(unclaimed, newAddressSig, senderSig, nonceHash, {from: alice}).should.be.rejectedWith(EVMThrow)
      await registry.accountIdForAddress(unclaimed).should.be.rejectedWith(EVMThrow)
      const unclaimedExists = await registry.addressBelongsToAccount(unclaimed)
      unclaimedExists.should.equal(false)
    });

    it("Allows address to be re-added with different nonce", async () => {
      await registryLogic.addAddressToAccount(unclaimed, newAddressSig, senderSig, nonceHash, {from: alice}).should.be.fulfilled
      await registryLogic.removeAddressFromAccountFor(unclaimed).should.be.fulfilled
      await registryLogic.addAddressToAccount(
        unclaimed,
        ethSigUtil.signTypedDataLegacy(
          unclaimedPrivkey,
          {data: getFormattedTypedDataAddAddress(
            alice,
            differentNonceHash
          )}
        ),
        ethSigUtil.signTypedDataLegacy(
          alicePrivkey,
          {data: getFormattedTypedDataAddAddress(
            unclaimed,
            differentNonceHash
          )}
        ),
        differentNonceHash,
        {from: alice}
      ).should.be.fulfilled
      const newId = await registry.accountIdForAddress.call(unclaimed)
      const aliceId = await registry.accountIdForAddress.call(alice)
      newId.should.bignumber.equal(aliceId)
      const unclaimedExists = await registry.addressBelongsToAccount(unclaimed)
      unclaimedExists.should.equal(true)
    });
  })

  describe("Delegating multiple accounts addition", async () => {
    beforeEach(async () => {
      await Promise.all([
        registryLogic.createAccount(alice),
        registryLogic.createAccount(bob),
      ]);
      [aliceId, bobId] = await Promise.all([
        registry.accountIdForAddress.call(alice),
        registry.accountIdForAddress.call(bob),
      ]);
    });
    it("Allows a bloom to add multiple addresses to an account if both sigs are submitted", async () => {
      await registryLogic.addAddressToAccountFor(unclaimed, newAddressSig, senderSig, alice, nonceHash, { from: owner }).should.be.fulfilled
    })
    it("Does not allow anyone else to add multiple addresss on behalf of another user", async () => {
      await registryLogic.addAddressToAccountFor(unclaimed, newAddressSig, senderSig, alice, nonceHash, { from: alice }).should.be.rejectedWith(EVMThrow)
    })
  })

  describe("Removing addresses from accounts", async () => {
    beforeEach(async () => {
      await Promise.all([
        registryLogic.createAccount(alice),
        registryLogic.createAccount(bob),
      ]);
      [aliceId, bobId] = await Promise.all([
        registry.accountIdForAddress.call(alice),
        registry.accountIdForAddress.call(bob),
      ]);
    });
    it("Allows registry logic to remove a new address from an account", async () => {
      await registryLogic.addAddressToAccount(unclaimed, newAddressSig, senderSig, nonceHash, {from: alice}).should.be.fulfilled
      await registryLogic.removeAddressFromAccountFor(unclaimed).should.be.fulfilled
      await registry.accountIdForAddress(unclaimed).should.be.rejectedWith(EVMThrow)
      const unclaimedExists = await registry.addressBelongsToAccount(unclaimed)
      unclaimedExists.should.equal(false)
    });

    interface RemovalEventArgs {
      accountId: BigNumber.BigNumber;
      oldAddress: string;
    }
    it("Emits an event when an address is removed", async () => {
      await registryLogic.addAddressToAccount(unclaimed, newAddressSig, senderSig, nonceHash, {from: alice}).should.be.fulfilled
      const { logs } = ((await registryLogic.removeAddressFromAccountFor(unclaimed)
      ) as Web3.TransactionReceipt<any>) as Web3.TransactionReceipt<
        RemovalEventArgs
      >;

      const aliceId = await registry.accountIdForAddress.call(alice)
      const matchingLog = logs.find(
        log => log.event === "AddressRemoved"
      );

      should.exist(matchingLog);
      if (!matchingLog) return;

      matchingLog.args.accountId.should.bignumber.equal(aliceId);
      matchingLog.args.oldAddress.should.equal(unclaimed);

    });
  })

});
