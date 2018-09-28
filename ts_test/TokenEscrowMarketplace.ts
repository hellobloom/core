import * as BigNumber from "bignumber.js";
import {
  AccountRegistryInstance,
  TokenEscrowMarketplaceInstance,
  SigningLogicLegacyInstance,
  MockBLTInstance
} from "./../contracts";
import { EVMThrow } from "./helpers/EVMThrow";
import * as ethereumjsWallet from "ethereumjs-wallet";
const ethSigUtil = require("eth-sig-util");
import { bufferToHex } from "ethereumjs-util";
const uuid = require('uuidv4')
import * as ipfs from "./../src/ipfs";

import { should } from "./test_setup";
import { latestBlockTime } from "./helpers/blockInfo";
import { increaseTime } from "./helpers/increaseTime";
import { hashData } from "./../src/signData";
import { getFormattedTypedDataReleaseTokens, getFormattedTypedDataLockupTokensFor } from "./helpers/signingLogicLegacy";

const TokenEscrowMarketplace = artifacts.require("TokenEscrowMarketplace");
const AccountRegistry= artifacts.require("AccountRegistry");
const MockBLT = artifacts.require("MockBLT");
const SigningLogic = artifacts.require("SigningLogicLegacy");

contract("TokenEscrowMarketplace", function(
  [
    alice,
    bob,
    mockAttestationLogic,
    differentMockAttestationLogic,
    mockAdmin
  ]) {
  let marketplace: TokenEscrowMarketplaceInstance;
  let token: MockBLTInstance;
  let registry: AccountRegistryInstance;
  let signingLogic: SigningLogicLegacyInstance;
  let aliceId: BigNumber.BigNumber;
  let bobId: BigNumber.BigNumber;

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


  // Sanity check
  if (alice != aliceWallet.getAddressString()) {
    throw new Error("Mnemonic used for truffle tests out of sync?");
  }

  // Sanity check
  if (bob != bobWallet.getAddressString()) {
    throw new Error("Mnemonic used for truffle tests out of sync?");
  }

  const nonce = uuid()
  const differentNonce = uuid()
  const nonceHash = bufferToHex(hashData(nonce))
  const differentNonceHash = bufferToHex(hashData(differentNonce))

  beforeEach(async () => {
    signingLogic = await SigningLogic.new();
    registry = await AccountRegistry.new(mockAdmin)
    token = await MockBLT.new();
    marketplace = await TokenEscrowMarketplace.new(
      token.address,
      registry.address,
      signingLogic.address,
      mockAttestationLogic,
      {from: mockAdmin}
    );

    await Promise.all([
      registry.createNewAccount(alice, {from: mockAdmin}),
      registry.createNewAccount(bob, {from: mockAdmin})
    ]);
    [aliceId, bobId] = await Promise.all([
      registry.accountIdForAddress.call(alice),
      registry.accountIdForAddress.call(bob),
    ]);
    await Promise.all([
      token.gift(alice, new BigNumber("1e18")),
      token.gift(bob, new BigNumber("1e18")),
    ]);
  });

  interface ActorBalances {
    marketplace: BigNumber.BigNumber;
    alice: BigNumber.BigNumber;
    bob: BigNumber.BigNumber;
  }

  const allBalances = async () => {
    const subjects = [alice, bob, marketplace.address];
    const [
      aliceToken,
      bobToken,
      marketToken,
    ] = await Promise.all(
      subjects
        .map(subject => token.balanceOf(subject))
    );

    return {
      token: {
        alice: aliceToken,
        bob: bobToken,
        market: marketToken
      },
    };
  };

  const lockupTokensForSig = ethSigUtil.signTypedDataLegacy(
    alicePrivkey,
    {data: getFormattedTypedDataLockupTokensFor(
      alice,
      new BigNumber("5e17").toString(10),
      nonceHash,
    )}
  );

  const tokenReleaseSig = ethSigUtil.signTypedDataLegacy(
    alicePrivkey,
    {data: getFormattedTypedDataReleaseTokens(
      alice,
      bob,
      new BigNumber("1e17").toString(10),
      nonceHash,
    )}
  );

  context("moving tokens to escrow", () => {
    beforeEach(async () => {
      await token.approve(marketplace.address, new BigNumber("5e17"));
    });

    it("allows users to lock up tokens via approve", async () => {
      const startBalance = await token.balanceOf(alice);

      await marketplace.moveTokensToEscrowLockup(new BigNumber("1e17"), {from: alice});

      const endBalance = await token.balanceOf(alice);

      startBalance.should.be.bignumber.equal("1e18");
      endBalance.should.be.bignumber.equal("9e17");
    });

    it("fails if paused", async () => {
      await marketplace.pause({from: mockAdmin})
      await marketplace.moveTokensToEscrowLockup(new BigNumber("1e17"), {from: alice}).should.be.rejectedWith(EVMThrow)
    });

    it("emits an event when paying into escrow", async () => {
      const { logs } = await marketplace.moveTokensToEscrowLockup(new BigNumber("1e17"));

      const matchingLog = logs.find(
        log => log.event === "TokenMarketplaceDeposit"
      );

      should.exist(matchingLog);

      if (!matchingLog) return; // Satisfy TS

      matchingLog.args.escrowPayer.should.be.bignumber.equal(aliceId);
      matchingLog.args.amount.should.be.bignumber.equal("1e17");
    });

    it("marks the tokens as being in escrow from alice", async () => {
      const escrowBefore = await marketplace.tokenEscrow.call(aliceId);

      await marketplace.moveTokensToEscrowLockup(new BigNumber("1e17"));

      const escrowAfter = await marketplace.tokenEscrow.call(aliceId);

      // balance
      escrowBefore.should.be.bignumber.equal("0");
      // balance
      escrowAfter.should.be.bignumber.equal("1e17");
    });

    it("can handle multiple additions to the same escrow", async () => {
      const escrowBefore = await marketplace.tokenEscrow.call(aliceId);

      await Promise.all([
        marketplace.moveTokensToEscrowLockup(new BigNumber("1e17")),
        marketplace.moveTokensToEscrowLockup(new BigNumber("1e17")),
      ]);

      const escrowAfter = await marketplace.tokenEscrow.call(aliceId);

      escrowBefore.should.be.bignumber.equal("0");
      escrowAfter.should.be.bignumber.equal("2e17");
    });

    it("fails if user tries to transfer more tokens to escrow than they own", async () => {
      const escrowBefore = await marketplace.tokenEscrow.call(aliceId);
      const tokenBeforeAlice = await token.balanceOf(alice)
      const tokenBeforeBob = await token.balanceOf(bob)

      await token.transfer(bob, new BigNumber("1e18"), { from: alice });

      await marketplace.moveTokensToEscrowLockup(new BigNumber("5e17")).should.be.rejectedWith(EVMThrow)

      const escrowAfter = await marketplace.tokenEscrow.call(aliceId);
      const tokenAfterAlice = await token.balanceOf(alice)
      const tokenAfterBob = await token.balanceOf(bob)

      // balance
      escrowBefore.should.be.bignumber.equal("0");
      tokenBeforeAlice.should.be.bignumber.equal("1e18")
      tokenBeforeBob.should.be.bignumber.equal("1e18")
      // balance
      escrowAfter.should.be.bignumber.equal("0");
      tokenAfterAlice.should.be.bignumber.equal("0")
      tokenAfterBob.should.be.bignumber.equal("2e18")
    });

    it("fails if user tries to transfer more tokens to escrow than they approved", async () => {
      const escrowBefore = await marketplace.tokenEscrow.call(aliceId);
      const tokenBefore = await token.balanceOf(alice)

      await marketplace.moveTokensToEscrowLockup(new BigNumber("6e17")).should.be.rejectedWith(EVMThrow)

      const escrowAfter = await marketplace.tokenEscrow.call(aliceId);
      const tokenAfter = await token.balanceOf(alice)

      escrowBefore.should.be.bignumber.equal("0");
      tokenBefore.should.be.bignumber.equal("1e18")

      escrowAfter.should.be.bignumber.equal("0");
      tokenAfter.should.be.bignumber.equal("1e18")
    });

  });

  
  context("delegating token lockup", () => {
    beforeEach(async () => {
      await token.approve(marketplace.address, new BigNumber("5e17"));
    });

    const lockupTokensForDefaults = {
      sender: alice,
      amount: new BigNumber("5e17"),
      nonce: nonceHash,
      delegationSig: lockupTokensForSig,
      from: mockAdmin
    };

    const lockupTokensFor = async (
      props: Partial<typeof lockupTokensForDefaults> = lockupTokensForDefaults
    ) => {
      let {
        sender,
        amount,
        nonce,
        delegationSig,
        from
      } = {
        ...lockupTokensForDefaults,
        ...props
      };

      return marketplace.moveTokensToEscrowLockupFor(
        sender,
        amount,
        nonce,
        delegationSig,
        {
          from
        }
      );
    };

    it("allows users to lockup tokens via delegation ", async () => {
      const escrowBefore = await marketplace.tokenEscrow.call(aliceId);

      const startBalance = await token.balanceOf(alice);

      await lockupTokensFor().should.be.fulfilled;

      const endBalance = await token.balanceOf(alice);
      const escrowAfter = await marketplace.tokenEscrow.call(aliceId);

      escrowBefore.should.be.bignumber.equal("0");
      escrowAfter.should.be.bignumber.equal("5e17");

      startBalance.should.be.bignumber.equal("1e18");
      endBalance.should.be.bignumber.equal("5e17");
    })

    it("fails if sent by non-admin", async () => {
      await lockupTokensFor({from: bob}).should.be.rejectedWith(EVMThrow);
    })

    it("fails if sender does not match sig", async () => {
      await lockupTokensFor({sender: bob}).should.be.rejectedWith(EVMThrow);
    })

    it("fails if amount does not match sig", async () => {
      await lockupTokensFor({amount: new BigNumber("1e17")}).should.be.rejectedWith(EVMThrow);
    })

    it("fails if nonce does not match sig", async () => {
      await lockupTokensFor({nonce: differentNonceHash}).should.be.rejectedWith(EVMThrow);
    })

    it("fails if sig replayed", async () => {
      await token.approve(marketplace.address, new BigNumber("5e17"));
      await lockupTokensFor().should.be.fulfilled;
      await lockupTokensFor().should.be.rejectedWith(EVMThrow);
    })

    it("allows multiple txs if different nonce", async () => {
      const escrowBefore = await marketplace.tokenEscrow.call(aliceId);
      const startBalance = await token.balanceOf(alice);

      await lockupTokensFor().should.be.fulfilled;
      await token.approve(marketplace.address, new BigNumber("5e17"));
      await lockupTokensFor({
        nonce: differentNonceHash,
        delegationSig: ethSigUtil.signTypedDataLegacy(
        alicePrivkey,
        {data: getFormattedTypedDataLockupTokensFor(
          lockupTokensForDefaults.sender,
          lockupTokensForDefaults.amount.toString(10),
          differentNonceHash,
          )}
        )
      }).should.be.fulfilled;
      const endBalance = await token.balanceOf(alice);
      const escrowAfter = await marketplace.tokenEscrow.call(aliceId);

      escrowBefore.should.be.bignumber.equal("0");
      escrowAfter.should.be.bignumber.equal("1e18");

      startBalance.should.be.bignumber.equal("1e18");
      endBalance.should.be.bignumber.equal("0");
    })

  })

  context("paying tokens out of escrow", () => {
    beforeEach(async () => {
      await token.approve(marketplace.address, new BigNumber("5e17"));
      await marketplace.moveTokensToEscrowLockup(new BigNumber("2e17"));
    });

    it("increases the receiver balance when escrow is paid out", async () => {
      const before = await allBalances();
      const escrowBefore = await marketplace.tokenEscrow.call(aliceId);

      await marketplace.requestTokenPayment(
        alice,
        bob,
        new BigNumber("1e17"),
        nonceHash,
        tokenReleaseSig, 
        {
          from: mockAttestationLogic
        }
      ).should.be.fulfilled


      const after = await allBalances();
      const escrowAfter = await marketplace.tokenEscrow.call(aliceId);

      // Bob's balance increases
      before.token.bob.should.be.bignumber.equal("10e17");
      after.token.bob.should.be.bignumber.equal("11e17");

      // Alice's stays the same
      before.token.alice.should.be.bignumber.equal("8e17");
      after.token.alice.should.be.bignumber.equal("8e17");

      // Escrow decreases
      escrowBefore.should.be.bignumber.equal("2e17");
      escrowAfter.should.be.bignumber.equal("1e17");
    });

    it("fails if paused", async () => {
      await marketplace.pause({from: mockAdmin})
      await marketplace.requestTokenPayment(
        alice,
        bob,
        new BigNumber("1e17"),
        nonceHash,
        tokenReleaseSig, 
        {
          from: mockAttestationLogic
        }
      ).should.be.rejectedWith(EVMThrow)
    });

    it("emits an event when paying from escrow", async () => {
      const before = await allBalances();
      const escrowBefore = await marketplace.tokenEscrow.call(aliceId);

      const { logs } = await marketplace.requestTokenPayment(
        alice,
        bob,
        new BigNumber("1e17"),
        nonceHash,
        tokenReleaseSig, 
        {
          from: mockAttestationLogic
        }
      )

      const matchingLog = logs.find(
        log => log.event === "TokenMarketplaceEscrowPayment"
      );

      should.exist(matchingLog);

      if (!matchingLog) return; // Satisfy TS

      matchingLog.args.escrowPayer.should.be.bignumber.equal(aliceId);
      matchingLog.args.escrowPayee.should.be.equal(bob);
      matchingLog.args.amount.should.be.bignumber.equal("1e17");

    });

    it("allows multiple txs with different nonce", async () => {
      const before = await allBalances();
      const escrowBefore = await marketplace.tokenEscrow.call(aliceId);

      await marketplace.requestTokenPayment(
        alice,
        bob,
        new BigNumber("1e17"),
        nonceHash,
        tokenReleaseSig, 
        {
          from: mockAttestationLogic
        }
      ).should.be.fulfilled

      await marketplace.requestTokenPayment(
        alice,
        bob,
        new BigNumber("1e17"),
        differentNonceHash,
        ethSigUtil.signTypedDataLegacy(
          alicePrivkey,
          {data: getFormattedTypedDataReleaseTokens(
            alice,
            bob,
            new BigNumber("1e17").toString(10),
            differentNonceHash,
          )}
        ),
        {
          from: mockAttestationLogic
        }
      ).should.be.fulfilled


      const after = await allBalances();
      const escrowAfter = await marketplace.tokenEscrow.call(aliceId);

      // Bob's balance increases
      before.token.bob.should.be.bignumber.equal("10e17");
      after.token.bob.should.be.bignumber.equal("12e17");

      // Alice's stays the same
      before.token.alice.should.be.bignumber.equal("8e17");
      after.token.alice.should.be.bignumber.equal("8e17");

      // Escrow goes to 0
      escrowBefore.should.be.bignumber.equal("2e17");
      escrowAfter.should.be.bignumber.equal("0");
    });


    it("fails if not called by attestationLogic", async () => {
      const before = await allBalances();
      const escrowBefore = await marketplace.tokenEscrow.call(aliceId);

      await marketplace.requestTokenPayment(
        alice,
        bob,
        new BigNumber("1e17"),
        nonceHash,
        tokenReleaseSig, 
        {
          from: bob
        }
      ).should.be.rejectedWith(EVMThrow)


      const after = await allBalances();
      const escrowAfter = await marketplace.tokenEscrow.call(aliceId);

      // Bob's balance stays the sam
      before.token.bob.should.be.bignumber.equal("1e18");
      after.token.bob.should.be.bignumber.equal("1e18");

      // Alice's stays the same
      before.token.alice.should.be.bignumber.equal("8e17");
      after.token.alice.should.be.bignumber.equal("8e17");

      // Escrow stays the same
      escrowBefore.should.be.bignumber.equal("2e17");
      escrowAfter.should.be.bignumber.equal("2e17");
    });

    it("fails if amount higher than authorization", async () => {
      const before = await allBalances();
      const escrowBefore = await marketplace.tokenEscrow.call(aliceId);

      await marketplace.requestTokenPayment(
        alice,
        bob,
        new BigNumber("2e17"),
        nonceHash,
        tokenReleaseSig, 
        {
          from: mockAttestationLogic
        }
      ).should.be.rejectedWith(EVMThrow)


      const after = await allBalances();
      const escrowAfter = await marketplace.tokenEscrow.call(aliceId);


      // Bob's balance stays the same
      before.token.bob.should.be.bignumber.equal("1e18");
      after.token.bob.should.be.bignumber.equal("1e18");

      // Alice's stays the same
      before.token.alice.should.be.bignumber.equal("8e17");
      after.token.alice.should.be.bignumber.equal("8e17");

      // Escrow stays the same
      escrowBefore.should.be.bignumber.equal("2e17");
      escrowAfter.should.be.bignumber.equal("2e17");
    });

    it("fails if authorized value higher than available balance", async () => {
      const before = await allBalances();
      const escrowBefore = await marketplace.tokenEscrow.call(aliceId);

      await marketplace.requestTokenPayment(
        alice,
        bob,
        new BigNumber("3e17"),
        nonceHash,
        ethSigUtil.signTypedDataLegacy(
          alicePrivkey,
          {data: getFormattedTypedDataReleaseTokens(
            alice,
            bob,
            new BigNumber("3e17").toString(10),
            nonceHash,
          )}
        ),
        {
          from: mockAttestationLogic
        }
      ).should.be.rejectedWith(EVMThrow)


      const after = await allBalances();
      const escrowAfter = await marketplace.tokenEscrow.call(aliceId);

      // Bob's balance stays the same
      before.token.bob.should.be.bignumber.equal("1e18");
      after.token.bob.should.be.bignumber.equal("1e18");

      // Alice's stays the same
      before.token.alice.should.be.bignumber.equal("8e17");
      after.token.alice.should.be.bignumber.equal("8e17");

      // Escrow stays the same
      escrowBefore.should.be.bignumber.equal("2e17");
      escrowAfter.should.be.bignumber.equal("2e17");
    });

    it("fails if sig replayed", async () => {
      const before = await allBalances();
      const escrowBefore = await marketplace.tokenEscrow.call(aliceId);

      await marketplace.requestTokenPayment(
        alice,
        bob,
        new BigNumber("1e17"),
        nonceHash,
        tokenReleaseSig, 
        {
          from: mockAttestationLogic
        }
      ).should.be.fulfilled
      await marketplace.requestTokenPayment(
        alice,
        bob,
        new BigNumber("1e17"),
        nonceHash,
        tokenReleaseSig, 
        {
          from: mockAttestationLogic
        }
      ).should.be.rejectedWith(EVMThrow)


      const after = await allBalances();
      const escrowAfter = await marketplace.tokenEscrow.call(aliceId);

      // Bob's balance increases
      before.token.bob.should.be.bignumber.equal("1e18");
      after.token.bob.should.be.bignumber.equal("11e17");

      // Alice's stays the same
      before.token.alice.should.be.bignumber.equal("8e17");
      after.token.alice.should.be.bignumber.equal("8e17");

      // Escrow decreases
      escrowBefore.should.be.bignumber.equal("2e17");
      escrowAfter.should.be.bignumber.equal("1e17");
    });


    it("fails if amount lower than authorization", async () => {
      const before = await allBalances();
      const escrowBefore = await marketplace.tokenEscrow.call(aliceId);

      await marketplace.requestTokenPayment(
        alice,
        bob,
        new BigNumber("1e16"),
        nonceHash,
        tokenReleaseSig, 
        {
          from: mockAttestationLogic
        }
      ).should.be.rejectedWith(EVMThrow)


      const after = await allBalances();
      const escrowAfter = await marketplace.tokenEscrow.call(aliceId);

      // Bob's balance stays the same
      before.token.bob.should.be.bignumber.equal("1e18");
      after.token.bob.should.be.bignumber.equal("1e18");

      // Alice's stays the same
      before.token.alice.should.be.bignumber.equal("8e17");
      after.token.alice.should.be.bignumber.equal("8e17");

      // Escrow stays the same
      escrowBefore.should.be.bignumber.equal("2e17");
      escrowAfter.should.be.bignumber.equal("2e17");
    });

  });

  context("releasing tokens from escrow back to payer", () => {
    beforeEach(async () => {
      await token.approve(marketplace.address, new BigNumber("5e17"));
      await marketplace.moveTokensToEscrowLockup(new BigNumber("2e17"));
    });

    it("increases the payer balance when escrow released", async () => {
      const before = await allBalances();
      const escrowBefore = await marketplace.tokenEscrow.call(aliceId);

      await marketplace.releaseTokensFromEscrow(new BigNumber("2e17"), {from: alice}).should.be.fulfilled

      const after = await allBalances();
      const escrowAfter = await marketplace.tokenEscrow.call(aliceId);

      // Bob's balance stays the same
      before.token.bob.should.be.bignumber.equal("1e18");
      after.token.bob.should.be.bignumber.equal("1e18");

      // Alice's increases
      before.token.alice.should.be.bignumber.equal("8e17");
      after.token.alice.should.be.bignumber.equal("1e18");

      // Escrow goes to zero
      escrowBefore.should.be.bignumber.equal("2e17");
      escrowAfter.should.be.bignumber.equal("0");
    });

    it("fails if paused", async () => {
      await marketplace.pause({from: mockAdmin})
      await marketplace.releaseTokensFromEscrow(new BigNumber("2e17"), {from: alice}).should.be.rejectedWith(EVMThrow)
    });

    it("fails if more than available balance", async () => {
      const before = await allBalances();
      const escrowBefore = await marketplace.tokenEscrow.call(aliceId);

      await marketplace.releaseTokensFromEscrow(new BigNumber("3e17")).should.be.rejectedWith(EVMThrow)

      const after = await allBalances();
      const escrowAfter = await marketplace.tokenEscrow.call(aliceId);

      // Bob's balance stays the same
      before.token.bob.should.be.bignumber.equal("1e18");
      after.token.bob.should.be.bignumber.equal("1e18");

      // Alice's stays the same
      before.token.alice.should.be.bignumber.equal("8e17");
      after.token.alice.should.be.bignumber.equal("8e17");

      // Escrow stays the same
      escrowBefore.should.be.bignumber.equal("2e17");
      escrowAfter.should.be.bignumber.equal("2e17");
    });


    it("emits an event when escrow is released", async () => {
      const { logs } = await marketplace.releaseTokensFromEscrow(new BigNumber("2e17"))

      const matchingLog = logs.find(
        log => log.event === "TokenMarketplaceWithdrawal"
      );

      should.exist(matchingLog);

      if (!matchingLog) return; // Satisfy TS

      matchingLog.args.subject.should.be.bignumber.equal(aliceId);
      matchingLog.args.amount.should.be.bignumber.equal("2e17");
    });

  });
  
  context("releasing tokens from escrow back to payer on behalf of user", () => {
    beforeEach(async () => {
      await token.approve(marketplace.address, new BigNumber("5e17"));
      await marketplace.moveTokensToEscrowLockup(new BigNumber("2e17"));
    });

    it("increases the payer balance when escrow released", async () => {
      const before = await allBalances();
      const escrowBefore = await marketplace.tokenEscrow.call(aliceId);

      await marketplace.releaseTokensFromEscrowFor(alice, new BigNumber("2e17"), {from: mockAdmin}).should.be.fulfilled

      const after = await allBalances();
      const escrowAfter = await marketplace.tokenEscrow.call(aliceId);

      // Bob's balance stays the same
      before.token.bob.should.be.bignumber.equal("1e18");
      after.token.bob.should.be.bignumber.equal("1e18");

      // Alice's increases
      before.token.alice.should.be.bignumber.equal("8e17");
      after.token.alice.should.be.bignumber.equal("1e18");

      // Escrow goes to zero
      escrowBefore.should.be.bignumber.equal("2e17");
      escrowAfter.should.be.bignumber.equal("0");
    });

    it("fails if called by non-admin", async () => {
      const before = await allBalances();
      const escrowBefore = await marketplace.tokenEscrow.call(aliceId);

      await marketplace.releaseTokensFromEscrowFor(alice, new BigNumber("2e17"), {from: alice}).should.be.rejectedWith(EVMThrow)
    });
  });

  describe("configuring the Attestation Logic", async () => {
    let attestationLogicAddressBefore: string;

    beforeEach(async () => {
      attestationLogicAddressBefore = await marketplace.attestationLogic.call();
      await marketplace.pause({from: mockAdmin})
    });

    it("allows the owner to change the Attestation Logic", async () => {
      await marketplace.setAttestationLogic(
        differentMockAttestationLogic,
        {from: mockAdmin}
      );
      const attestationLogicAddressAfter = await marketplace.attestationLogic();

      attestationLogicAddressBefore.should.be.equal(mockAttestationLogic);
      attestationLogicAddressAfter.should.be.equal(
        differentMockAttestationLogic
      );
    });
    
    it("fails if not paused", async () => {
      await marketplace.unpause({from: mockAdmin})
      await marketplace.setAttestationLogic(
        differentMockAttestationLogic,
        {from: mockAdmin}
      ).should.be.rejectedWith(EVMThrow)
      const attestationLogicAddressAfter = await marketplace.attestationLogic();

      attestationLogicAddressBefore.should.be.equal(mockAttestationLogic);
      attestationLogicAddressAfter.should.be.equal(mockAttestationLogic);
    });

    it("doesn't allow anyone else to change the Attestation Logic", async () => {
      await marketplace
        .setAttestationLogic(differentMockAttestationLogic, {
          from: bob
        })
        .should.be.rejectedWith(EVMThrow);
      const attestationLogicAddressAfter = await marketplace.attestationLogic();

      attestationLogicAddressBefore.should.be.equal(mockAttestationLogic);
      attestationLogicAddressAfter.should.be.equal(mockAttestationLogic);
    });
  });

  describe("configuring the marketplace admin", async () => {
    let marketplaceAdminBefore: string;
    let differentMarketplaceAdmin = alice;

    beforeEach(async () => {
      marketplaceAdminBefore = await marketplace.marketplaceAdmin.call();
    });

    it("allows the owner to change the marketplace admin", async () => {
      await marketplace.setMarketplaceAdmin(
        differentMarketplaceAdmin,
        {from: mockAdmin}
      );
      const marketplaceAdminAfter = await marketplace.marketplaceAdmin();

      marketplaceAdminBefore.should.be.equal(mockAdmin);
      marketplaceAdminAfter.should.be.equal(
        differentMarketplaceAdmin
      );
    });
    
    it("doesn't allow anyone else to change the marketplace admin", async () => {
      await marketplace
        .setMarketplaceAdmin(differentMarketplaceAdmin, {
          from: bob
        })
        .should.be.rejectedWith(EVMThrow);
      const marketplaceAdminAfter = await marketplace.marketplaceAdmin();

      marketplaceAdminBefore.should.be.equal(mockAdmin);
      marketplaceAdminAfter.should.be.equal(mockAdmin);
    });
  });

  describe("configuring the signing logic", async () => {
    let differentSigningLogic: SigningLogicLegacyInstance;
    let signingLogicAddressBefore: string;

    beforeEach(async () => {
      differentSigningLogic = await SigningLogic.new();
      signingLogicAddressBefore = await marketplace.signingLogic.call();
      await marketplace.pause({from: mockAdmin})
    });

    it("allows the owner to change the signing logic", async () => {
      await marketplace.setSigningLogic(differentSigningLogic.address, {from: mockAdmin});
      const signingLogicAddressAfter = await marketplace.signingLogic();

      signingLogicAddressBefore.should.be.equal(signingLogic.address);
      signingLogicAddressAfter.should.be.equal(differentSigningLogic.address);
    });

    it("fails if not paused", async () => {
      await marketplace.unpause({from: mockAdmin})
      await marketplace
        .setSigningLogic(differentSigningLogic.address, {
          from: mockAdmin
        })
        .should.be.rejectedWith(EVMThrow);
      const signingLogicAddressAfter = await marketplace.signingLogic();

      signingLogicAddressBefore.should.be.equal(signingLogic.address);
      signingLogicAddressAfter.should.be.equal(signingLogic.address);
    });

    it("doesn't allow anyone else to change the signing logic", async () => {
      await marketplace
        .setSigningLogic(differentSigningLogic.address, {
          from: bob
        })
        .should.be.rejectedWith(EVMThrow);
      const signingLogicAddressAfter = await marketplace.signingLogic();

      signingLogicAddressBefore.should.be.equal(signingLogic.address);
      signingLogicAddressAfter.should.be.equal(signingLogic.address);
    });
  });

  describe("configuring the signing logic", async () => {
    let differentRegistry: AccountRegistryInstance;
    let registryBefore: string;

    beforeEach(async () => {
      differentRegistry = await AccountRegistry.new(mockAdmin);
      registryBefore = await marketplace.registry.call();
      await marketplace.pause({from: mockAdmin})
    });

    it("allows the owner to change the signing logic", async () => {
      await marketplace.setAccountRegistry(differentRegistry.address, {from: mockAdmin});
      const registryAfter = await marketplace.registry.call();

      registryBefore.should.be.equal(registry.address);
      registryAfter.should.be.equal(differentRegistry.address);
    });

    it("fails if not paused", async () => {
      await marketplace.unpause({from: mockAdmin})
      await marketplace
        .setAccountRegistry(differentRegistry.address, {
          from: mockAdmin
        })
        .should.be.rejectedWith(EVMThrow);
      const registryAfter = await marketplace.registry();

      registryBefore.should.be.equal(registry.address);
      registryAfter.should.be.equal(registry.address);
    });

    it("doesn't allow anyone else to change the signing logic", async () => {
      await marketplace
        .setAccountRegistry(differentRegistry.address, {
          from: bob
        })
        .should.be.rejectedWith(EVMThrow);
      const registryAfter = await marketplace.registry();

      registryBefore.should.be.equal(registry.address);
      registryAfter.should.be.equal(registry.address);
    });
  });

});
