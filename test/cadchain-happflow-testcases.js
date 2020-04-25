const IPProtection = artifacts.require("IPProtection");
const fs = require('fs');
const chai = require('chai');
const BN = require('bn.js');
const bnChai = require('bn-chai');
chai.use(bnChai(BN));
const assert = chai.assert;
const expect = chai.expect;
const truffleAssert = require('truffle-assertions');
contract("CADChain Happy Flow Test", async accounts => {

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

  it('should allow owner to pause and unpause the contract', async () => {
    const txObj = await instance.pause({ from: owner });
    const paused = await instance.paused({ from: owner });
    assert.isTrue(paused, 'the contract is paused');

    truffleAssert.eventEmitted(txObj.receipt, 'Paused', (ev) => {
        return ev.account == owner;
    });

    assert.strictEqual(txObj.receipt.logs.length, 1, 'Incorrect number of events emitted');
    
    await instance.unpause({ from: owner });
    const pausedAgain = await instance.paused({ from: owner });
    assert.isFalse(pausedAgain, 'the contract is nnot paused');

    truffleAssert.eventEmitted(txObj.receipt, 'Paused', (ev) => {  
         return ev.account == owner;
    });

    assert.strictEqual(txObj.receipt.logs.length, 1, 'Incorrect number of events emitted');

 });

 it('should allow owner kill the contract', async () => {
    await instance.pause({ from: owner });
    const txObj = await instance.kill({ from: owner });
    const killed = await instance.isKilled({ from: owner });
    assert.isTrue(killed, 'the contract has not been killed');

    truffleAssert.eventEmitted(txObj.receipt, 'LogKilled', (ev) => {
        return ev.account == owner;
    });

    assert.strictEqual(txObj.receipt.logs.length, 1, 'Incorrect number of events emitted');

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

  it('should allow a designer to protect her design', async () => {
    await instance.registerDesigner(alice, {from: owner});
    const txObj = await instance.protectDesign(web3.utils.toHex("Valve"), {from: alice});
    truffleAssert.eventEmitted(txObj.receipt, 'LogDesignProtected', (ev) => {    
        //console.log("nameFromEvent ", web3.utils.hexToAscii(ev.name));
        return ev.designer == alice && expect(ev.id).to.eq.BN(1);
    });    
  });

  it('should increase counter correctly', async () => {
    await instance.registerDesigner(alice, {from: owner});
    const txObj = await instance.protectDesign(web3.utils.toHex("Valve"), {from: alice});
    truffleAssert.eventEmitted(txObj.receipt, 'LogDesignProtected', (ev) => {    
        //console.log("nameFromEvent ", web3.utils.hexToAscii(ev.name));
        return ev.designer == alice && expect(ev.id).to.eq.BN(1);
    });    

    const txObj2 = await instance.protectDesign(web3.utils.toHex("Mask"), {from: alice});
    truffleAssert.eventEmitted(txObj2.receipt, 'LogDesignProtected', (ev) => {    
        //console.log("nameFromEvent ", web3.utils.hexToAscii(ev.name));
        return ev.designer == alice && expect(ev.id).to.eq.BN(2);
    }); 
  });

});//end test contract