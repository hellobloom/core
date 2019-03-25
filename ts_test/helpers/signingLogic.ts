const ethSigUtil = require('eth-sig-util')
const {soliditySha3} = require('web3-utils')
import * as BigNumber from 'bignumber.js'

interface IFormattedTypedData {
  types: {
    EIP712Domain: ITypedDataParam[]
    [key: string]: ITypedDataParam[]
  }
  primaryType: string
  domain: {
    name: string
    version: string
    chainId: number
    verifyingContract: string
  }
  message: {[key: string]: string}
}

interface ITypedDataParam {
  name: string
  type: string
}

export const getFormattedTypedDataAttestationRequest = (
  contractAddress: string,
  chainId: number,
  dataHash: string,
  requestNonce: string
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
        {name: 'name', type: 'string'},
        {name: 'version', type: 'string'},
        {name: 'chainId', type: 'uint256'},
        {name: 'verifyingContract', type: 'address'},
      ],
      AttestationRequest: [
        {name: 'dataHash', type: 'bytes32'},
        {name: 'nonce', type: 'bytes32'},
      ],
    },
    primaryType: 'AttestationRequest',
    domain: {
      name: 'Bloom Attestation Logic',
      version: '2',
      chainId: chainId,
      verifyingContract: contractAddress,
    },
    message: {
      dataHash: dataHash,
      nonce: requestNonce,
    },
  }
}

export const getFormattedTypedDataAddAddress = (
  contractAddress: string,
  chainId: number,
  addressToAdd: string,
  nonce: string
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
        {name: 'name', type: 'string'},
        {name: 'version', type: 'string'},
        {name: 'chainId', type: 'uint256'},
        {name: 'verifyingContract', type: 'address'},
      ],
      AddAddress: [
        {name: 'addressToAdd', type: 'address'},
        {name: 'nonce', type: 'bytes32'},
      ],
    },
    primaryType: 'AddAddress',
    domain: {
      name: 'Bloom Account Registry',
      version: '2',
      chainId: chainId,
      verifyingContract: contractAddress,
    },
    message: {
      addressToAdd: addressToAdd,
      nonce: nonce,
    },
  }
}

export const getFormattedTypedDataRemoveAddress = (
  contractAddress: string,
  chainId: number,
  addressToRemove: string,
  nonce: string
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
        {name: 'name', type: 'string'},
        {name: 'version', type: 'string'},
        {name: 'chainId', type: 'uint256'},
        {name: 'verifyingContract', type: 'address'},
      ],
      RemoveAddress: [
        {name: 'addressToRemove', type: 'address'},
        {name: 'nonce', type: 'bytes32'},
      ],
    },
    primaryType: 'RemoveAddress',
    domain: {
      name: 'Bloom Account Registry',
      version: '2',
      chainId: chainId,
      verifyingContract: contractAddress,
    },
    message: {
      addressToRemove: addressToRemove,
      nonce: nonce,
    },
  }
}

export const getFormattedTypedDataPayTokens = (
  contractAddress: string,
  chainId: number,
  sender: string,
  receiver: string,
  amount: string,
  paymentNonce: string
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
        {name: 'name', type: 'string'},
        {name: 'version', type: 'string'},
        {name: 'chainId', type: 'uint256'},
        {name: 'verifyingContract', type: 'address'},
      ],
      PayTokens: [
        {name: 'sender', type: 'address'},
        {name: 'receiver', type: 'address'},
        {name: 'amount', type: 'uint256'},
        {name: 'nonce', type: 'bytes32'},
      ],
    },
    primaryType: 'PayTokens',
    domain: {
      name: 'Bloom Token Escrow Marketplace',
      version: '2',
      chainId: chainId,
      verifyingContract: contractAddress,
    },
    message: {
      sender: sender,
      receiver: receiver,
      amount: amount,
      nonce: paymentNonce,
    },
  }
}

export const getFormattedTypedDataAttestFor = (
  contractAddress: string,
  chainId: number,
  subject: string,
  requester: string,
  reward: string,
  dataHash: string,
  requestNonce: string
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
        {name: 'name', type: 'string'},
        {name: 'version', type: 'string'},
        {name: 'chainId', type: 'uint256'},
        {name: 'verifyingContract', type: 'address'},
      ],
      AttestFor: [
        {name: 'subject', type: 'address'},
        {name: 'requester', type: 'address'},
        {name: 'reward', type: 'uint256'},
        {name: 'dataHash', type: 'bytes32'},
        {name: 'requestNonce', type: 'bytes32'},
      ],
    },
    primaryType: 'AttestFor',
    domain: {
      name: 'Bloom Attestation Logic',
      version: '2',
      chainId: chainId,
      verifyingContract: contractAddress,
    },
    message: {
      subject: subject,
      requester: requester,
      reward: reward,
      dataHash: dataHash,
      requestNonce: requestNonce,
    },
  }
}

export const getFormattedTypedDataContestFor = (
  contractAddress: string,
  chainId: number,
  requester: string,
  reward: string,
  requestNonce: string
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
        {name: 'name', type: 'string'},
        {name: 'version', type: 'string'},
        {name: 'chainId', type: 'uint256'},
        {name: 'verifyingContract', type: 'address'},
      ],
      ContestFor: [
        {name: 'requester', type: 'address'},
        {name: 'reward', type: 'uint256'},
        {name: 'requestNonce', type: 'bytes32'},
      ],
    },
    primaryType: 'ContestFor',
    domain: {
      name: 'Bloom Attestation Logic',
      version: '2',
      chainId: chainId,
      verifyingContract: contractAddress,
    },
    message: {
      requester: requester,
      reward: reward,
      requestNonce: requestNonce,
    },
  }
}

export const getFormattedTypedDataVoteFor = (
  pollName: string,
  contractAddress: string,
  chainId: number,
  choice: number,
  voter: string,
  nonce: string,
  poll: string
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
        {name: 'name', type: 'string'},
        {name: 'version', type: 'string'},
        {name: 'chainId', type: 'uint256'},
        {name: 'verifyingContract', type: 'address'},
      ],
      VoteFor: [
        {name: 'choice', type: 'uint16'},
        {name: 'voter', type: 'address'},
        {name: 'nonce', type: 'bytes32'},
        {name: 'poll', type: 'address'},
      ],
    },
    primaryType: 'VoteFor',
    domain: {
      name: pollName,
      version: '2',
      chainId: chainId,
      verifyingContract: contractAddress,
    },
    message: {
      choice: choice.toString(10),
      voter: voter,
      nonce: nonce,
      poll: poll,
    },
  }
}

export const getFormattedTypedDataLockupTokensFor = (
  contractAddress: string,
  chainId: number,
  sender: string,
  amount: string,
  nonce: string
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
        {name: 'name', type: 'string'},
        {name: 'version', type: 'string'},
        {name: 'chainId', type: 'uint256'},
        {name: 'verifyingContract', type: 'address'},
      ],
      LockupTokensFor: [
        {name: 'sender', type: 'address'},
        {name: 'amount', type: 'uint256'},
        {name: 'nonce', type: 'bytes32'},
      ],
    },
    primaryType: 'LockupTokensFor',
    domain: {
      name: 'Bloom Token Escrow Marketplace',
      version: '2',
      chainId: chainId,
      verifyingContract: contractAddress,
    },
    message: {
      sender: sender,
      amount: amount,
      nonce: nonce,
    },
  }
}

export const getFormattedTypedDataReleaseTokensFor = (
  contractAddress: string,
  chainId: number,
  sender: string,
  amount: string,
  nonce: string
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
        {name: 'name', type: 'string'},
        {name: 'version', type: 'string'},
        {name: 'chainId', type: 'uint256'},
        {name: 'verifyingContract', type: 'address'},
      ],
      ReleaseTokensFor: [
        {name: 'sender', type: 'address'},
        {name: 'amount', type: 'uint256'},
        {name: 'nonce', type: 'bytes32'},
      ],
    },
    primaryType: 'ReleaseTokensFor',
    domain: {
      name: 'Bloom Token Escrow Marketplace',
      version: '2',
      chainId: chainId,
      verifyingContract: contractAddress,
    },
    message: {
      sender: sender,
      amount: amount,
      nonce: nonce,
    },
  }
}

export const getFormattedTypedDataRevokeAttestationFor = (
  contractAddress: string,
  chainId: number,
  link: string,
  nonce: string
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
        {name: 'name', type: 'string'},
        {name: 'version', type: 'string'},
        {name: 'chainId', type: 'uint256'},
        {name: 'verifyingContract', type: 'address'},
      ],
      RevokeAttestationFor: [
        {name: 'link', type: 'bytes32'},
        {name: 'nonce', type: 'bytes32'},
      ],
    },
    primaryType: 'RevokeAttestationFor',
    domain: {
      name: 'Bloom Attestation Logic',
      version: '2',
      chainId: chainId,
      verifyingContract: contractAddress,
    },
    message: {
      link: link,
      nonce: nonce,
    },
  }
}
