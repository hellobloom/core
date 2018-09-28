import "./test_setup";
import { latestBlockTime } from "./helpers/blockInfo";
import { should } from "./test_setup";
import * as ipfs from "../src/ipfs";
import { VotingCenterInstance, SigningLogicLegacyInstance, AccountRegistryInstance } from "../contracts";

const VotingCenter = artifacts.require("VotingCenter");
const Poll = artifacts.require("Poll");
const AccountRegistry = artifacts.require("AccountRegistry");
const SigningLogic = artifacts.require("SigningLogicLegacy");

contract("VotingCenter", function([alice, bob, carl]) {
  let votingCenter: VotingCenterInstance;
  let ipfsHash: string;
  let pollAddress: string;
  let startTime: number;
  let endTime: number;
  let registry: AccountRegistryInstance;
  let signingLogic: SigningLogicLegacyInstance;

  beforeEach(async () => {
    signingLogic = await SigningLogic.new();
    registry = await AccountRegistry.new(alice);
    votingCenter = await VotingCenter.new();
    ipfsHash = ipfs.toHex("Qmd5yJ2g7RQYJrve1eytv1Pj33VUKnb4FmpEyLxqvFmafe");
    startTime = latestBlockTime() + 10;
    endTime = startTime + 100;

    pollAddress = await votingCenter.createPoll.call(
      ipfsHash,
      10,
      startTime,
      endTime,
      registry.address,
      signingLogic.address,
      bob
    );
  });

  it("lets anyone create a poll", async () => {
    await votingCenter.createPoll(
      ipfsHash,
      10,
      startTime,
      endTime,
      registry.address,
      signingLogic.address,
      bob
    );

    const poll = Poll.at(pollAddress);
    ipfs
      .fromHex(await poll.pollDataMultihash.call())
      .should.equal("Qmd5yJ2g7RQYJrve1eytv1Pj33VUKnb4FmpEyLxqvFmafe");
  });

  it("emits an event when a poll is created", async () => {
    const { logs } = await votingCenter.createPoll(
      ipfsHash,
      10,
      startTime,
      endTime,
      registry.address,
      signingLogic.address,
      bob
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
      startTime,
      endTime,
      registry.address,
      signingLogic.address,
      bob
    );

    const poll = Poll.at(pollAddress);
    (await poll.author()).should.be.equal(alice);
  });
});
