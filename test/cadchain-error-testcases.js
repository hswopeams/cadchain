const IPProtection = artifacts.require("IPProtection");
const chai = require('chai');
const BN = require('bn.js');
const bnChai = require('bn-chai');
chai.use(bnChai(BN));
const assert = chai.assert;
const expect = chai.expect;
const truffleAssert = require('truffle-assertions');

contract("Remittance Happy Flow Test", async accounts => {

  let instance;
  let owner,alice,bob,carol,dan,ellen,frank, safeguard;
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';



  // Runs before all tests in this block.
  before("setting up test data", async () => {
    assert.isAtLeast(accounts.length,8);

    //Set up accounts for parties. In truffel owner = accounts[0].
    [owner,alice,bob,carol,dan,ellen,frank,safeguard] = accounts;
  });

  //Run before each test case
  beforeEach("deploying new instance", async () => {
    instance = await IPProtection.new({ from: owner });
  });

  it('should revert when the fallback function is called', async () => {
    await truffleAssert.reverts(
        instance.sendTransaction({
            from: alice,
            to: instance
        }),
        "Fallback function not available"
    );    
  });

  it('should only allow owner to register a designer', async () => {
    await truffleAssert.reverts(
        instance.registerDesigner(carol, {from: frank}),
        "Ownable: caller is not the owner"
    );        
  });

  it('should only allow owner to deregister a designer', async () => {
    await truffleAssert.reverts(
        instance.deregisterDesigner(carol, {from: frank}),
        "Ownable: caller is not the owner"
    );        
  });

  it('should only allow owner to register a printer', async () => {
    await truffleAssert.reverts(
        instance.registerPrinter(carol, {from: frank}),
        "Ownable: caller is not the owner"
    );        
  });

  it('should only allow owner to deregister a printer', async () => {
    await truffleAssert.reverts(
        instance.deregisterPrinter(carol, {from: frank}),
        "Ownable: caller is not the owner"
    );        
  });

});//end test contract