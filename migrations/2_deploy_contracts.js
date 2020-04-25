const IPProtection = artifacts.require("IPProtection");

module.exports = function(deployer) {
  deployer.deploy(IPProtection);
};
