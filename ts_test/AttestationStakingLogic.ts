import * as Web3 from "web3";
import * as BigNumber from "bignumber.js";
import * as ethereumjsWallet from "ethereumjs-wallet";
const ethSigUtil = require("eth-sig-util");
const { soliditySha3 } = require("web3-utils");
import { bufferToHex } from "ethereumjs-util";
const uuid = require('uuidv4')

import { EVMThrow } from "./helpers/EVMThrow";
import { should } from "./test_setup";
import {
  SigningLogicLegacyInstance,
  AttestationRepoInstance,
  AttestationLogicInstance,
  TokenEscrowMarketplaceInstance,
  AccountRegistryInstance,
  MockBLTInstance
} from "../contracts";

import { latestBlockTime } from "./helpers/blockInfo";
import { hashData, generateSigNonce} from "./../src/signData";
import { soliditySign } from "./../src/signatures";
import * as ipfs from "./../src/ipfs";
import { increaseTime } from "./helpers/increaseTime";
import {
  getFormattedTypedDataReleaseTokens,
  getFormattedTypedDataAttestationRequest,
  getFormattedTypedDataStakeFor,
  getFormattedTypedDataRevokeStakeFor
} from "./helpers/signingLogicLegacy";

const SigningLogic = artifacts.require("SigningLogicLegacy");
const AttestationRepo = artifacts.require("AttestationRepo");
const TokenEscrowMarketplace = artifacts.require("TokenEscrowMarketplace");
const AttestationLogic = artifacts.require("AttestationLogic");
const AccountRegistry = artifacts.require("AccountRegistry");
const MockBLT = artifacts.require("MockBLT");

contract("AttestationLogic", function(
  [
    alice,
    bob,
    carl,
    david,
    ellen,
    mockAdmin,
  ]
) {
  let token: MockBLTInstance;
  let registry: AccountRegistryInstance;
  let attestationLogic: AttestationLogicInstance;
  let attestationRepo: AttestationRepoInstance;
  let signingLogic: SigningLogicLegacyInstance;
  let marketplace: TokenEscrowMarketplaceInstance;

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
  const oneDay = 60 * 60 * 24;
  const oneWeek = oneDay * 7;
  const oneYear = oneDay * 365;

  const creditWorthyData = {
    dataType: 'creditworthy',
    data: "",
    nonce: uuid()
  };

  const creditWorthyDataHash = bufferToHex(hashData(creditWorthyData));

  const combinedDataHash = bufferToHex(hashData({creditWorthyData}))

  const nonce = uuid()
  const differentNonce = uuid()

  const nonceHash = generateSigNonce()
  const differentNonceHash = generateSigNonce()

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

    marketplace = await TokenEscrowMarketplace.new(
      token.address,
      registry.address,
      signingLogic.address,
      attestationLogic.address,
    );

    await attestationRepo.setAttestationLogic(attestationLogic.address);
    await attestationLogic.setTokenEscrowMarketplace(marketplace.address);
    await attestationLogic.setAdmin(mockAdmin)

    await Promise.all([
      attestationLogic.createType("creditworthy", {from: mockAdmin}),
      // token.gift(alice),
      token.gift(david, new BigNumber("2e18")),
      registry.createNewAccount(alice),
      registry.createNewAccount(bob),
      registry.createNewAccount(david)
    ]);
    [aliceId, bobId, davidId] = await Promise.all([
      registry.accountIdForAddress.call(alice),
      registry.accountIdForAddress.call(bob),
      registry.accountIdForAddress.call(david),
    ]);

    await token.approve(marketplace.address, new BigNumber("2e18"), {
        from: david
      })

    await marketplace.moveTokensToEscrowLockup(
      new BigNumber("2e18"),
      {from: david})

    tokenReleaseSig = ethSigUtil.signTypedDataLegacy(
      davidPrivkey,
      {data: getFormattedTypedDataReleaseTokens(
        david,
        attestationRepo.address,
        new BigNumber(web3.toWei(1, "ether")).toString(10),
        nonceHash,
      )}
    );

    stakerDelegationSig = ethSigUtil.signTypedDataLegacy(
      davidPrivkey,
      {data: getFormattedTypedDataStakeFor(
        alice,
        new BigNumber(web3.toWei(1, "ether")).toString(10),
        nonceHash,
        combinedDataHash,
        [0],
        nonceHash,
        oneYear - oneDay,
      )}
    )

    revokeStakeDelegationSig = ethSigUtil.signTypedDataLegacy(
      davidPrivkey,
      {data: getFormattedTypedDataRevokeStakeFor(
        aliceId,
        0
      )}
    )


  });

  const subjectSig = ethSigUtil.signTypedDataLegacy(
    alicePrivkey,
    {data: getFormattedTypedDataAttestationRequest(
      alice,
      david,
      alice,
      combinedDataHash,
      [0],
      nonceHash,
    )}
  );

  const unrelatedSignature = ethSigUtil.signTypedDataLegacy(
    ethereumjsWallet.generate().getPrivateKey(),
    {data: getFormattedTypedDataAttestationRequest(
      alice,
      david,
      alice,
      combinedDataHash,
      [0],
      nonceHash,
    )}
  );

  let tokenReleaseSig: string
  let stakerDelegationSig: string
  let revokeStakeDelegationSig: string

  const stakeDefaults = {
    subject: alice,
    staker: david,
    value: new BigNumber(web3.toWei(1, "ether")),
    paymentNonce: nonceHash,
    paymentSig: "",
    dataHash: combinedDataHash,
    typeIds: [0],
    requestNonce: nonceHash,
    subjectSig: subjectSig,
    stakeDuration: oneYear - oneDay,
    from: david
  };

  const stake = async (
    props: Partial<typeof stakeDefaults> = stakeDefaults
  ) => {
    let {
      subject,
      staker,
      value,
      paymentNonce,
      paymentSig,
      dataHash,
      typeIds,
      requestNonce,
      subjectSig,
      stakeDuration,
      from
    } = {
      ...stakeDefaults,
      ...props
    };

    return attestationLogic.stake(
      subject,
      value,
      paymentNonce,
      paymentSig,
      dataHash,
      typeIds,
      requestNonce,
      subjectSig,
      stakeDuration,
      {
        from
      }
    );
  };

  interface ActorBalances {
    marketplace: BigNumber.BigNumber;
    alice: BigNumber.BigNumber;
    bob: BigNumber.BigNumber;
  }

  const allBalances = async () => {
    const subjects = [david, marketplace.address, attestationRepo.address];
    const [
      davidToken,
      marketToken,
      attestationRepoToken,
    ] = await Promise.all(
      subjects
        .map(subject => token.balanceOf(subject))
    );

    return {
      token: {
        david: davidToken,
        market: marketToken,
        attestationRepo: attestationRepoToken
      },
    };
  };

  context("submitting staked attestations", () => {

    it("accepts a valid stake", async () => {
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
    });

    it("Moves tokens from staker to collateralizer", async () => {
      const before = await allBalances();
      const escrowBefore = await marketplace.tokenEscrow.call(davidId);
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      const after = await allBalances();
      const escrowAfter = await marketplace.tokenEscrow.call(davidId);

      escrowBefore.should.be.bignumber.equal("2e18")
      before.token.david.should.be.bignumber.equal("0")
      before.token.attestationRepo.should.be.bignumber.equal("0")
      before.token.market.should.be.bignumber.equal("2e18")

      escrowAfter.should.be.bignumber.equal("1e18")
      after.token.david.should.be.bignumber.equal("0")
      after.token.attestationRepo.should.be.bignumber.equal("1e18")
      after.token.market.should.be.bignumber.equal("1e18")
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

    it("Emits an event when stake submitted", async () => {
      const {logs} = ((await stake({paymentSig: tokenReleaseSig})
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
      matchingLog.args.attesterId.should.be.bignumber.equal(davidId);
      matchingLog.args.requesterId.should.be.bignumber.equal(aliceId);
      matchingLog.args.dataHash.should.be.equal(stakeDefaults.dataHash);
      new BigNumber(matchingLog.args.typeIds[0]).toNumber().should.be.equal(stakeDefaults.typeIds[0])
      matchingLog.args.stakeValue.should.be.bignumber.equal(stakeDefaults.value);
      matchingLog.args.expiresAt.should.be.bignumber.equal(new BigNumber(latestBlockTime() + oneYear - oneDay));
    });

    it("Fails if invalid subject sig", async () => {
      await stake(
        {
          paymentSig: tokenReleaseSig,
          subjectSig: unrelatedSignature
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("fails if greater than one year", async () => {
      await stake(
        {
          paymentSig: tokenReleaseSig,
          stakeDuration: oneYear + oneDay,
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("Fails if invalid trait type", async () => {
      await stake(
        {
          paymentSig: tokenReleaseSig,
          typeIds: [1],
          subjectSig: ethSigUtil.signTypedDataLegacy(
            alicePrivkey,
            {data: getFormattedTypedDataAttestationRequest(
              alice,
              david,
              alice,
              combinedDataHash,
              [1],
              nonceHash,
            )}
          )
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("Fails if sig already used", async () => {
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      await stake({paymentSig: tokenReleaseSig}).should.be.rejectedWith(EVMThrow);
    });

    it("writes the stake to the contract", async () => {
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;

      const recoveredAttestation = await attestationRepo.readAttestation.call(
        aliceId,
        0
      )

      const [
        stakerId,
        completedAt,
        stakeValue,
        expiresAt
      ] = recoveredAttestation;

      stakerId.should.be.bignumber.equal(davidId);
      completedAt.should.be.bignumber.equal(latestBlockTime());
      stakeValue.should.be.bignumber.equal(new BigNumber("1e18"));
      expiresAt.should.be.bignumber.equal(new BigNumber(latestBlockTime() + oneYear - oneDay));
    });

    it("Fails to revoke an attestation if it has an active stake", async () => {
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      await attestationLogic.revokeAttestation(
        aliceId,
        0,
        {
          from: david
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("Allows an attestation to be revoked if stake revoked first", async () => {
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      await attestationLogic.revokeStake(
        aliceId,
        0,
        {from: david}
      ).should.be.fulfilled
      await attestationLogic.revokeAttestation(
        aliceId,
        0,
        {
          from: david
        }
      ).should.be.fulfilled
    });

  });

  context("delegating staking", () => {

    const stakeForDefaults = {
      subject: alice,
      staker: david,
      value: new BigNumber(web3.toWei(1, "ether")),
      paymentNonce: nonceHash,
      paymentSig: "",
      dataHash: combinedDataHash,
      typeIds: [0],
      requestNonce: nonceHash,
      subjectSig: subjectSig,
      stakeDuration: oneYear - oneDay,
      delegationSig: "",
      from: mockAdmin
    };

    const stakeFor = async (
      props: Partial<typeof stakeForDefaults> = stakeForDefaults
    ) => {
      let {
        subject,
        staker,
        value,
        paymentNonce,
        paymentSig,
        dataHash,
        typeIds,
        requestNonce,
        subjectSig,
        stakeDuration,
        delegationSig,
        from
      } = {
        ...stakeForDefaults,
        ...props
      };

      return attestationLogic.stakeFor(
        subject,
        staker,
        value,
        paymentNonce,
        paymentSig,
        dataHash,
        typeIds,
        requestNonce,
        subjectSig,
        stakeDuration,
        delegationSig,
        {
          from
        }
      );
    };

    it("accepts a valid delegated stake", async () => {
      await stakeFor(
        {
          paymentSig: tokenReleaseSig,
          delegationSig: stakerDelegationSig,
        }
      ).should.be.fulfilled
    });

    it("rejects a stake if not from admin", async () => {
      await stakeFor(
        {
          paymentSig: tokenReleaseSig,
          delegationSig: stakerDelegationSig,
          from: ellen
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("rejects a stake if the subject is wrong in the signature", async () => {
      await stakeFor(
        {
          paymentSig: tokenReleaseSig,
          delegationSig: stakerDelegationSig,
          subject: ellen
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("rejects a stake if the attester is wrong in the signature", async () => {
      await stakeFor(
        {
          paymentSig: tokenReleaseSig,
          delegationSig: stakerDelegationSig,
          staker: ellen
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("rejects a stake if the reward is wrong", async () => {
      await stakeFor(
        {
          paymentSig: tokenReleaseSig,
          delegationSig: stakerDelegationSig,
          value: new BigNumber(web3.toWei(2, "ether"))
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("rejects a stake if the payment nonce is wrong", async () => {
      await stakeFor(
        {
          paymentSig: tokenReleaseSig,
          delegationSig: stakerDelegationSig,
          paymentNonce: differentNonceHash
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("rejects a stake if the data hash is wrong", async () => {
      await stakeFor(
        {
          paymentSig: tokenReleaseSig,
          delegationSig: stakerDelegationSig,
          dataHash: 'invalidHash'
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("rejects a stake if the type hash is wrong", async () => {
      await stakeFor(
        {
          paymentSig: tokenReleaseSig,
          delegationSig: stakerDelegationSig,
          typeIds: [1]
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("rejects a stake if the request nonce is wrong", async () => {
      await stakeFor(
        {
          paymentSig: tokenReleaseSig,
          delegationSig: stakerDelegationSig,
          requestNonce: differentNonceHash
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("rejects a stake if the stake duration is wrong", async () => {
      await stakeFor(
        {
          paymentSig: tokenReleaseSig,
          delegationSig: stakerDelegationSig,
          stakeDuration: oneWeek
        }
      ).should.be.rejectedWith(EVMThrow);
    });

  });

  context("Delegating reclaiming tokens", () => {

    it("Allows admin to reclaim tokens after staking period for user", async () => {
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      await increaseTime(oneYear)
      await attestationLogic.reclaimStakedTokensFor(
        aliceId,
        david,
        0,
        {from: mockAdmin}
      ).should.be.fulfilled;
    });

    it("Fails if not performed by admin", async () => {
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      await increaseTime(oneYear)
      await attestationLogic.reclaimStakedTokensFor(
        aliceId,
        david,
        0,
        {from: ellen}
      ).should.be.rejectedWith(EVMThrow);
    });

  });

  context("Reclaiming tokens after staking period", () => {

    it("Allows staker to reclaim tokens after staking period", async () => {
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      await increaseTime(oneYear)
      await attestationLogic.reclaimStakedTokens(0, aliceId, {from: david}).should.be.fulfilled;
    });

    it("Moves tokens from collateralize to the staker", async () => {
      const before = await allBalances();
      const escrowBefore = await marketplace.tokenEscrow.call(davidId);
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      const staked = await allBalances();
      const escrowStaked = await marketplace.tokenEscrow.call(davidId);
      await increaseTime(oneYear)
      await attestationLogic.reclaimStakedTokens(0, aliceId, {from: david}).should.be.fulfilled;
      const after = await allBalances();

      escrowBefore.should.be.bignumber.equal("2e18")
      before.token.david.should.be.bignumber.equal("0")
      before.token.attestationRepo.should.be.bignumber.equal("0")
      before.token.market.should.be.bignumber.equal("2e18")

      escrowStaked.should.be.bignumber.equal("1e18")
      staked.token.david.should.be.bignumber.equal("0")
      staked.token.attestationRepo.should.be.bignumber.equal("1e18")
      staked.token.market.should.be.bignumber.equal("1e18")

      after.token.david.should.be.bignumber.equal("1e18")
      after.token.attestationRepo.should.be.bignumber.equal("0")
      after.token.market.should.be.bignumber.equal("1e18")
    });

    interface ReclaimEventArgs {
      stakerId: BigNumber.BigNumber;
      value: BigNumber.BigNumber;
    }

    it("Emits an event when stake reclaimed", async () => {
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      await increaseTime(oneYear)
      const {logs} = ((await attestationLogic.reclaimStakedTokens(0, aliceId, {from: david}).should.be.fulfilled
      ) as Web3.TransactionReceipt<any>) as Web3.TransactionReceipt<
        ReclaimEventArgs
      >;

      const matchingLog = logs.find(
        log => log.event === "StakedTokensReclaimed"
      );

      should.exist(matchingLog);
      if (!matchingLog) return;

      matchingLog.args.stakerId.should.be.bignumber.equal(davidId);
      matchingLog.args.value.should.be.bignumber.equal(new BigNumber("1e18"));
    });

    it("Zeroes the value of the stake", async () => {
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      await increaseTime(oneYear)
      await attestationLogic.reclaimStakedTokens(0, aliceId, {from: david}).should.be.fulfilled;

      const recoveredAttestation = await attestationRepo.readAttestation.call(
        aliceId,
        0
      )

      const [
        stakerId,
        completedAt,
        stakeValue,
        expiresAt
      ] = recoveredAttestation;

      stakerId.should.be.bignumber.equal(davidId);
      stakeValue.should.be.bignumber.equal(new BigNumber(0));
      expiresAt.toNumber().should.be.lessThan(latestBlockTime());
    });

    it("Fails if staking period not ended", async () => {
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      await increaseTime(oneWeek)
      await attestationLogic.reclaimStakedTokens(0, aliceId, {from: david}).should.be.rejectedWith(EVMThrow);
    });

    it("Fails if stake already claimed", async () => {
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      await increaseTime(oneYear)
      await attestationLogic.reclaimStakedTokens(0, aliceId, {from: david}).should.be.fulfilled;
      await attestationLogic.reclaimStakedTokens(0, aliceId, {from: david}).should.be.rejectedWith(EVMThrow);
    });

  });

  context("Revoking an active stake", () => {

    it("Allows staker to revoke a stake during an active staking period", async () => {
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      await increaseTime(oneDay)
      await attestationLogic.revokeStake(aliceId, 0, {from: david}).should.be.fulfilled;
    });

    it("Moves tokens from collateralize to the staker", async () => {
      const before = await allBalances();
      const escrowBefore = await marketplace.tokenEscrow.call(davidId);
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      const staked = await allBalances();
      const escrowStaked = await marketplace.tokenEscrow.call(davidId);
      await increaseTime(oneDay)
      await attestationLogic.revokeStake(aliceId, 0, {from: david}).should.be.fulfilled;
      const after = await allBalances();

      escrowBefore.should.be.bignumber.equal("2e18")
      before.token.david.should.be.bignumber.equal("0")
      before.token.attestationRepo.should.be.bignumber.equal("0")
      before.token.market.should.be.bignumber.equal("2e18")

      escrowStaked.should.be.bignumber.equal("1e18")
      staked.token.david.should.be.bignumber.equal("0")
      staked.token.attestationRepo.should.be.bignumber.equal("1e18")
      staked.token.market.should.be.bignumber.equal("1e18")

      after.token.david.should.be.bignumber.equal("1e18")
      after.token.attestationRepo.should.be.bignumber.equal("0")
      after.token.market.should.be.bignumber.equal("1e18")
    });

    interface ReclaimEventArgs {
      stakerId: BigNumber.BigNumber;
      value: BigNumber.BigNumber;
    }

    it("Emits an event when stake revoked", async () => {
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      await increaseTime(oneDay)
      const {logs} = ((await attestationLogic.revokeStake(aliceId, 0, {from: david}).should.be.fulfilled
      ) as Web3.TransactionReceipt<any>) as Web3.TransactionReceipt<
        ReclaimEventArgs
      >;

      const matchingLog = logs.find(
        log => log.event === "StakedTokensReclaimed"
      );

      should.exist(matchingLog);
      if (!matchingLog) return;

      matchingLog.args.stakerId.should.be.bignumber.equal(davidId);
      matchingLog.args.value.should.be.bignumber.equal(new BigNumber("1e18"));
    });

    it("Zeroes the value of the stake", async () => {
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      await increaseTime(oneDay)
      await attestationLogic.revokeStake(aliceId, 0, {from: david}).should.be.fulfilled;

      const recoveredAttestation = await attestationRepo.readAttestation.call(
        aliceId,
        0
      )

      const [
        stakerId,
        completedAt,
        stakeValue,
        expiresAt
      ] = recoveredAttestation;

      stakerId.should.be.bignumber.equal(davidId);
      stakeValue.should.be.bignumber.equal(new BigNumber(0));
      expiresAt.toNumber().should.be.equal(latestBlockTime());
    });

    it("Fails if staking period ended", async () => {
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      await increaseTime(oneYear)
      await attestationLogic.revokeStake(aliceId, 0, {from: david}).should.be.rejectedWith(EVMThrow);
    });

    it("Fails if stake already revoked", async () => {
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      await increaseTime(oneDay)
      await attestationLogic.revokeStake(aliceId, 0, {from: david}).should.be.fulfilled;
      await attestationLogic.revokeStake(aliceId, 0, {from: david}).should.be.rejectedWith(EVMThrow);
    });
  });

  context("delegating revoking", () => {

    const revokeStakeForDefaults = {
      subjectId: aliceId,
      staker: david,
      attestationId: 0,
      delegationSig: "",
      from: mockAdmin
    };

    const revokeStakeFor = async (
      props: Partial<typeof revokeStakeForDefaults> = revokeStakeForDefaults
    ) => {
      let {
        subjectId,
        staker,
        attestationId,
        delegationSig,
        from
      } = {
        ...revokeStakeForDefaults,
        ...props
      };

      return attestationLogic.revokeStakeFor(
        subjectId,
        staker,
        attestationId,
        delegationSig,
        {
          from
        }
      );
    };

    it("accepts a valid delegated revocation", async () => {
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      await increaseTime(oneDay)
      await revokeStakeFor(
        {
          subjectId: aliceId,
          delegationSig: revokeStakeDelegationSig
        }
      ).should.be.fulfilled;
    });

    it("fails if not called by admin", async () => {
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      await increaseTime(oneDay)
      await revokeStakeFor(
        {
          subjectId: aliceId,
          delegationSig: revokeStakeDelegationSig,
          from: ellen
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("fails if subject id not valid", async () => {
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      await increaseTime(oneDay)
      await revokeStakeFor(
        {
          subjectId: bobId,
          delegationSig: revokeStakeDelegationSig,
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("fails if staker not valid", async () => {
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      await increaseTime(oneDay)
      await revokeStakeFor(
        {
          subjectId: aliceId,
          staker: bob,
          delegationSig: revokeStakeDelegationSig,
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("fails if attestation id not valid", async () => {
      await stake({paymentSig: tokenReleaseSig}).should.be.fulfilled;
      await increaseTime(oneDay)
      await revokeStakeFor(
        {
          subjectId: aliceId,
          attestationId: 1,
          delegationSig: revokeStakeDelegationSig,
        }
      ).should.be.rejectedWith(EVMThrow);
    });

  });

});
