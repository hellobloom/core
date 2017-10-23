// import { advanceBlock } from "./helpers/advanceToBlock";
// import { latestBlockTime } from "./helpers/latestBlockNumber";

import * as BigNumber from "bignumber.js";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

const chaiBignumber = require("chai-bignumber");

chai
  .use(chaiAsPromised)
  .use(chaiBignumber(web3.BigNumber))
  .should();

const AccountRegistry = artifacts.require("AccountRegistry");
const MockBLT = artifacts.require("./helpers/MockBLT");

contract("AccountRegistry", function([owner, alice, bob]) {
  describe("inviting new users", async () => {
    it("allows existing users to invite others if they collateralize some BLT", async () => {
      const token = await MockBLT.new();
      const registry = await AccountRegistry.new(token);
      const collateralizer = await registry.inviteCollateralizer();
      await token.gift(owner);
      await token.approve(collateralizer, new BigNumber("1e18"));

      (await registry.invites(alice)).should.be.false;
      await registry.invite(alice);
      (await registry.invites(alice)).should.be.true;
    });

    it("fails if the invited user already has an account");

    it("fails if the invited user already has an invite", async () => {
      const token = await MockBLT.new();
      const registry = await AccountRegistry.new(token);
      const collateralizer = await registry.inviteCollateralizer();
      await token.gift(owner);
      await token.approve(collateralizer, new BigNumber("1e18"));

      await registry.invite(alice).should.be.fulfilled;
      await registry.invite(alice).should.be.rejectedWith("invalid opcode");
    });

    it("fails if the inviter does not have any BLT");
    it("fails if the inviter has not approved the collateralizer");

    it("fails if the inviter does not have an account", async () => {
      const token = await MockBLT.new();
      const registry = await AccountRegistry.new(token);
      const collateralizer = await registry.inviteCollateralizer();
      await token.gift(alice);
      await token.approve(collateralizer, new BigNumber("1e18"), {
        from: alice
      });

      await registry
        .invite(bob, { from: alice })
        .should.be.rejectedWith("invalid opcode");
    });
  });
});
