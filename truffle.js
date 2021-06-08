var HDWalletProvider = require("truffle-hdwallet-provider");
const MNEMONIC = '0xA491C397e86AB73D46c703B76B74e7d431656853';

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(MNEMONIC, "https://ropsten.infura.io/v3/84e5ee7d74cb499d9d0f98af91ee62e1")
      },
      network_id: 3,
      gas: 4000000      //make sure this gas allocation isn't over 4M, which is the max
    }
  }
};