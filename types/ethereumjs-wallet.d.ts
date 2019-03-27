declare module 'ethereumjs-wallet' {
  import {Buffer} from 'buffer'

  export class Wallet {
    getAddress(): Buffer
    getAddressString(): string
    getChecksumAddressString(): string
    getPrivateKey(): Buffer
    getPrivateKeyString(): string
    getPublicKey(): Buffer
    getPublicKeyString(): string
    getV3Filename(): string
  }

  export function generate(): Wallet
  export function fromPrivateKey(key: Buffer): Wallet
  export function fromPublicKey(key: Buffer): Wallet
}
