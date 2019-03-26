import * as BigNumber from 'bignumber.js'
import {EVMThrow} from './helpers/EVMThrow'
import * as ethereumjsWallet from 'ethereumjs-wallet'
const ethSigUtil = require('eth-sig-util')

import {should} from './test_setup'
import {generateSigNonce} from './../src/signData'
import {
  getFormattedTypedDataPayTokens,
  getFormattedTypedDataLockupTokensFor,
  getFormattedTypedDataReleaseTokensFor,
} from './helpers/signingLogic'
import { TokenEscrowMarketplaceInstance, MockBLTInstance } from '../types/truffle-contracts'
import { BNe10 } from './helpers/BNe10'

const TokenEscrowMarketplace = artifacts.require('TokenEscrowMarketplace')
const MockBLT = artifacts.require('MockBLT')

contract('TokenEscrowMarketplace', function([
  alice,
  bob,
  mockAttestationLogic,
  mockAdmin,
]) {
  let marketplace: TokenEscrowMarketplaceInstance
  let token: MockBLTInstance

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
  // Sanity check
  if (alice.toLowerCase() != aliceWallet.getAddressString()) {
    throw new Error('Mnemonic used for truffle tests out of sync?')
  }

  // Sanity check
  if (bob.toLowerCase() != bobWallet.getAddressString()) {
    throw new Error('Mnemonic used for truffle tests out of sync?')
  }

  let nonceHash: string
  let differentNonceHash: string

  let lockupTokensForSig: string[]
  let releaseTokensForSig: string[]
  let tokenPaymentSig: string[]

  beforeEach(async () => {
    token = await MockBLT.new()
    marketplace = await TokenEscrowMarketplace.new(
      token.address,
      mockAttestationLogic,
      {from: mockAdmin}
    )

    await Promise.all([
      token.gift(alice, new BigNumber('1e18')),
      token.gift(bob, new BigNumber('1e18')),
    ])

    nonceHash = generateSigNonce()
    differentNonceHash = generateSigNonce()
    lockupTokensForSig = ethSigUtil.signTypedData(alicePrivkey, {
      data: getFormattedTypedDataLockupTokensFor(
        marketplace.address,
        1,
        alice,
        new BigNumber('5e17').toString(10),
        nonceHash
      ),
    })
  })

  interface ActorBalances {
    marketplace: BigNumber.BigNumber
    alice: BigNumber.BigNumber
    bob: BigNumber.BigNumber
  }

  const allBalances = async () => {
    const subjects = [alice, bob, marketplace.address]
    const [aliceToken, bobToken, marketToken] = await Promise.all(
      subjects.map(subject => token.balanceOf(subject))
    )

    return {
      token: {
        alice: aliceToken,
        bob: bobToken,
        market: marketToken,
      },
    }
  }

  context('moving tokens to escrow', () => {
    beforeEach(async () => {
      await token.approve(marketplace.address, new BigNumber('5e17'))
    })

    it('allows users to lock up tokens via approve', async () => {
      const startBalance = await token.balanceOf(alice)

      await marketplace.moveTokensToEscrowLockup(new BigNumber('1e17'), {
        from: alice,
      })

      const endBalance = await token.balanceOf(alice)

      startBalance.should.be.eq.BN(BNe10(('1e18')))
      endBalance.should.be.eq.BN(BNe10(('9e17')))
    })

    it('emits an event when paying into escrow', async () => {
      const {logs} = await marketplace.moveTokensToEscrowLockup(
        new BigNumber('1e17')
      )

      const matchingLog = logs.find(log => log.event === 'TokenMarketplaceDeposit')

      should.exist(matchingLog)

      if (!matchingLog) return // Satisfy TS

      matchingLog.args.escrowPayer.should.be.eq.BN(alice)
      matchingLog.args.amount.should.be.eq.BN(BNe10(('1e17')))
    })

    it('marks the tokens as being in escrow from alice', async () => {
      const escrowBefore = await marketplace.tokenEscrow(alice)

      await marketplace.moveTokensToEscrowLockup(new BigNumber('1e17'))

      const escrowAfter = await marketplace.tokenEscrow(alice)

      // balance
      escrowBefore.should.be.eq.BN('0')
      // balance
      escrowAfter.should.be.eq.BN(BNe10(('1e17')))
    })

    it('can handle multiple additions to the same escrow', async () => {
      const escrowBefore = await marketplace.tokenEscrow(alice)

      await Promise.all([
        marketplace.moveTokensToEscrowLockup(new BigNumber('1e17')),
        marketplace.moveTokensToEscrowLockup(new BigNumber('1e17')),
      ])

      const escrowAfter = await marketplace.tokenEscrow(alice)

      escrowBefore.should.be.eq.BN('0')
      escrowAfter.should.be.eq.BN(BNe10(('2e17')))
    })

    it('fails if user tries to transfer more tokens to escrow than they own', async () => {
      const escrowBefore = await marketplace.tokenEscrow(alice)
      const tokenBeforeAlice = await token.balanceOf(alice)
      const tokenBeforeBob = await token.balanceOf(bob)

      await token.transfer(bob, new BigNumber('1e18'), {from: alice})

      await marketplace
        .moveTokensToEscrowLockup(new BigNumber('5e17'))
        .should.be.rejectedWith(EVMThrow)

      const escrowAfter = await marketplace.tokenEscrow(alice)
      const tokenAfterAlice = await token.balanceOf(alice)
      const tokenAfterBob = await token.balanceOf(bob)

      // balance
      escrowBefore.should.be.eq.BN('0')
      tokenBeforeAlice.should.be.eq.BN(BNe10(('1e18')))
      tokenBeforeBob.should.be.eq.BN(BNe10(('1e18')))
      // balance
      escrowAfter.should.be.eq.BN('0')
      tokenAfterAlice.should.be.eq.BN('0')
      tokenAfterBob.should.be.eq.BN(BNe10(('2e18')))
    })

    it('fails if user tries to transfer more tokens to escrow than they approved', async () => {
      const escrowBefore = await marketplace.tokenEscrow(alice)
      const tokenBefore = await token.balanceOf(alice)

      await marketplace
        .moveTokensToEscrowLockup(new BigNumber('6e17'))
        .should.be.rejectedWith(EVMThrow)

      const escrowAfter = await marketplace.tokenEscrow(alice)
      const tokenAfter = await token.balanceOf(alice)

      escrowBefore.should.be.eq.BN('0')
      tokenBefore.should.be.eq.BN(BNe10(('1e18')))

      escrowAfter.should.be.eq.BN('0')
      tokenAfter.should.be.eq.BN(BNe10(('1e18')))
    })
  })

  context('delegating token lockup', () => {
    let lockupTokensForDefaults: {
      sender: string
      amount: BigNumber.BigNumber
      nonce: string
      delegationSig: string[]
      from: string
    }

    let lockupTokensFor = async (
      props: Partial<typeof lockupTokensForDefaults> = lockupTokensForDefaults
    ) => {
      let {sender, amount, nonce, delegationSig, from} = {
        ...lockupTokensForDefaults,
        ...props,
      }

      return marketplace.moveTokensToEscrowLockupFor(
        sender,
        amount,
        nonce,
        delegationSig,
        {
          from,
        }
      )
    }
    beforeEach(async () => {
      await token.approve(marketplace.address, new BigNumber('5e17'))
      lockupTokensForDefaults = {
        sender: alice,
        amount: new BigNumber('5e17'),
        nonce: nonceHash,
        delegationSig: lockupTokensForSig,
        from: mockAdmin,
      }

      lockupTokensFor = async (
        props: Partial<typeof lockupTokensForDefaults> = lockupTokensForDefaults
      ) => {
        let {sender, amount, nonce, delegationSig, from} = {
          ...lockupTokensForDefaults,
          ...props,
        }

        return marketplace.moveTokensToEscrowLockupFor(
          sender,
          amount,
          nonce,
          delegationSig,
          {
            from,
          }
        )
      }
    })

    it('allows users to lockup tokens via delegation ', async () => {
      const escrowBefore = await marketplace.tokenEscrow(alice)

      const startBalance = await token.balanceOf(alice)

      await lockupTokensFor().should.be.fulfilled

      const endBalance = await token.balanceOf(alice)
      const escrowAfter = await marketplace.tokenEscrow(alice)

      escrowBefore.should.be.eq.BN('0')
      escrowAfter.should.be.eq.BN(BNe10(('5e17')))

      startBalance.should.be.eq.BN(BNe10(('1e18')))
      endBalance.should.be.eq.BN(BNe10(('5e17')))
    })

    it('Allows anyone to submit valid sigs', async () => {
      await lockupTokensFor({from: bob}).should.be.fulfilled
    })

    it('fails if sender does not match sig', async () => {
      await lockupTokensFor({sender: bob}).should.be.rejectedWith(EVMThrow)
    })

    it('fails if amount does not match sig', async () => {
      await lockupTokensFor({amount: new BigNumber('1e17')}).should.be.rejectedWith(
        EVMThrow
      )
    })

    it('fails if nonce does not match sig', async () => {
      await lockupTokensFor({nonce: differentNonceHash}).should.be.rejectedWith(
        EVMThrow
      )
    })

    it('fails if sig replayed', async () => {
      await token.approve(marketplace.address, new BigNumber('5e17'))
      await lockupTokensFor().should.be.fulfilled
      await lockupTokensFor().should.be.rejectedWith(EVMThrow)
    })

    it('allows multiple txs if different nonce', async () => {
      const escrowBefore = await marketplace.tokenEscrow(alice)
      const startBalance = await token.balanceOf(alice)

      await lockupTokensFor().should.be.fulfilled
      await token.approve(marketplace.address, new BigNumber('5e17'))
      await lockupTokensFor({
        nonce: differentNonceHash,
        delegationSig: ethSigUtil.signTypedData(alicePrivkey, {
          data: getFormattedTypedDataLockupTokensFor(
            marketplace.address,
            1,
            lockupTokensForDefaults.sender,
            lockupTokensForDefaults.amount.toString(10),
            differentNonceHash
          ),
        }),
      }).should.be.fulfilled
      const endBalance = await token.balanceOf(alice)
      const escrowAfter = await marketplace.tokenEscrow(alice)

      escrowBefore.should.be.eq.BN('0')
      escrowAfter.should.be.eq.BN(BNe10(('1e18')))

      startBalance.should.be.eq.BN(BNe10(('1e18')))
      endBalance.should.be.eq.BN('0')
    })
  })

  context('paying tokens out of escrow', () => {
    beforeEach(async () => {
      await token.approve(marketplace.address, new BigNumber('5e17'))
      await marketplace.moveTokensToEscrowLockup(new BigNumber('2e17'))
      tokenPaymentSig = ethSigUtil.signTypedData(alicePrivkey, {
        data: getFormattedTypedDataPayTokens(
          marketplace.address,
          1,
          alice,
          bob,
          new BigNumber('1e17').toString(10),
          nonceHash
        ),
      })
    })

    it('increases the receiver balance when escrow is paid out', async () => {
      const before = await allBalances()
      const escrowBefore = await marketplace.tokenEscrow(alice)

      await marketplace.requestTokenPayment(
        alice,
        bob,
        new BigNumber('1e17'),
        nonceHash,
        tokenPaymentSig,
        {
          from: mockAttestationLogic,
        }
      ).should.be.fulfilled

      const after = await allBalances()
      const escrowAfter = await marketplace.tokenEscrow(alice)

      // Bob's balance increases
      before.token.bob.should.be.eq.BN(BNe10(('10e17')))
      after.token.bob.should.be.eq.BN(BNe10(('11e17')))

      // Alice's stays the same
      before.token.alice.should.be.eq.BN(BNe10(('8e17')))
      after.token.alice.should.be.eq.BN(BNe10(('8e17')))

      // Escrow decreases
      escrowBefore.should.be.eq.BN(BNe10(('2e17')))
      escrowAfter.should.be.eq.BN(BNe10(('1e17')))
    })

    it('emits an event when paying from escrow', async () => {
      const before = await allBalances()
      const escrowBefore = await marketplace.tokenEscrow(alice)

      const {logs} = await marketplace.requestTokenPayment(
        alice,
        bob,
        new BigNumber('1e17'),
        nonceHash,
        tokenPaymentSig,
        {
          from: mockAttestationLogic,
        }
      )

      const matchingLog = logs.find(
        log => log.event === 'TokenMarketplaceEscrowPayment'
      )

      should.exist(matchingLog)

      if (!matchingLog) return // Satisfy TS

      matchingLog.args.escrowPayer.should.be.eq.BN(alice)
      matchingLog.args.escrowPayee.should.be.equal(bob)
      matchingLog.args.amount.should.be.eq.BN(BNe10(('1e17')))
    })

    it('allows multiple txs with different nonce', async () => {
      const before = await allBalances()
      const escrowBefore = await marketplace.tokenEscrow(alice)

      await marketplace.requestTokenPayment(
        alice,
        bob,
        new BigNumber('1e17'),
        nonceHash,
        tokenPaymentSig,
        {
          from: mockAttestationLogic,
        }
      ).should.be.fulfilled

      await marketplace.requestTokenPayment(
        alice,
        bob,
        new BigNumber('1e17'),
        differentNonceHash,
        ethSigUtil.signTypedData(alicePrivkey, {
          data: getFormattedTypedDataPayTokens(
            marketplace.address,
            1,
            alice,
            bob,
            new BigNumber('1e17').toString(10),
            differentNonceHash
          ),
        }),
        {
          from: mockAttestationLogic,
        }
      ).should.be.fulfilled

      const after = await allBalances()
      const escrowAfter = await marketplace.tokenEscrow(alice)

      // Bob's balance increases
      before.token.bob.should.be.eq.BN(BNe10(('10e17')))
      after.token.bob.should.be.eq.BN(BNe10(('12e17')))

      // Alice's stays the same
      before.token.alice.should.be.eq.BN(BNe10(('8e17')))
      after.token.alice.should.be.eq.BN(BNe10(('8e17')))

      // Escrow goes to 0
      escrowBefore.should.be.eq.BN(BNe10(('2e17')))
      escrowAfter.should.be.eq.BN('0')
    })

    it('fails if not called by attestationLogic', async () => {
      const before = await allBalances()
      const escrowBefore = await marketplace.tokenEscrow(alice)

      await marketplace
        .requestTokenPayment(
          alice,
          bob,
          new BigNumber('1e17'),
          nonceHash,
          tokenPaymentSig,
          {
            from: bob,
          }
        )
        .should.be.rejectedWith(EVMThrow)

      const after = await allBalances()
      const escrowAfter = await marketplace.tokenEscrow(alice)

      // Bob's balance stays the sam
      before.token.bob.should.be.eq.BN(BNe10(('1e18')))
      after.token.bob.should.be.eq.BN(BNe10(('1e18')))

      // Alice's stays the same
      before.token.alice.should.be.eq.BN(BNe10(('8e17')))
      after.token.alice.should.be.eq.BN(BNe10(('8e17')))

      // Escrow stays the same
      escrowBefore.should.be.eq.BN(BNe10(('2e17')))
      escrowAfter.should.be.eq.BN(BNe10(('2e17')))
    })

    it('fails if amount higher than authorization', async () => {
      const before = await allBalances()
      const escrowBefore = await marketplace.tokenEscrow(alice)

      await marketplace
        .requestTokenPayment(
          alice,
          bob,
          new BigNumber('2e17'),
          nonceHash,
          tokenPaymentSig,
          {
            from: mockAttestationLogic,
          }
        )
        .should.be.rejectedWith(EVMThrow)

      const after = await allBalances()
      const escrowAfter = await marketplace.tokenEscrow(alice)

      // Bob's balance stays the same
      before.token.bob.should.be.eq.BN(BNe10(('1e18')))
      after.token.bob.should.be.eq.BN(BNe10(('1e18')))

      // Alice's stays the same
      before.token.alice.should.be.eq.BN(BNe10(('8e17')))
      after.token.alice.should.be.eq.BN(BNe10(('8e17')))

      // Escrow stays the same
      escrowBefore.should.be.eq.BN(BNe10(('2e17')))
      escrowAfter.should.be.eq.BN(BNe10(('2e17')))
    })

    it('fails if authorized value higher than available balance', async () => {
      const before = await allBalances()
      const escrowBefore = await marketplace.tokenEscrow(alice)

      await marketplace
        .requestTokenPayment(
          alice,
          bob,
          new BigNumber('3e17'),
          nonceHash,
          ethSigUtil.signTypedData(alicePrivkey, {
            data: getFormattedTypedDataPayTokens(
              marketplace.address,
              1,
              alice,
              bob,
              new BigNumber('3e17').toString(10),
              nonceHash
            ),
          }),
          {
            from: mockAttestationLogic,
          }
        )
        .should.be.rejectedWith(EVMThrow)

      const after = await allBalances()
      const escrowAfter = await marketplace.tokenEscrow(alice)

      // Bob's balance stays the same
      before.token.bob.should.be.eq.BN(BNe10(('1e18')))
      after.token.bob.should.be.eq.BN(BNe10(('1e18')))

      // Alice's stays the same
      before.token.alice.should.be.eq.BN(BNe10(('8e17')))
      after.token.alice.should.be.eq.BN(BNe10(('8e17')))

      // Escrow stays the same
      escrowBefore.should.be.eq.BN(BNe10(('2e17')))
      escrowAfter.should.be.eq.BN(BNe10(('2e17')))
    })

    it('fails if sig replayed', async () => {
      const before = await allBalances()
      const escrowBefore = await marketplace.tokenEscrow(alice)

      await marketplace.requestTokenPayment(
        alice,
        bob,
        new BigNumber('1e17'),
        nonceHash,
        tokenPaymentSig,
        {
          from: mockAttestationLogic,
        }
      ).should.be.fulfilled
      await marketplace
        .requestTokenPayment(
          alice,
          bob,
          new BigNumber('1e17'),
          nonceHash,
          tokenPaymentSig,
          {
            from: mockAttestationLogic,
          }
        )
        .should.be.rejectedWith(EVMThrow)

      const after = await allBalances()
      const escrowAfter = await marketplace.tokenEscrow(alice)

      // Bob's balance increases
      before.token.bob.should.be.eq.BN(BNe10(('1e18')))
      after.token.bob.should.be.eq.BN(BNe10(('11e17')))

      // Alice's stays the same
      before.token.alice.should.be.eq.BN(BNe10(('8e17')))
      after.token.alice.should.be.eq.BN(BNe10(('8e17')))

      // Escrow decreases
      escrowBefore.should.be.eq.BN(BNe10(('2e17')))
      escrowAfter.should.be.eq.BN(BNe10(('1e17')))
    })

    it('fails if amount lower than authorization', async () => {
      const before = await allBalances()
      const escrowBefore = await marketplace.tokenEscrow(alice)

      await marketplace
        .requestTokenPayment(
          alice,
          bob,
          new BigNumber('1e16'),
          nonceHash,
          tokenPaymentSig,
          {
            from: mockAttestationLogic,
          }
        )
        .should.be.rejectedWith(EVMThrow)

      const after = await allBalances()
      const escrowAfter = await marketplace.tokenEscrow(alice)

      // Bob's balance stays the same
      before.token.bob.should.be.eq.BN(BNe10(('1e18')))
      after.token.bob.should.be.eq.BN(BNe10(('1e18')))

      // Alice's stays the same
      before.token.alice.should.be.eq.BN(BNe10(('8e17')))
      after.token.alice.should.be.eq.BN(BNe10(('8e17')))

      // Escrow stays the same
      escrowBefore.should.be.eq.BN(BNe10(('2e17')))
      escrowAfter.should.be.eq.BN(BNe10(('2e17')))
    })
  })

  context('releasing tokens from escrow back to payer', () => {
    beforeEach(async () => {
      await token.approve(marketplace.address, new BigNumber('5e17'))
      await marketplace.moveTokensToEscrowLockup(new BigNumber('2e17'))
    })

    it('increases the payer balance when escrow released', async () => {
      const before = await allBalances()
      const escrowBefore = await marketplace.tokenEscrow(alice)

      await marketplace.releaseTokensFromEscrow(new BigNumber('2e17'), {from: alice})
        .should.be.fulfilled

      const after = await allBalances()
      const escrowAfter = await marketplace.tokenEscrow(alice)

      // Bob's balance stays the same
      before.token.bob.should.be.eq.BN(BNe10(('1e18')))
      after.token.bob.should.be.eq.BN(BNe10(('1e18')))

      // Alice's increases
      before.token.alice.should.be.eq.BN(BNe10(('8e17')))
      after.token.alice.should.be.eq.BN(BNe10(('1e18')))

      // Escrow goes to zero
      escrowBefore.should.be.eq.BN(BNe10(('2e17')))
      escrowAfter.should.be.eq.BN('0')
    })

    it('fails if more than available balance', async () => {
      const before = await allBalances()
      const escrowBefore = await marketplace.tokenEscrow(alice)

      await marketplace
        .releaseTokensFromEscrow(new BigNumber('3e17'))
        .should.be.rejectedWith(EVMThrow)

      const after = await allBalances()
      const escrowAfter = await marketplace.tokenEscrow(alice)

      // Bob's balance stays the same
      before.token.bob.should.be.eq.BN(BNe10(('1e18')))
      after.token.bob.should.be.eq.BN(BNe10(('1e18')))

      // Alice's stays the same
      before.token.alice.should.be.eq.BN(BNe10(('8e17')))
      after.token.alice.should.be.eq.BN(BNe10(('8e17')))

      // Escrow stays the same
      escrowBefore.should.be.eq.BN(BNe10(('2e17')))
      escrowAfter.should.be.eq.BN(BNe10(('2e17')))
    })

    it('emits an event when escrow is released', async () => {
      const {logs} = await marketplace.releaseTokensFromEscrow(new BigNumber('2e17'))

      const matchingLog = logs.find(
        log => log.event === 'TokenMarketplaceWithdrawal'
      )

      should.exist(matchingLog)

      if (!matchingLog) return // Satisfy TS

      matchingLog.args.escrowPayer.should.be.eq.BN(alice)
      matchingLog.args.amount.should.be.eq.BN(BNe10(('2e17')))
    })
  })

  context('releasing tokens from escrow back to payer on behalf of user', () => {
    beforeEach(async () => {
      await token.approve(marketplace.address, new BigNumber('5e17'))
      await marketplace.moveTokensToEscrowLockup(new BigNumber('2e17'))
      releaseTokensForSig = ethSigUtil.signTypedData(alicePrivkey, {
        data: getFormattedTypedDataReleaseTokensFor(
          marketplace.address,
          1,
          alice,
          new BigNumber('2e17').toString(10),
          nonceHash
        ),
      })
    })

    it('increases the payer balance when escrow released', async () => {
      const before = await allBalances()
      const escrowBefore = await marketplace.tokenEscrow(alice)

      await marketplace.releaseTokensFromEscrowFor(
        alice,
        new BigNumber('2e17'),
        nonceHash,
        releaseTokensForSig,
        {from: mockAdmin}
      ).should.be.fulfilled

      const after = await allBalances()
      const escrowAfter = await marketplace.tokenEscrow(alice)

      // Bob's balance stays the same
      before.token.bob.should.be.eq.BN(BNe10(('1e18')))
      after.token.bob.should.be.eq.BN(BNe10(('1e18')))

      // Alice's increases
      before.token.alice.should.be.eq.BN(BNe10(('8e17')))
      after.token.alice.should.be.eq.BN(BNe10(('1e18')))

      // Escrow goes to zero
      escrowBefore.should.be.eq.BN(BNe10(('2e17')))
      escrowAfter.should.be.eq.BN('0')
    })

    it('allows anyone to submit valid sigs', async () => {
      await marketplace.releaseTokensFromEscrowFor(
        alice,
        new BigNumber('2e17'),
        nonceHash,
        releaseTokensForSig,
        {from: bob}
      ).should.be.fulfilled
    })

    it('fails if sender does not match sig', async () => {
      await token.approve(marketplace.address, new BigNumber('2e17'), {from: bob})
      await marketplace.moveTokensToEscrowLockup(new BigNumber('2e17'), {from: bob})
      await marketplace
        .releaseTokensFromEscrowFor(
          bob,
          new BigNumber('2e17'),
          nonceHash,
          releaseTokensForSig
        )
        .should.be.rejectedWith(EVMThrow)
    })

    it('fails if amount does not match sig', async () => {
      await marketplace
        .releaseTokensFromEscrowFor(
          alice,
          new BigNumber('1e17'),
          nonceHash,
          releaseTokensForSig,
          {from: mockAdmin}
        )
        .should.be.rejectedWith(EVMThrow)
    })

    it('fails if amount does not match sig', async () => {
      await marketplace
        .releaseTokensFromEscrowFor(
          alice,
          new BigNumber('3e17'),
          nonceHash,
          releaseTokensForSig,
          {from: mockAdmin}
        )
        .should.be.rejectedWith(EVMThrow)
    })

    it('fails if nonce does not match sig', async () => {
      await marketplace
        .releaseTokensFromEscrowFor(
          alice,
          new BigNumber('2e17'),
          differentNonceHash,
          releaseTokensForSig,
          {from: mockAdmin}
        )
        .should.be.rejectedWith(EVMThrow)
    })

    it('fails if sig replayed', async () => {
      const partialReleaseSig = ethSigUtil.signTypedData(alicePrivkey, {
        data: getFormattedTypedDataReleaseTokensFor(
          marketplace.address,
          1,
          alice,
          new BigNumber('1e17').toString(10),
          nonceHash
        ),
      })
      await marketplace.releaseTokensFromEscrowFor(
        alice,
        new BigNumber('1e17'),
        nonceHash,
        partialReleaseSig,

        {from: bob}
      ).should.be.fulfilled
      console.log(`remaining balance ${await marketplace.tokenEscrow(alice)}`)
      await marketplace
        .releaseTokensFromEscrowFor(
          alice,
          new BigNumber('1e17'),
          nonceHash,
          partialReleaseSig,

          {from: bob}
        )
        .should.be.rejectedWith(EVMThrow)
    })

    it('allows multiple txs if different nonce', async () => {
      const partialReleaseSig = ethSigUtil.signTypedData(alicePrivkey, {
        data: getFormattedTypedDataReleaseTokensFor(
          marketplace.address,
          1,
          alice,
          new BigNumber('1e17').toString(10),
          nonceHash
        ),
      })
      const diffPartialReleaseSig = ethSigUtil.signTypedData(alicePrivkey, {
        data: getFormattedTypedDataReleaseTokensFor(
          marketplace.address,
          1,
          alice,
          new BigNumber('1e17').toString(10),
          differentNonceHash
        ),
      })
      await marketplace.releaseTokensFromEscrowFor(
        alice,
        new BigNumber('1e17'),
        nonceHash,
        partialReleaseSig,

        {from: bob}
      ).should.be.fulfilled
      console.log(`remaining balance ${await marketplace.tokenEscrow(alice)}`)
      await marketplace.releaseTokensFromEscrowFor(
        alice,
        new BigNumber('1e17'),
        differentNonceHash,
        diffPartialReleaseSig,

        {from: bob}
      ).should.be.fulfilled
    })
  })
})
