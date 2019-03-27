pragma solidity 0.5.7;

import "./SigningLogic.sol";
import "./Initializable.sol";

/**
 * @title Bloom account registry
 * @notice Account Registry Logic allows users to link multiple addresses to the same owner
 *
 */
contract AccountRegistryLogic is Initializable, SigningLogic {
  /**
   * @notice The AccountRegistry constructor configures the signing logic implementation
   */
  constructor(
    address _initializer
  ) public Initializable(_initializer) SigningLogic("Bloom Account Registry", "2", 1) {}

  event AddressLinked(address indexed currentAddress, address indexed newAddress, uint256 indexed linkId);
  event AddressUnlinked(address indexed addressToRemove);

  // Counter to generate unique link Ids
  uint256 linkCounter;
  mapping(address => uint256) public linkIds;

  /**
   * @notice Add an address to an existing id on behalf of a user to pay the gas costs
   * @param _currentAddress Address to which user wants to link another address. May currently be linked to another address
   * @param _currentAddressSig Signed message from address currently associated with account confirming intention
   * @param _newAddress Address to add to account. Cannot currently be linked to another address
   * @param _newAddressSig Signed message from new address confirming ownership by the sender
   * @param _nonce hex string used when generating sigs to make them one time use
   */
  function linkAddresses(
    address _currentAddress,
    bytes calldata _currentAddressSig,
    address _newAddress,
    bytes calldata _newAddressSig,
    bytes32 _nonce
    ) external {
      // Confirm newAddress is not linked to another account
      require(linkIds[_newAddress] == 0);
      // Confirm new address is signed by current address and is unused
      validateLinkSignature(_currentAddress, _newAddress, _nonce, _currentAddressSig);

      // Confirm current address is signed by new address and is unused
      validateLinkSignature(_newAddress, _currentAddress, _nonce, _newAddressSig);

      // Get linkId of current address if exists. Otherwise use incremented linkCounter
      if (linkIds[_currentAddress] == 0) {
        linkIds[_currentAddress] = ++linkCounter;
      }
      linkIds[_newAddress] = linkIds[_currentAddress];

      emit AddressLinked(_currentAddress, _newAddress, linkIds[_currentAddress]);
  }

  /**
   * @notice Remove an address from a link relationship
   * @param _addressToRemove Address to unlink from all other addresses
   * @param _unlinkSignature Signed message from address currently associated with account confirming intention to unlink
   * @param _nonce hex string used when generating sigs to make them one time use
   */
  function unlinkAddress(
    address _addressToRemove,
    bytes32 _nonce,
    bytes calldata _unlinkSignature
  ) external {
    // Confirm unlink request is signed by sender and is unused
    validateUnlinkSignature(_addressToRemove, _nonce, _unlinkSignature);
    linkIds[_addressToRemove] = 0;

    emit AddressUnlinked(_addressToRemove);
  }

  /**
   * @notice Verify link signature is valid and unused V
   * @param _currentAddress Address signing intention to link
   * @param _addressToAdd Address being linked
   * @param _nonce Unique nonce for this request
   * @param _linkSignature Signature of address a
   */
  function validateLinkSignature(
    address _currentAddress,
    address _addressToAdd,
    bytes32 _nonce,
    bytes memory _linkSignature
  ) private {
    bytes32 _signatureDigest = generateAddAddressSchemaHash(_addressToAdd, _nonce);
    require(_currentAddress == recoverSigner(_signatureDigest, _linkSignature));
    burnSignatureDigest(_signatureDigest, _currentAddress);
  }

  /**
   * @notice Verify unlink signature is valid and unused 
   * @param _addressToRemove Address being unlinked
   * @param _nonce Unique nonce for this request
   * @param _unlinkSignature Signature of senderAddress
   */
  function validateUnlinkSignature(
    address _addressToRemove,
    bytes32 _nonce,
    bytes memory _unlinkSignature
  ) private {

    // require that address to remove is currently linked to senderAddress
    require(linkIds[_addressToRemove] != 0, "Address does not have active link");

    bytes32 _signatureDigest = generateRemoveAddressSchemaHash(_addressToRemove, _nonce);

    require(_addressToRemove == recoverSigner(_signatureDigest, _unlinkSignature));
    burnSignatureDigest(_signatureDigest, _addressToRemove);
  }

  /**
   * @notice Submit link completed prior to deployment of this contract
   * @dev Gives initializer privileges to write links during the initialization period without signatures
   * @param _currentAddress Address to which user wants to link another address. May currently be linked to another address
   * @param _newAddress Address to add to account. Cannot currently be linked to another address
   */
  function migrateLink(
    address _currentAddress,
    address _newAddress
  ) external onlyDuringInitialization {
    // Confirm newAddress is not linked to another account
    require(linkIds[_newAddress] == 0);

    // Get linkId of current address if exists. Otherwise use incremented linkCounter
    if (linkIds[_currentAddress] == 0) {
      linkIds[_currentAddress] = ++linkCounter;
    }
    linkIds[_newAddress] = linkIds[_currentAddress];

    emit AddressLinked(_currentAddress, _newAddress, linkIds[_currentAddress]);
  }

}
