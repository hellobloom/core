import './test_setup'
import {latestBlockTime} from './helpers/blockInfo'
import {should} from './test_setup'
import * as ipfs from '../src/ipfs'
import {VotingCenterInstance} from '../types/truffle-contracts'
import { advanceBlock } from './helpers/advanceBlock'
import { increaseTime } from './helpers/increaseTime';

const VotingCenter = artifacts.require('VotingCenter')
const Poll = artifacts.require('Poll')

contract('VotingCenter', function([alice, bob, carl]) {
  let votingCenter: VotingCenterInstance
  let ipfsHash: string[]
  let pollAddress: string
  let startTime: number
  let endTime: number
  let pollName = 'Bloom Poll'

  beforeEach(async () => {
    votingCenter = await VotingCenter.new()
    ipfsHash = ipfs.toHex('Qmd5yJ2g7RQYJrve1eytv1Pj33VUKnb4FmpEyLxqvFmafe')
    startTime = (await latestBlockTime()) + 10
    endTime = startTime + 100
  })

  it.only('lets anyone create a poll', async () => {
    const {logs} = await votingCenter.createPoll(
      pollName,
      1,
      ipfsHash,
      10,
      startTime,
      endTime
    )
    const matchingLog = logs.find(log => log.event === 'PollCreated')
    should.exist(matchingLog)
    if (!matchingLog) return
    await advanceBlock()
    await increaseTime(10)
    pollAddress = matchingLog.args.poll

    const poll = Poll.at('0xb8549998430fA7772DbB87c7b4A05892A1231Dd8')
    const multihash = (await poll.pollDataMultihash()) as unknown as string
    ipfs
      .fromHex(multihash)
      .should.equal('Qmd5yJ2g7RQYJrve1eytv1Pj33VUKnb4FmpEyLxqvFmafe')
  })

  it.only('emits an event when a poll is created', async () => {
    const {logs} = await votingCenter.createPoll(
      pollName,
      1,
      ipfsHash,
      10,
      startTime,
      endTime
    )
    const matchingLog = logs.find(log => log.event === 'PollCreated')

    should.exist(matchingLog)
    if (!matchingLog) return

    matchingLog.args.author.should.be.equal(alice)
  })

  it.only('sets the author on the Poll', async () => {
    const {logs} = await votingCenter.createPoll(
      pollName,
      1,
      ipfsHash,
      10,
      startTime,
      endTime
    )

    const poll = Poll.at(logs[0].address)
    ;(await poll.author()).should.be.equal(alice)
  })
})
