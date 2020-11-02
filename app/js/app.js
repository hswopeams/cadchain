// Import the page's CSS. Webpack will know what to do with it.
import "../styles/app.css";

const Web3 = require("web3");
const truffleContract = require("truffle-contract");
const $ = require("jquery");
// Not to forget our built contract
const iPProtectionJson = require("../../build/contracts/IPProtection.json");
require("file-loader?name=../index.html!../index.html");
require("file-loader?name=../admin.html!../admin.html");

// Supports Metamask, and other wallets that provide / inject 'web3'.
if (typeof web3 !== 'undefined') {
    // Use the Mist/wallet/Metamask provider.
    window.web3 = new Web3(web3.currentProvider);
} else {
    // Your preferred fallback.
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')); 
}

const IPProtection = truffleContract(iPProtectionJson);
IPProtection.setProvider(web3.currentProvider);

window.addEventListener('load', async function() {
    try {
        const accounts = await (/*window.ethereum ?
            window.enable() ||*/
            web3.eth.getAccounts());
            console.log("accounts ", accounts);
        if (accounts.length == 0) {
            throw new Error("No account with which to transact");
        }
        window.account = accounts[0];
        console.log("window.account ", window.account);

        const network = await web3.eth.net.getId();
        const instance = await IPProtection.deployed();
 
      
       $("#account0").html(accounts[0]);
       $("#account1").html(accounts[1]);
       $("#account2").html(accounts[2]);
       $("#account3").html(accounts[3]);
       $("#account4").html(accounts[4]);
       
        // We wire it when the system looks in order.
        $("#registerDesigner").click(registerDesigner);
        $("#deregisterDesigner").click(deregisterDesigner);
        $("#registerPrinter").click(registerPrinter);
        $("#deregisterPrinter").click(deregisterPrinter);
        $("#protectDesign").click(protectDesign);
        $("#withdrawFunds").click(withdrawFunds);
        $("#useDesign").click(useDesign);
        $("#getBalance").click(getBalance);
        
    } catch(err) {
        // Never let an error go unlogged.
        console.error(err);
    }
});

const registerDesigner = async function() {
    // Sometimes you have to force the gas amount to a value you know is enough because
    // `web3.eth.estimateGas` may get it wrong.
    const gas = 300000;
    try {
        const accounts = await (/*window.ethereum ?
            window.enable() ||*/
            web3.eth.getAccounts());
            console.log("accounts ", accounts);
        const instance = await IPProtection.deployed();

        // We simulate the real call and see whether this is likely to work.
        // No point in wasting gas if we have a likely failure.
        const success = await instance.registerDesigner.call(
            $("input[name='designerAddress']").val(),
            { from: window.account, gas: gas });

        if (!success) {
            throw new Error("The transaction will fail anyway, not sending");
        }

        // Ok, we move onto the proper action.
        const txObj = await instance.registerDesigner(
            $("input[name='designerAddress']").val(),
            { from: window.account, gas: gas })
            //transfer takes time in real life, so we get the txHash immediately while it 
            // is mined.
            .on(
                "transactionHash",
                txHash => $("#status").html("Transaction on the way " + txHash)
            )
            .on('receipt', function(receipt){
                console.log("receipt in on receipt ", receipt);
                console.log("events in on receipt ", receipt.events);

            });
        // Now we got the mined tx.
        const receipt = txObj.receipt;

        if (!receipt.status) {
            console.error("Wrong status");
            console.error(receipt);
            $("#status").html("There was an error in the tx execution, status not 1");
        } else if (receipt.logs.length == 0) {
            console.error("Empty logs");
            console.error(receipt);
            $("#status").html("There was an error in the tx execution, missing expected event");
        } else {
            console.log("logs ", receipt.logs[0]);
            $("#status").html("Designer registered");
        }
        
        // Make sure we update the UI.
       // $("#balanceContract").html(await web3.eth.getBalance(instance.address));

    } catch(err) {
        $("#status").html(err.toString());
        console.error(err);
    }
};

const deregisterDesigner = async function() {
    // Sometimes you have to force the gas amount to a value you know is enough because
    // `web3.eth.estimateGas` may get it wrong.
    const gas = 300000;
    try {
        const accounts = await (/*window.ethereum ?
            window.enable() ||*/
            web3.eth.getAccounts());
            console.log("accounts ", accounts);
        const instance = await IPProtection.deployed();

        // We simulate the real call and see whether this is likely to work.
        // No point in wasting gas if we have a likely failure.
        const success = await instance.deregisterDesigner.call(
            $("input[name='designerAddress']").val(),
            { from: window.account, gas: gas });

        if (!success) {
            throw new Error("The transaction will fail anyway, not sending");
        }

        // Ok, we move onto the proper action.
        const txObj = await instance.deregisterDesigner(
            $("input[name='designerAddress']").val(),
            { from: window.account, gas: gas })
            //transfer takes time in real life, so we get the txHash immediately while it 
            // is mined.
            .on(
                "transactionHash",
                txHash => $("#status").html("Transaction on the way " + txHash)
            )
            .on('receipt', function(receipt){
                console.log("receipt in on receipt ", receipt);
                console.log("events in on receipt ", receipt.events);

            });
        // Now we got the mined tx.
        const receipt = txObj.receipt;

        if (!receipt.status) {
            console.error("Wrong status");
            console.error(receipt);
            $("#status").html("There was an error in the tx execution, status not 1");
        } else if (receipt.logs.length == 0) {
            console.error("Empty logs");
            console.error(receipt);
            $("#status").html("There was an error in the tx execution, missing expected event");
        } else {
            console.log("logs ", receipt.logs[0]);
            $("#status").html("Designer deregistered");
        }
        
        // Make sure we update the UI.
       // $("#balanceContract").html(await web3.eth.getBalance(instance.address));

    } catch(err) {
        $("#status").html(err.toString());
        console.error(err);
    }
};

const registerPrinter = async function() {
    // Sometimes you have to force the gas amount to a value you know is enough because
    // `web3.eth.estimateGas` may get it wrong.
    const gas = 300000;
    try {
        const accounts = await (/*window.ethereum ?
            window.enable() ||*/
            web3.eth.getAccounts());
            console.log("accounts ", accounts);
        const instance = await IPProtection.deployed();

        // We simulate the real call and see whether this is likely to work.
        // No point in wasting gas if we have a likely failure.
        const success = await instance.registerPrinter.call(
            $("input[name='printerAddress']").val(),
            { from: window.account, gas: gas });

        if (!success) {
            throw new Error("The transaction will fail anyway, not sending");
        }

        // Ok, we move onto the proper action.
        const txObj = await instance.registerPrinter(
            $("input[name='printerAddress']").val(),
            { from: window.account, gas: gas })
            //transfer takes time in real life, so we get the txHash immediately while it 
            // is mined.
            .on(
                "transactionHash",
                txHash => $("#status").html("Transaction on the way " + txHash)
            )
            .on('receipt', function(receipt){
                console.log("receipt in on receipt ", receipt);
                console.log("events in on receipt ", receipt.events);

            });
        // Now we got the mined tx.
        const receipt = txObj.receipt;

        if (!receipt.status) {
            console.error("Wrong status");
            console.error(receipt);
            $("#status").html("There was an error in the tx execution, status not 1");
        } else if (receipt.logs.length == 0) {
            console.error("Empty logs");
            console.error(receipt);
            $("#status").html("There was an error in the tx execution, missing expected event");
        } else {
            console.log("logs ", receipt.logs[0]);
            $("#status").html("Printer registered");
        }
        
        // Make sure we update the UI.
       // $("#balanceContract").html(await web3.eth.getBalance(instance.address));

    } catch(err) {
        $("#status").html(err.toString());
        console.error(err);
    }
};


const deregisterPrinter = async function() {
    // Sometimes you have to force the gas amount to a value you know is enough because
    // `web3.eth.estimateGas` may get it wrong.
    const gas = 300000;
    try {
        const accounts = await (/*window.ethereum ?
            window.enable() ||*/
            web3.eth.getAccounts());
            console.log("accounts ", accounts);
        const instance = await IPProtection.deployed();

        // We simulate the real call and see whether this is likely to work.
        // No point in wasting gas if we have a likely failure.
        const success = await instance.deregisterPrinter.call(
            $("input[name='printerAddress']").val(),
            { from: window.account, gas: gas });

        if (!success) {
            throw new Error("The transaction will fail anyway, not sending");
        }

        // Ok, we move onto the proper action.
        const txObj = await instance.deregisterPrinter(
            $("input[name='printerAddress']").val(),
            { from: window.account, gas: gas })
            //transfer takes time in real life, so we get the txHash immediately while it 
            // is mined.
            .on(
                "transactionHash",
                txHash => $("#status").html("Transaction on the way " + txHash)
            )
            .on('receipt', function(receipt){
                console.log("receipt in on receipt ", receipt);
                console.log("events in on receipt ", receipt.events);

            });
        // Now we got the mined tx.
        const receipt = txObj.receipt;

        if (!receipt.status) {
            console.error("Wrong status");
            console.error(receipt);
            $("#status").html("There was an error in the tx execution, status not 1");
        } else if (receipt.logs.length == 0) {
            console.error("Empty logs");
            console.error(receipt);
            $("#status").html("There was an error in the tx execution, missing expected event");
        } else {
            console.log("logs ", receipt.logs[0]);
            $("#status").html("Printer deregistered");
        }
        
        // Make sure we update the UI.
       // $("#balanceContract").html(await web3.eth.getBalance(instance.address));

    } catch(err) {
        $("#status").html(err.toString());
        console.error(err);
    }
};

const protectDesign = async function() {
    // Sometimes you have to force the gas amount to a value you know is enough because
    // `web3.eth.estimateGas` may get it wrong.
    const gas = 300000;
    try {
        const accounts = await (/*window.ethereum ?
            window.enable() ||*/
            web3.eth.getAccounts());
            console.log("accounts ", accounts);
        const instance = await IPProtection.deployed();

        const hexValueContentPointer = web3.utils.hexToBytes($("input[name='hashedContentPointerProtect']").val());

        // We simulate the real call and see whether this is likely to work.
        // No point in wasting gas if we have a likely failure.
        const success = await instance.protectDesign.call(
            hexValueContentPointer,
            { from: $("input[name='designerAddress']").val(), gas: gas });

        if (!success) {
            throw new Error("The transaction will fail anyway, not sending");
        }

        // Ok, we move onto the proper action.
        const txObj = await instance.protectDesign(
            hexValueContentPointer,
            { from: $("input[name='designerAddress']").val(), gas: gas })
            //transfer takes time in real life, so we get the txHash immediately while it 
            // is mined.
            .on(
                "transactionHash",
                txHash => $("#statusProtectDesign").html("Transaction on the way " + txHash)
            )
            .on('receipt', function(receipt){
                console.log("receipt in on receipt ", receipt);
                console.log("events in on receipt ", receipt.events);

            });
        // Now we got the mined tx.
        const receipt = txObj.receipt;

        if (!receipt.status) {
            console.error("Wrong status");
            console.error(receipt);
            $("#statusProtectDesign").html("There was an error in the tx execution, status not 1");
        } else if (receipt.logs.length == 0) {
            console.error("Empty logs");
            console.error(receipt);
            $("#statusProtectDesign").html("There was an error in the tx execution, missing expected event");
        } else {
            console.log("logs ", receipt.logs[0]);
            $("#statusProtectDesign").html("Design registered");
        }
        
        // Make sure we update the UI.
       // $("#balanceContract").html(await web3.eth.getBalance(instance.address));

    } catch(err) {
        $("#statusProtectDesign").html(err.toString());
        console.error(err);
    }
};

const withdrawFunds = async function() {
    // Sometimes you have to force the gas amount to a value you know is enough because
    // `web3.eth.estimateGas` may get it wrong.
    const gas = 300000;

    try {
        const accounts = await (/*window.ethereum ?
            window.enable() ||*/
            web3.eth.getAccounts());
            console.log("accounts ", accounts);
        if (accounts.length == 0) {
            throw new Error("No account with which to transact");
        }

        const instance = await IPProtection.deployed();

        // We simulate the real call and see whether this is likely to work.
        // No point in wasting gas if we have a likely failure.
        const success = await instance.withdrawFunds.call(
            { from: $("input[name='designerAddressWithdraw']").val(), gas: gas });
        if (!success) {
            throw new Error("The transaction will fail anyway, not sending");
        }

        // Ok, we move onto the proper action.
        const txObj = await instance.withdrawFunds(
            { from: $("input[name='designerAddressWithdraw']").val(), gas: gas })
            // withdrawFunds takes time in real life, so we get the txHash immediately while it 
            // is mined.
            .on(
                "transactionHash",
                txHash => $("#status").html("Transaction on the way " + txHash)
            );
        // Now we got the mined tx.
        const receipt = txObj.receipt;
        
        if (!receipt.status) {
            console.error("Wrong status");
            console.error(receipt);
            $("#statusRegisterDesign").html("There was an error in the tx execution, status not 1");
        } else if (receipt.logs.length == 0) {
            console.error("Empty logs");
            console.error(receipt);
            $("#statusRegisterDesign").html("There was an error in the tx execution, missing expected event");
        } else {
            console.log(receipt.logs[0]);
            $("#statusRegisterDesign").html("Transfer executed");
        }

        const designerContractBalance = await instance.balances($("input[name='designerAddressWithdraw']").val(), { from: window.account, gas: gas });
        $("#designerContractBalance").html(designerContractBalance.toString());

        //console.log("designerContractBalance ", designerContractBalance);
        const desginerBalance = await web3.eth.getBalance($("input[name='designerAddressWithdraw']").val());

        $("#balanceContract").html(desginerBalance);
        
    } catch(err) {
        $("#statusRegisterDesign").html(err.toString());
        console.error(err);
    }
    
};

const useDesign = async function() {
    // Sometimes you have to force the gas amount to a value you know is enough because
    // `web3.eth.estimateGas` may get it wrong.
    const gas = 300000;
    try {
        const accounts = await (/*window.ethereum ?
            window.enable() ||*/
            web3.eth.getAccounts());
            console.log("accounts ", accounts);
        const instance = await IPProtection.deployed();

        const hexValueContentPointer = web3.utils.hexToBytes($("input[name='hashedContentPointerProtectUseDesign']").val());

        // We simulate the real call and see whether this is likely to work.
        // No point in wasting gas if we have a likely failure.
        const success = await instance.useDesign.call(
            hexValueContentPointer,
            { from: $("input[name='printerAddress']").val(), value: $("input[name='amount']").val(), gas: gas });

        if (!success) {
            throw new Error("The transaction will fail anyway, not sending");
        }

        // Ok, we move onto the proper action.
        const txObj = await instance.useDesign(
            hexValueContentPointer,
            { from: $("input[name='printerAddress']").val(), value: $("input[name='amount']").val(), gas: gas })
            //transfer takes time in real life, so we get the txHash immediately while it 
            // is mined.
            .on(
                "transactionHash",
                txHash => $("#status").html("Transaction on the way " + txHash)
            )
            .on('receipt', function(receipt){
                console.log("receipt in on receipt ", receipt);
                console.log("events in on receipt ", receipt.events);

            });
        // Now we got the mined tx.
        const receipt = txObj.receipt;

        if (!receipt.status) {
            console.error("Wrong status");
            console.error(receipt);
            $("#statusUseDesign").html("There was an error in the tx execution, status not 1");
        } else if (receipt.logs.length == 0) {
            console.error("Empty logs");
            console.error(receipt);
            $("#statusUseDesign").html("There was an error in the tx execution, missing expected event");
        } else {
            console.log("logs ", receipt.logs[0]);
            $("#statusUseDesign").html("Design access approved");
        }

    } catch(err) {
        $("#statusUseDesign").html(err.toString());
        console.error(err);
    }
};

const getBalance = async function() {
    // Sometimes you have to force the gas amount to a value you know is enough because
    // `web3.eth.estimateGas` may get it wrong.
    const gas = 300000;
    try {
        const accounts = await (/*window.ethereum ?
            window.enable() ||*/
            web3.eth.getAccounts());
            console.log("accounts ", accounts);
        const instance = await IPProtection.deployed();

       const designerContractBalance = await instance.balances($("input[name='designerAddressWithdraw']").val(), { from: window.account, gas: gas });
       $("#designerContractBalance").html(designerContractBalance.toString());

       console.log("designerContractBalance ", designerContractBalance);

       const desginerBalance = await web3.eth.getBalance($("input[name='designerAddressWithdraw']").val());

        $("#balanceContract").html(desginerBalance);

        console.log("desginerBalance ", desginerBalance);

    } catch(err) {
        $("#statusUseDesign").html(err.toString());
        console.error(err);
    }
};