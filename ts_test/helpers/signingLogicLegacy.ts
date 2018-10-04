const ethSigUtil = require('eth-sig-util');
import * as BigNumber from "bignumber.js";
import {HashingLogic} from '@bloomprotocol/attestations-lib'

interface ITypedDataParam {
  type: string
  name: string
  value: string
}

export const getFormattedTypedDataAttestationRequest= (
  subject: string,
  attester: string,
  requester: string,
  dataHash: string,
  typeIds: number[],
  requestNonce: string,
): ITypedDataParam[] => {
  return [
      {type: 'address', name: 'subject', value: subject},
      {type: 'address', name: 'attester', value: attester},
      {type: 'address', name: 'requester', value: requester},
      {type: 'bytes32', name: 'dataHash', value: dataHash},
      {
        type: 'bytes32',
        name: 'typeHash',
        value: HashingLogic.hashAttestationTypes(typeIds),
      },
      {type: 'bytes32', name: 'nonce', value: requestNonce},
  ]
}

export const getFormattedTypedDataAddAddress = (
  sender: string,
  nonce: string,
): ITypedDataParam[] => {
  return [
      {type: 'address', name: 'sender', value: sender},
      {type: 'bytes32', name: 'nonce', value: nonce},
  ]
}

export const getFormattedTypedDataReleaseTokens = (
  sender: string,
  receiver: string,
  amount: string,
  paymentNonce: string,
): ITypedDataParam[] => {
  return [
      {type: 'string', name: 'action', value: 'pay'},
      {type: 'address', name: 'sender', value: sender},
      {type: 'address', name: 'receiver', value: receiver},
      {type: 'uint256', name: 'amount', value: amount},
      {type: 'bytes32', name: 'nonce', value: paymentNonce},
  ]
}

export const getFormattedTypedDataAttestFor = (
  subject: string,
  requester: string,
  reward: string,
  paymentNonce: string,
  dataHash: string,
  typeIds: number[],
  requestNonce: string,
): ITypedDataParam[] => {
  return [
      {type: 'string', name: 'action', value: 'attest'},
      {type: 'address', name: 'subject', value: subject},
      {type: 'address', name: 'requester', value: requester},
      {type: 'uint256', name: 'reward', value: reward},
      {type: 'bytes32', name: 'paymentNonce', value: paymentNonce},
      {type: 'bytes32', name: 'dataHash', value: dataHash},
      {
        type: 'bytes32',
        name: 'typeHash',
        value: HashingLogic.hashAttestationTypes(typeIds),
      },
      {type: 'bytes32', name: 'requestNonce', value: requestNonce},
  ]
}

export const getFormattedTypedDataContestFor = (
  requester: string,
  reward: string,
  paymentNonce: string,
): ITypedDataParam[] => {
  return [
      {type: 'string', name: 'action', value: 'contest'},
      {type: 'address', name: 'requester', value: requester},
      {type: 'uint256', name: 'reward', value: reward},
      {type: 'bytes32', name: 'paymentNonce', value: paymentNonce},
  ]
}

export const getFormattedTypedDataStakeFor = (
  subject: string,
  value: string,
  paymentNonce: string,
  dataHash: string,
  typeIds: number[],
  requestNonce: string,
  stakeDuration: number,
): ITypedDataParam[] => {
  return [
      {type: 'string', name: 'action', value: 'stake'},
      {type: 'address', name: 'subject', value: subject},
      {type: 'uint256', name: 'value', value: value},
      {type: 'bytes32', name: 'paymentNonce', value: paymentNonce},
      {type: 'bytes32', name: 'dataHash', value: dataHash},
      {
        type: 'bytes32',
        name: 'typeHash',
        value: HashingLogic.hashAttestationTypes(typeIds),
      },
      {type: 'bytes32', name: 'requestNonce', value: requestNonce},
      {type: 'uint256', name: 'stakeDuration', value: stakeDuration},
  ]
}

export const getFormattedTypedDataRevokeStakeFor = (
  subjectId: BigNumber.BigNumber,
  attestationId: number,
): ITypedDataParam[] => {
  return [
      {type: 'string', name: 'action', value: 'revokeStake'},
      {type: 'uint256', name: 'subjectId', value: subjectId.toString(10)},
      {type: 'uint256', name: 'attestationId', value: attestationId.toString(10)},
  ]
}

export const getFormattedTypedDataVoteFor = (
  choice: number,
  voter: string,
  nonce: string,
  poll: string,
): ITypedDataParam[] => {
  return [
      {type: 'uint16', name: 'choice', value: choice.toString(10)},
      {type: 'address', name: 'voter', value: voter},
      {type: 'bytes32', name: 'nonce', value: nonce},
      {type: 'address', name: 'poll', value: poll},
  ]
}

export const getFormattedTypedDataLockupTokensFor = (
  sender: string,
  amount: string,
  nonce: string,
): ITypedDataParam[] => {
  return [
      {type: 'string', name: 'action', value: 'lockup'},
      {type: 'address', name: 'sender', value: sender},
      {type: 'uint256', name: 'amount', value: amount},
      {type: 'bytes32', name: 'nonce', value: nonce},
  ]
}