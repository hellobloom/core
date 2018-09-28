import * as Web3 from "web3";
import * as BigNumber from "bignumber.js";
import * as ethereumjsWallet from "ethereumjs-wallet";
const ethSigUtil = require("eth-sig-util");
const { soliditySha3 } = require("web3-utils");
import { bufferToHex } from "ethereumjs-util";

import { EVMThrow } from "./helpers/EVMThrow";
import { should } from "./test_setup";
import {
  AttestationRepoInstance,
  MockBLTInstance
} from "../contracts";

import { latestBlockTime } from "./helpers/blockInfo";
import { hashData } from "./../src/signData";
import { soliditySign } from "./../src/signatures";
import * as ipfs from "./../src/ipfs";

const AttestationRepo = artifacts.require("AttestationRepo");
const MockBLT = artifacts.require("MockBLT");

contract("AttestationRepo", function (
  [alice, bob, carl, david, mockAttestationLogic, differentMockAttestationLogic]
) {
  let token: MockBLTInstance;
  let attestationRepo: AttestationRepoInstance;

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

  const data = {
    phone: "12223334444",
    nonce: 528495719456771842372645
  };

  const dataHash = bufferToHex(hashData(data));

    const timestamp = Math.floor(Date.now() / 1000);

    const attestDefaults = {
      subjectId: 0,
      attesterId: 1,
      timestamp: timestamp,
      stakeValue: new BigNumber(0),
      expiresAt: 0,
      from: mockAttestationLogic
    };

    const attest = async (
      props: Partial<typeof attestDefaults> = attestDefaults
    ) => {
      let {
        subjectId,
        attesterId,
        timestamp,
        stakeValue,
        expiresAt,
        from
      } = {
        ...attestDefaults,
        ...props
      };

      return attestationRepo.writeAttestation(
        subjectId,
        attesterId,
        timestamp,
        stakeValue,
        expiresAt,
        {
          from
        }
      );
    };

  beforeEach(async () => {
    token = await MockBLT.new();
    attestationRepo = await AttestationRepo.new(token.address, mockAttestationLogic);

    token.gift(attestationRepo.address, new BigNumber("5e18"))
  });

  context("submitting attestations", () => {

    it("accepts a valid attestation", async () => {
      await attest().should.be.fulfilled;
    });

    it("fails if the attestation comes from a different contract", async () => {
      await attest(
        {
          from: differentMockAttestationLogic
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("writes the attestation to the contract", async () => {
      await attest();

      const recoveredAttestation = await attestationRepo.readAttestation.call(
        attestDefaults.subjectId,
        0
      )

      const [
        attesterId,
        completedAt,
        stakeValue,
        expiresAt
      ] = recoveredAttestation;

      attesterId.should.be.bignumber.equal(attestDefaults.attesterId);
      completedAt.should.be.bignumber.equal(attestDefaults.timestamp);
      stakeValue.should.be.bignumber.equal(attestDefaults.stakeValue)
      expiresAt.should.be.bignumber.equal(attestDefaults.expiresAt)

    });

    it("accepts a valid staked attestation", async () => {
      await attest(
        {
          stakeValue: new BigNumber("1e18"),
          expiresAt: timestamp + oneWeek

        }
      ).should.be.fulfilled;
    });

    it("writes the staked attestation to the contract", async () => {
      await attest(
        {
          stakeValue: new BigNumber("1e18"),
          expiresAt: timestamp + oneWeek

        }
      ).should.be.fulfilled;

      const recoveredAttestation = await attestationRepo.readAttestation.call(
        attestDefaults.subjectId,
        0
      )

      let [
        attesterId,
        completedAt,
        stakeValue,
        expiresAt
      ] = recoveredAttestation;

      attesterId.should.be.bignumber.equal(attestDefaults.attesterId);
      completedAt.should.be.bignumber.equal(attestDefaults.timestamp);

      stakeValue.should.be.bignumber.equal(new BigNumber("1e18"))
      expiresAt.should.be.bignumber.equal(timestamp + oneWeek);

    });

    it("Allows stake fields to be updated in an attestation", async () => {
      await attest().should.be.fulfilled;

      const recoveredAttestation = await attestationRepo.readAttestation.call(
        attestDefaults.subjectId,
        0
      )

      let [
        attesterId,
        completedAt,
        stakeValue,
        expiresAt
      ] = recoveredAttestation;

      attesterId.should.be.bignumber.equal(attestDefaults.attesterId);
      completedAt.should.be.bignumber.equal(attestDefaults.timestamp);
      stakeValue.should.be.bignumber.equal(0);
      expiresAt.should.be.bignumber.equal(0);

      await attestationRepo.writeStake(
        attestDefaults.subjectId,
        0,
        new BigNumber("1e18"),
        timestamp + oneWeek,
        {from: mockAttestationLogic}
      ).should.be.fulfilled

      const recoveredAttestationAfter = await attestationRepo.readAttestation.call(
        attestDefaults.subjectId,
        0
      )

      let [
        attesterIdAfter,
        completedAtAfter,
        stakeValueAfter,
        expiresAtAfter
      ] = recoveredAttestationAfter;

      attesterIdAfter.should.be.bignumber.equal(attestDefaults.attesterId);
      completedAtAfter.should.be.bignumber.equal(attestDefaults.timestamp);
      stakeValueAfter.should.be.bignumber.equal(new BigNumber("1e18"));
      expiresAtAfter.should.be.bignumber.equal(timestamp + oneWeek);

    });

    it("Fails to update stake if not called by AttestationLogic", async () => {
      await attest().should.be.fulfilled;

      await attestationRepo.writeStake(
        attestDefaults.subjectId,
        0,
        new BigNumber("1e18"),
        timestamp + oneWeek,
        {from: bob}
      ).should.be.rejectedWith(EVMThrow)
    });

  });

  context("revoking attestations", () => {

    it("Allows attestationLogic to revoke an attestation", async () => {
      await attest().should.be.fulfilled;
      await attestationRepo.revokeAttestation(
        attestDefaults.subjectId,
        0,
        {
          from: mockAttestationLogic
        }
      ).should.be.fulfilled;
    });

    it("Fails if someone else tries to revoke an attestation", async () => {
      await attest().should.be.fulfilled;
      await attestationRepo.revokeAttestation(
        attestDefaults.subjectId,
        0,
        {
          from: differentMockAttestationLogic
        }
      ).should.be.rejectedWith(EVMThrow);
    });

    it("Nullifies the attestation", async () => {
      await attest();
      await attestationRepo.revokeAttestation(
        attestDefaults.subjectId,
        0,
        {
          from: mockAttestationLogic
        }
      );

      const recoveredAttestation = await attestationRepo.readAttestation.call(
        attestDefaults.subjectId,
        0
      )

      const [
        attesterId,
        completedAt,
        stakeValue,
        expiresAt,
      ] = recoveredAttestation;

      attesterId.should.be.bignumber.equal(0);
      completedAt.should.be.bignumber.equal(0);
      stakeValue.should.be.bignumber.equal(0);
      expiresAt.should.be.bignumber.equal(0);

    });

    it("Allows new attestation to be appended after the revoked attestation", async () => {
      await attest().should.be.fulfilled;
      await attestationRepo.revokeAttestation(
        attestDefaults.subjectId,
        0,
        {
          from: mockAttestationLogic
        }
      ).should.be.fulfilled;
      await attest().should.be.fulfilled;
      const recoveredAttestation = await attestationRepo.readAttestation.call(
        attestDefaults.subjectId,
        1
      )

      const [
        attesterId,
        completedAt,
        stakeValue,
        expiresAt,
      ] = recoveredAttestation;

      attesterId.should.be.bignumber.equal(attestDefaults.attesterId);
      completedAt.should.be.bignumber.equal(attestDefaults.timestamp);
      stakeValue.should.be.bignumber.equal(0);
      expiresAt.should.be.bignumber.equal(0);
    });

  });

  context("Retrieving tokens", async () => {
    
    it("Allows attestation logic to withdraw tokens and send back to staker", async () => {
      token.balanceOf.call(attestationRepo.address).then(bal => bal.should.be.bignumber.equal("5e18"))
      token.balanceOf.call(bob).then(bal => bal.should.be.bignumber.equal("0"))

      await attestationRepo.transferTokensToStaker(
        bob,
        new BigNumber("1e18"),
        {from: mockAttestationLogic}
      ).should.be.fulfilled;

    token.balanceOf.call(attestationRepo.address).then(bal => bal.should.be.bignumber.equal("4e18"))
    token.balanceOf.call(bob).then(bal => bal.should.be.bignumber.equal("1e18"))
    });

    it("Fails if not called by attestationLogic", async () => {
      await attestationRepo.transferTokensToStaker(
        bob,
        new BigNumber("1e18"),
        {from: bob}
      ).should.be.rejectedWith(EVMThrow);
    });

    it("Fails if paused", async () => {
      await attestationRepo.pause({from: alice})
      await attestationRepo.transferTokensToStaker(
        bob,
        new BigNumber("1e18"),
        {from: mockAttestationLogic}
      ).should.be.rejectedWith(EVMThrow);
    });
  })

  describe("configuring the Attestation Logic", async () => {
    let attestationLogicAddressBefore: string;

    beforeEach(async () => {
      attestationLogicAddressBefore = await attestationRepo.attestationLogic.call();
    });

    it("allows the owner to change the Attestation Logic", async () => {
      await attestationRepo.setAttestationLogic(
        differentMockAttestationLogic
      );
      const attestationLogicAddressAfter = await attestationRepo.attestationLogic();

      attestationLogicAddressBefore.should.be.equal(mockAttestationLogic);
      attestationLogicAddressAfter.should.be.equal(
        differentMockAttestationLogic
      );
    });

    it("doesn't allow anyone else to change the Attestation Logic", async () => {
      await attestationRepo
        .setAttestationLogic(differentMockAttestationLogic, {
          from: bob
        })
        .should.be.rejectedWith(EVMThrow);
      const attestationLogicAddressAfter = await attestationRepo.attestationLogic();

      attestationLogicAddressBefore.should.be.equal(mockAttestationLogic);
      attestationLogicAddressAfter.should.be.equal(mockAttestationLogic);
    });
  });
});
