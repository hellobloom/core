/// <reference types="chai" />

declare module 'chai-bn' {
  function chaiBN(BN: any): (chai: any, utils: any) => void

  namespace chaiBN {

  }

  export = chaiBN
}

declare namespace Chai {
  // For BDD API
  interface Equal {
    BN: {(value: any, message?: string): Assertion}
  }
  interface NumberComparer {
    BN: {(value: any, message?: string): Assertion}
  }
}
