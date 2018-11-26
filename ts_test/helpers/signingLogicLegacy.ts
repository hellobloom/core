const ethSigUtil = require('eth-sig-util');
import * as BigNumber from "bignumber.js";
import {HashingLogic} from '@bloomprotocol/attestations-lib'

interface ITypedDataParam {
  type: string
  name: string
  value: string
}

export const getFormattedTypedDataAttestationRequest= (
  dataHash: string,
  requestNonce: string,
): ITypedDataParam[] => {
  return [
      {type: 'bytes32', name: 'dataHash', value: dataHash},
      {type: 'bytes32', name: 'nonce', value: requestNonce},
  ]
}

export const getFormattedTypedDataAddAddress = (
  addressToAdd: string,
  nonce: string,
): ITypedDataParam[] => {
  return [
      {type: 'string', name: 'action', value: 'addAddress'},
      {type: 'address', name: 'addressToAdd', value: addressToAdd},
      {type: 'bytes32', name: 'nonce', value: nonce},
  ]
}

export const getFormattedTypedDataRemoveAddress = (
  addressToRemove: string,
  nonce: string,
): ITypedDataParam[] => {
  return [
      {type: 'string', name: 'action', value: 'removeAddress'},
      {type: 'address', name: 'addressToRemove', value: addressToRemove},
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
  requestNonce: string,
): ITypedDataParam[] => {
  return [
      {type: 'string', name: 'action', value: 'attest'},
      {type: 'address', name: 'subject', value: subject},
      {type: 'address', name: 'requester', value: requester},
      {type: 'uint256', name: 'reward', value: reward},
      {type: 'bytes32', name: 'paymentNonce', value: paymentNonce},
      {type: 'bytes32', name: 'dataHash', value: dataHash},
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
  requestNonce: string,
  stakeDuration: number,
): ITypedDataParam[] => {
  return [
      {type: 'string', name: 'action', value: 'stake'},
      {type: 'address', name: 'subject', value: subject},
      {type: 'uint256', name: 'value', value: value},
      {type: 'bytes32', name: 'paymentNonce', value: paymentNonce},
      {type: 'bytes32', name: 'dataHash', value: dataHash},
      {type: 'bytes32', name: 'requestNonce', value: requestNonce},
      {type: 'uint256', name: 'stakeDuration', value: stakeDuration.toString(10)},
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

export const getFormattedTypedDataRevokeAttestationFor = (
  link: string,
): ITypedDataParam[] => {
  return [
      {type: 'string', name: 'action', value: 'revokeAttestation'},
      {type: 'bytes32', name: 'link', value: link},
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