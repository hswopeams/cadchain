// Import the page's CSS. Webpack will know what to do with it.
import "../styles/app.css";

const Web3 = require("web3");
const truffleContract = require("truffle-contract");
const $ = require("jquery");
// Not to forget our built contract
const iPProtectionJson = require("../../build/contracts/IPProtection.json");
require("file-loader?name=../index.html!../index.html");
require("file-loader?name=../admin.html!../admin.html");
require("file-loader?name=../printer.html!../printer.html");

// Supports Metamask, and other wallets that provide / inject 'ethereum' or 'web3'.
import detectEthereumProvider from '@metamask/detect-provider';

// this returns the provider, or null if it wasn't detected
const provider = await detectEthereumProvider();

if (provider) {
  startApp(provider); // Initialize your app
} else {
    web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
}

function startApp(provider) {
  // If the provider returned by detectEthereumProvider is not the same as
  // window.ethereum, something is overwriting it, perhaps another wallet.
  if (provider !== window.ethereum) {
    console.error('provider !== window.ethereum');
  } else {
    web3 = new Web3(provider);
  }
  // Access the decentralized web!
}


const IPProtection = truffleContract(iPProtectionJson);
IPProtection.setProvider(web3.currentProvider);

/**********************************************************/
/* Handle chain (network) and chainChanged (per EIP-1193) */
/**********************************************************/

// Normally, we would recommend the 'eth_chainId' RPC method, but it currently
// returns incorrectly formatted chain ID values.
let currentChainId = ethereum.chainId;

ethereum.on('chainChanged', handleChainChanged);

function handleChainChanged(_chainId) {
  // We recommend reloading the page, unless you must do otherwise
  window.location.reload();
}

/***********************************************************/
/* Handle user accounts and accountsChanged (per EIP-1193) */
/***********************************************************/

let currentAccount = null;

ethereum
  .request({ method: 'eth_accounts' })
  .then(handleAccountsChanged)
  .catch((err) => {
    // Some unexpected error.
    // For backwards compatibility reasons, if no accounts are available,
    // eth_accounts will return an empty array.
    console.error(err);
  });

// Note that this event is emitted on page load.
// If the array of accounts is non-empty, you're already
// connected.
ethereum.on('accountsChanged', handleAccountsChanged);

// For now, 'eth_accounts' will continue to always return an array
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // MetaMask is locked or the user has not connected any accounts
    console.log('No accounts available');
  } else if (accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
    updateGUI();
    
  }
}

/*********************************************/
/* Access the user's accounts (per EIP-1102) */
/*********************************************/

// You should only attempt to request the user's accounts in response to user
// interaction, such as a button click.
// Otherwise, you popup-spam the user like it's 1999.
// If you fail to retrieve the user's account(s), you should encourage the user
// to initiate the attempt.
function connect() {
  ethereum
    .request({ method: 'eth_requestAccounts' })
    .then(handleAccountsChanged)
    .catch((err) => {
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log('Please connect to MetaMask.');
      } else {
        console.error(err);
      }
    });
}

const updateGUI = async function() {
    const gas = 300000;
    const instance = await IPProtection.deployed();
    const designerContractBalance = await instance.balances(currentAccount, { from: currentAccount, gas: gas });
    $("#designerContractBalance").html(designerContractBalance.toString());

    const desginerBalance = await web3.eth.getBalance(currentAccount);
    $("#balanceContract").html(desginerBalance);
}

window.addEventListener('load', async function() {
    try {

        const gas = 300000;
        connect();
        const instance = await IPProtection.deployed();
 
        updateGUI();
       
        // We wire it when the system looks in order.
        $("#registerDesigner").click(registerDesigner);
        $("#deregisterDesigner").click(deregisterDesigner);
        $("#registerPrinter").click(registerPrinter);
        $("#deregisterPrinter").click(deregisterPrinter);
        $("#protectDesign").click(protectDesign);
        $("#withdrawFunds").click(withdrawFunds);
        $("#useDesign").click(useDesign);
        
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

        connect();
        const instance = await IPProtection.deployed();

        // We simulate the real call and see whether this is likely to work.
        // No point in wasting gas if we have a likely failure.
        const success = await instance.registerDesigner.call(
            $("input[name='designerAddress']").val(),
            { from: currentAccount, gas: gas });

        if (!success) {
            throw new Error("The transaction will fail anyway, not sending");
        }

        // Ok, we move onto the proper action.
        const txObj = await instance.registerDesigner(
            $("input[name='designerAddress']").val(),
            { from: currentAccount, gas: gas })
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

        connect();
        const instance = await IPProtection.deployed();

        // We simulate the real call and see whether this is likely to work.
        // No point in wasting gas if we have a likely failure.
        const success = await instance.deregisterDesigner.call(
            $("input[name='designerAddress']").val(),
            { from: currentAccount, gas: gas });

        if (!success) {
            throw new Error("The transaction will fail anyway, not sending");
        }

        // Ok, we move onto the proper action.
        const txObj = await instance.deregisterDesigner(
            $("input[name='designerAddress']").val(),
            { from: currentAccount, gas: gas })
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

        connect();
        const instance = await IPProtection.deployed();

        // We simulate the real call and see whether this is likely to work.
        // No point in wasting gas if we have a likely failure.
        const success = await instance.registerPrinter.call(
            $("input[name='printerAddress']").val(),
            { from: currentAccount, gas: gas });

        if (!success) {
            throw new Error("The transaction will fail anyway, not sending");
        }

        // Ok, we move onto the proper action.
        const txObj = await instance.registerPrinter(
            $("input[name='printerAddress']").val(),
            { from: currentAccount, gas: gas })
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
        
        connect();
        const instance = await IPProtection.deployed();

        // We simulate the real call and see whether this is likely to work.
        // No point in wasting gas if we have a likely failure.
        const success = await instance.deregisterPrinter.call(
            $("input[name='printerAddress']").val(),
            { from: currentAccount, gas: gas });

        if (!success) {
            throw new Error("The transaction will fail anyway, not sending");
        }

        // Ok, we move onto the proper action.
        const txObj = await instance.deregisterPrinter(
            $("input[name='printerAddress']").val(),
            { from: currentAccount, gas: gas })
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
        
        connect();
        const instance = await IPProtection.deployed();

        const hexValueContentPointer = web3.utils.hexToBytes($("input[name='hashedContentPointerProtect']").val());

        // We simulate the real call and see whether this is likely to work.
        // No point in wasting gas if we have a likely failure.
        const success = await instance.protectDesign.call(
            hexValueContentPointer,
            { from: currentAccount, gas: gas });

        if (!success) {
            throw new Error("The transaction will fail anyway, not sending");
        }

        // Ok, we move onto the proper action.
        const txObj = await instance.protectDesign(
            hexValueContentPointer,
            { from: currentAccount, gas: gas })
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
            $("#status").html("Design registered");
        }
        
        updateGUI();

    } catch(err) {
        $("#status").html(err.toString());
        console.error(err);
    }
};

const withdrawFunds = async function() {
    // Sometimes you have to force the gas amount to a value you know is enough because
    // `web3.eth.estimateGas` may get it wrong.
    const gas = 300000;

    try {
        
        connect();
        const instance = await IPProtection.deployed();

        // We simulate the real call and see whether this is likely to work.
        // No point in wasting gas if we have a likely failure.
        const success = await instance.withdrawFunds.call(
            { from: currentAccount, gas: gas });
        if (!success) {
            throw new Error("The transaction will fail anyway, not sending");
        }

        // Ok, we move onto the proper action.
        const txObj = await instance.withdrawFunds(
            { from: currentAccount, gas: gas })
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
            $("#status").html("There was an error in the tx execution, status not 1");
        } else if (receipt.logs.length == 0) {
            console.error("Empty logs");
            console.error(receipt);
            $("#status").html("There was an error in the tx execution, missing expected event");
        } else {
            console.log(receipt.logs[0]);
            $("#status").html("Transfer executed");
        }

        updateGUI();
        
    } catch(err) {
        $("#status").html(err.toString());
        console.error(err);
    }
    
};

const useDesign = async function() {
    // Sometimes you have to force the gas amount to a value you know is enough because
    // `web3.eth.estimateGas` may get it wrong.
    const gas = 300000;
    try {

        connect();
        const instance = await IPProtection.deployed();

        const hexValueContentPointer = web3.utils.hexToBytes($("input[name='hashedContentPointerProtectUseDesign']").val());

        // We simulate the real call and see whether this is likely to work.
        // No point in wasting gas if we have a likely failure.
        const success = await instance.useDesign.call(
            hexValueContentPointer,
            { from: currentAccount, value: $("input[name='amount']").val(), gas: gas });

        if (!success) {
            throw new Error("The transaction will fail anyway, not sending");
        }

        // Ok, we move onto the proper action.
        const txObj = await instance.useDesign(
            hexValueContentPointer,
            { from: currentAccount, value: $("input[name='amount']").val(), gas: gas })
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

        updateGUI();

    } catch(err) {
        $("#statusUseDesign").html(err.toString());
        console.error(err);
    }
};