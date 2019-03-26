// Copied from https://gist.github.com/ColtonProvias/e9f1ebbfa9dcea4aa04d4e90bf0c42d5
declare module 'bn.js' {
  class Red {}
  class Mont extends Red {}
  export default class BN {
      red: Red
      constructor (num?: any, base?: number, endian?: string)
      static isBN (num: any): num is BN
      static max (left: BN, right: BN): BN
      static min (left: BN, right: BN): BN
      static red (num: BN | string): Red
      copy (dest: BN): void
      clone (): BN
      strip (): BN
      inspect (): string
      toString (base?: number, padding?: number): string
      toNumber (): number
      toJSON (): string
      toBuffer (endian: string, length: number): Buffer
      toArray (endian: string, length: number): Array<number>
      toArrayLike (arrayType: ArrayLike<any> | Buffer, endian: string, length: number): ArrayLike<any>
      bitLength (): number
      zeroBits (): number
      byteLength (): number
      toTwos (width: number): BN
      fromTwos (width: number): BN
      isNeg (): boolean
      neg (): BN
      ineg (): BN
      iuor (num: BN): BN
      ior (num: BN): BN
      or (num: BN): BN
      uor (num: BN): BN
      iuand (num: BN): BN
      iand (num: BN): BN
      and (num: BN): BN
      uand (num: BN): BN
      iuxor (num: BN): BN
      ixor (num: BN): BN
      xor (num: BN): BN
      uxor (num: BN): BN
      inotn (width: number): BN
      notn (width: number): BN
      setn (bit: number, val: boolean): BN
      iadd (num: BN): BN
      add (num: BN): BN
      isub (num: BN): BN
      sub (num: BN): BN
      mulTo (num: BN, out: BN): BN
      mul (num: BN): BN
      mulf (num: BN): BN
      imul (num: BN): BN
      imuln (num: number): BN
      muln (num: number): BN
      sqr (): BN
      isqr (): BN
      pow (num: BN): BN
      iushln (bits: number): BN
      ishln (bits: number): BN
      iushrn (bits: number, hint?: number, extended?: BN): BN
      ishrn (bits: number, hint?: number, extended?: BN): BN
      shln (bits: number): BN
      ushln (bits: number): BN
      shrn (bits: number): BN
      ushrn (bits: number): BN
      testn (bit: number): boolean
      imaskn (bits: number): BN
      maskn (bits: number): BN
      iaddn (num: number): BN
      isubn (num: number): BN
      addn (num: number): BN
      subn (num: number): BN
      iabs (): BN
      abs (): BN
      divmod (num: BN, mode: string, positive: boolean): {div: BN, mod: BN}
      div (num: BN): BN
      mod (num: BN): BN
      umod (num: BN): BN
      divRound (num: BN): BN
      modn (num: number): number
      idivn (num: number): BN
      divn (num: number): BN
      egcd (p: BN): {a: BN, b: BN, gcd: BN}
      gcd (num: BN): BN
      invm (num: BN): BN
      isEven (): boolean
      isOdd (): boolean
      addln (num: number): number
      bincn (bit: number): BN
      isZero (): boolean
      cmpn (num: number): number
      cmp (num: BN): number
      ucmp (num: BN): number
      gtn (num: number): boolean
      gt (num: BN): boolean
      gten (num: number): boolean
      gte (num: BN): boolean
      ltn (num: number): boolean
      lt (num: BN): boolean
      lten (num: number): boolean
      lte (num: BN): boolean
      eqn (num: number): boolean
      eq (num: BN): boolean
      toRed (ctx: Red): BN
      fromRed (ctx: Red): BN
      forceRed (ctx: Red): BN
      redAdd (num: BN): BN
      redIAdd (num: BN): BN
      redSub (num: BN): BN
      redISub (num: BN): BN
      redShl (num: BN): BN
      redMul (num: BN): BN
      redIMul (num: BN): BN
      redSqr (): BN
      redISqr (): BN
      redSqrt (): BN
      redInvm (): BN
      redNeg (): BN
      redPow (num: BN): BN
      mont (num: BN): Mont
  }
}