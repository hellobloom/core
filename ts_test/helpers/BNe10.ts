import BigNumber = require('bignumber.js')
export const BNe10 = (number: string): string => new BigNumber(number).toString()
