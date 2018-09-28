var ProviderEngine = require("web3-provider-engine");
var createLedgerSubprovider = require("@ledgerhq/web3-subprovider").default;
var FiltersSubprovider = require('web3-provider-engine/subproviders/filters.js');
var WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
var Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");
var TransportU2F = require("@ledgerhq/hw-transport-node-hid").default;

var Web3 = require("web3");

var engine = new ProviderEngine();

let LedgerProvider = function(network_id, account_number, provider_url) {
  const getTransport = () => TransportU2F.create();
  const ledger = createLedgerSubprovider(getTransport, {
    networkId: network_id,
    accountsOffset: account_number 
  });
  engine.addProvider(ledger); 
  engine.addProvider(new FiltersSubprovider());
  engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(provider_url)));
  engine.start();
  return engine;

};

LedgerProvider.prototype.sendAsync = function() {
  this.engine.sendAsync.apply(this.engine, arguments);
};

LedgerProvider.prototype.send = function() {
  return this.engine.send.apply(this.engine, arguments);
};

LedgerProvider.prototype.getAddress = function() {
  return this.address;
};

module.exports = LedgerProvider;