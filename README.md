# cadchain
#### CADChain EUvsVirus Ethereum Prototype

This IPProtection smart contract is the prototyp built for the CADChain submission during the EUvsVirus hackathon in April 2020.

The smart contract can be used to protect intelectual property (IP). A design is IP that can be protected. The owner of the contract can register
designers using the `registerDesigner(address designer)` function. Registered designers can protect their designs using the IPProtection smart contract. The owner can also
register 3D printers using the `registerPrinter(address printer)` function. Designers and printers can also be deregistered by the owner using the `deregisterDesigner(address designer)` and `deregisterPrinter(address printer)` functions.

A designer can protect her design by calling `protectDesign(bytes32 hashedContentPointer)`. It is assumed the front-end
has already stored the actual design on something like IPFS. Only the hashed pointer will be stored on the blockchain.

A 3D printer can request to use a design by calling 'useDesign(bytes32 hashedContentPointer)'. A 3D printer may
use a design once for free. After that he must pay a fee (the prototype only requires a nominal fee of 1000 wei). The
fee gets allocated to the designer's balance in the contract.

Each registered designer can withdraw her funds to her own account using `withdrawFunds()`.

Ownership of the contract can be transferred. 

The contract can be paused and killed.

After the contract has been killed, the owner can safeguard any funds into a safeguard account. The `balances` mapping
is still available and can be used to refund the correct amount to each designer.

The IPProtection smart contract is deployed on Ropsten and can be found [here](https://ropsten.etherscan.io/address/0xA79965FAB97a681a6529Bd068faf562eDb529C97)
