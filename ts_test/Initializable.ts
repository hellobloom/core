import * as Web3 from "web3";
import { InitializableInstance } from './../contracts'
import './test_setup'
import { EVMThrow } from './helpers/EVMThrow'
import { should } from './test_setup'
import * as ethereumjsWallet from 'ethereumjs-wallet'

const Initializable = artifacts.require('Initializable')

contract('Initializable', function([alice, bob, carl]) {
  let initializable: InitializableInstance

  const aliceWallet = ethereumjsWallet.fromPrivateKey(
    new Buffer(
      'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
      'hex'
    )
  )
  const alicePrivkey = aliceWallet.getPrivateKey()

  const bobWallet = ethereumjsWallet.fromPrivateKey(
    new Buffer(
      'ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f',
      'hex'
    )
  )
  const bobPrivkey = bobWallet.getPrivateKey()

  let aliceId: BigNumber.BigNumber

  // Sanity check
  if (alice != aliceWallet.getAddressString()) {
    throw new Error('Mnemonic used for truffle tests out of sync?')
  }

  // Sanity check
  if (bob != bobWallet.getAddressString()) {
    throw new Error('Mnemonic used for truffle tests out of sync?')
  }

  beforeEach(async () => {
    initializable = await Initializable.new(bob);
  });

  context('Configuring', () => {
    it('Sets initialzer to address specified in constructor', async () => {
      initializable = await Initializable.new(bob);
      (await initializable.initializer()).should.be.equal(bob)
    })
    it('Sets initializing to true in constructor', async () => {
      initializable = await Initializable.new(bob);
      (await initializable.initializing()).should.be.equal(true)
    })
    it("Allows the initializer to end initialization", async () => {
      initializable = await Initializable.new(bob);
      await initializable.endInitialization({from: bob}).should.be.fulfilled
    });
    it("Does not allow anyone else to end initialization", async () => {
      initializable = await Initializable.new(bob);
      await initializable.endInitialization({from: carl}).should.be.rejectedWith(EVMThrow)
    });
    it("Sets initializing to false when ending intialization", async () => {
      initializable = await Initializable.new(bob);
      await initializable.endInitialization({from: bob});
      (await initializable.initializing()).should.be.equal(false)
    });
    it("Does not allow initializer to end initialization multiple times", async () => {
      initializable = await Initializable.new(bob);
      await initializable.endInitialization({from: bob}).should.be.fulfilled
      await initializable.endInitialization({from: bob}).should.be.rejectedWith(EVMThrow)
    });
    it("Does not allow anyone else to end initialization after ending initialization", async () => {
      initializable = await Initializable.new(bob);
      await initializable.endInitialization({from: bob}).should.be.fulfilled
      await initializable.endInitialization({from: carl}).should.be.rejectedWith(EVMThrow)
    });
    it('Emits an event when ending initialization', async () => {
      initializable = await Initializable.new(bob);
      const {logs} = (await initializable.endInitialization({from: bob})) as Web3.TransactionReceipt<any> 
      const matchingLog = logs.find(
        log => log.event === "InitializationEnded"
      );

      should.exist(matchingLog);
    })
  })
  
})
