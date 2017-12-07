import * as BigNumber from "bignumber.js";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as Web3 from "web3";

import { increaseTime } from "./helpers/increaseTime";

import { MockBLTInstance, InviteCollateralizerInstance } from "./../truffle";

const chaiBignumber = require("chai-bignumber");

chai
  .use(chaiAsPromised)
  .use(chaiBignumber(web3.BigNumber))
  .should();

const InviteCollateralizer = artifacts.require("InviteCollateralizer");
const MockBLT = artifacts.require("./helpers/MockBLT");

contract("InviteCollateralizer", function([owner, _alice, _bob]) {
  let token: MockBLTInstance;
  let collateralizer: InviteCollateralizerInstance;

  const setupOwner = async () => {
    await token.gift(owner);
    await token.approve(collateralizer.address, new BigNumber("1e18"));
  };

  beforeEach(async () => {
    token = await MockBLT.new();
    collateralizer = await InviteCollateralizer.new(token.address);
    await setupOwner();
  });

  it.only("transfers a small amount of BLT to the collateralizer", async () => {
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
    ownerBalanceAfter.should.be.bignumber.equal("999999999999999999");
    collateralizerBalanceBefore.should.be.bignumber.equal(0);
    collateralizerBalanceAfter.should.be.bignumber.equal(1);
  });

  it.only("emits a collateralization event", async () => {
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
    args.amount.should.be.bignumber.equal(1);
  });

  it("lets the owner of the collateralized BLT claim it after a year", async () => {
    await collateralizer.takeCollateral(owner);

    await increaseTime(60 * 60 * 24 * 365);

    await collateralizer.reclaim().should.be.fulfilled;
  });

  it("does not let the owner claim the BLT before a year has passed");
  it("lets a user collateralize BLT multiple times");
});
