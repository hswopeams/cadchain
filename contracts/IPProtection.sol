pragma solidity >=0.4.25 <0.6.0;

import "./Killable.sol";

contract IPProtection is Killable {

  struct Design {
    uint256 id;
    string name;
    uint256 registrationDateTime;
    mapping (address => bool) printedBy;
  }

  uint256 counter;
  mapping (address => Design) public designs;
  mapping (address => uint256) public balances;
  mapping (address => bool) registeredDesigners;
  mapping (address => bool) registeredPrinters;

  event LogDesignerRegistered(address indexed designer);
  event LogDesignerDeregistered(address indexed designer);
  event LogPrinterRegistered(address indexed printer);
  event LogPrinterDeregistered(address indexed printer);
  event LogDesignProtected(address indexed designer, string indexed name, uint256 id);
  
  constructor() public {}

  function() external {
    revert("Fallback function not available");
  }

  function registerDesigner(address designer) public onlyOwner returns (bool) {
    require(designer != address(0), "Designer is the zero address");
    require(!registeredDesigners[designer], "Designer shop already registered");
    registeredDesigners[designer] = true;
    emit LogDesignerRegistered(designer);
    return true;
  }

  function registerPrinter(address printer) public onlyOwner returns (bool) {
    require(printer != address(0), "Printer is the zero address");
    require(!registeredPrinters[printer], "Printer shop already registered");
    registeredPrinters[printer] = true;
    emit LogPrinterRegistered(printer);
    return true;
  }

  function deregisterDesigner(address designer) public onlyOwner returns (bool) {
      require(registeredDesigners[designer], "Designer shop not registered");
      registeredDesigners[designer] = false;
      emit LogDesignerDeregistered(designer);
      return true;
  }

  function deregisterPrinter(address printer) public onlyOwner returns (bool) {
      require(registeredPrinters[printer], "Printer shop not registered");
      registeredPrinters[printer] = false;
      emit LogPrinterDeregistered(printer);
      return true;
  }

}

