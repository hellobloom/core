const ethSigUtil = require('eth-sig-util');
const { soliditySha3 } = require('web3-utils');
import * as BigNumber from "bignumber.js";

interface IFormattedTypedData {
    types: {
      EIP712Domain: ITypedDataParam[],
      [key: string]: ITypedDataParam[]
    }
    primaryType: string
    domain: {
      name: string
      version: string
    }
    message: {[key: string]: string},
}

interface ITypedDataParam {
  name: string
  type: string
}

export const getFormattedTypedDataAttestationRequest= (
  subject: string,
  attester: string,
  requester: string,
  dataHash: string,
  requestNonce: string,
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
      ],
      AttestationRequest: [
        { name: 'subject', type: 'address'},
        { name: 'attester', type: 'address'},
        { name: 'requester', type: 'address'},
        { name: 'dataHash', type: 'bytes32'},
        { name: 'nonce', type: 'bytes32'}
      ]
    },
    primaryType: 'AttestationRequest',
    domain: {
      name: 'Bloom',
      version: '1',
    },
    message: {
      subject: subject,
      attester: attester,
      requester: requester,
      dataHash: dataHash,
      nonce: requestNonce
    }
  }
}

export const getFormattedTypedDataAddAddress = (
  addressToAdd: string,
  nonce: string,
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
      ],
      AddAddress: [
        { name: 'addressToAdd', type: 'address'},
        { name: 'nonce', type: 'bytes32'},
      ]
    },
    primaryType: 'AddAddress',
    domain: {
      name: 'Bloom',
      version: '1',
    },
    message: {
      sender: addressToAdd,
      nonce: nonce
    }
  }
}

export const getFormattedTypedDataRemoveAddress = (
  addressToRemove: string,
  nonce: string,
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
      ],
      AddAddress: [
        { name: 'addressToRemove', type: 'address'},
        { name: 'nonce', type: 'bytes32'},
      ]
    },
    primaryType: 'RemoveAddress',
    domain: {
      name: 'Bloom',
      version: '1',
    },
    message: {
      sender: addressToRemove,
      nonce: nonce
    }
  }
}

export const getFormattedTypedDataReleaseTokens = (
  sender: string,
  receiver: string,
  amount: string,
  paymentNonce: string,
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
      ],
      ReleaseTokens: [
        { name: 'sender', type: 'address'},
        { name: 'receiver', type: 'address'},
        { name: 'amount', type: 'uint256'},
        { name: 'nonce', type: 'bytes32'},
      ]
    },
    primaryType: 'ReleaseTokens',
    domain: {
      name: 'Bloom',
      version: '1',
    },
    message: {
      sender: sender,
      receiver: receiver,
      amount: amount,
      nonce: paymentNonce
    }
  }
}

export const getFormattedTypedDataAttestFor = (
  subject: string,
  requester: string,
  reward: string,
  paymentNonce: string,
  dataHash: string,
  requestNonce: string,
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
      ],
      AttestFor: [
        { name: 'subject', type: 'address'},
        { name: 'requester', type: 'address'},
        { name: 'reward', type: 'uint256'},
        { name: 'paymentNonce', type: 'bytes32'},
        { name: 'dataHash', type: 'bytes32'},
        { name: 'requestNonce', type: 'bytes32'},
      ]
    },
    primaryType: 'AttestFor',
    domain: {
      name: 'Bloom',
      version: '1',
    },
    message: {
      subject: subject,
      requester: requester,
      reward: reward,
      paymentNonce: paymentNonce,
      dataHash: dataHash,
      requestNonce: requestNonce,
    }
  }
}

export const getFormattedTypedDataContestFor = (
  requester: string,
  reward: string,
  paymentNonce: string,
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
      ],
      ContestFor: [
        { name: 'requester', type: 'address'},
        { name: 'reward', type: 'uint256'},
        { name: 'paymentNonce', type: 'bytes32'},
      ]
    },
    primaryType: 'ContestFor',
    domain: {
      name: 'Bloom',
      version: '1',
    },
    message: {
      requester: requester,
      reward: reward,
      paymentNonce: paymentNonce,
    }
  }
}

export const getFormattedTypedDataStakeFor = (
  subject: string,
  value: string,
  paymentNonce: string,
  dataHash: string,
  requestNonce: string,
  stakeDuration: number,
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
      ],
      StakeFor: [
        { name: 'subject', type: 'address'},
        { name: 'value', type: 'uint256'},
        { name: 'paymentNonce', type: 'bytes32'},
        { name: 'dataHash', type: 'bytes32'},
        { name: 'requestNonce', type: 'bytes32'},
        { name: 'stakeDuration', type: 'uint256'},
      ]
    },
    primaryType: 'StakeFor',
    domain: {
      name: 'Bloom',
      version: '1',
    },
    message: {
      subject: subject,
      value: value,
      paymentNonce: paymentNonce,
      dataHash: dataHash,
      requestNonce: requestNonce,
      stakeDuration: stakeDuration.toString(10),
    }
  }
}

export const getFormattedTypedDataRevokeStakeFor = (
  subjectId: BigNumber.BigNumber,
  attestationId: number,
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
      ],
      RevokeStakeFor: [
        { name: 'subjectId', type: 'uint256'},
        { name: 'attestationId', type: 'uint256'},
      ]
    },
    primaryType: 'RevokeStakeFor',
    domain: {
      name: 'Bloom',
      version: '1',
    },
    message: {
      subjectId: subjectId.toString(10),
      attestationId: attestationId.toString(10),
    }
  }
}

export const getFormattedTypedDataVoteFor = (
  choice: number,
  voter: string,
  nonce: string,
  poll: string,
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
      ],
      VoteFor: [
        { name: 'choice', type: 'uint16'},
        { name: 'voter', type: 'address'},
        { name: 'nonce', type: 'bytes32'},
        { name: 'poll', type: 'address'},
      ]
    },
    primaryType: 'VoteFor',
    domain: {
      name: 'Bloom',
      version: '1',
    },
    message: {
      choice: choice.toString(10),
      voter: voter,
      nonce: nonce,
      poll: poll,
    }
  }
}

export const getFormattedTypedDataLockupTokensFor = (
  sender: string,
  amount: string,
  nonce: string,
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
      ],
      LockupTokensFor: [
        { name: 'sender', type: 'address'},
        { name: 'amount', type: 'uint256'},
        { name: 'nonce', type: 'bytes32'},
      ]
    },
    primaryType: 'LockupTokensFor',
    domain: {
      name: 'Bloom',
      version: '1',
    },
    message: {
      sender: sender,
      amount: amount,
      nonce: nonce
    }
  }
}