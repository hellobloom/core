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

contract("AccountRegistry", function([]) {
  it("hello", async () => {
    console.log(AccountRegistry, BigNumber);
  });
});
