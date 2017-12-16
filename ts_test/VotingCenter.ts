const multihash = require("multihashes");
const { bufferToHex, stripHexPrefix } = require("ethereumjs-util");
import "./test_setup";
import { latestBlockTime } from "./helpers/blockInfo";
import { VotingCenterInstance } from "../truffle";
import { should } from "./test_setup";

const VotingCenter = artifacts.require("VotingCenter");
const Poll = artifacts.require("Poll");

contract("VotingCenter", function([alice]) {
  let votingCenter: VotingCenterInstance;
  let originalIpfsBuffer: Buffer;
  let ipfsHash: string;
  let pollAddress: string;

  beforeEach(async () => {
    votingCenter = await VotingCenter.new();
    originalIpfsBuffer = multihash.fromB58String(
      "Qmd5yJ2g7RQYJrve1eytv1Pj33VUKnb4FmpEyLxqvFmafe"
    );
    ipfsHash = bufferToHex(originalIpfsBuffer);

    pollAddress = await votingCenter.createPoll.call(
      ipfsHash,
      10,
      latestBlockTime(),
      latestBlockTime() + 100
    );
  });

  it("lets anyone create a poll", async () => {
    await votingCenter.createPoll(
      ipfsHash,
      10,
      latestBlockTime(),
      latestBlockTime() + 100
    );

    const poll = Poll.at(pollAddress);
    const [hashFn, size, hash] = await poll.pollDataMultihash.call();

    const ipfsHashOnPoll = Buffer.concat([
      Buffer.from([hashFn.toNumber()]),
      Buffer.from([size.toNumber()]),
      new Buffer(stripHexPrefix(hash), "hex")
    ]);

    ipfsHashOnPoll.toString("hex").should.equal(stripHexPrefix(ipfsHash));
  });

  it("emits an event when a poll is created", async () => {
    const { logs } = await votingCenter.createPoll(
      ipfsHash,
      10,
      latestBlockTime(),
      latestBlockTime() + 100
    );

    const matchingLog = logs.find(
      log =>
        log.event === "PollCreated" &&
        log.args.poll === pollAddress &&
        log.args.author === alice
    );

    should.exist(matchingLog);
  });

  it("sets the author on the Poll", async () => {
    await votingCenter.createPoll(
      ipfsHash,
      10,
      latestBlockTime(),
      latestBlockTime() + 100
    );

    const poll = Poll.at(pollAddress);
    (await poll.author()).should.be.equal(alice);
  });
});
