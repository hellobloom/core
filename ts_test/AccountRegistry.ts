import * as BigNumber from "bignumber.js";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
const { soliditySHA3 } = require("ethereumjs-abi");

import { MockBLTInstance, AccountRegistryInstance } from "./../truffle";
import { advanceBlocks } from "./helpers/advanceBlock";

const chaiBignumber = require("chai-bignumber");

const should = chai
  .use(chaiAsPromised)
  .use(chaiBignumber(web3.BigNumber))
  .should();

const AccountRegistry = artifacts.require("AccountRegistry");
const MockBLT = artifacts.require("./helpers/MockBLT");

contract("AccountRegistry", function([owner, alice, bob]) {
  let token: MockBLTInstance;
  let registry: AccountRegistryInstance;
  let collateralizer: string;

  let inviterSecret: string;
  let inviteeSecret: string;

  const setupOwner = async () => {
    await token.gift(owner);
    return token.approve(collateralizer, new BigNumber("1e18"));
  };

  const hashedSecret = (secret: string, address: string) => {
    return (
      "0x" +
      soliditySHA3(
        ["string", "string", "address"],
        [secret, "/", address]
      ).toString("hex")
    );
  };

  beforeEach(async () => {
    token = await MockBLT.new();
    registry = await AccountRegistry.new(token.address);
    collateralizer = await registry.inviteCollateralizer();
    inviterSecret = hashedSecret("secret", owner);
    inviteeSecret = hashedSecret("secret", alice);

    await setupOwner();
  });

  it("allows existing users to create invites if they collateralize some BLT", async () => {
    (await registry.inviterSecretDigests(owner, inviterSecret)).should.be.false;
    await registry.createInvite(inviterSecret);
    (await registry.inviterSecretDigests(owner, inviterSecret)).should.be.true;
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
      .createInvite(hashedSecret("secret", alice), { from: alice })
      .should.be.rejectedWith("invalid opcode");

    await token.approve(collateralizer, new BigNumber("1e18"), { from: alice });
    await registry.createInvite(hashedSecret("secret", alice), { from: alice })
      .should.be.fulfilled;
  });

  it("saves the invitee secret", async () => {
    (await registry.inviteeSecretDigests(
      alice,
      inviteeSecret
    )).should.be.bignumber.equal(0);

    await registry.createInvite(inviterSecret);
    await registry.beginAcceptInvite(inviteeSecret, { from: alice });

    (await registry.inviteeSecretDigests(
      alice,
      inviteeSecret
    )).should.be.bignumber.greaterThan(0);
  });

  it("does not allow people to accept invites if they are already a user", async () => {
    await registry.createAccount(alice);

    await registry.createInvite(inviterSecret);
    await registry
      .beginAcceptInvite(inviteeSecret, { from: alice })
      .should.be.rejectedWith("invalid opcode");
  });

  it("fails if the secret provided during finishAcceptInvite is wrong", async () => {
    await registry.createInvite(inviterSecret);
    await registry.beginAcceptInvite(inviteeSecret, { from: alice });
    await registry
      .finishAcceptInvite(owner, "incorrect", { from: alice })
      .should.be.rejectedWith("invalid opcode");
  });

  it("fails if the inviter provided during finishAcceptInvite is wrong", async () => {
    await registry.createInvite(inviterSecret);
    await registry.beginAcceptInvite(inviteeSecret, { from: alice });
    await registry
      .finishAcceptInvite(bob, "incorrect", { from: alice })
      .should.be.rejectedWith("invalid opcode");
  });

  it("accepts the invite if the secret and owner are both correct", async () => {
    (await registry.accounts(alice)).should.be.false;

    await registry.createInvite(inviterSecret);
    await registry.beginAcceptInvite(inviteeSecret, { from: alice });
    await advanceBlocks(5);

    await registry.finishAcceptInvite(owner, "secret", { from: alice }).should
      .be.fulfilled;

    (await registry.accounts(alice)).should.be.true;
  });

  it("emits an event when an invite is accepted", async () => {
    await registry.createInvite(inviterSecret);
    await registry.beginAcceptInvite(inviteeSecret, { from: alice });
    await advanceBlocks(5);

    const { logs } = await registry.finishAcceptInvite(owner, "secret", {
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
    await registry.beginAcceptInvite(inviteeSecret, { from: alice });
    await advanceBlocks(5);

    const { logs } = await registry.finishAcceptInvite(owner, "secret", {
      from: alice
    });

    const accountCreatedMatch = logs.find(log => {
      return log.event === "AccountCreated" && log.args.newUser === alice;
    });

    should.exist(accountCreatedMatch);
  });

  it("deletes the invite secret hashes when an invite is accepted", async () => {
    await registry.createInvite(inviterSecret);
    await registry.beginAcceptInvite(inviteeSecret, { from: alice });

    (await registry.inviterSecretDigests(owner, inviterSecret)).should.be.true;
    (await registry.inviteeSecretDigests(
      alice,
      inviteeSecret
    )).should.be.bignumber.greaterThan(0);

    await advanceBlocks(5);

    await registry.finishAcceptInvite(owner, "secret", {
      from: alice
    });

    (await registry.inviterSecretDigests(owner, inviterSecret)).should.be.false;
    (await registry.inviteeSecretDigests(
      alice,
      inviteeSecret
    )).should.be.bignumber.equal(0);
  });

  it("avoids frunt running the invite acceptance by requiring the demonstration and reveal be 5 blocks apart", async () => {
    await registry.createInvite(inviterSecret);
    await registry.beginAcceptInvite(inviteeSecret, { from: alice });

    await advanceBlocks(3);

    await registry
      .finishAcceptInvite(owner, "secret", { from: alice })
      .should.be.rejectedWith("invalid opcode");
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
