import * as BigNumber from "bignumber.js";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

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
    return token.approve(collateralizer.address, new BigNumber("1e18"));
  };

  beforeEach(async () => {
    token = await MockBLT.new();
    collateralizer = await InviteCollateralizer.new(token.address);
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
    ownerBalanceAfter.should.be.bignumber.equal("999999999999999999");
    collateralizerBalanceBefore.should.be.bignumber.equal(0);
    collateralizerBalanceAfter.should.be.bignumber.equal(1);
  });
});
