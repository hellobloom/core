pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./AccountRegistryInterface.sol";

/**
 * @title AccreditationRepo stores the whitelisted attesters
 * @notice Bloom stores a whitelist of accredited attesters.
 *  This list is queried during the whisper negotiation process
 *  to ensure trusted attesters are bidding on jobs.
 *  In future versions of this contract, accreditation will be sourced by the community
 */
contract AccreditationRepo is Ownable{
  address public admin;

  /**
   * @notice AccreditationRepo constructor sets the admin
   * @param _admin Address of admin which can grant and revoke accreditation
   */
  constructor(address _admin) public {
    admin = _admin;
  }

  // Map address to bool indicating accreditation
  mapping(address => bool) public accreditations;

  event AdminChanged(address oldAdmin, address newAdmin);
  event AccreditationGranted(address attester);
  event AccreditationRevoked(address attester);

  modifier onlyAdmin() {
    require(msg.sender == admin);
    _;
  }

  /**
   * @dev Zero address not allowed
   */
  modifier nonZero(address _address) {
    require(_address != 0);
    _;
  }

  /**
   * @notice grantAccreditation adds an attester address to the whitelist
   * @dev Restricted to admin which can be an externally owned account or a contract
   *  enabling vote based administration
   * @param _attester Address to whitelist
   */
  function grantAccreditation(address _attester) external onlyAdmin {
    require (!accreditations[_attester]);
    accreditations[_attester] = true;
    emit AccreditationGranted(_attester);
  }

  /**
   * @notice revokeAttestation removes an attester address from the whitelist
   * @dev Restricted to admin which can be an externally owned account or a contract
   *  enabling vote based administration
   * @param _attester Address to remove
   */
  function revokeAccreditation(address _attester) external onlyAdmin {
    require (accreditations[_attester]);
    accreditations[_attester] = false;
    emit AccreditationRevoked(_attester);
  }

  /**
   * @notice setAdmin changes the contract admin which has privileges to grant and revoke accreditation
   * @dev Restricted to contract owner
   * @param _newAdmin address of new admin user or contract
   */
  function setAdmin(address _newAdmin) public onlyOwner nonZero(_newAdmin) {
    address _oldAdmin = admin;
    require (_newAdmin != _oldAdmin);
    admin = _newAdmin;
    emit AdminChanged(_oldAdmin, _newAdmin);
  }
}
