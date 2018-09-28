import * as BigNumber from "bignumber.js";
import { PollInstance } from "./../contracts";
import "./test_setup";
import { latestBlockTime } from "./helpers/blockInfo";
import { EVMThrow } from "./helpers/EVMThrow";
import { increaseTime } from "./helpers/increaseTime";
import { should } from "./test_setup";
import { advanceBlock } from "./helpers/advanceBlock";
import * as ipfs from "./../src/ipfs";
import { SigningLogicLegacyInstance, AccountRegistryInstance } from "../contracts";
const ethSigUtil = require("eth-sig-util");
import * as ethereumjsWallet from "ethereumjs-wallet";
const uuid = require('uuidv4')
import { bufferToHex } from "ethereumjs-util";

import { hashData } from "./../src/signData";
import { getFormattedTypedDataVoteFor } from "./helpers/signingLogicLegacy";

const Poll = artifacts.require("Poll");
const AccountRegistry = artifacts.require("AccountRegistry");
const SigningLogic = artifacts.require("SigningLogicLegacy");

contract("Poll", function([alice, bob, carl]) {
  let poll: PollInstance;
  let registry: AccountRegistryInstance;
  let signingLogic: SigningLogicLegacyInstance;

  const aliceWallet = ethereumjsWallet.fromPrivateKey(
    new Buffer(
      "c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3",
      "hex"
    )
  );
  const alicePrivkey = aliceWallet.getPrivateKey();

  const bobWallet = ethereumjsWallet.fromPrivateKey(
    new Buffer(
      "ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f",
      "hex"
    )
  );
  const bobPrivkey = bobWallet.getPrivateKey();

  let aliceId: BigNumber.BigNumber;

  // Sanity check
  if (alice != aliceWallet.getAddressString()) {
    throw new Error("Mnemonic used for truffle tests out of sync?");
  }

  // Sanity check
  if (bob != bobWallet.getAddressString()) {
    throw new Error("Mnemonic used for truffle tests out of sync?");
  }

  const nonce = uuid()
  const differentNonce = uuid()
  const nonceHash = bufferToHex(hashData(nonce))
  const differentNonceHash = bufferToHex(hashData(differentNonce))

  // latestBlockTime() is wrong for the first test if we don't do this.
  before(advanceBlock);

  beforeEach(async () => {
    signingLogic = await SigningLogic.new();
    registry = await AccountRegistry.new(alice);
    await registry.createNewAccount(alice);
    await registry.createNewAccount(bob);
    await registry.createNewAccount(carl);
    poll = await Poll.new(
      ipfs.toHex("Qmd5yJ2g7RQYJrve1eytv1Pj33VUKnb4FmpEyLxqvFmafe"),
      10,
      latestBlockTime() + 10,
      latestBlockTime() + 100,
      alice,
      registry.address,
      signingLogic.address,
      bob
    );
    aliceId = await registry.accountIdForAddress.call(alice);
  });

  context("Voting", () => {
    it("allows users to cast votes", async () => {
      await increaseTime(10);

      (await poll.votes(aliceId)).should.be.bignumber.equal(0);
      await poll.vote(1, { from: alice });
      (await poll.votes(aliceId)).should.be.bignumber.equal(1);
    });

    it("allows users to change their vote", async () => {
      await increaseTime(10);

      await poll.vote(1, { from: alice });
      (await poll.votes(aliceId)).should.be.bignumber.equal(1);

      await poll.vote(2, { from: alice });
      (await poll.votes(aliceId)).should.be.bignumber.equal(2);
    });

    it("does not let users vote for invalid options", async () => {
      await increaseTime(10);

      await poll.vote(11, { from: alice }).should.be.rejectedWith(EVMThrow);
      await poll.vote(10, { from: alice }).should.be.fulfilled;
    });

    it("does not let users vote before voting begins", async () => {
      await poll.vote(1).should.be.rejectedWith(EVMThrow);
      await increaseTime(10);
      await poll.vote(1).should.be.fulfilled;
    });

    it("does not let users vote after voting has ended", async () => {
      await increaseTime(10);
      await poll.vote(1).should.be.fulfilled;
      await increaseTime(200);
      await poll.vote(2).should.be.rejectedWith(EVMThrow);
    });

    it("emits a Vote event when you cast a vote", async () => {
      await increaseTime(10);
      const { logs } = await poll.vote(1);

      const matchingLog = logs.find(log => {
        return (
          log.event === "VoteCast" &&
          log.args.voter === alice &&
          (log.args.choice as BigNumber.BigNumber).equals(new BigNumber(1))
        );
      });

      should.exist(matchingLog);
    });
  })
  
  context("Administrating", () => {
    it("exposes an IPFS hash", async () => {
      ipfs
        .fromHex(await poll.pollDataMultihash.call())
        .should.equal("Qmd5yJ2g7RQYJrve1eytv1Pj33VUKnb4FmpEyLxqvFmafe");
    });

    it("exposes an author", async () => {
      (await poll.author()).should.be.equal(alice);
    });

    it("rejects polls with a start date earlier than now", async () => {
      await Poll.new(
        ipfs.toHex("Qmd5yJ2g7RQYJrve1eytv1Pj33VUKnb4FmpEyLxqvFmafe"),
        10,
        100,
        200,
        alice,
        registry.address,
        signingLogic.address,
        bob
      ).should.be.rejectedWith(EVMThrow);
    });

    it("rejects polls with an end date that is not later than the start date", async () => {
      await Poll.new(
        ipfs.toHex("Qmd5yJ2g7RQYJrve1eytv1Pj33VUKnb4FmpEyLxqvFmafe"),
        10,
        latestBlockTime() + 10,
        latestBlockTime() + 10,
        alice,
        registry.address,
        signingLogic.address,
        bob
      ).should.be.rejectedWith(EVMThrow);
    });
  })

  context("Delegating votes", () => {
    it("Allows the poll admin to vote on behalf of a voter", async () => {
      const aliceSig = ethSigUtil.signTypedDataLegacy(
        alicePrivkey,
        {
          data:
          getFormattedTypedDataVoteFor(1, alice, nonceHash, poll.address)
        }
      )

      await increaseTime(10);

      (await poll.votes(aliceId)).should.be.bignumber.equal(0);
      await poll.voteFor(1, alice, nonceHash, aliceSig, { from: bob }).should.be.fulfilled;
      (await poll.votes(aliceId)).should.be.bignumber.equal(1);
    });

    it("Fails if trying to replay sig", async () => {
      const aliceSig = ethSigUtil.signTypedDataLegacy(
        alicePrivkey,
        {
          data:
        getFormattedTypedDataVoteFor(1, alice, nonceHash, poll.address)
        }
      )

      await increaseTime(10);

      (await poll.votes(aliceId)).should.be.bignumber.equal(0);
      await poll.voteFor(1, alice, nonceHash, aliceSig, { from: bob }).should.be.fulfilled;
      await poll.voteFor(1, alice, nonceHash, aliceSig, { from: bob }).should.be.rejectedWith(EVMThrow);
      (await poll.votes(aliceId)).should.be.bignumber.equal(1);
    });

    it("Allows user to change vote with new nonce", async () => {
      const aliceSig = ethSigUtil.signTypedDataLegacy(
        alicePrivkey,
        {
          data:
        getFormattedTypedDataVoteFor(1, alice, nonceHash, poll.address)
        }
      )
      const anotherAliceSig = ethSigUtil.signTypedDataLegacy(
        alicePrivkey,
        {
          data:
        getFormattedTypedDataVoteFor(2, alice, differentNonceHash, poll.address)
        }
      )

      await increaseTime(10);

      (await poll.votes(aliceId)).should.be.bignumber.equal(0);
      await poll.voteFor(1, alice, nonceHash, aliceSig, { from: bob }).should.be.fulfilled;
      await poll.voteFor(2, alice, differentNonceHash, anotherAliceSig, { from: bob }).should.be.fulfilled;
      (await poll.votes(aliceId)).should.be.bignumber.equal(2);
    });

    it("Rejects a vote if vote does not match sig", async () => {
      const aliceSig = ethSigUtil.signTypedDataLegacy(
        alicePrivkey,
        {
          data:
        getFormattedTypedDataVoteFor(1, alice, nonceHash, poll.address)
        }
      )

      await increaseTime(10);

      (await poll.votes(aliceId)).should.be.bignumber.equal(0);
      await poll.voteFor(2, alice, nonceHash, aliceSig, { from: bob }).should.be.rejectedWith(EVMThrow);
      (await poll.votes(aliceId)).should.be.bignumber.equal(0);
    });

    it("Rejects a vote if nonce does not match sig", async () => {
      const aliceSig = ethSigUtil.signTypedDataLegacy(
        alicePrivkey,
        {
          data:
        getFormattedTypedDataVoteFor(1, alice, differentNonceHash, poll.address)
        }
      )

      await increaseTime(10);

      (await poll.votes(aliceId)).should.be.bignumber.equal(0);
      await poll.voteFor(1, alice, nonceHash, aliceSig, { from: bob }).should.be.rejectedWith(EVMThrow);
      (await poll.votes(aliceId)).should.be.bignumber.equal(0);
    });

    it("Rejects a vote if poll address is invalid in signature", async () => {
      const badSig = ethSigUtil.signTypedDataLegacy(
        alicePrivkey,
        {
          data:
        getFormattedTypedDataVoteFor(1, alice, nonceHash, carl)
        }
      )

      await increaseTime(10);

      (await poll.votes(aliceId)).should.be.bignumber.equal(0);
      await poll.voteFor(1, alice, nonceHash, badSig, { from: bob }).should.be.rejectedWith(EVMThrow);
      (await poll.votes(aliceId)).should.be.bignumber.equal(0);
    });

    it("Rejects a vote if signed by different user", async () => {
      const badSig = ethSigUtil.signTypedDataLegacy(
        bobPrivkey,
        {
          data:
        getFormattedTypedDataVoteFor(1, alice, nonceHash, poll.address)
        }
      )

      await increaseTime(10);

      (await poll.votes(aliceId)).should.be.bignumber.equal(0);
      await poll.voteFor(1, alice, nonceHash, badSig, { from: bob }).should.be.rejectedWith(EVMThrow);
      (await poll.votes(aliceId)).should.be.bignumber.equal(0);
    });

    it("Rejects a vote if valid sig from wrong user", async () => {
      const badSig = ethSigUtil.signTypedDataLegacy(
        bobPrivkey,
        {
          data:
        getFormattedTypedDataVoteFor(1, bob, nonceHash, poll.address)
        }
      )

      await increaseTime(10);

      (await poll.votes(aliceId)).should.be.bignumber.equal(0);
      await poll.voteFor(1, alice, nonceHash, badSig, { from: bob }).should.be.rejectedWith(EVMThrow);
      (await poll.votes(aliceId)).should.be.bignumber.equal(0);
    });
  
    it("Rejects a vote if sent by non poll admin", async () => {
      const aliceSig = ethSigUtil.signTypedDataLegacy(
        alicePrivkey,
        {
          data:
        getFormattedTypedDataVoteFor(1, alice, nonceHash, poll.address)
        }
      )

      await increaseTime(10);

      (await poll.votes(aliceId)).should.be.bignumber.equal(0);
      await poll.voteFor(1, alice, nonceHash, aliceSig, { from: carl }).should.be.rejectedWith(EVMThrow);
      (await poll.votes(aliceId)).should.be.bignumber.equal(0);
    });

  })
});
