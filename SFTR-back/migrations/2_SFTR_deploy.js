var Migrations = artifacts.require("./SFTR.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
