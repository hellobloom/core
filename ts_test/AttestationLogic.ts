import * as Web3 from "web3";
import * as BigNumber from "bignumber.js";
import * as ethereumjsWallet from "ethereumjs-wallet";
const ethSigUtil = require("eth-sig-util");
import { bufferToHex } from "ethereumjs-util";
const uuid = require('uuidv4')
import {AttestationTypeID, HashingLogic} from '@bloomprotocol/attestations-lib'

import { EVMThrow } from "./helpers/EVMThrow";
import { should } from "./test_setup";
import {
  SigningLogicLegacyInstance,
  AttestationLogicInstance,
  TokenEscrowMarketplaceInstance,
  AccountRegistryInstance,
} from "../contracts";

import { MockBLTInstance } from "./../contracts";
import { latestBlockTime } from "./helpers/blockInfo";
import * as ipfs from "./../src/ipfs";
import {
  getFormattedTypedDataAttestationRequest, 
  getFormattedTypedDataReleaseTokens, 
  getFormattedTypedDataAttestFor, 
  getFormattedTypedDataContestFor, 
  getFormattedTypedDataRevokeAttestationFor
} from "./helpers/signingLogicLegacy";
import { generateSigNonce } from "../src/signData";

const SigningLogic = artifacts.require("SigningLogicLegacy");
const AttestationRepo = artifacts.require("AttestationRepo");
const TokenEscrowMarketplace = artifacts.require("TokenEscrowMarketplace");
const AttestationLogic = artifacts.require("AttestationLogic");
const AccountRegistry = artifacts.require("AccountRegistry");
const MockBLT = artifacts.require("MockBLT");

contract("AttestationLogic", function(
  [alice, bob, carl, david, ellen]
) {
  let token: MockBLTInstance;
  let registry: AccountRegistryInstance;
  let attestationLogic: AttestationLogicInstance;
  let signingLogic: SigningLogicLegacyInstance;
  let tokenEscrowMarketplace: TokenEscrowMarketplaceInstance;

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

  const davidWallet = ethereumjsWallet.fromPrivateKey(
    new Buffer(
      "c88b703fb08cbea894b6aeff5a544fb92e78a18e19814cd85da83b71f772aa6c",
      "hex"
    )
  );
  const davidPrivkey = davidWallet.getPrivateKey();

  let aliceId: BigNumber.BigNumber;
  let bobId: BigNumber.BigNumber;
  let davidId: BigNumber.BigNumber;

  // Sanity check
  if (alice != aliceWallet.getAddressString()) {
    throw new Error("Mnemonic used for truffle tests out of sync?");
  }

  // Sanity check
  if (bob != bobWallet.getAddressString()) {
    throw new Error("Mnemonic used for truffle tests out of sync?");
  }

  // Sanity check
  if (david != davidWallet.getAddressString()) {
    throw new Error("Mnemonic used for truffle tests out of sync?");
  }

  const phoneData: HashingLogic.IAttestationData = {
    type: 'phone',
    provider: 'Bloom',
    data: "12223334444",
    nonce: uuid(),
    version: '1.0.0'
  };

  const emailData: HashingLogic.IAttestationData = {
    type: 'email',
    provider: 'Bloom',
    data: "abc@google.com",
    nonce: uuid(),
    version: '1.0.0'
  };

  const phoneOnlyMerkleTree = HashingLogic.getMerkleTree([phoneData])
  const emailOnlyMerkleTree = HashingLogic.getMerkleTree([emailData])

  const phoneDataHash = bufferToHex(phoneOnlyMerkleTree.getRoot());
  const emailDataHash = bufferToHex(emailOnlyMerkleTree.getRoot());

  const merkleTree = HashingLogic.getMerkleTree([phoneData, emailData])
  const combinedDataHash = bufferToHex(merkleTree.getRoot())

  const nonce = generateSigNonce()
  const differentNonce = generateSigNonce()

  // Send more test eth to alice so it doesn't run out during test
  web3.eth.sendTransaction({to: alice, from: bob, value: web3.toWei(50, 'ether')})

  beforeEach(async () => {
    signingLogic = await SigningLogic.new();
    registry = await AccountRegistry.new(alice)
    token = await MockBLT.new();

    attestationLogic = await AttestationLogic.new(
      alice,
      registry.address,
      signingLogic.address,
      "0x0",
    );

    tokenEscrowMarketplace = await TokenEscrowMarketplace.new(
      token.address,
      registry.address,
      signingLogic.address,
      attestationLogic.address,
    );

    await attestationLogic.setTokenEscrowMarketplace(tokenEscrowMarketplace.address);

    await Promise.all([
      // token.gift(alice),
      token.gift(david, new BigNumber("1e18")),
      token.gift(david, new BigNumber("1e18")),
      registry.createNewAccount(alice),
      registry.createNewAccount(bob),
      registry.createNewAccount(david),
    ]);
    [aliceId, bobId, davidId] = await Promise.all([
      registry.accountIdForAddress.call(alice),
      registry.accountIdForAddress.call(bob),
      registry.accountIdForAddress.call(david),
    ]);

    await token.approve(tokenEscrowMarketplace.address, new BigNumber("2e18"), {
        from: david
      })

    await tokenEscrowMarketplace.moveTokensToEscrowLockup(
      new BigNumber("2e18"),
      {from: david})

  });

  const subjectSig = ethSigUtil.signTypedDataLegacy(
    alicePrivkey,
    {data: getFormattedTypedDataAttestationRequest(
      combinedDataHash,
      nonce,
    )}
  );

  const tokenReleaseSig = ethSigUtil.signTypedDataLegacy(
    davidPrivkey,
    {data: getFormattedTypedDataReleaseTokens(
      david,
      bob,
      new BigNumber(web3.toWei(1, "ether")).toString(10),
      nonce,
    )}
  );

  const unrelatedSignature = ethSigUtil.signTypedDataLegacy(
    ethereumjsWallet.generate().getPrivateKey(),
    {data: getFormattedTypedDataAttestationRequest(
      combinedDataHash,
      nonce,
    )}
  );

  const attesterDelegationSig = ethSigUtil.signTypedDataLegacy(
    bobPrivkey,
    {data: getFormattedTypedDataAttestFor(
      alice,
      david,
      new BigNumber(web3.toWei(1, "ether")).toString(10),
      nonce,
      combinedDataHash,
      nonce,
    )}
  );

  const contesterDelegationSig = ethSigUtil.signTypedDataLegacy(
    bobPrivkey,
    {data: getFormattedTypedDataContestFor(
      david,
      new BigNumber(web3.toWei(1, "ether")).toString(10),
      nonce,
    )}
  );

  // await increaseTime(60 * 60 * 24 * 364);
  context("submitting attestations", () => {

    const attestDefaults = {
      subject: alice,
      attester: bob,
      requester: david,
      reward: new BigNumber(web3.toWei(1, "ether")),
      paymentNonce: nonce,
      requesterSig: tokenReleaseSig,
      dataHash: combinedDataHash,
      requestNonce: nonce,
      subjectSig: subjectSig,
      from: bob
    };

    const attest = async (
      props: Partial<typeof attestDefaults> = attestDefaults
    ) => {
      let {
        subject,
        attester,
        requester,
        reward,
        paymentNonce,
        requesterSig,
        dataHash,
        requestNonce,
        subjectSig,
        from
      } = {
        ...attestDefaults,
        ...props
      };

      return attestationLogic.attest(
        subject,
        requester,
        reward,
        paymentNonce,
        requesterSig,
        dataHash,
        requestNonce,
        subjectSig,
        {
          from
        }
      );
    };

    it.only("accepts a valid attestation", async () => {
      await attest().should.be.fulfilled;
    });

    it.only("accepts a valid attestation with 0 reward", async () => {
      await attest({
        reward: new BigNumber(0),
        requesterSig: ethSigUtil.signTypedDataLegacy(
          davidPrivkey,
          {data: getFormattedTypedDataReleaseTokens(
            david,
            bob,
            new BigNumber(0).toString(10),
            nonce,
          )}
        )
      }).should.be.fulfilled;
    });

    it.only("Fails if sent by different attester", async () => {
      await attest({from: alice}).should.be.rejectedWith(EVMThrow);
    });

    it.only("fails if no account for subject", async () => {
      const unrelatedWallet = ethereumjsWallet.generate()
      await attest({
        subject: carl,
        subjectSig: ethSigUtil.signTypedDataLegacy(
          unrelatedWallet.getPrivateKey(),
          {data: getFormattedTypedDataAttestationRequest(
              attestDefaults.dataHash,
              attestDefaults.requestNonce,
          )}
        )
      }
      ).should.be.rejectedWith(EVMThrow);
    });

    interface WriteEventArgs {
      subjectId: BigNumber.BigNumber;
      attesterId: BigNumber.BigNumber;
      requesterId: BigNumber.BigNumber;
      dataHash: string;
    }

    it.only("emits an event when attestation is written", async () => {
      const { logs } = ((await attest()
      ) as Web3.TransactionReceipt<any>) as Web3.TransactionReceipt<
        WriteEventArgs
      >;

      const matchingLog = logs.find(
        log => log.event === "TraitAttested"
      );

      should.exist(matchingLog);
      if (!matchingLog) return;

      matchingLog.args.subjectId.should.be.bignumber.equal(aliceId);
      matchingLog.args.attesterId.should.be.bignumber.equal(bobId);
      matchingLog.args.requesterId.should.be.bignumber.equal(davidId);
      matchingLog.args.dataHash.should.be.equal(attestDefaults.dataHash);
    });


    it.only("accepts a valid second attestation with different nonce", async () => {
      await attest().should.be.fulfilled;
      await attest({
          paymentNonce: differentNonce,
          requesterSig: ethSigUtil.signTypedDataLegacy(
            davidPrivkey,
            {data: getFormattedTypedDataReleaseTokens(
              david,
              bob,
              new BigNumber(web3.toWei(1, "ether")).toString(10),
              differentNonce,
            )}
          ),
          requestNonce: differentNonce,
        subjectSig: ethSigUtil.signTypedDataLegacy(
            alicePrivkey,
            {data: getFormattedTypedDataAttestationRequest(
              combinedDataHash,
              differentNonce,
            )}
        )
      }).should.be.fulfilled;
    });


    it.only("releases tokens from escrow to the verifier and leaves some leftover", async () => {
      const requesterEscrowBalanceBefore = await tokenEscrowMarketplace.tokenEscrow.call(davidId)
      requesterEscrowBalanceBefore.should.be.bignumber.equal("2e18");

      (await token.balanceOf(bob)).should.be.bignumber.equal(
        "0"
      );

      await attest();

      const requesterEscrowBalanceAfter = await tokenEscrowMarketplace.tokenEscrow.call(davidId)
      requesterEscrowBalanceAfter.should.be.bignumber.equal("1e18");
      (await token.balanceOf(bob)).should.be.bignumber.equal(
        "1e18"
      );
    });

    it.only("releases all tokens from escrow to the verifier", async () => {
      const requesterEscrowBalanceBefore = await tokenEscrowMarketplace.tokenEscrow.call(davidId)
      requesterEscrowBalanceBefore.should.be.bignumber.equal("2e18");

      (await token.balanceOf(bob)).should.be.bignumber.equal(
        "0"
      );

      await attest(
        {
          reward: new BigNumber(web3.toWei(2, "ether")),
          requesterSig: ethSigUtil.signTypedDataLegacy(
            davidPrivkey,
            {data: getFormattedTypedDataReleaseTokens(
              david,
              bob,
              new BigNumber(web3.toWei(2, "ether")).toString(10),
              nonce,
            )}
          ),
        }
      );

      const requesterEscrowBalanceAfter = await tokenEscrowMarketplace.tokenEscrow.call(davidId)
      requesterEscrowBalanceAfter.should.be.bignumber.equal("0");
      (await token.balanceOf(bob)).should.be.bignumber.equal(
        "2e18"
      );
    });

    it.only("submits a second attestation for same data with different nonce", async () => {
      await attest();
      await attest({
          paymentNonce: differentNonce,
          requesterSig: ethSigUtil.signTypedDataLegacy(
            davidPrivkey,
            {data: getFormattedTypedDataReleaseTokens(
              david,
              bob,
              new BigNumber(web3.toWei(1, "ether")).toString(10),
              differentNonce,
            )}
          ),
          requestNonce: differentNonce,
          subjectSig: ethSigUtil.signTypedDataLegacy(
              alicePrivkey,
              {data: getFormattedTypedDataAttestationRequest(
                attestDefaults.dataHash,
                differentNonce,
              )}
          )
      }).should.be.fulfilled;
    });

    it.only("rejects attestations that aren't sent from the attester specified in the request", async () => {
      await attest({ from: carl }).should.be.rejectedWith(EVMThrow);
    });

    it.only("rejects attestations with for an invalid subject", async () => {
      await attest({ subject: carl }).should.be.rejectedWith(EVMThrow);
    });
    
    it.only("rejects attestations with for an invalid requester", async () => {
      await attest({ requester: carl }).should.be.rejectedWith(EVMThrow);
    });

    it.only("rejects attestations with for an invalid reward", async () => {
      await attest({ reward: new BigNumber(web3.toWei(2, "ether")) }).should.be.rejectedWith(EVMThrow);
    });

    it.only("rejects attestations with for an invalid data hash", async () => {
      await attest({ dataHash: emailDataHash}).should.be.rejectedWith(EVMThrow);
    });

    it.only("rejects attestations with for an invalid payment nonce", async () => {
      await attest({ paymentNonce: differentNonce}).should.be.rejectedWith(EVMThrow);
    });

    it.only("rejects attestations with for an invalid request nonce", async () => {
      await attest({ requestNonce: differentNonce}).should.be.rejectedWith(EVMThrow);
    });

    it.only("rejects attestations if at attestation has already been submitted", async () => {
      await attest().should.be.fulfilled;
      await attest().should.be.rejectedWith(EVMThrow);
    });
  });

  context("Rejecting attestation", () => {

    const contestDefaults = {
      attester: bob,
      requester: david,
      reward: new BigNumber(web3.toWei(1, "ether")),
      paymentNonce: nonce,
      requesterSig: tokenReleaseSig,
      from: bob
    };

    const contest = async (
      props: Partial<typeof contestDefaults> = contestDefaults
    ) => {
      let {
        attester,
        requester,
        reward,
        paymentNonce,
        requesterSig,
        from
      } = {
        ...contestDefaults,
        ...props
      };

      return attestationLogic.contest(
        requester,
        reward,
        paymentNonce,
        requesterSig,
        {
          from
        }
      );
    };

    it.only("accepts a valid contestation", async () => {
      await contest().should.be.fulfilled;
    });

    interface rejectEventArgs {
      attesterId: BigNumber.BigNumber;
      requesterId: BigNumber.BigNumber;
    }

    it.only("emits an event when attestation is rejected", async () => {
      const { logs } = ((await contest()
      ) as Web3.TransactionReceipt<any>) as Web3.TransactionReceipt<
        rejectEventArgs
      >;

      const matchingLog = logs.find(
        log => log.event === "AttestationRejected"
      );

      should.exist(matchingLog);
      if (!matchingLog) return;

      matchingLog.args.attesterId.should.be.bignumber.equal(bobId);
      matchingLog.args.requesterId.should.be.bignumber.equal(davidId);
    });

    it.only("releases tokens from escrow to the verifier and leaves some leftover", async () => {
      const requesterEscrowBalanceBefore = await tokenEscrowMarketplace.tokenEscrow.call(davidId)
      requesterEscrowBalanceBefore.should.be.bignumber.equal("2e18");

      (await token.balanceOf(bob)).should.be.bignumber.equal(
        "0"
      );

      await contest();

      const requesterEscrowBalanceAfter = await tokenEscrowMarketplace.tokenEscrow.call(davidId)
      requesterEscrowBalanceAfter.should.be.bignumber.equal("1e18");
      (await token.balanceOf(bob)).should.be.bignumber.equal(
        "1e18"
      );
    });

    it.only("releases all tokens from escrow to the verifier", async () => {
      const requesterEscrowBalanceBefore = await tokenEscrowMarketplace.tokenEscrow.call(davidId)
      requesterEscrowBalanceBefore.should.be.bignumber.equal("2e18");

      (await token.balanceOf(bob)).should.be.bignumber.equal(
        "0"
      );

      await contest(
        {
          reward: new BigNumber(web3.toWei(2, "ether")),
          requesterSig: ethSigUtil.signTypedDataLegacy(
            davidPrivkey,
            {data: getFormattedTypedDataReleaseTokens(
              david,
              bob,
              new BigNumber(web3.toWei(2, "ether")).toString(10),
              nonce,
            )}
          ),
        }
      );

      const requesterEscrowBalanceAfter = await tokenEscrowMarketplace.tokenEscrow.call(davidId)
      requesterEscrowBalanceAfter.should.be.bignumber.equal("0");
      (await token.balanceOf(bob)).should.be.bignumber.equal(
        "2e18"
      );
    });

    it.only("Fails if attester does not match payment sig", async () => {
      await contest({
        from: alice
      }).should.be.rejectedWith(EVMThrow);
    });

  });

  context("delegating rejecting attestations", () => {
    const contestForDefaults = {
      attester: bob,
      requester: david,
      reward: new BigNumber(web3.toWei(1, "ether")),
      paymentNonce: nonce,
      requesterSig: tokenReleaseSig,
      delegationSig: contesterDelegationSig,
      from: carl
    };

    const contestFor = async (
      props: Partial<typeof contestForDefaults> = contestForDefaults
    ) => {
      let {
        attester,
        requester,
        reward,
        paymentNonce,
        requesterSig,
        delegationSig,
        from
      } = {
        ...contestForDefaults,
        ...props
      };

      return attestationLogic.contestFor(
        attester,
        requester,
        reward,
        paymentNonce,
        requesterSig,
        delegationSig,
        {
          from
        }
      );
    };

    it.only("accepts a valid delegated attestation rejection", async () => {
      await contestFor().should.be.fulfilled
    });

    it.only("rejects an attestation rejection if the attester is wrong in the signature", async () => {
      await contestFor(
        {
          attester: ellen
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it.only("rejects an attestation rejection if the requester is wrong in the signature", async () => {
      await contestFor(
        {
          requester: ellen
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it.only("rejects an attestation rejection if the reward is wrong", async () => {
      await contestFor(
        {
          reward: new BigNumber(web3.toWei(2, "ether"))
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it.only("rejects an attestation rejection if the payment nonce is wrong", async () => {
      await contestFor(
        {
          paymentNonce: differentNonce
        }
      ).should.be.rejectedWith(EVMThrow);
    });
  });

  context("delegating attestations", () => {
    const attestForDefaults = {
      subject: alice,
      attester: bob,
      requester: david,
      reward: new BigNumber(web3.toWei(1, "ether")),
      paymentNonce: nonce,
      requesterSig: tokenReleaseSig,
      dataHash: combinedDataHash,
      requestNonce: nonce,
      subjectSig: subjectSig,
      delegationSig: attesterDelegationSig,
      from: carl
    };

    const attestFor = async (
      props: Partial<typeof attestForDefaults> = attestForDefaults
    ) => {
      let {
        subject,
        attester,
        requester,
        reward,
        paymentNonce,
        requesterSig,
        dataHash,
        requestNonce,
        subjectSig,
        delegationSig,
        from
      } = {
        ...attestForDefaults,
        ...props
      };

      return attestationLogic.attestFor(
        subject,
        attester,
        requester,
        reward,
        paymentNonce,
        requesterSig,
        dataHash,
        requestNonce,
        subjectSig,
        delegationSig,
        {
          from
        }
      );
    };

    it.only("accepts a valid delegated attestation", async () => {
      await attestFor().should.be.fulfilled
    });

    it.only("rejects an attestation if the subject is wrong in the signature", async () => {
      await attestFor(
        {
          subject: ellen
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it.only("rejects an attestation if the attester is wrong in the signature", async () => {
      await attestFor(
        {
          attester: ellen
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it.only("rejects an attestation if the requester is wrong in the signature", async () => {
      await attestFor(
        {
          requester: ellen
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it.only("rejects an attestation if the reward is wrong", async () => {
      await attestFor(
        {
          reward: new BigNumber(web3.toWei(2, "ether"))
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it.only("rejects an attestation if the payment nonce is wrong", async () => {
      await attestFor(
        {
          paymentNonce: differentNonce
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it.only("rejects an attestation if the data hash is wrong", async () => {
      await attestFor(
        {
          dataHash: emailDataHash
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it.only("rejects an attestation if the request nonce is wrong", async () => {
      await attestFor(
        {
          requestNonce: differentNonce
        }
      ).should.be.rejectedWith(EVMThrow);
    });

  });

  context("revoking attestations", () => {

    const revokeLink = '0xb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6'

    it.only("Allows attester to revoke an attestation", async () => {
      await attestationLogic.revokeAttestation(
        revokeLink,
        {
          from: bob
        }
      ).should.be.fulfilled;
    });

    it.only("Does not allow someone without a BloomID to submit a revocation", async () => {
      await attestationLogic.revokeAttestation(
        revokeLink,
        {
          from: carl
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    interface RevokeEventArgs {
      link: string;
      attesterId: BigNumber.BigNumber;
    }

    it.only("emits an event when attestation is revoked", async () => {
      const { logs } = ((
        await attestationLogic.revokeAttestation(
          revokeLink,
          {
            from: bob
          })
      ) as Web3.TransactionReceipt<any>) as Web3.TransactionReceipt<
        RevokeEventArgs
      >;

      const matchingLog = logs.find(
        log => log.event === "AttestationRevoked"
      );

      should.exist(matchingLog);
      if (!matchingLog) return;

      matchingLog.args.link.should.be.equal(revokeLink);
      matchingLog.args.attesterId.should.be.bignumber.equal(bobId);
    });

  });

  context("delegated revoking attestations", () => {

    const revokeLink = '0xb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6'
    const differentRevokeLink = '0xc10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6'
    const revokeAttestationDelegationSig = ethSigUtil.signTypedDataLegacy(
      bobPrivkey,
      {data: getFormattedTypedDataRevokeAttestationFor(
        revokeLink,
      )}
    )

    const recoveredETHAddress: string = ethSigUtil.recoverTypedSignatureLegacy({
      data: getFormattedTypedDataRevokeAttestationFor(
        revokeLink,
      ),
      sig: revokeAttestationDelegationSig,
    })


    it.only("Allows anyone to revoke an attestation on behalf of an attester with a valid sig", async () => {
      await attestationLogic.revokeAttestationFor(
        revokeLink,
        bob,
        revokeAttestationDelegationSig,
        {
          from: carl
        }
      ).should.be.fulfilled;
    });

    it.only("Fails is link is wrong", async () => {
      await attestationLogic.revokeAttestationFor(
        differentRevokeLink,
        bob,
        revokeAttestationDelegationSig,
        {
          from: carl
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    interface RevokeEventArgs {
      link: string;
      attesterId: BigNumber.BigNumber;
    }

    it.only("emits an event when attestation is revoked", async () => {
      const { logs } = ((
        await attestationLogic.revokeAttestationFor(
          revokeLink,
          bob,
          revokeAttestationDelegationSig,
          {
            from: carl
          })
      ) as Web3.TransactionReceipt<any>) as Web3.TransactionReceipt<
        RevokeEventArgs
      >;

      const matchingLog = logs.find(
        log => log.event === "AttestationRevoked"
      );

      should.exist(matchingLog);
      if (!matchingLog) return;

      console.log(matchingLog.args)

      matchingLog.args.link.should.be.equal(revokeLink);
      matchingLog.args.attesterId.should.be.bignumber.equal(bobId);
    });

  });

  describe("configuring the Token Escrow Marketplace", async () => {
    let differentTokenEscrowMarketplace: TokenEscrowMarketplaceInstance;
    let TokenEscrowMarketplaceAddressBefore: string;

    beforeEach(async () => {
      differentTokenEscrowMarketplace = await TokenEscrowMarketplace.new(
        token.address,
        registry.address,
        signingLogic.address,
        attestationLogic.address
      );
      TokenEscrowMarketplaceAddressBefore = await attestationLogic.tokenEscrowMarketplace.call();
    });

    it.only("allows the initializer to change the marketplace during initialization", async () => {
      await attestationLogic.setTokenEscrowMarketplace(differentTokenEscrowMarketplace.address, {from: alice});
      const TokenEscrowMarketplaceAddressAfter = await attestationLogic.tokenEscrowMarketplace();

      TokenEscrowMarketplaceAddressBefore.should.be.equal(tokenEscrowMarketplace.address);
      TokenEscrowMarketplaceAddressAfter.should.be.equal(differentTokenEscrowMarketplace.address);
    });

    it.only("doesn't allow anyone else to change the marketplace", async () => {
      await attestationLogic
        .setTokenEscrowMarketplace(differentTokenEscrowMarketplace.address, {
          from: bob
        })
        .should.be.rejectedWith(EVMThrow);
      const TokenEscrowMarketplaceAddressAfter = await attestationLogic.tokenEscrowMarketplace();

      TokenEscrowMarketplaceAddressBefore.should.be.equal(tokenEscrowMarketplace.address);
      TokenEscrowMarketplaceAddressAfter.should.be.equal(tokenEscrowMarketplace.address);
    });

    it.only("doesn't initializer to change the marketplace after initialization ends", async () => {
      await attestationLogic.endInitialization({from: alice}).should.be.fulfilled;
      await attestationLogic
        .setTokenEscrowMarketplace(differentTokenEscrowMarketplace.address, {
          from: alice
        })
        .should.be.rejectedWith(EVMThrow);
      const TokenEscrowMarketplaceAddressAfter = await attestationLogic.tokenEscrowMarketplace();

      TokenEscrowMarketplaceAddressBefore.should.be.equal(tokenEscrowMarketplace.address);
      TokenEscrowMarketplaceAddressAfter.should.be.equal(tokenEscrowMarketplace.address);
    });
  });
});
