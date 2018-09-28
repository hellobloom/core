pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/ownership/HasNoEther.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";

// @title Airdrop proxy contract for BLT
// @author Dustin van Schouwen
// @notice Handles simple airdrops for BLT
contract AirdropProxy is Ownable, HasNoEther, Pausable {
  using SafeERC20 for ERC20;
  ERC20 public token;

  // @notice Mapping to describe which addresses are managers
  mapping(address => bool) managers_map;

  event AddManager(address _address);
  event RemoveManager(address _address);

  // @notice Initializes contract
  constructor(ERC20 _token) public {
    token = _token;
    managers_map[msg.sender] = true;
  }

  // @notice Prevents non-managers from running some functions
  modifier onlyManager { 
    require(managers_map[msg.sender], "Must be a manager");
    _;
  }

  // @notice Function for owner of contract to add new manager
  function addManager(address _manager) public onlyOwner {
    managers_map[_manager] = true;
    emit AddManager(_manager);
  }

  // @notice Function for owner of contract to remove manager
  function removeManager(address _oldManager) public onlyOwner {
    require(isManager(_oldManager), "Address is not currently a manager");
    managers_map[_oldManager] = false;
    emit RemoveManager(_oldManager);
  } 

  // @notice Function for a contract manager to airdrop BLT to an address
  function airdrop(address _to, uint256 _amount) public onlyManager whenNotPaused {
    require(token.balanceOf(address(this)) > _amount, "Not enough tokens to fulfill");
    require(_amount < 10 ether, "Amount exceeds max allowed amount");
    token.transfer(_to, _amount);
  }

  // @notice Function to return true/false re: an address being a manager
  function isManager(address _address) public view returns (bool) {
    return managers_map[_address] == true;
  }

  // @notice Function to withdraw all tokens from contract
  function withdrawAllTokens(address _to) public onlyOwner {
    token.transfer(_to, token.balanceOf(address(this)));
  }
}

