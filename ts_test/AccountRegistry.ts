import * as BigNumber from "bignumber.js";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
const walletTools = require("ethereumjs-wallet");
const { privateToAddress } = require("ethereumjs-util");
import { signAddress } from "./../src/signAddress";

import { MockBLTInstance, AccountRegistryInstance } from "./../truffle";

const chaiBignumber = require("chai-bignumber");

const should = chai
  .use(chaiAsPromised)
  .use(chaiBignumber(web3.BigNumber))
  .should();

const AccountRegistry = artifacts.require("AccountRegistry");
const MockBLT = artifacts.require("./helpers/MockBLT");

contract("AccountRegistry", function([owner, alice, bob, seizedTokensWallet]) {
  let token: MockBLTInstance;
  let registry: AccountRegistryInstance;
  let collateralizer: string;

  let invitePrivateKey: Buffer;
  let invitePublicAddress: string;
  let inviterSecret: string;
  let recipientSecret: string;

  const setupOwner = async () => {
    await token.gift(owner);
    return token.approve(collateralizer, new BigNumber("1e18"));
  };

  const signFor = (user: string) =>
    signAddress({
      address: user,
      privKey: invitePrivateKey
    });

  beforeEach(async () => {
    token = await MockBLT.new();
    registry = await AccountRegistry.new(token.address, seizedTokensWallet);
    collateralizer = await registry.inviteCollateralizer();
    invitePrivateKey = walletTools.generate().getPrivateKey();
    invitePublicAddress =
      "0x" + privateToAddress(invitePrivateKey).toString("hex");
    inviterSecret = signFor(owner);
    recipientSecret = signFor(alice);

    await setupOwner();
  });

  it("allows existing users to create invites if they collateralize some BLT", async () => {
    (await registry.invites(invitePublicAddress)).should.deep.equal([
      "0x0000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000"
    ]);
    await registry.createInvite(inviterSecret);

    (await registry.invites(invitePublicAddress)).should.deep.equal([
      owner,
      "0x0000000000000000000000000000000000000000"
    ]);
  });

  it("emits an event when an invite is created", async () => {
    const { logs } = await registry.createInvite(inviterSecret);

    const match = logs.find(log => {
      return log.event === "InviteCreated" && log.args.inviter === owner;
    });

    should.exist(match);
  });

  it("does not allow a registered user to invite without collateralizing BLT", async () => {
    await registry.createAccount(alice);
    await token.gift(alice);

    await registry
      .createInvite(signFor(alice), { from: alice })
      .should.be.rejectedWith("invalid opcode");

    await token.approve(collateralizer, new BigNumber("1e18"), { from: alice });
    await registry.createInvite(signFor(alice), { from: alice }).should.be
      .fulfilled;
  });

  it("saves the recipient signature", async () => {
    await registry.createInvite(inviterSecret);
    await registry.acceptInvite(recipientSecret, { from: alice });

    (await registry.invites(invitePublicAddress)).should.deep.equal([
      owner,
      alice
    ]);
  });

  it("does not allow people to accept invites if they are already a user", async () => {
    await registry.createAccount(alice);

    await registry.createInvite(inviterSecret);
    await registry
      .acceptInvite(recipientSecret, { from: alice })
      .should.be.rejectedWith("invalid opcode");
  });

  it("fails if the inviter provided during acceptInvite is wrong", async () => {
    await registry.createInvite(inviterSecret);
    await registry
      .acceptInvite(recipientSecret, { from: bob })
      .should.be.rejectedWith("invalid opcode");
  });

  it("accepts the invite if the secret and owner are both correct", async () => {
    (await registry.accounts(alice)).should.be.false;

    await registry.createInvite(inviterSecret);
    await registry.acceptInvite(recipientSecret, { from: alice });

    (await registry.accounts(alice)).should.be.true;
  });

  it("emits an event when an invite is accepted", async () => {
    await registry.createInvite(inviterSecret);
    const { logs } = await registry.acceptInvite(recipientSecret, {
      from: alice
    });

    const inviteAcceptedMatch = logs.find(log => {
      return (
        log.event === "InviteAccepted" &&
        log.args.inviter === owner &&
        log.args.recipient === alice
      );
    });

    should.exist(inviteAcceptedMatch);
  });

  it("emits an event that an account was created when an invite was accepted", async () => {
    await registry.createInvite(inviterSecret);
    const { logs } = await registry.acceptInvite(recipientSecret, {
      from: alice
    });

    const accountCreatedMatch = logs.find(log => {
      return log.event === "AccountCreated" && log.args.newUser === alice;
    });

    should.exist(accountCreatedMatch);
  });

  describe("invitation admin", async () => {
    it("allows the invite admin to instantly create an account for people", async () => {
      (await registry.accounts(bob)).should.be.false;

      await registry.createAccount(bob);

      (await registry.accounts(bob)).should.be.true;
    });

    it("does not allow anyone else to instantly create accounts", async () => {
      await registry
        .createAccount(bob, { from: alice })
        .should.be.rejectedWith("invalid opcode");
    });

    it("throws an error if the user already has an account", async () => {
      await registry.createAccount(bob).should.be.fulfilled;
      await registry
        .createAccount(bob)
        .should.be.rejectedWith("invalid opcode");
    });

    it("supports changing the invite admin", async () => {
      await registry
        .createAccount(bob, { from: alice })
        .should.be.rejectedWith("invalid opcode");

      await registry.setInviteAdmin(alice);

      await registry.createAccount(bob, { from: alice }).should.be.fulfilled;
    });

    it("only allows the owner to change the invite admin", async () => {
      await registry
        .setInviteAdmin(alice, { from: alice })
        .should.be.rejectedWith("invalid opcode");
    });

    it("does not allow setting the invite admin to zero", async () => {
      await registry
        .setInviteAdmin("0x0")
        .should.be.rejectedWith("invalid opcode");
    });
  });
});
