import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

const chaiBignumber = require("chai-bignumber");

const should = chai
  .use(chaiAsPromised)
  .use(chaiBignumber(web3.BigNumber))
  .should();

export { should };
