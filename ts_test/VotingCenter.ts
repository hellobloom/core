import "./test_setup";
import { latestBlockTime } from "./helpers/blockInfo";
import { VotingCenterInstance } from "../truffle";
import { should } from "./test_setup";
import * as ipfs from "../src/ipfs";

const VotingCenter = artifacts.require("VotingCenter");
const Poll = artifacts.require("Poll");

contract("VotingCenter", function([alice]) {
  let votingCenter: VotingCenterInstance;
  let ipfsHash: string;
  let pollAddress: string;

  beforeEach(async () => {
    votingCenter = await VotingCenter.new();
    ipfsHash = ipfs.toHex("Qmd5yJ2g7RQYJrve1eytv1Pj33VUKnb4FmpEyLxqvFmafe");

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
    ipfs
      .fromStruct(await poll.pollDataMultihash.call())
      .should.equal("Qmd5yJ2g7RQYJrve1eytv1Pj33VUKnb4FmpEyLxqvFmafe");
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
