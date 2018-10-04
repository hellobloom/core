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
  AttestationRepoInstance,
  AccountRegistryInstance,
  AttestationLogicUpgradeModeInstance
} from "../contracts";

import { latestBlockTime } from "./helpers/blockInfo";
import { hashData } from "./../src/signData";
import { soliditySign } from "./../src/signatures";
import * as ipfs from "./../src/ipfs";
import { HashingLogic } from "@bloomprotocol/attestations-lib";

const AttestationRepo = artifacts.require("AttestationRepo");
const AttestationLogicUpgradeMode = artifacts.require("AttestationLogicUpgradeMode");
const AccountRegistry = artifacts.require("AccountRegistry");

contract("AttestationLogicUpgradeMode", function(
  [alice, bob, carl, david, mockAttestationLogic]
) {
  let registry: AccountRegistryInstance;
  let attestationLogicUpgradeMode: AttestationLogicUpgradeModeInstance;
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

  const merkleTree = HashingLogic.getMerkleTree([phoneData, emailData])
  const dataHash = bufferToHex(merkleTree.getRoot())
  const typeIds = [0, 1];

  beforeEach(async () => {
    registry = await AccountRegistry.new(alice);
    attestationRepo = await AttestationRepo.new("0x0", "0x0");

    attestationLogicUpgradeMode = await AttestationLogicUpgradeMode.new(
      registry.address,
      attestationRepo.address
    )

    await attestationRepo.setAttestationLogic(attestationLogicUpgradeMode.address);

    await Promise.all([
      registry.createNewAccount(alice),
      registry.createNewAccount(bob),
      registry.createNewAccount(david)
    ]);
    [aliceId, bobId, davidId] = await Promise.all([
      registry.accountIdForAddress.call(alice),
      registry.accountIdForAddress.call(bob),
      registry.accountIdForAddress.call(david)
    ]);

  });

  context("Populating attestations", () => {
    it("Populates a complete attestation", async () => {
      await attestationLogicUpgradeMode.proxyWriteAttestation(
        alice,
        bob,
        david,
        dataHash,
        typeIds,
        1526241724,
      ).should.be.fulfilled;
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

    it("emits an event when an attestation is written", async () => {
      const { logs } = ((
        await attestationLogicUpgradeMode.proxyWriteAttestation(
          alice,
          bob,
          david,
          dataHash,
          typeIds,
          1526241724,
        )
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
      matchingLog.args.dataHash.should.be.equal(dataHash);
      new BigNumber(matchingLog.args.typeIds[0]).toNumber().should.be.equal(typeIds[0])
      new BigNumber(matchingLog.args.typeIds[1]).toNumber().should.be.equal(typeIds[1])
      matchingLog.args.stakeValue.should.be.bignumber.equal(0);
      matchingLog.args.expiresAt.should.be.bignumber.equal(0);
    });

    it("Fails if Attestation Repo is not in upgrade mode", async () => {
      await attestationRepo.setAttestationLogic(mockAttestationLogic);
      await attestationLogicUpgradeMode.proxyWriteAttestation(
        alice,
        bob,
        david,
        dataHash,
        typeIds,
        1526241724,
      ).should.be.rejectedWith(EVMThrow);
    });
    it("Fails if not called by owner", async () => {
      await attestationLogicUpgradeMode.proxyWriteAttestation(
        alice,
        bob,
        david,
        dataHash,
        typeIds,
        1526241724,
        {from: carl},
      ).should.be.rejectedWith(EVMThrow);
    });
  });
});
