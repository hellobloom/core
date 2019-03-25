import * as chaiAsPromised from 'chai-as-promised'
var chai = require('chai')
var bnChai = require('bn-chai')
const BN = require('bn.js')

chai.use(bnChai(BN))
chai.use(chaiAsPromised)

const should = chai.should()


export {should}
