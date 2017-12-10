import * as BigNumber from "bignumber.js";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as Web3 from "web3";

import { increaseTime } from "./helpers/increaseTime";

import { MockBLTInstance, InviteCollateralizerInstance } from "./../truffle";

const chaiBignumber = require("chai-bignumber");

const should = chai
  .use(chaiAsPromised)
  .use(chaiBignumber(web3.BigNumber))
  .should();

const InviteCollateralizer = artifacts.require("InviteCollateralizer");
const MockBLT = artifacts.require("./helpers/MockBLT");

contract("InviteCollateralizer", function([owner, alice, bob, seizedTokensWallet]) {
  let token: MockBLTInstance;
  let collateralizer: InviteCollateralizerInstance;

  const setupOwner = async () => {
    await token.gift(owner);
    await token.approve(collateralizer.address, new BigNumber("1e18"));
  };

  beforeEach(async () => {
    token = await MockBLT.new();
    collateralizer = await InviteCollateralizer.new(token.address, seizedTokensWallet);
    await setupOwner();
  });

  it("transfers a small amount of BLT to the collateralizer", async () => {
    const ownerBalanceBefore = await token.balanceOf(owner);
    const collateralizerBalanceBefore = await token.balanceOf(
      collateralizer.address
    );

    await collateralizer.takeCollateral(owner);

    const collateralizerBalanceAfter = await token.balanceOf(
      collateralizer.address
    );
    const ownerBalanceAfter = await token.balanceOf(owner);

    ownerBalanceBefore.should.be.bignumber.equal("1e18");
    ownerBalanceAfter.should.be.bignumber.equal("9e17");
    collateralizerBalanceBefore.should.be.bignumber.equal(0);
    collateralizerBalanceAfter.should.be.bignumber.equal("1e17");
  });

  it("emits a collateralization event", async () => {
    const { logs } = await (collateralizer.takeCollateral as any)(owner);

    const { blockNumber, args } = logs.find(
      (log: Web3.SolidityEvent<never>) => {
        return log.event === "CollateralPosted";
      }
    );

    const blockTimestamp = web3.eth.getBlock(blockNumber).timestamp;

    args.owner.should.equal(owner);
    args.releaseDate.should.be.bignumber.greaterThan(
      blockTimestamp + 60 * 60 * 24 * 364
    );
    args.amount.should.be.bignumber.equal("1e17");
  });

  it("lets the owner of the collateralized BLT claim it after a year", async () => {
    await collateralizer.takeCollateral(owner);

    await increaseTime(60 * 60 * 24 * 366);

    await collateralizer.reclaim().should.be.fulfilled;
  });

  it("does not let the owner claim the BLT before a year has passed", async () => {
    await collateralizer.takeCollateral(owner);

    await increaseTime(60 * 60 * 24 * 364);

    await collateralizer.reclaim().should.be.rejectedWith("invalid opcode");

    await increaseTime(60 * 60 * 24 * 2);

    await collateralizer.reclaim().should.be.fulfilled;
  });

  it("fails if the owner has not collateralized anything", async () => {
    // Give the collateralizer some BLT so it doesn't fail due to an empty balance alone
    await token.gift(collateralizer.address);

    await collateralizer.reclaim().should.be.rejectedWith("invalid opcode");
  });

  it("lets a user collateralize BLT multiple times", async () => {
    await collateralizer.takeCollateral(owner);
    await collateralizer.takeCollateral(owner);

    (await token.balanceOf(collateralizer.address)).should.be.bignumber.equal(
      "2e17"
    );
    const ownerBalanceBeforeReclaim = await token.balanceOf(owner);

    await increaseTime(60 * 60 * 24 * 366);

    await collateralizer.reclaim();

    (await token.balanceOf(collateralizer.address)).should.be.bignumber.equal(
      0
    );
    (await token.balanceOf(owner)).should.be.bignumber.equal(
      ownerBalanceBeforeReclaim.add("2e17")
    );
  });

  it("works with multiple collateralizations issued and reclaimed with meaningful time between each", async () => {
    // Take collateral and wait 183 days
    await collateralizer.takeCollateral(owner);
    await increaseTime(60 * 60 * 24 * 183);

    // Take another collateral and wait 183 days
    await collateralizer.takeCollateral(owner);
    await increaseTime(60 * 60 * 24 * 183);

    // Collateralizer should now have balance of both collateralizations
    (await token.balanceOf(collateralizer.address)).should.be.bignumber.equal(
      "2e17"
    );

    // Only the first collateralization is reclaimable so the collateralizer balance shouldn't go to zero
    await collateralizer.reclaim();
    (await token.balanceOf(collateralizer.address)).should.be.bignumber.equal(
      "1e17"
    );

    // Another reclaim should fail since nothing can be claimed
    await collateralizer.reclaim().should.be.rejectedWith("invalid opcode");

    // Fast forward to after the second collateral is reclaimable. Now balance should go to zero.
    await increaseTime(60 * 60 * 24 * 183);
    await collateralizer.reclaim();
    (await token.balanceOf(collateralizer.address)).should.be.bignumber.equal(
      0
    );
  });

  describe("seizing collateral from bad actors", async () => {
    it("allows the collateral seizer to seize collateral", async () => {
      await token.gift(alice);
      await token.approve(collateralizer.address, new BigNumber("1e18"), {
        from: alice
      });
      await collateralizer.takeCollateral(alice);

      const seizedTokensBefore = await token.balanceOf(seizedTokensWallet);
      await collateralizer.seize(alice, 0);
      const seizedTokensAfter = await token.balanceOf(seizedTokensWallet);

      seizedTokensBefore.should.be.bignumber.equal(0);
      seizedTokensAfter.should.be.bignumber.equal("1e17");
    });

    it("does not allow others to seize collateral", async () => {
      await token.gift(alice);
      await token.approve(collateralizer.address, new BigNumber("1e18"), {
        from: alice
      });
      await collateralizer.takeCollateral(alice);

      await collateralizer.seize(alice, 0, { from: bob }).should.be.rejectedWith("invalid opcode");
    });

    it("marks the seized collateral as claimed", async () => {
      await token.gift(alice);
      await token.approve(collateralizer.address, new BigNumber("1e18"), {
        from: alice
      });
      await collateralizer.takeCollateral(alice);

      const [, , claimedBefore] = await collateralizer.collateralizations(alice, 0);
      await collateralizer.seize(alice, 0);
      const [, , claimedAfter] = await collateralizer.collateralizations(alice, 0);

      claimedBefore.should.be.false;
      claimedAfter.should.be.true;
    });

    it("emits a CollateralSeized event", async () => {
      await token.gift(alice);
      await token.approve(collateralizer.address, new BigNumber("1e18"), {
        from: alice
      });
      await collateralizer.takeCollateral(alice);

      const { logs } = await collateralizer.seize(alice, 0);

      const match = logs.find(log => {
        return log.event === "CollateralSeized" && log.args.owner === alice && (log.args.collateralId as BigNumber.BigNumber).eq(0);
      });

      should.exist(match);
    });
  });

  describe("changing the administrators of the contract", async () => {
    it("allows the owner to change the collateral taker", async () => {
      await token.gift(bob);
      await token.approve(collateralizer.address, new BigNumber("1e18"), {
        from: bob
      });

      await collateralizer.takeCollateral(bob, { from: alice }).should.be.rejectedWith("invalid opcode");
      await collateralizer.changeCollateralTaker(alice);
      await collateralizer.takeCollateral(bob, { from: alice }).should.be.fulfilled;
    });

    it("does not allow anyone besides the owner to change the collateral taker", async () => {
      await collateralizer.changeCollateralTaker(alice, { from: alice }).should.be.rejectedWith("invalid opcode");
    });

    it("allows the owner to change the collateral seizer", async () => {
      await token.gift(bob);
      await token.approve(collateralizer.address, new BigNumber("1e18"), {
        from: bob
      });
      await collateralizer.takeCollateral(bob);

      await collateralizer.seize(bob, 0, { from: alice }).should.be.rejectedWith("invalid opcode");
      await collateralizer.changeCollateralSeizer(alice);
      await collateralizer.seize(bob, 0, { from: alice }).should.be.fulfilled;
    })

    it("does not allow anyone besides the owner to change the collateral seizer", async () => {
      await collateralizer.changeCollateralSeizer(alice, { from: alice }).should.be.rejectedWith("invalid opcode");
    });
  });

  describe("changing the collateral amount", async () => {
    it("allows the owner to change the collateral amount", async () => {
      await collateralizer.changeCollateralAmount(new BigNumber("2e17"));
      await collateralizer.takeCollateral(owner);
      (await token.balanceOf(collateralizer.address)).should.be.bignumber.equal("2e17");
    });

    it("does not allow otehrs to change the collateral amount", async () => {
      await collateralizer.changeCollateralAmount(new BigNumber("2e17"), { from: alice }).should.be.rejectedWith("invalid opcode");
    });
  });

  describe("changing the seized tokens address", async () => {
    it("allows the owner to change the address", async () => {
      await collateralizer.changeSeizedTokensWallet(alice).should.be.fulfilled;
    });

    it("does not allow otehrs to change the collateral amount", async () => {
      await collateralizer.changeSeizedTokensWallet(alice, { from: alice }).should.be.rejectedWith("invalid opcode");
    });
  });

});
