# CADChain
#### CADChain EUvsVirus Ethereum Prototype

This IPProtection smart contract is the prototype built for the CADChain submission during the EUvsVirus hackathon in April 2020. The dApp is called 3DID. The hackathon allowed me only 48 hours to code the prototype from scratch. 

The smart contract can be used to protect intelectual property (IP). A design is IP that can be protected. The owner of the contract can register
designers using the `registerDesigner(address designer)` function. Registered designers can protect their designs using the IPProtection smart contract. The owner can also
register 3D printers using the `registerPrinter(address printer)` function. Designers and printers can also be deregistered by the owner using the `deregisterDesigner(address designer)` and `deregisterPrinter(address printer)` functions.

A designer can protect her design by calling `protectDesign(bytes32 hashedContentPointer)`. It is assumed the front-end
has already stored the actual design on something like IPFS. Only the hashed pointer will be stored on the blockchain.

A 3D printer can request to use a design by calling `useDesign(bytes32 hashedContentPointer)`. A 3D printer may
use a design once for free. After that he must pay a fee (the prototype only requires a nominal fee of 1000 wei). The
fee gets allocated to the designer's balance in the contract.

Each registered designer can withdraw her funds to her own account using `withdrawFunds()`.

Ownership of the contract can be transferred. 

The contract can be paused and killed.

After the contract has been killed, the owner can safeguard any funds into a safeguard account. The `balances` mapping
is still available and can be used to refund the correct amount to each designer.

The IPProtection smart contract is deployed on Ropsten and can be found [here](https://ropsten.etherscan.io/address/0xA79965FAB97a681a6529Bd068faf562eDb529C97)

I'm not a front-end developer, so the GUI is very simple. It serves only to show that I can wire a front-end to a smart contract.

## How to run locally
1. Clone this respository
2. CD to the `cadchain` directory
3. Run `npm install`
4. In a separate terminal,  run `ganache-cli --host 0.0.0.0`. Assumes ganache-cli is installed globally (https://www.npmjs.com/package/ganache-cli)
5. Take note of the addresses. 
6. In the first terminal, run `npm run migrate` to migrate contracts to ganache
7. Run `npm run build`
8. Run `npm run dev`
9. Go to <http://127.0.0.1:8000/admin.html> in your browser. 
10. Make sure  MetaMask is connected to the Localhost 8545 network.
11. Import 3 of the ganache addresses into Meta Mask to represent the contract owner, a designer, and a printer.
12. The first page is the  contract owner's page. Make sure the owner account imported into MetaMask is selected. Use this page to register and deregister designers and printers.
13. Next go to the designers's page at <http://127.0.0.1:8000/index.html> . Use this page to register a design using its hash. This page can also be used by the desiger to withdraw royalties.
14. Next got o the printers's page at <http://127.0.0.1:8000/printer.html>  . This page can be used by a printer to access a design. If a printer accesses the same design more than once, s/he must pay royalties.

