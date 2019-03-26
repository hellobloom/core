import * as ethereumjsWallet from 'ethereumjs-wallet'
const ethSigUtil = require('eth-sig-util')

import {EVMThrow} from './helpers/EVMThrow'
import {should} from './test_setup'

import {
  getFormattedTypedDataAttestationRequest,
  getFormattedTypedDataPayTokens,
  getFormattedTypedDataAttestFor,
  getFormattedTypedDataContestFor,
  getFormattedTypedDataRevokeAttestationFor,
} from './helpers/signingLogic'
import {generateSigNonce} from '../src/signData'
import {
  MockBLTInstance,
  AttestationLogicInstance,
  TokenEscrowMarketplaceInstance,
} from '../types/truffle-contracts'
import BN from 'bn.js'
import BigNumber = require('bignumber.js')
import { BNe10 } from './helpers/BNe10'

const TokenEscrowMarketplace = artifacts.require('TokenEscrowMarketplace')
const AttestationLogic = artifacts.require('AttestationLogic')
const MockBLT = artifacts.require('MockBLT')
const zeroAddress = '0x0000000000000000000000000000000000000000'

contract('AttestationLogic', function([
  alice,
  bob,
  carl,
  david,
  ellen,
  initializer,
]) {
  let token: MockBLTInstance
  let attestationLogic: AttestationLogicInstance
  let attestationLogicAddress: string
  let tokenEscrowMarketplace: TokenEscrowMarketplaceInstance
  let tokenEscrowMarketplaceAddress: string

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

  const davidWallet = ethereumjsWallet.fromPrivateKey(
    new Buffer(
      'c88b703fb08cbea894b6aeff5a544fb92e78a18e19814cd85da83b71f772aa6c',
      'hex'
    )
  )
  const davidPrivkey = davidWallet.getPrivateKey()

  // Sanity check
  if (alice.toLowerCase() != aliceWallet.getAddressString()) {
    throw new Error('Mnemonic used for truffle tests out of sync?')
  }

  // Sanity check
  if (bob.toLowerCase() != bobWallet.getAddressString()) {
    throw new Error('Mnemonic used for truffle tests out of sync?')
  }

  // Sanity check
  if (david.toLowerCase() != davidWallet.getAddressString()) {
    throw new Error('Mnemonic used for truffle tests out of sync?')
  }

  const emailDataHash =
    '0xd1696aa0222c2ee299efa58d265eaecc4677d8c88cb3a5c7e60bc5957fff514a'
  const combinedDataHash =
    '0xe72cf1f9a85fbc529cd17cded83d0021beb12359c7f238276d8e20aea603e928'

  let nonce: string
  let differentNonce: string

  let subjectSig: string[]
  let unrelatedSignature: string[]
  let tokenPaymentSig: string[]
  let attesterDelegationSig: string[]
  let contesterDelegationSig: string[]

  let attestDefaults: {
    subject: string
    attester: string
    requester: string
    reward: BigNumber.BigNumber
    requesterSig: string[]
    dataHash: string
    requestNonce: string
    subjectSig: string[]
    from: string
  }

  let attest = async (props: Partial<typeof attestDefaults> = attestDefaults) => {
    let {
      subject,
      attester,
      requester,
      reward,
      requesterSig,
      dataHash,
      requestNonce,
      subjectSig,
      from,
    } = {
      ...attestDefaults,
      ...props,
    }

    return attestationLogic.attest(
      subject,
      requester,
      reward,
      requesterSig,
      dataHash,
      requestNonce,
      subjectSig,
      {
        from,
      }
    )
  }
  let contestDefaults: {
    attester: string
    requester: string
    reward: BigNumber.BigNumber
    paymentNonce: string
    requesterSig: string[]
    from: string
  }

  let contest = async (props: Partial<typeof contestDefaults> = contestDefaults) => {
    let {attester, requester, reward, paymentNonce, requesterSig, from} = {
      ...contestDefaults,
      ...props,
    }

    return attestationLogic.contest(requester, reward, paymentNonce, requesterSig, {
      from,
    })
  }

  // Send more test eth to alice so it doesn't run out during test
  web3.eth.sendTransaction({
    to: alice,
    from: bob,
    value: web3.utils.toWei('50', 'ether'),
  })

  beforeEach(async () => {
    token = await MockBLT.new()

    attestationLogic = await AttestationLogic.new(initializer, zeroAddress)
    attestationLogicAddress = attestationLogic.address

    tokenEscrowMarketplace = await TokenEscrowMarketplace.new(
      token.address,
      attestationLogic.address
    )
    tokenEscrowMarketplaceAddress = tokenEscrowMarketplace.address

    await attestationLogic.setTokenEscrowMarketplace(tokenEscrowMarketplaceAddress, {
      from: initializer,
    })

    await Promise.all([
      token.gift(david, new BigNumber('1e18')),
      token.gift(david, new BigNumber('1e18')),
    ])

    await token.approve(tokenEscrowMarketplaceAddress, new BigNumber('2e18'), {
      from: david,
    })

    await tokenEscrowMarketplace.moveTokensToEscrowLockup(new BigNumber('2e18'), {
      from: david,
    })

    nonce = generateSigNonce()
    differentNonce = generateSigNonce()

    subjectSig = ethSigUtil.signTypedData(alicePrivkey, {
      data: getFormattedTypedDataAttestationRequest(
        attestationLogicAddress,
        1,
        combinedDataHash,
        nonce
      ),
    })

    tokenPaymentSig = ethSigUtil.signTypedData(davidPrivkey, {
      data: getFormattedTypedDataPayTokens(
        tokenEscrowMarketplaceAddress,
        1,
        david,
        bob,
        new BigNumber(web3.utils.toWei('1', 'ether')).toString(10),
        nonce
      ),
    })

    unrelatedSignature = ethSigUtil.signTypedData(
      ethereumjsWallet.generate().getPrivateKey(),
      {
        data: getFormattedTypedDataAttestationRequest(
          attestationLogicAddress,
          1,
          combinedDataHash,
          nonce
        ),
      }
    )

    attesterDelegationSig = ethSigUtil.signTypedData(bobPrivkey, {
      data: getFormattedTypedDataAttestFor(
        attestationLogicAddress,
        1,
        alice,
        david,
        new BigNumber(web3.utils.toWei('1', 'ether')).toString(10),
        combinedDataHash,
        nonce
      ),
    })

    contesterDelegationSig = ethSigUtil.signTypedData(bobPrivkey, {
      data: getFormattedTypedDataContestFor(
        attestationLogicAddress,
        1,
        david,
        new BigNumber(web3.utils.toWei('1', 'ether')).toString(10),
        nonce
      ),
    })

    attestDefaults = {
      subject: alice,
      attester: bob,
      requester: david,
      reward: new BigNumber(web3.utils.toWei('1', 'ether')),
      requesterSig: tokenPaymentSig,
      dataHash: combinedDataHash,
      requestNonce: nonce,
      subjectSig: subjectSig,
      from: bob,
    }
    attest = async (props: Partial<typeof attestDefaults> = attestDefaults) => {
      let {
        subject,
        attester,
        requester,
        reward,
        requesterSig,
        dataHash,
        requestNonce,
        subjectSig,
        from,
      } = {
        ...attestDefaults,
        ...props,
      }

      return attestationLogic.attest(
        subject,
        requester,
        reward,
        requesterSig,
        dataHash,
        requestNonce,
        subjectSig,
        {
          from,
        }
      )
    }
    contestDefaults = {
      attester: bob,
      requester: david,
      reward: new BigNumber(web3.utils.toWei('1', 'ether')),
      paymentNonce: nonce,
      requesterSig: tokenPaymentSig,
      from: bob,
    }

    contest = async (props: Partial<typeof contestDefaults> = contestDefaults) => {
      let {attester, requester, reward, paymentNonce, requesterSig, from} = {
        ...contestDefaults,
        ...props,
      }

      return attestationLogic.contest(
        requester,
        reward,
        paymentNonce,
        requesterSig,
        {
          from,
        }
      )
    }
  })

  // await increaseTime(60 * 60 * 24 * 364);
  context('submitting attestations', () => {
    interface WriteEventArgs {
      subject: string
      attester: string
      requester: string
      dataHash: string
    }

    it('accepts a valid attestation', async () => {
      await attest().should.be.fulfilled
    })

    it('accepts a valid attestation with 0 reward', async () => {
      await attest({
        reward: new BigNumber(0),
        requesterSig: ethSigUtil.signTypedData(davidPrivkey, {
          data: getFormattedTypedDataPayTokens(
            tokenEscrowMarketplaceAddress,
            1,
            david,
            bob,
            new BigNumber(0).toString(10),
            nonce
          ),
        }),
      }).should.be.fulfilled
    })

    it('Fails if sent by different attester', async () => {
      await attest({from: alice}).should.be.rejectedWith(EVMThrow)
    })

    it('emits an event when attestation is written', async () => {
      const {logs} = await attest()

      const matchingLog = logs.find(log => log.event === 'TraitAttested')

      should.exist(matchingLog)
      if (!matchingLog) return

      matchingLog.args.subject.should.be.equal(alice)
      matchingLog.args.attester.should.be.equal(bob)
      matchingLog.args.requester.should.be.equal(david)
      matchingLog.args.dataHash.should.be.equal(attestDefaults.dataHash)
    })

    it('accepts a valid second attestation with different nonce', async () => {
      await attest().should.be.fulfilled
      await attest({
        requesterSig: ethSigUtil.signTypedData(davidPrivkey, {
          data: getFormattedTypedDataPayTokens(
            tokenEscrowMarketplaceAddress,
            1,
            david,
            bob,
            new BigNumber(web3.utils.toWei('1', 'ether')).toString(10),
            differentNonce
          ),
        }),
        requestNonce: differentNonce,
        subjectSig: ethSigUtil.signTypedData(alicePrivkey, {
          data: getFormattedTypedDataAttestationRequest(
            attestationLogicAddress,
            1,
            combinedDataHash,
            differentNonce
          ),
        }),
      }).should.be.fulfilled
    })

    it('pays tokens from escrow to the verifier and leaves some leftover', async () => {
      const requesterEscrowBalanceBefore = await tokenEscrowMarketplace.tokenEscrow(
        david
      )
      requesterEscrowBalanceBefore.should.be.eq.BN(BNe10('2e18'))
      ;(await token.balanceOf(bob)).should.be.eq.BN('0')

      await attest()

      const requesterEscrowBalanceAfter = await tokenEscrowMarketplace.tokenEscrow(
        david
      )
      requesterEscrowBalanceAfter.should.be.eq.BN(BNe10('1e18'))
      ;(await token.balanceOf(bob)).should.be.eq.BN(BNe10('1e18'))
    })

    it('pays all tokens from escrow to the verifier', async () => {
      const requesterEscrowBalanceBefore = await tokenEscrowMarketplace.tokenEscrow(
        david
      )
      requesterEscrowBalanceBefore.should.be.eq.BN(BNe10('2e18'))
      ;(await token.balanceOf(bob)).should.be.eq.BN('0')

      await attest({
        reward: new BigNumber(web3.utils.toWei('2', 'ether')),
        requesterSig: ethSigUtil.signTypedData(davidPrivkey, {
          data: getFormattedTypedDataPayTokens(
            tokenEscrowMarketplaceAddress,
            1,
            david,
            bob,
            new BigNumber(web3.utils.toWei('2', 'ether')).toString(10),
            nonce
          ),
        }),
      })

      const requesterEscrowBalanceAfter = await tokenEscrowMarketplace.tokenEscrow(
        david
      )
      requesterEscrowBalanceAfter.should.be.eq.BN('0')
      ;(await token.balanceOf(bob)).should.be.eq.BN(BNe10('2e18'))
    })

    it('submits a second attestation for same data with different nonce', async () => {
      await attest()
      await attest({
        requesterSig: ethSigUtil.signTypedData(davidPrivkey, {
          data: getFormattedTypedDataPayTokens(
            tokenEscrowMarketplaceAddress,
            1,
            david,
            bob,
            new BigNumber(web3.utils.toWei('1', 'ether')).toString(10),
            differentNonce
          ),
        }),
        requestNonce: differentNonce,
        subjectSig: ethSigUtil.signTypedData(alicePrivkey, {
          data: getFormattedTypedDataAttestationRequest(
            attestationLogicAddress,
            1,
            attestDefaults.dataHash,
            differentNonce
          ),
        }),
      }).should.be.fulfilled
    })

    it("rejects attestations that aren't sent from the attester specified in the request", async () => {
      await attest({from: carl}).should.be.rejectedWith(EVMThrow)
    })

    it('rejects attestations with for an invalid subject', async () => {
      await attest({subject: carl}).should.be.rejectedWith(EVMThrow)
    })

    it('rejects attestations with for an invalid requester', async () => {
      await attest({requester: carl}).should.be.rejectedWith(EVMThrow)
    })

    it('rejects attestations with for an invalid reward', async () => {
      await attest({
        reward: new BigNumber(web3.utils.toWei('2', 'ether')),
      }).should.be.rejectedWith(EVMThrow)
    })

    it('rejects attestations with for an invalid data hash', async () => {
      await attest({dataHash: emailDataHash}).should.be.rejectedWith(EVMThrow)
    })

    it('rejects attestations with for an invalid request nonce', async () => {
      await attest({requestNonce: differentNonce}).should.be.rejectedWith(EVMThrow)
    })

    it('rejects attestations if at attestation has already been submitted', async () => {
      await attest().should.be.fulfilled
      await attest().should.be.rejectedWith(EVMThrow)
    })
  })

  context('Rejecting attestation', () => {
    it('accepts a valid contestation', async () => {
      await contest().should.be.fulfilled
    })

    interface rejectEventArgs {
      attester: string
      requester: string
    }

    it('emits an event when attestation is rejected', async () => {
      const {logs} = await contest()

      const matchingLog = logs.find(log => log.event === 'AttestationRejected')

      should.exist(matchingLog)
      if (!matchingLog) return

      matchingLog.args.attester.should.be.equal(bob)
      matchingLog.args.requester.should.be.equal(david)
    })

    it('pays tokens from escrow to the verifier and leaves some leftover', async () => {
      const requesterEscrowBalanceBefore = await tokenEscrowMarketplace.tokenEscrow(
        david
      )
      requesterEscrowBalanceBefore.should.be.eq.BN(BNe10('2e18'))
      ;(await token.balanceOf(bob)).should.be.eq.BN('0')

      await contest()

      const requesterEscrowBalanceAfter = await tokenEscrowMarketplace.tokenEscrow(
        david
      )
      requesterEscrowBalanceAfter.should.be.eq.BN(BNe10('1e18'))
      ;(await token.balanceOf(bob)).should.be.eq.BN(BNe10('1e18'))
    })

    it('pays all tokens from escrow to the verifier', async () => {
      const requesterEscrowBalanceBefore = await tokenEscrowMarketplace.tokenEscrow(
        david
      )
      requesterEscrowBalanceBefore.should.be.eq.BN(BNe10('2e18'))
      ;(await token.balanceOf(bob)).should.be.eq.BN('0')

      await contest({
        reward: new BigNumber(web3.utils.toWei('2', 'ether')),
        requesterSig: ethSigUtil.signTypedData(davidPrivkey, {
          data: getFormattedTypedDataPayTokens(
            tokenEscrowMarketplaceAddress,
            1,
            david,
            bob,
            new BigNumber(web3.utils.toWei('2', 'ether')).toString(10),
            nonce
          ),
        }),
      })

      const requesterEscrowBalanceAfter = await tokenEscrowMarketplace.tokenEscrow(
        david
      )
      requesterEscrowBalanceAfter.should.be.eq.BN('0')
      ;(await token.balanceOf(bob)).should.be.eq.BN(BNe10('2e18'))
    })

    it('Fails if attester does not match payment sig', async () => {
      await contest({
        from: alice,
      }).should.be.rejectedWith(EVMThrow)
    })
  })

  context('delegating rejecting attestations', () => {
    let contestForDefaults: {
      attester: string
      requester: string
      reward: BigNumber.BigNumber
      paymentNonce: string
      requesterSig: string[]
      delegationSig: string[]
      from: string
    }

    let contestFor = async (
      props: Partial<typeof contestForDefaults> = contestForDefaults
    ) => {
      let {
        attester,
        requester,
        reward,
        paymentNonce,
        requesterSig,
        delegationSig,
        from,
      } = {
        ...contestForDefaults,
        ...props,
      }

      return attestationLogic.contestFor(
        attester,
        requester,
        reward,
        paymentNonce,
        requesterSig,
        delegationSig,
        {
          from,
        }
      )
    }
    beforeEach(async () => {
      contestForDefaults = {
        attester: bob,
        requester: david,
        reward: new BigNumber(web3.utils.toWei('1', 'ether')),
        paymentNonce: nonce,
        requesterSig: tokenPaymentSig,
        delegationSig: contesterDelegationSig,
        from: carl,
      }

      contestFor = async (
        props: Partial<typeof contestForDefaults> = contestForDefaults
      ) => {
        let {
          attester,
          requester,
          reward,
          paymentNonce,
          requesterSig,
          delegationSig,
          from,
        } = {
          ...contestForDefaults,
          ...props,
        }

        return attestationLogic.contestFor(
          attester,
          requester,
          reward,
          paymentNonce,
          requesterSig,
          delegationSig,
          {
            from,
          }
        )
      }
    })

    it('accepts a valid delegated attestation rejection', async () => {
      await contestFor().should.be.fulfilled
    })

    it('rejects an attestation rejection if the attester is wrong in the signature', async () => {
      await contestFor({
        attester: ellen,
      }).should.be.rejectedWith(EVMThrow)
    })

    it('rejects an attestation rejection if the requester is wrong in the signature', async () => {
      await contestFor({
        requester: ellen,
      }).should.be.rejectedWith(EVMThrow)
    })

    it('rejects an attestation rejection if the reward is wrong', async () => {
      await contestFor({
        reward: new BigNumber(web3.utils.toWei('2', 'ether')),
      }).should.be.rejectedWith(EVMThrow)
    })

    it('rejects an attestation rejection if the payment nonce is wrong', async () => {
      await contestFor({
        paymentNonce: differentNonce,
      }).should.be.rejectedWith(EVMThrow)
    })
  })

  context('delegating attestations', () => {
    let attestForDefaults: {
      subject: string
      attester: string
      requester: string
      reward: BigNumber.BigNumber
      requesterSig: string[]
      dataHash: string
      requestNonce: string
      subjectSig: string[]
      delegationSig: string[]
      from: string
    }

    let attestFor = async (
      props: Partial<typeof attestForDefaults> = attestForDefaults
    ) => {
      let {
        subject,
        attester,
        requester,
        reward,
        requesterSig,
        dataHash,
        requestNonce,
        subjectSig,
        delegationSig,
        from,
      } = {
        ...attestForDefaults,
        ...props,
      }

      return attestationLogic.attestFor(
        subject,
        attester,
        requester,
        reward,
        requesterSig,
        dataHash,
        requestNonce,
        subjectSig,
        delegationSig,
        {
          from,
        }
      )
    }

    beforeEach(async () => {
      attestForDefaults = {
        subject: alice,
        attester: bob,
        requester: david,
        reward: new BigNumber(web3.utils.toWei('1', 'ether')),
        requesterSig: tokenPaymentSig,
        dataHash: combinedDataHash,
        requestNonce: nonce,
        subjectSig: subjectSig,
        delegationSig: attesterDelegationSig,
        from: carl,
      }

      attestFor = async (
        props: Partial<typeof attestForDefaults> = attestForDefaults
      ) => {
        let {
          subject,
          attester,
          requester,
          reward,
          requesterSig,
          dataHash,
          requestNonce,
          subjectSig,
          delegationSig,
          from,
        } = {
          ...attestForDefaults,
          ...props,
        }

        return attestationLogic.attestFor(
          subject,
          attester,
          requester,
          reward,
          requesterSig,
          dataHash,
          requestNonce,
          subjectSig,
          delegationSig,
          {
            from,
          }
        )
      }
    })

    it('accepts a valid delegated attestation', async () => {
      await attestFor().should.be.fulfilled
    })

    it('rejects an attestation if the subject is wrong in the signature', async () => {
      await attestFor({
        subject: ellen,
      }).should.be.rejectedWith(EVMThrow)
    })

    it('rejects an attestation if the attester is wrong in the signature', async () => {
      await attestFor({
        attester: ellen,
      }).should.be.rejectedWith(EVMThrow)
    })

    it('rejects an attestation if the requester is wrong in the signature', async () => {
      await attestFor({
        requester: ellen,
      }).should.be.rejectedWith(EVMThrow)
    })

    it('rejects an attestation if the reward is wrong', async () => {
      await attestFor({
        reward: new BigNumber(web3.utils.toWei('2', 'ether')),
      }).should.be.rejectedWith(EVMThrow)
    })

    it('rejects an attestation if the data hash is wrong', async () => {
      await attestFor({
        dataHash: emailDataHash,
      }).should.be.rejectedWith(EVMThrow)
    })

    it('rejects an attestation if the request nonce is wrong', async () => {
      await attestFor({
        requestNonce: differentNonce,
      }).should.be.rejectedWith(EVMThrow)
    })
  })

  context('revoking attestations', () => {
    const revokeLink =
      '0xb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6'

    it('Allows attester to revoke an attestation', async () => {
      await attestationLogic.revokeAttestation(revokeLink, {
        from: bob,
      }).should.be.fulfilled
    })

    interface RevokeEventArgs {
      link: string
      attester: string
    }

    it('emits an event when attestation is revoked', async () => {
      const {logs} = await attestationLogic.revokeAttestation(revokeLink, {
        from: bob,
      })

      const matchingLog = logs.find(log => log.event === 'AttestationRevoked')

      should.exist(matchingLog)
      if (!matchingLog) return

      matchingLog.args.link.should.be.equal(revokeLink)
      matchingLog.args.attester.should.be.equal(bob)
    })
  })

  context('delegated revoking attestations', () => {
    const revokeLink =
      '0xb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6'
    const differentRevokeLink =
      '0xc10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6'
    let revokeAttestationDelegationSig: string[]

    it('Allows anyone to revoke an attestation on behalf of an attester with a valid sig', async () => {
      revokeAttestationDelegationSig = ethSigUtil.signTypedData(bobPrivkey, {
        data: getFormattedTypedDataRevokeAttestationFor(
          attestationLogicAddress,
          1,
          revokeLink,
          nonce
        ),
      })
      await attestationLogic.revokeAttestationFor(
        bob,
        revokeLink,
        nonce,
        revokeAttestationDelegationSig,
        {
          from: carl,
        }
      ).should.be.fulfilled
    })

    it('Fails if link is wrong', async () => {
      revokeAttestationDelegationSig = ethSigUtil.signTypedData(bobPrivkey, {
        data: getFormattedTypedDataRevokeAttestationFor(
          attestationLogicAddress,
          1,
          revokeLink,
          nonce
        ),
      })
      await attestationLogic
        .revokeAttestationFor(
          bob,
          differentRevokeLink,
          nonce,
          revokeAttestationDelegationSig,
          {
            from: carl,
          }
        )
        .should.be.rejectedWith(EVMThrow)
    })

    it('Fails if nonce is wrong', async () => {
      revokeAttestationDelegationSig = ethSigUtil.signTypedData(bobPrivkey, {
        data: getFormattedTypedDataRevokeAttestationFor(
          attestationLogicAddress,
          1,
          revokeLink,
          nonce
        ),
      })
      await attestationLogic
        .revokeAttestationFor(
          bob,
          revokeLink,
          differentNonce,
          revokeAttestationDelegationSig,
          {
            from: carl,
          }
        )
        .should.be.rejectedWith(EVMThrow)
    })

    it('Does not allow sig to be replayed', async () => {
      revokeAttestationDelegationSig = ethSigUtil.signTypedData(bobPrivkey, {
        data: getFormattedTypedDataRevokeAttestationFor(
          attestationLogicAddress,
          1,
          revokeLink,
          nonce
        ),
      })
      await attestationLogic.revokeAttestationFor(
        bob,
        revokeLink,
        nonce,
        revokeAttestationDelegationSig,
        {
          from: carl,
        }
      ).should.be.fulfilled
      await attestationLogic
        .revokeAttestationFor(
          bob,
          revokeLink,
          nonce,
          revokeAttestationDelegationSig,
          {
            from: carl,
          }
        )
        .should.be.rejectedWith(EVMThrow)
    })

    interface RevokeEventArgs {
      link: string
      attester: string
    }

    it('emits an event when attestation is revoked via delegated sig', async () => {
      revokeAttestationDelegationSig = ethSigUtil.signTypedData(bobPrivkey, {
        data: getFormattedTypedDataRevokeAttestationFor(
          attestationLogicAddress,
          1,
          revokeLink,
          nonce
        ),
      })
      const {logs} = await attestationLogic.revokeAttestationFor(
        bob,
        revokeLink,
        nonce,
        revokeAttestationDelegationSig,
        {
          from: carl,
        }
      )

      const matchingLog = logs.find(log => log.event === 'AttestationRevoked')

      should.exist(matchingLog)
      if (!matchingLog) return

      console.log(matchingLog.args)

      matchingLog.args.link.should.be.equal(revokeLink)
      matchingLog.args.attester.should.be.equal(bob)
    })
  })

  describe('configuring the Token Escrow Marketplace', async () => {
    let differentTokenEscrowMarketplace: TokenEscrowMarketplaceInstance
    let TokenEscrowMarketplaceAddressBefore: string

    beforeEach(async () => {
      differentTokenEscrowMarketplace = await TokenEscrowMarketplace.new(
        token.address,
        attestationLogic.address
      )
      TokenEscrowMarketplaceAddressBefore = await attestationLogic.tokenEscrowMarketplace()
    })

    it('allows the initializer to change the marketplace during initialization', async () => {
      await attestationLogic.setTokenEscrowMarketplace(
        differentTokenEscrowMarketplace.address,
        {from: initializer}
      )
      const TokenEscrowMarketplaceAddressAfter = await attestationLogic.tokenEscrowMarketplace()

      TokenEscrowMarketplaceAddressBefore.should.be.equal(
        tokenEscrowMarketplaceAddress
      )
      TokenEscrowMarketplaceAddressAfter.should.be.equal(
        differentTokenEscrowMarketplace.address
      )
    })

    it("doesn't allow anyone else to change the marketplace", async () => {
      await attestationLogic
        .setTokenEscrowMarketplace(differentTokenEscrowMarketplace.address, {
          from: bob,
        })
        .should.be.rejectedWith(EVMThrow)
      const TokenEscrowMarketplaceAddressAfter = await attestationLogic.tokenEscrowMarketplace()

      TokenEscrowMarketplaceAddressBefore.should.be.equal(
        tokenEscrowMarketplaceAddress
      )
      TokenEscrowMarketplaceAddressAfter.should.be.equal(
        tokenEscrowMarketplaceAddress
      )
    })

    it("doesn't initializer to change the marketplace after initialization ends", async () => {
      await attestationLogic.endInitialization({from: initializer}).should.be
        .fulfilled
      await attestationLogic
        .setTokenEscrowMarketplace(differentTokenEscrowMarketplace.address, {
          from: initializer,
        })
        .should.be.rejectedWith(EVMThrow)
      const TokenEscrowMarketplaceAddressAfter = await attestationLogic.tokenEscrowMarketplace()

      TokenEscrowMarketplaceAddressBefore.should.be.equal(
        tokenEscrowMarketplaceAddress
      )
      TokenEscrowMarketplaceAddressAfter.should.be.equal(
        tokenEscrowMarketplaceAddress
      )
    })
  })

  describe('Migrating attestations during initialization', async () => {
    it('allows the initializer to write attestations without validation during initialization', async () => {
      await attestationLogic.migrateAttestation(
        bob,
        david,
        alice,
        combinedDataHash,
        {from: initializer}
      ).should.be.fulfilled
    })
    it('does not allow anyone else to write attestations during initialization', async () => {
      await attestationLogic
        .migrateAttestation(bob, david, alice, combinedDataHash, {from: bob})
        .should.be.rejectedWith(EVMThrow)
    })
    it('does not allow initializer to migrate attestations after initialization', async () => {
      await attestationLogic.endInitialization({from: initializer}).should.be
        .fulfilled
      await attestationLogic
        .migrateAttestation(bob, david, alice, combinedDataHash, {from: initializer})
        .should.be.rejectedWith(EVMThrow)
    })
    it('does not allow anyone else to write attestations after initialization', async () => {
      await attestationLogic.endInitialization({from: initializer}).should.be
        .fulfilled
      await attestationLogic
        .migrateAttestation(bob, david, alice, combinedDataHash, {from: bob})
        .should.be.rejectedWith(EVMThrow)
    })
    interface WriteEventArgs {
      subject: string
      attester: string
      requester: string
      dataHash: string
    }

    it('emits an event when attestation is migrated', async () => {
      const {logs} = await attestationLogic.migrateAttestation(
        david,
        bob,
        alice,
        combinedDataHash,
        {
          from: initializer,
        }
      )

      const matchingLog = logs.find(log => log.event === 'TraitAttested')

      should.exist(matchingLog)
      if (!matchingLog) return

      matchingLog.args.subject.should.be.equal(alice)
      matchingLog.args.attester.should.be.equal(bob)
      matchingLog.args.requester.should.be.equal(david)
      matchingLog.args.dataHash.should.be.equal(combinedDataHash)
    })
  })
})
