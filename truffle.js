module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    test: {
      provider: require("ethereumjs-testrpc").provider({ gasLimit: 1e7 }),
      network_id: "*"
    }
  }
};
