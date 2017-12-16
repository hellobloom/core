import * as BigNumber from "bignumber.js";
const multihash = require("multihashes");
const { bufferToHex, stripHexPrefix } = require("ethereumjs-util");
import { PollInstance } from "./../truffle";
import "./test_setup";
import { latestBlockTime } from "./helpers/blockInfo";
import { EVMThrow } from "./helpers/EVMThrow";
import { increaseTime } from "./helpers/increaseTime";
import { should } from "./test_setup";
import { advanceBlock } from "./helpers/advanceBlock";

const Poll = artifacts.require("Poll");

contract("Poll", function([alice]) {
  let poll: PollInstance;

  // latestBlockTime() is wrong for the first test if we don't do this.
  before(advanceBlock);

  beforeEach(async () => {
    const ipfsHash = bufferToHex(
      multihash.fromB58String("Qmd5yJ2g7RQYJrve1eytv1Pj33VUKnb4FmpEyLxqvFmafe")
    );

    poll = await Poll.new(
      ipfsHash,
      10,
      latestBlockTime() + 10,
      latestBlockTime() + 100,
      alice
    );
  });

  it("allows users to cast votes", async () => {
    await increaseTime(10);

    (await poll.votes(alice)).should.be.bignumber.equal(0);
    await poll.vote(1, { from: alice });
    (await poll.votes(alice)).should.be.bignumber.equal(1);
  });

  it("allows users to change their vote", async () => {
    await increaseTime(10);

    await poll.vote(1, { from: alice });
    (await poll.votes(alice)).should.be.bignumber.equal(1);

    await poll.vote(2, { from: alice });
    (await poll.votes(alice)).should.be.bignumber.equal(2);
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
        log.event === "Vote" &&
        log.args.voter === alice &&
        (log.args.choice as BigNumber.BigNumber).equals(new BigNumber(1))
      );
    });

    should.exist(matchingLog);
  });

  it("exposes an IPFS hash", async () => {
    const [hashFn, size, hash] = await poll.pollDataMultihash.call();
    const ipfsHashBuffer = Buffer.concat([
      Buffer.from([hashFn.toNumber()]),
      Buffer.from([size.toNumber()]),
      new Buffer(stripHexPrefix(hash), "hex")
    ]);

    multihash
      .toB58String(ipfsHashBuffer)
      .should.equal("Qmd5yJ2g7RQYJrve1eytv1Pj33VUKnb4FmpEyLxqvFmafe");
  });

  it("exposes an author", async () => {
    (await poll.author()).should.be.equal(alice);
  });
});
