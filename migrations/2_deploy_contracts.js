var PersonList = artifacts.require("./PersonList.sol");

module.exports = function(deployer) {
  deployer.deploy(PersonList);
};
