pragma solidity >=0.4.25 <0.6.0;

import "./Killable.sol";

contract IPProtection is Killable {

  struct Design {
    uint256 id;
    bytes32 name;
    uint256 registrationDateTime;
    mapping (address => bool) usedBy;
  }

  uint256 public counter;
  mapping (address => Design) public designs;
  mapping (address => uint256) public balances;
  mapping (address => bool) registeredDesigners;
  mapping (address => bool) registeredPrinters;

  event LogDesignerRegistered(address indexed designer);
  event LogDesignerDeregistered(address indexed designer);
  event LogPrinterRegistered(address indexed printer);
  event LogPrinterDeregistered(address indexed printer);
  event LogDesignProtected(address indexed designer, bytes32 indexed name, uint256 id);
  event LogDesignPurchaseApproved(address indexed printer, uint256 indexed designId, bool approved);
  
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
    designs[msg.sender] = Design(counter, name, now);
    emit LogDesignProtected(msg.sender, name, counter);
  }



}

