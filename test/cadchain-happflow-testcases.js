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

  it('should allow owner to transfer contract balance to a safeguard address when killed', async () => {
    await instance.registerPrinter(bob, {from: owner});
    await instance.registerDesigner(alice, {from: owner});
    await instance.protectDesign(web3.utils.toHex("Valve"), {from: alice});
   

    await instance.useDesign(1, {from: bob});
    await instance.useDesign(1, {from: bob, value: 1000});

    const contractBalance = await web3.eth.getBalance(instance.address);
    const safeguardStartingBalance = await web3.eth.getBalance(safeguard);

    expect(contractBalance).to.eq.BN(1000);

    await instance.pause({ from: owner });
    await instance.kill({ from: owner });
    const killed = await instance.isKilled({ from: owner });
    assert.isTrue(killed, 'the contract has not been killed');

    const txObj =  await instance.safeguardFunds(safeguard);
   
    const newContractBalance = await web3.eth.getBalance(instance.address);
    const safeguardBalance = await web3.eth.getBalance(safeguard);
    const expectedSafeguardBalance = new BN(safeguardStartingBalance).add(new BN(contractBalance));

    expect(newContractBalance).to.eq.BN(0);
    expect(safeguardBalance).to.eq.BN(expectedSafeguardBalance);

    truffleAssert.eventEmitted(txObj.receipt, 'LogFundsSafeguarded', (ev) => {    
        return ev.recipient == safeguard && expect(ev.amount).to.eq.BN(contractBalance);
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

  it('should allow a designer to protect a design with diacritics in the name', async () => {
    await instance.registerDesigner(alice, {from: owner});
    const txObj = await instance.protectDesign(web3.utils.toHex("ëçà"), {from: alice});
    truffleAssert.eventEmitted(txObj.receipt, 'LogDesignProtected', (ev) => {    
        //console.log("nameFromEvent ", web3.utils.hexToAscii(ev.name));
        return ev.designer == alice && expect(ev.id).to.eq.BN(1);
    });    
  });

  it('should increase counter correctly when designs are protected', async () => {
    await instance.registerDesigner(alice, {from: owner});
    const txObj = await instance.protectDesign(web3.utils.toHex("Valve"), {from: alice});
    truffleAssert.eventEmitted(txObj.receipt, 'LogDesignProtected', (ev) => {    
        //console.log("nameFromEvent ", web3.utils.hexToAscii(ev.name));
        return ev.designer == alice && expect(ev.id).to.eq.BN(1);
    });    

    let counter = await instance.counter();
    expect(counter).to.eq.BN(1);

    const txObj2 = await instance.protectDesign(web3.utils.toHex("Mask"), {from: alice});
    truffleAssert.eventEmitted(txObj2.receipt, 'LogDesignProtected', (ev) => {    
        //console.log("nameFromEvent ", web3.utils.hexToAscii(ev.name));
        return ev.designer == alice && expect(ev.id).to.eq.BN(2);
    }); 

    counter = await instance.counter();
    expect(counter).to.eq.BN(2);
  });

  it('should allow a printer to use a design once for free', async () => {
    await instance.registerDesigner(alice, {from: owner});
    await instance.registerPrinter(bob, {from: owner});
    await instance.protectDesign(web3.utils.toHex("Valve"), {from: alice});

    const txObj = await instance.useDesign(1, {from: bob});

    truffleAssert.eventEmitted(txObj.receipt, 'LogDesignUseApproved', (ev) => {    
        return ev.printer == bob && expect(ev.designId).to.eq.BN(1) && expect(ev.approved).to.be.true;
    });    
  });

  it('should accept payment from printer for subsequent requests and add funds to designer balance', async () => {
    await instance.registerPrinter(bob, {from: owner});
    await instance.registerDesigner(alice, {from: owner});
    await instance.protectDesign(web3.utils.toHex("Valve"), {from: alice});
   

    await instance.useDesign(1, {from: bob});
    await instance.useDesign(1, {from: bob, value: 1000});
    await instance.useDesign(1, {from: bob, value: 2500});

    const newContractBalanceAlice = new BN(await instance.balances(alice));
    expect(newContractBalanceAlice).to.eq.BN(3500);
       
  });

  it('should allow use of multiple designs by a printer and add funds to correct designer\'s balance', async () => {
    await instance.registerDesigner(alice, {from: owner});
    await instance.registerDesigner(carol, {from: owner});
    await instance.registerPrinter(bob, {from: owner});
    await instance.protectDesign(web3.utils.toHex("Valve"), {from: alice});
    await instance.protectDesign(web3.utils.toHex("Mask"), {from: carol});

    //Use Carol's design
    const txObj = await instance.useDesign(2, {from: bob});

    truffleAssert.eventEmitted(txObj.receipt, 'LogDesignUseApproved', (ev) => {    
        return ev.printer == bob && expect(ev.designId).to.eq.BN(2) && expect(ev.approved).to.be.true;
    });  

    const txObj2 = await instance.useDesign(2, {from: bob, value: 1000});

    truffleAssert.eventEmitted(txObj2.receipt, 'LogDesignUseApproved', (ev) => {    
        return ev.printer == bob && expect(ev.designId).to.eq.BN(2) && expect(ev.approved).to.be.true;
    });  
       

    //User Alice's design
    const txObj3 = await instance.useDesign(1, {from: bob});

    truffleAssert.eventEmitted(txObj3.receipt, 'LogDesignUseApproved', (ev) => {    
        return ev.printer == bob && expect(ev.designId).to.eq.BN(1) && expect(ev.approved).to.be.true;
    });  

    const txObj4 = await instance.useDesign(1, {from: bob, value: 5000});

    truffleAssert.eventEmitted(txObj4.receipt, 'LogDesignUseApproved', (ev) => {    
        return ev.printer == bob && expect(ev.designId).to.eq.BN(1) && expect(ev.approved).to.be.true;
    });  

    const newContractBalanceCarol = new BN(await instance.balances(carol));
    expect(newContractBalanceCarol).to.eq.BN(1000);

    const newContractBalanceAlice = new BN(await instance.balances(alice));
    expect(newContractBalanceAlice).to.eq.BN(5000);
  });

  it('should correctly determine whether or not multiple printers have used various designs', async () => {
    await instance.registerPrinter(bob, {from: owner});
    await instance.registerPrinter(dan, {from: owner});
    await instance.registerDesigner(alice, {from: owner});
    await instance.protectDesign(web3.utils.toHex("Valve"), {from: alice});
   

    await instance.useDesign(1, {from: bob});
    await instance.useDesign(1, {from: dan});


    await instance.useDesign(1, {from: dan, value: 1000});
    await instance.useDesign(1, {from: bob, value: 2500});

    const newContractBalanceAlice = new BN(await instance.balances(alice));
    expect(newContractBalanceAlice).to.eq.BN(3500);
       
  });

  it('should allow designer to withdraw her funds', async () => {
    await instance.registerDesigner(alice, {from: owner});
    await instance.registerPrinter(bob, {from: owner});
    await instance.protectDesign(web3.utils.toHex("Valve"), {from: alice});

    await instance.useDesign(1, {from: bob});
    await instance.useDesign(1, {from: bob, value: 2500});
    
    const startingAccountBalanceAlice = new BN(await web3.eth.getBalance(alice));
    const txObj = await instance.withdrawFunds({ from: alice });
    const withdrawGasPrice = (await web3.eth.getTransaction(txObj.tx)).gasPrice;
    const withdrawTxPrice = withdrawGasPrice * txObj.receipt.gasUsed;
    const newAccountBalanceAlice = new BN(await web3.eth.getBalance(alice));

    //Alice's balance after calling withdrawFunds() = Alice's balance before calling withdrawFunds() plus amount withdrawn minus price of calling withdrawFunds()
    const expectedAccountBalance = startingAccountBalanceAlice.add(new BN(2500)).sub(new BN(withdrawTxPrice));      
    expect(new BN(newAccountBalanceAlice).eq(new BN(expectedAccountBalance))).to.be.true; 

    const newContraceBalanceAlice = await instance.balances(alice, { from: alice });
    expect(newContraceBalanceAlice.eq(new BN(0))).to.be.true; 


    truffleAssert.eventEmitted(txObj.receipt, 'LogFundsWithdrawn', (ev) => {    
        return ev.designer == alice && ev.balanceWithdrawn == 2500 ;
    });   

    assert.equal(txObj.receipt.logs.length, 1, 'Incorrect number of events emitted');
  });

it('should allow the correct designer to withdraw the correctfunds', async () => {
    await instance.registerDesigner(alice, {from: owner});
    await instance.registerDesigner(carol, {from: owner});
    await instance.registerPrinter(bob, {from: owner});
    await instance.protectDesign(web3.utils.toHex("Valve"), {from: alice});
    await instance.protectDesign(web3.utils.toHex("Mask"), {from: carol});

    await instance.useDesign(1, {from: bob});
    await instance.useDesign(1, {from: bob, value: 2500});

    await instance.useDesign(2, {from: bob});
    await instance.useDesign(2, {from: bob, value: 1000});
    
    //Alice
    const startingAccountBalanceAlice = new BN(await web3.eth.getBalance(alice));
    const txObj = await instance.withdrawFunds({ from: alice });
    const withdrawGasPrice = (await web3.eth.getTransaction(txObj.tx)).gasPrice;
    const withdrawTxPrice = withdrawGasPrice * txObj.receipt.gasUsed;
    const newAccountBalanceAlice = new BN(await web3.eth.getBalance(alice));

    //Alice's balance after calling withdrawFunds() = Alice's balance before calling withdrawFunds() plus amount withdrawn minus price of calling withdrawFunds()
    const expectedAccountBalanceAlice= startingAccountBalanceAlice.add(new BN(2500)).sub(new BN(withdrawTxPrice));      
    expect(new BN(newAccountBalanceAlice).eq(new BN(expectedAccountBalanceAlice))).to.be.true; 

    const newContraceBalanceAlice = await instance.balances(alice, { from: alice });
    expect(newContraceBalanceAlice.eq(new BN(0))).to.be.true; 


    truffleAssert.eventEmitted(txObj.receipt, 'LogFundsWithdrawn', (ev) => {    
        return ev.designer == alice && ev.balanceWithdrawn == 2500 ;
    });   

    assert.equal(txObj.receipt.logs.length, 1, 'Incorrect number of events emitted');


     //Carol
     const startingAccountBalanceCarol = new BN(await web3.eth.getBalance(carol));
     const txObj2 = await instance.withdrawFunds({ from: carol });
     const withdrawGasPriceCarol = (await web3.eth.getTransaction(txObj2.tx)).gasPrice;
     const withdrawTxPriceCarol = withdrawGasPriceCarol * txObj2.receipt.gasUsed;
     const newAccountBalanceCarol = new BN(await web3.eth.getBalance(carol));
 
     //Carol's balance after calling withdrawFunds() = Carol's balance before calling withdrawFunds() plus amount withdrawn minus price of calling withdrawFunds()
     const expectedAccountBalanceCarol= startingAccountBalanceCarol.add(new BN(1000)).sub(new BN(withdrawTxPrice));      
     expect(new BN(newAccountBalanceCarol).eq(new BN(expectedAccountBalanceCarol))).to.be.true; 
 
     const newContraceBalanceCarol = await instance.balances(carol, { from: carol });
     expect(newContraceBalanceCarol.eq(new BN(0))).to.be.true; 
 
 
     truffleAssert.eventEmitted(txObj2.receipt, 'LogFundsWithdrawn', (ev) => {    
         return ev.designer == carol && ev.balanceWithdrawn == 1000 ;
     });   
 
     assert.equal(txObj.receipt.logs.length, 1, 'Incorrect number of events emitted');
});

});//end test contract