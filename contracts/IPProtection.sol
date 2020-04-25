pragma solidity >=0.4.25 <0.6.0;

import "./Killable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract IPProtection is Killable {
    using SafeMath for uint256;

  struct Design {
    address owner;
    uint256 id;
    bytes32 name;
    uint256 registrationDateTime;
    mapping (address => bool) usedBy;
  }

  uint256 public counter;
  //mapping (address => Design) public designs;
  mapping (uint256 => Design) public designs;
  mapping (address => uint256) public balances;
  mapping (address => bool) registeredDesigners;
  mapping (address => bool) registeredPrinters;

  event LogDesignerRegistered(address indexed designer);
  event LogDesignerDeregistered(address indexed designer);
  event LogPrinterRegistered(address indexed printer);
  event LogPrinterDeregistered(address indexed printer);
  event LogDesignProtected(address indexed designer, bytes32 indexed name, uint256 id);
  event LogDesignUseApproved(address indexed printer, uint256 indexed designId, bool approved, uint256 designerBalance);
  event LogFundsWithdrawn(address indexed designer, uint256 balanceWithdrawn);

  
  constructor() public {}

  function() external {
    revert("Fallback function not available");
  }

  function registerDesigner(address designer) public onlyOwner returns (bool) {
    require(designer != address(0), "Invalid designer address");
    require(!registeredDesigners[designer], "Designer already registered");
    registeredDesigners[designer] = true;
    emit LogDesignerRegistered(designer);
    return true;
  }

  function registerPrinter(address printer) public onlyOwner returns (bool) {
    require(printer != address(0), "Invalid printer address");
    require(!registeredPrinters[printer], "Printer already registered");
    registeredPrinters[printer] = true;
    emit LogPrinterRegistered(printer);
    return true;
  }

  function deregisterDesigner(address designer) public onlyOwner returns (bool) {
      require(registeredDesigners[designer], "Designer not registered");
      registeredDesigners[designer] = false;
      emit LogDesignerDeregistered(designer);
      return true;
  }

  function deregisterPrinter(address printer) public onlyOwner returns (bool) {
      require(registeredPrinters[printer], "Printer not registered");
      registeredPrinters[printer] = false;
      emit LogPrinterDeregistered(printer);
      return true;
  }

  function protectDesign(bytes32 name) public whenAlive {
    require(registeredDesigners[msg.sender], "Message sender is not a registered designer");
    counter = ++counter;
    designs[counter] = Design(msg.sender, counter, name, now);
    emit LogDesignProtected(msg.sender, name, counter);
  }

  function useDesign(uint256 designId) public payable whenAlive {
    require(registeredPrinters[msg.sender], "Printer not registered");
    require(designs[designId].owner != address(0), "Invalid design id");

    Design storage design = designs[designId];

    if(design.usedBy[msg.sender]) {
         require(msg.value >= 1000, "You must pay at least 1000 wei to use this design again");
    }

    design.usedBy[msg.sender] = true;
    balances[design.owner] = balances[design.owner].add(msg.value);
   
    emit LogDesignUseApproved(msg.sender, designId, true, balances[design.owner]);

  }

  function withdrawFunds() public whenAlive {
        require(registeredDesigners[msg.sender], "Message sender is not a registered designer");

        uint256 amount = balances[msg.sender];
        require(amount > 0, "No funds to withdraw");
        balances[msg.sender] = 0;
        emit LogFundsWithdrawn(msg.sender, amount);
 
        (bool success, ) = msg.sender.call.value(amount)("");
        require(success, "Transfer failed.");
   
    }

}

