module.exports = {
     // See <http://truffleframework.com/docs/advanced/configuration>
     // to customize your Truffle configuration!
     networks: {
          ganache: {
               host: "localhost",
               port: "7545",
               network_id: "*", // Match any network id
               gas: 15000000,
               gasPrice: 5000000000
          },
          chainskills : {
            host: "localhost",
            port: "8545",
            network_id: "4224",
            gas: 4700000
          },
          rinkeby: {
            host: "localhost",
            port: "8545",
            network_id: "4",
            gas: 15000000,
            gasPrice: 5000000000
          },
          live: {
            host: "localhost",
            port: "8545",
            network_id: "1",
            gas: 100000000
          }
     }
};
