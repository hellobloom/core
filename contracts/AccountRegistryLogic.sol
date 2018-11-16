pragma solidity 0.4.24;

import "./SigningLogicInterface.sol";

/**
 * @title Bloom account registry
 * @notice Account Registry Logic allows users to link multiple addresses to the same owner
 *
 */
contract AccountRegistryLogic {

  SigningLogicInterface public signingLogic;

  /**
   * @notice The AccountRegistry constructor configures the signing logic implementation
   * @param _signingLogic The address of the deployed SigningLogic contract
   */
  constructor(
    SigningLogicInterface _signingLogic
    ) public {
    signingLogic = _signingLogic;
  }

  event AddressLinked(address indexed addressA, address indexed addressB, uint256 indexed linkId);
  event AddressUnlinked(address indexed senderAddress, address indexed addressToRemove);

  // Signatures contain a nonce to make them unique. usedSignatures tracks which signatures
  //  have been used so they can't be replayed
  mapping (bytes32 => bool) public usedSignatures;

  // Counter to generate unique link Ids
  uint256 linkCounter;
  mapping(address => uint256) public linkIds;

  /**
   * @notice Add an address to an existing id on behalf of a user to pay the gas costs
   * @param _currentAddress Address to which user wants to link another address. May currently be linked to another address
   * @param _currentAddressSig Signed message from address currently associated with account confirming intention
   * @param _newAddress Address to add to account. Cannot currently be linked to another address
   * @param _newAddressSig Signed message from new address confirming ownership by the sender
   * @param _nonce uuid used when generating sigs to make them one time use
   */
  function linkAddresses(
    address _currentAddress,
    bytes _currentAddressSig,
    address _newAddress,
    bytes _newAddressSig,
    bytes32 _nonce
    ) public {
      // Confirm newAddress is not linked to another account
      require(linkIds[_newAddress] == 0);
      // Confirm new address is signed by current address
      validateLinkSignature(_currentAddress, _newAddress, _nonce, _currentAddressSig);
      // Confirm current address is signed by new address
      validateLinkSignature(_newAddress, _currentAddress, _nonce, _newAddressSig);

      // Get linkId of current address if exists. Otherwise use incremented linkCounter
      if (linkIds[_currentAddress] == 0) {
        linkIds[_currentAddress] = ++linkCounter;
      }
      linkIds[_newAddress] = linkIds[_currentAddress];

      emit AddressLinked(_currentAddress, _newAddress, linkIds[_currentAddress]);
  }

  function unlinkAddress(
    address _senderAddress,
    address _addressToRemove,
    bytes32 _nonce,
    bytes _unlinkSignature
  ) public {
    // Confirm unlink request is signed by sender
    validateUnlinkSignature(_senderAddress, _addressToRemove, _nonce, _unlinkSignature);
    linkIds[_addressToRemove] = 0;

    emit AddressUnlinked(_senderAddress, _addressToRemove);
  }

  /**
   * @notice Verify link signature is valid and unused V
   * @param _addressA Address signing intention to link
   * @param _addressB Address being linked
   * @param _nonce Unique nonce for this request
   * @param _linkSignature Signature of address a
   */
  function validateLinkSignature(
    address _addressA,
    address _addressB,
    bytes32 _nonce,
    bytes _linkSignature
  ) public {

    require(!usedSignatures[keccak256(abi.encodePacked(_linkSignature))], "Signature not unique");
    usedSignatures[keccak256(abi.encodePacked(_linkSignature))] = true;

    require(_addressA == signingLogic.recoverSigner(
      signingLogic.generateAddAddressSchemaHash(
      _addressB,
      _nonce
    ), _linkSignature));
  }

  /**
   * @notice Verify unlink signature is valid and unused 
   * @param _senderAddress Address requesting unlink
   * @param _addressToRemove Address being unlinked
   * @param _nonce Unique nonce for this request
   * @param _unlinkSignature Signature of senderAddress
   */
  function validateUnlinkSignature(
    address _senderAddress,
    address _addressToRemove,
    bytes32 _nonce,
    bytes _unlinkSignature
  ) public {

    require(!usedSignatures[keccak256(abi.encodePacked(_unlinkSignature))], "Signature not unique");
    usedSignatures[keccak256(abi.encodePacked(_unlinkSignature))] = true;

    require(_senderAddress == signingLogic.recoverSigner(
      signingLogic.generateRemoveAddressSchemaHash(
      _addressToRemove,
      _nonce
    ), _unlinkSignature));
  }

}
