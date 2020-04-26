const Killable = artifacts.require("Killable");
const IPProtection = artifacts.require("IPProtection");

module.exports = function(deployer) {
  deployer.then(() => {
      return deployer.deploy(Killable);
  }).then(() => {
      return deployer.deploy(IPProtection);
  });
 
};