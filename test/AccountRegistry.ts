// import { advanceBlock } from "./helpers/advanceToBlock";
// import { latestBlockTime } from "./helpers/latestBlockNumber";

// import * as BigNumber from "bignumber.js";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

const chaiBignumber = require("chai-bignumber");

chai
  .use(chaiAsPromised)
  .use(chaiBignumber(web3.BigNumber))
  .should();

const AccountRegistry = artifacts.require("AccountRegistry");
const MockBLT = artifacts.require("./helpers/MockBLT");

contract("AccountRegistry", function([]) {
  it("hello", async () => {
    const token = await MockBLT.new();
    const registry = await AccountRegistry.new(token);

    console.log(registry);
  });
});
