const IPProtection = artifacts.require("IPProtection");
const chai = require('chai');
const BN = require('bn.js');
const bnChai = require('bn-chai');
chai.use(bnChai(BN));
const assert = chai.assert;
const expect = chai.expect;
const truffleAssert = require('truffle-assertions');

contract("CADChain Error Test", async accounts => {

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

  it('should revert if kill is called before pausing the contract', async () => {
    await truffleAssert.reverts(
        instance.kill({ from: owner }),
        "Pausable: not paused"
    );
    
  });

  it('should not allow certain functions to be called if the contract has been killed', async () => {
    await instance.pause({ from: owner });
    await instance.kill({ from: owner });
  
    await truffleAssert.reverts(
        instance.protectDesign(alice, {from: owner}),
        "Killable: killed"
    );

    await truffleAssert.reverts(
        instance.useDesign(alice, {from: owner}),
        "Killable: killed"
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

  it('should only allow designer to register once', async () => {
    await instance.registerDesigner(alice, {from: owner}),
    await truffleAssert.reverts(
        instance.registerDesigner(alice, {from: owner}),
        "Designer already registered"
    );         
  });

  it('should only allow printer to register once', async () => {
    await instance.registerPrinter(bob, {from: owner}),
    await truffleAssert.reverts(
        instance.registerPrinter(bob, {from: owner}),
        "Printer already registered"
    );         
  });

  it('should revert if designer is zero address when registering', async () => {
    await truffleAssert.reverts(
        instance.registerDesigner(ZERO_ADDRESS, {from: owner}),
        "Invalid designer address"
    );         
  });

  it('should revert if designer is zero address when registering', async () => {
    await truffleAssert.reverts(
        instance.registerPrinter(ZERO_ADDRESS, {from: owner}),
        "Invalid printer address"
    );         
  });

  it('should revert if unregistered designer tries to protect design', async () => {
    await truffleAssert.reverts(
        instance.protectDesign(web3.utils.toHex("Valve"), {from: alice}),
        "Message sender is not a registered designer"
    );        
  });

  it('should revert if design id is not known when trying to use design', async () => {
    await instance.registerDesigner(alice, {from: owner});
    await instance.registerPrinter(bob, {from: owner});
    await instance.protectDesign(web3.utils.toHex("Valve"), {from: alice});

    await truffleAssert.reverts(
        instance.useDesign(2, {from: bob}),
        "Invalid design id"
    );        
  });

  it('should revert if design id is 0 when trying to use design', async () => {
    await instance.registerDesigner(alice, {from: owner});
    await instance.registerPrinter(bob, {from: owner});
    await instance.protectDesign(web3.utils.toHex("Valve"), {from: alice});

    await truffleAssert.reverts(
        instance.useDesign(0, {from: bob}),
        "Invalid design id"
    );        
  });

  it('should revert if printer tries to use design before any designs have been protected', async () => {
    await instance.registerPrinter(bob, {from: owner});
    await instance.registerDesigner(alice, {from: owner})
    await truffleAssert.reverts(
        instance.useDesign(0, {from: bob}),
        "Invalid design id"
    );        
  });

  it('should revert if printer has already used design and does not pay this time', async () => {
    await instance.registerDesigner(alice, {from: owner});
    await instance.registerPrinter(bob, {from: owner});
    await instance.registerPrinter(dan, {from: owner});
    await instance.protectDesign(web3.utils.toHex("Valve"), {from: alice});
    await instance.protectDesign(web3.utils.toHex("Mask"), {from: alice});
    await instance.useDesign(1, {from: bob}),

    await truffleAssert.reverts(
        instance.useDesign(1, {from: bob}),
        "You have already used this design once. You must pay to use it again"
    );        

    await instance.useDesign(1, {from: dan}),

    await truffleAssert.reverts(
        instance.useDesign(1, {from: dan}),
        "You have already used this design once. You must pay to use it again"
    );  

    await instance.useDesign(2, {from: dan}),

    await truffleAssert.reverts(
        instance.useDesign(2, {from: dan}),
        "You have already used this design once. You must pay to use it again"
    );
  });

});//end test contract