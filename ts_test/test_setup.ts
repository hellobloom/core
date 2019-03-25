import * as chaiAsPromised from 'chai-as-promised'
var chai = require('chai')
var BN = require('bn.js')
var bnChai = require('bn-chai')

const should = chai
  .use(bnChai(BN))
  .use(chaiAsPromised)
  .should()

export {should}
