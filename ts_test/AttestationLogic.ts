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
  AttestationRepoInstance,
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
  getFormattedTypedDataContestFor 
} from "./helpers/signingLogicLegacy";
import { generateSigNonce } from "../src/signData";

const SigningLogic = artifacts.require("SigningLogicLegacy");
const AttestationRepo = artifacts.require("AttestationRepo");
const TokenEscrowMarketplace = artifacts.require("TokenEscrowMarketplace");
const AttestationLogic = artifacts.require("AttestationLogic");
const AccountRegistry = artifacts.require("AccountRegistry");
const MockBLT = artifacts.require("MockBLT");

contract("AttestationLogic", function(
  [alice, bob, carl, david, ellen, mockOwner, mockAdmin, differentMockAdmin]
) {
  let token: MockBLTInstance;
  let registry: AccountRegistryInstance;
  let attestationLogic: AttestationLogicInstance;
  let attestationRepo: AttestationRepoInstance;
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
  let mockAdminId: BigNumber.BigNumber;

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

    attestationRepo = await AttestationRepo.new(token.address, "0x0");

    attestationLogic = await AttestationLogic.new(
      registry.address,
      attestationRepo.address,
      signingLogic.address,
      "0x0",
    );

    tokenEscrowMarketplace = await TokenEscrowMarketplace.new(
      token.address,
      registry.address,
      signingLogic.address,
      attestationLogic.address,
    );

    await attestationRepo.setAttestationLogic(attestationLogic.address);
    await attestationLogic.setTokenEscrowMarketplace(tokenEscrowMarketplace.address);
    await attestationLogic.transferOwnership(mockOwner)
    await attestationLogic.setAdmin(mockAdmin, {from: mockOwner})

    await Promise.all([
      attestationLogic.createType("phone", {from: mockAdmin}),
      attestationLogic.createType("email", {from: mockAdmin}),
      // token.gift(alice),
      token.gift(david, new BigNumber("1e18")),
      token.gift(david, new BigNumber("1e18")),
      registry.createNewAccount(alice),
      registry.createNewAccount(bob),
      registry.createNewAccount(david),
      registry.createNewAccount(mockAdmin)
    ]);
    [aliceId, bobId, davidId, mockAdminId] = await Promise.all([
      registry.accountIdForAddress.call(alice),
      registry.accountIdForAddress.call(bob),
      registry.accountIdForAddress.call(david),
      registry.accountIdForAddress.call(mockAdmin)
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
      alice,
      bob,
      david,
      combinedDataHash,
      [0, 1],
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
      alice,
      bob,
      david,
      combinedDataHash,
      [0, 1],
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
      [0, 1],
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
      typeIds: [0, 1],
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
        typeIds,
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
        typeIds,
        requestNonce,
        subjectSig,
        {
          from
        }
      );
    };

    it("accepts a valid attestation", async () => {
      await attest().should.be.fulfilled;
    });

    it("accepts a valid attestation with 0 reward", async () => {
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

    it("Fails if sent by different attester", async () => {
      await attest({from: alice}).should.be.rejectedWith(EVMThrow);
    });

    it("fails if invalid type", async () => {
      await attest({typeIds: [1, 2]}).should.be.rejectedWith(EVMThrow);
    });

    it("fails if no account for subject", async () => {
      const unrelatedWallet = ethereumjsWallet.generate()
      await attest({
        subject: carl,
        subjectSig: ethSigUtil.signTypedDataLegacy(
          unrelatedWallet.getPrivateKey(),
          {data: getFormattedTypedDataAttestationRequest(
            unrelatedWallet.getAddressString(),
              attestDefaults.attester,
              attestDefaults.requester,
              attestDefaults.dataHash,
              attestDefaults.typeIds,
              attestDefaults.requestNonce,
          )}
        )
      }
      ).should.be.rejectedWith(EVMThrow);
    });

    interface WriteEventArgs {
      attestationId: BigNumber.BigNumber;
      subjectId: BigNumber.BigNumber;
      attesterId: BigNumber.BigNumber;
      requesterId: BigNumber.BigNumber;
      dataHash: string;
      typeIds: BigNumber.BigNumber[];
      stakeValue: BigNumber.BigNumber;
      expiresAt: BigNumber.BigNumber;
    }

    it("emits an event when attestation is written", async () => {
      const { logs } = ((await attest()
      ) as Web3.TransactionReceipt<any>) as Web3.TransactionReceipt<
        WriteEventArgs
      >;

      const matchingLog = logs.find(
        log => log.event === "TraitAttested"
      );

      should.exist(matchingLog);
      if (!matchingLog) return;

      matchingLog.args.attestationId.should.be.bignumber.equal(0);
      matchingLog.args.subjectId.should.be.bignumber.equal(aliceId);
      matchingLog.args.attesterId.should.be.bignumber.equal(bobId);
      matchingLog.args.requesterId.should.be.bignumber.equal(davidId);
      matchingLog.args.dataHash.should.be.equal(attestDefaults.dataHash);
      new BigNumber(matchingLog.args.typeIds[0]).toNumber().should.be.equal(attestDefaults.typeIds[0])
      new BigNumber(matchingLog.args.typeIds[1]).toNumber().should.be.equal(attestDefaults.typeIds[1])
      matchingLog.args.stakeValue.should.be.bignumber.equal(0);
      matchingLog.args.expiresAt.should.be.bignumber.equal(0);
    });


    it("accepts a valid second attestation with different nonce", async () => {
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
              alice,
              bob,
              david,
              combinedDataHash,
              [0, 1],
              differentNonce,
            )}
        )
      }).should.be.fulfilled;
    });

    it("accepts a valid attestation for 9 traits", async () => {
      let tempTypes = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
      for (let i in tempTypes) {
        await attestationLogic.createType(tempTypes[i], {from: mockAdmin})
      }
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
          typeIds: [0, 1, 2, 3, 5, 6, 7, 8, 9],
          requestNonce: differentNonce,
          subjectSig: ethSigUtil.signTypedDataLegacy(
              alicePrivkey,
              {data: getFormattedTypedDataAttestationRequest(
                alice,
                bob,
                david,
                combinedDataHash,
                [0, 1, 2, 3, 5, 6, 7, 8, 9],
                differentNonce,
              )}
          )
      }).should.be.fulfilled;
    });

    it("rejects a valid second attestation for 9 traits if one not valid", async () => {
      let tempTypes = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
      for (let i in tempTypes) {
        await attestationLogic.createType(tempTypes[i], {from: mockAdmin})
      }
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
          typeIds: [0, 1, 2, 3, 5, 6, 7, 8, 9],
          requestNonce: differentNonce,
          subjectSig: ethSigUtil.signTypedDataLegacy(
              alicePrivkey,
              {data: getFormattedTypedDataAttestationRequest(
                alice,
                bob,
                david,
                combinedDataHash,
                [0, 1, 2, 3, 5, 6, 7, 8, 9],
                differentNonce,
              )}
          )
      }).should.be.rejectedWith(EVMThrow);
    });


    it("releases tokens from escrow to the verifier and leaves some leftover", async () => {
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

    it("releases all tokens from escrow to the verifier", async () => {
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

    it("writes the attestation to the contract", async () => {
      await attest();


      const recoveredAttestation = await attestationRepo.readAttestation.call(
        aliceId,
        0
      )

      const [
        attesterId,
        completedAt,
        stakeValue,
        expiresAt
      ] = recoveredAttestation;

      attesterId.should.be.bignumber.equal(bobId);
      completedAt.should.be.bignumber.equal(latestBlockTime());
      stakeValue.should.be.bignumber.equal(0)
      expiresAt.should.be.bignumber.equal(0)

    });

    it("writes a second attestation for same data with different nonce", async () => {
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
                alice,
                bob,
                david,
                attestDefaults.dataHash,
                attestDefaults.typeIds,
                differentNonce,
              )}
          )
      }).should.be.fulfilled;

      const recoveredAttestation = await attestationRepo.readAttestation.call(
        aliceId,
        1
      )

      const [
        attesterId,
        completedAt,
        stakeValue,
        expiresAt
      ] = recoveredAttestation;

      attesterId.should.be.bignumber.equal(bobId);
      completedAt.should.be.bignumber.equal(latestBlockTime());
      stakeValue.should.be.bignumber.equal(0)
      expiresAt.should.be.bignumber.equal(0)

    });

    it("rejects attestations that aren't sent from the attester specified in the request", async () => {
      await attest({ from: carl }).should.be.rejectedWith(EVMThrow);
    });

    it("rejects attestations with for an invalid subject", async () => {
      await attest({ subject: carl }).should.be.rejectedWith(EVMThrow);
    });
    
    it("rejects attestations with for an invalid requester", async () => {
      await attest({ requester: carl }).should.be.rejectedWith(EVMThrow);
    });

    it("rejects attestations with for an invalid reward", async () => {
      await attest({ reward: new BigNumber(web3.toWei(2, "ether")) }).should.be.rejectedWith(EVMThrow);
    });

    it("rejects attestations with for an invalid data hash", async () => {
      await attest({ dataHash: emailDataHash}).should.be.rejectedWith(EVMThrow);
    });

    it("rejects attestations with for an invalid type ids", async () => {
      await attest({ typeIds: [1]}).should.be.rejectedWith(EVMThrow);
    });

    it("rejects attestations with for an invalid payment nonce", async () => {
      await attest({ paymentNonce: differentNonce}).should.be.rejectedWith(EVMThrow);
    });

    it("rejects attestations with for an invalid request nonce", async () => {
      await attest({ requestNonce: differentNonce}).should.be.rejectedWith(EVMThrow);
    });

    it("rejects attestations if at attestation has already been submitted", async () => {
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

    it("accepts a valid contestation", async () => {
      await contest().should.be.fulfilled;
    });

    interface rejectEventArgs {
      attesterId: BigNumber.BigNumber;
      requesterId: BigNumber.BigNumber;
    }

    it("emits an event when attestation is rejected", async () => {
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

    it("releases tokens from escrow to the verifier and leaves some leftover", async () => {
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

    it("releases all tokens from escrow to the verifier", async () => {
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

    it("Fails if attester does not match payment sig", async () => {
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
      from: mockAdmin
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

    it("accepts a valid delegated attestation rejection", async () => {
      await contestFor().should.be.fulfilled
    });

    it("rejects an attestation rejection if not sent from admin", async () => {
      await contestFor(
        {
          from: ellen
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("rejects an attestation rejection if the attester is wrong in the signature", async () => {
      await contestFor(
        {
          attester: ellen
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("rejects an attestation rejection if the requester is wrong in the signature", async () => {
      await contestFor(
        {
          requester: ellen
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("rejects an attestation rejection if the reward is wrong", async () => {
      await contestFor(
        {
          reward: new BigNumber(web3.toWei(2, "ether"))
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("rejects an attestation rejection if the payment nonce is wrong", async () => {
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
      typeIds: [0, 1],
      requestNonce: nonce,
      subjectSig: subjectSig,
      delegationSig: attesterDelegationSig,
      from: mockAdmin
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
        typeIds,
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
        typeIds,
        requestNonce,
        subjectSig,
        delegationSig,
        {
          from
        }
      );
    };

    it("accepts a valid delegated attestation", async () => {
      await attestFor().should.be.fulfilled
    });

    it("rejects an attestation if not sent from admin", async () => {
      await attestFor(
        {
          from: ellen
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("rejects an attestation if the subject is wrong in the signature", async () => {
      await attestFor(
        {
          subject: ellen
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("rejects an attestation if the attester is wrong in the signature", async () => {
      await attestFor(
        {
          attester: ellen
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("rejects an attestation if the requester is wrong in the signature", async () => {
      await attestFor(
        {
          requester: ellen
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("rejects an attestation if the reward is wrong", async () => {
      await attestFor(
        {
          reward: new BigNumber(web3.toWei(2, "ether"))
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("rejects an attestation if the payment nonce is wrong", async () => {
      await attestFor(
        {
          paymentNonce: differentNonce
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("rejects an attestation if the data hash is wrong", async () => {
      await attestFor(
        {
          dataHash: emailDataHash
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("rejects an attestation if the type hash is wrong", async () => {
      await attestFor(
        {
          typeIds: [1]
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("rejects an attestation if the request nonce is wrong", async () => {
      await attestFor(
        {
          requestNonce: differentNonce
        }
      ).should.be.rejectedWith(EVMThrow);
    });

  });

  context("revoking attestations", () => {

    const attestDefaults = {
      subject: alice,
      attester: bob,
      requester: david,
      reward: new BigNumber(web3.toWei(1, "ether")),
      paymentNonce: nonce,
      requesterSig: tokenReleaseSig,
      dataHash: combinedDataHash,
      typeIds: [0, 1],
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
        typeIds,
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
        typeIds,
        requestNonce,
        subjectSig,
        {
          from
        }
      );
    };

    it("Allows admin to revoke an attestation", async () => {
      await attest().should.be.fulfilled;
      await attestationLogic.revokeAttestation(
        aliceId,
        0,
        {
          from: mockAdmin
        }
      ).should.be.fulfilled;
    });

    it("Allows subject to revoke an attestation", async () => {
      await attest().should.be.fulfilled;
      await attestationLogic.revokeAttestation(
        aliceId,
        0,
        {
          from: alice
        }
      ).should.be.fulfilled;
    });

    it("Allows attester to revoke an attestation", async () => {
      await attest().should.be.fulfilled;
      await attestationLogic.revokeAttestation(
        aliceId,
        0,
        {
          from: bob
        }
      ).should.be.fulfilled;
    });

    it("Does not allow anyone else to revoke an attestation", async () => {
      await attest().should.be.fulfilled;
      await attestationLogic.revokeAttestation(
        aliceId,
        0,
        {
          from: david
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("Does not allow an attestation to be revoked twice", async () => {
      await attest().should.be.fulfilled;
      await attestationLogic.revokeAttestation(
        aliceId,
        0,
        {
          from: mockAdmin
        }
      ).should.be.fulfilled;
      await attestationLogic.revokeAttestation(
        aliceId,
        0,
        {
          from: mockAdmin
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    interface RevokeEventArgs {
      subjectId: BigNumber.BigNumber;
      attestationId: BigNumber.BigNumber;
      revokerId: BigNumber.BigNumber;
    }

    it("emits an event when attestation is revoked", async () => {
      await attest().should.be.fulfilled;
      const { logs } = ((
        await attestationLogic.revokeAttestation(
          aliceId,
          0,
          {
            from: mockAdmin
          })
      ) as Web3.TransactionReceipt<any>) as Web3.TransactionReceipt<
        RevokeEventArgs
      >;

      const matchingLog = logs.find(
        log => log.event === "AttestationRevoked"
      );

      should.exist(matchingLog);
      if (!matchingLog) return;

      matchingLog.args.subjectId.should.be.bignumber.equal(aliceId);
      matchingLog.args.revokerId.should.be.bignumber.equal(mockAdminId);
      matchingLog.args.attestationId.should.be.bignumber.equal(0);
    });

  });

  describe("configuring the account registry", async () => {
    let differentAccountRegistry: AccountRegistryInstance;
    let accountRegistryAddressBefore: string;

    beforeEach(async () => {
      differentAccountRegistry = await AccountRegistry.new(
        "0x0"
      );
      accountRegistryAddressBefore = await attestationLogic.registry.call();
    });

    it("allows the owner to change the account registry", async () => {
      await attestationLogic.setAccountRegistry(
        differentAccountRegistry.address,
        {from: mockOwner}
      );
      const accountRegistryAddressAfter = await attestationLogic.registry();

      accountRegistryAddressBefore.should.be.equal(registry.address);
      accountRegistryAddressAfter.should.be.equal(
        differentAccountRegistry.address
      );
    });

    it("doesn't allow anyone else to change the account registry", async () => {
      await attestationLogic
        .setAccountRegistry(differentAccountRegistry.address, {
          from: bob
        })
        .should.be.rejectedWith(EVMThrow);
      const accountRegistryAddressAfter = await attestationLogic.registry();

      accountRegistryAddressBefore.should.be.equal(registry.address);
      accountRegistryAddressAfter.should.be.equal(registry.address);
    });
  });

  describe("configuring the signing logic", async () => {
    let differentSigningLogic: SigningLogicLegacyInstance;
    let signingLogicAddressBefore: string;

    beforeEach(async () => {
      differentSigningLogic = await SigningLogic.new();
      signingLogicAddressBefore = await attestationLogic.signingLogic.call();
    });

    it("allows the owner to change the signing logic", async () => {
      await attestationLogic.setSigningLogic(differentSigningLogic.address, {from: mockOwner});
      const signingLogicAddressAfter = await attestationLogic.signingLogic();

      signingLogicAddressBefore.should.be.equal(signingLogic.address);
      signingLogicAddressAfter.should.be.equal(differentSigningLogic.address);
    });

    it("doesn't allow anyone else to change the signing logic", async () => {
      await attestationLogic
        .setSigningLogic(differentSigningLogic.address, {
          from: bob
        })
        .should.be.rejectedWith(EVMThrow);
      const signingLogicAddressAfter = await attestationLogic.signingLogic();

      signingLogicAddressBefore.should.be.equal(signingLogic.address);
      signingLogicAddressAfter.should.be.equal(signingLogic.address);
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

    it("allows the owner to change the marketplace", async () => {
      await attestationLogic.setTokenEscrowMarketplace(differentTokenEscrowMarketplace.address, {from: mockOwner});
      const TokenEscrowMarketplaceAddressAfter = await attestationLogic.tokenEscrowMarketplace();

      TokenEscrowMarketplaceAddressBefore.should.be.equal(tokenEscrowMarketplace.address);
      TokenEscrowMarketplaceAddressAfter.should.be.equal(differentTokenEscrowMarketplace.address);
    });

    it("doesn't allow anyone else to change the marketplace", async () => {
      await attestationLogic
        .setTokenEscrowMarketplace(differentTokenEscrowMarketplace.address, {
          from: bob
        })
        .should.be.rejectedWith(EVMThrow);
      const TokenEscrowMarketplaceAddressAfter = await attestationLogic.tokenEscrowMarketplace();

      TokenEscrowMarketplaceAddressBefore.should.be.equal(tokenEscrowMarketplace.address);
      TokenEscrowMarketplaceAddressAfter.should.be.equal(tokenEscrowMarketplace.address);
    });
  });

  describe("configuring the Attestation Repo", async () => {
    let differentAttestationRepo: AttestationRepoInstance;
    let attestationRepoAddressBefore: string;

    beforeEach(async () => {
      differentAttestationRepo = await AttestationRepo.new(
        token.address,
        attestationLogic.address,
      );
      attestationRepoAddressBefore = await attestationLogic.attestationRepo.call();
    });

    it("allows the owner to change the Attestation Repo", async () => {
      await attestationLogic.setAttestationRepo(
        differentAttestationRepo.address, {
          from: mockOwner
        }
      );
      const attestationRepoAddressAfter = await attestationLogic.attestationRepo();

      attestationRepoAddressBefore.should.be.equal(attestationRepo.address);
      attestationRepoAddressAfter.should.be.equal(
        differentAttestationRepo.address
      );
    });

    it("doesn't allow anyone else to change the Attestation Repo", async () => {
      await attestationLogic
        .setAttestationRepo(differentAttestationRepo.address, {
          from: bob
        })
        .should.be.rejectedWith(EVMThrow);
      const attestationRepoAddressAfter = await attestationLogic.attestationRepo();

      attestationRepoAddressBefore.should.be.equal(attestationRepo.address);
      attestationRepoAddressAfter.should.be.equal(attestationRepo.address);
    });
  });

  describe("Configuring the admin", async () => {
    let adminBefore: string;

    beforeEach(async () => {
      adminBefore = await attestationLogic.admin.call();
    });

    it("allows the owner to change the admin", async () => {
      await attestationLogic.setAdmin(differentMockAdmin, {from: mockOwner});
      const adminAfter = await attestationLogic.admin();

      adminBefore.should.be.equal(mockAdmin);
      adminAfter.should.be.equal(differentMockAdmin);
    });

    it("doesn't allow anyone else to change the admin", async () => {
      await attestationLogic
        .setAdmin(differentMockAdmin, {
          from: bob
        })
        .should.be.rejectedWith(EVMThrow);
      const adminAfter = await attestationLogic.admin();

      adminBefore.should.be.equal(mockAdmin);
      adminAfter.should.be.equal(mockAdmin);
    });
  });
});
