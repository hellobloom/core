# Bloom Core Contracts

This repo houses the core contracts developed for the Bloom protocol. This README outlines the happy paths of the protocol as a method of explaining the role of each contract and how they are used.

## Prerequisites

These contracts assume that the [Bloom token sale](https://github.com/hellobloom/crowdsale) is over and people can freely transfer BLT (our ERC20 token) to each other.

## Creating an Account

When the account system is initially launched, only the creator of the contract has an account. An owner of BLT (Alice) can visit our dApp in order to create an account. If Alice successfully requests an account via our dApp, a special "invite admin" account we own will create an account for her via our `AccountRegistry#createAccount` function.

The user provides the ETH address they would like to associate with their account along with a signature proving they own the address:

```js
// Example code for create account

const address = web3.eth.accounts[0];
const signature = web3.personal.sign(web3.toHex("Hello, Bloom!"), address);

fetch("https://example.hellobloom.io/signup/", {
  method: "post",
  body: JSON.stringify({ address, signature })
});
```

If everything checks out on the backend, the function is called on the contract from the admin account:

```js
// Example code on backend

accountRegistry.createAccount(address, { from: inviteAdmin });
```

## Inviting another User

If Alice wants to invite another user (Bob) who doesn't own BLT, she can use the invite system. During the early stages of the protocol, we require that users lockup a small amount of BLT in order to create an invite. They can reclaim it after 1 year if as long as they don't do something malicious like exit scam the network. The account registry will handle transfering and holding the BLT once the invite is created, but the user has to allow the invite system to transfer the BLT on their behalf first:

```js
// Example code for allowing the "invite collateralizer" to transfer BLT for the user

// `blt` is the contract instance for our ERC20 token
blt.approve(
  // `inviteCollateralizer` is the contract instance for the contract that handles token lockup and release
  inviteCollateralizer.address,
  // `inviteCollateralizer.collateralAmount` is a function that returns how much BLT is required to make an invite right now
  await inviteCollateralizer.collateralAmount()
);
```

I don't know any of my friends Ethereum addresses, so Alice shouldn't have to know Bob's either in order to invite him. Instead, Alice generates a new private key just for this invite that will be used as a shared secret. Using the shared secret, she signs her own address and calls the `createInvite` function on the account registry.

```js
// Example code for creating an invite

// This signAddress function exists in the repo! Checkout https://git.io/vb1hc
const { signAddress } = require("./src/signAddress");
const ethereumjsWallet = require("ethereumjs-wallet");

// Generate the private key using the ethereumjs-wallet library
// NOTE: This does not mean we are making a new ethereum account, we are
// just using these tools in order to make a private key.
const signingKeypair = ethereumjsWallet.generate();
const signingPrivateKey = signingKeypair.getPrivateKey();

// Sign the address associated with our Bloom account using the
// new signing private key
const inviteSignature = signAddress({
  address: web3.eth.accounts[0],
  privKey: signingPrivateKey
});

// Submit this signature to the contract
accountRegistry.createInvite(inviteSignature);
```

When the contract receives the `createInvite` call, it uses [`ecrecover`](https://git.io/vb1h4) to derive the associated public key for the signature. This is saved in the contract under the `invites` field so if we want we could look it up to see the invite status:

```js
// Example code for looking up an invite

// Get the address string from the keypair we generated before
const signingAddressString = signingKeypair.getAddressString();

// Lookup the invite
const inviteStruct = await accountRegistry.invites(signingAddressString);

const inviter = inviteStruct[0];   // Should be Alice's address
const recipient = inviteStruct[1]; // Should be 0x0 until Bob accepts
```
