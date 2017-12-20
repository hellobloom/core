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

