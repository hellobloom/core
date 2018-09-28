var HDWalletProvider = require("truffle-hdwallet-provider")
var mnemonic = "robot robot robot robot robot robot robot robot robot robot robot robot"
var infura_key = "not-a-real-key"

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(
          mnemonic,
          "https://rinkeby.infura.io/" + infura_key
        )
      },
      network_id: 4
    },
    rinkebyLedger: {
      provider: function() {
        return LedgerProvider(
          4, 
          0,
          "https://rinkeby.infura.io/" + infura_key,
        )
      },
      network_id: 4,
      gasPrice: 2000000000,
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(
          mnemonic,
          "https://ropsten.infura.io/" + infura_key
        )
      },
      network_id: 3
    },
    mainnet: {
      provider: function() {
        return new HDWalletProvider(
          mnemonic,
          "https://mainnet.infura.io/" + infura_key
        )
      },
      network_id: 2
    },
    mainnetLedger: {
      provider: function() {
        return LedgerProvider(
          1, 
          0,
          "https://mainnet.infura.io/" + infura_key
        )
      },
      network_id: 1,
      gasPrice: 4000000000,
    },
  },
  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions : {
      currency: 'USD',
      gasPrice: 21
    }
  }
}
