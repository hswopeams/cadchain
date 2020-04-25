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

  it('should have starting balance of 0', async () => {
    const contractBalance = await web3.eth.getBalance(instance.address);
    assert.strictEqual(contractBalance, '0',"contract balance isn't 0");
  });

  it('should allow owner to register a designer', async () => {
    const txObj = await instance.registerDesigner(alice, {from: owner});
    truffleAssert.eventEmitted(txObj.receipt, 'LogDesignerRegistered', (ev) => {   
        return ev.designer == alice;
    });    

    assert.strictEqual(txObj.receipt.logs.length, 1, 'Incorrect number of events emitted');
  });

  it('should allow owner to deregister a designer', async () => {
    await instance.registerDesigner(alice, {from: owner});
    const txObj = await instance.deregisterDesigner(alice, {from: owner});
    truffleAssert.eventEmitted(txObj.receipt, 'LogDesignerDeregistered', (ev) => {    
        return ev.designer == alice;
    });    

    assert.strictEqual(txObj.receipt.logs.length, 1, 'Incorrect number of events emitted');
  });

  it('should allow owner to register a printer', async () => {
    const txObj = await instance.registerPrinter(bob, {from: owner});
    truffleAssert.eventEmitted(txObj.receipt, 'LogPrinterRegistered', (ev) => {   
        return ev.printer == bob;
    });    

    assert.strictEqual(txObj.receipt.logs.length, 1, 'Incorrect number of events emitted');
  });

  it('should allow owner to deregister a printer', async () => {
    await instance.registerPrinter(bob, {from: owner});
    const txObj = await instance.deregisterPrinter(bob, {from: owner});
    truffleAssert.eventEmitted(txObj.receipt, 'LogPrinterDeregistered', (ev) => {    
        return ev.printer == bob;
    });    

    assert.strictEqual(txObj.receipt.logs.length, 1, 'Incorrect number of events emitted');
  });

});//end test contract