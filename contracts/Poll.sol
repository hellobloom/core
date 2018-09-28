pragma solidity 0.4.24;

import "./VotingCenter.sol";
import "./DependentOnIPFS.sol";
import "./AccountRegistryInterface.sol";
import "./SigningLogicInterface.sol";

/**
 * @title Voteable poll with associated IPFS data
 *
 * A poll records votes on a variable number of choices. A poll specifies
 * a window during which users can vote. Information like the poll title and
 * the descriptions for each option are stored on IPFS.
 */
contract Poll is DependentOnIPFS {
  // There isn't a way around using time to determine when votes can be cast
  // solhint-disable not-rely-on-time

  bytes public pollDataMultihash;
  uint16 public numChoices;
  uint256 public startTime;
  uint256 public endTime;
  address public author;
  address public pollAdmin;

  AccountRegistryInterface public registry;
  SigningLogicInterface public signingLogic;

  mapping(uint256 => uint16) public votes;

  mapping (bytes32 => bool) public usedSignatures;

  event VoteCast(address indexed voter, uint16 indexed choice);

  constructor(
    bytes _ipfsHash,
    uint16 _numChoices,
    uint256 _startTime,
    uint256 _endTime,
    address _author,
    AccountRegistryInterface _registry,
    SigningLogicInterface _signingLogic,
    address _pollAdmin
  ) public {
    require(_startTime >= now && _endTime > _startTime);
    require(isValidIPFSMultihash(_ipfsHash));

    numChoices = _numChoices;
    startTime = _startTime;
    endTime = _endTime;
    pollDataMultihash = _ipfsHash;
    author = _author;
    registry = _registry;
    signingLogic = _signingLogic;
    pollAdmin = _pollAdmin;
  }

  function vote(uint16 _choice) external {
    voteForUser(_choice, msg.sender);
  }

  function voteFor(uint16 _choice, address _voter, bytes32 _nonce, bytes _delegationSig) external onlyPollAdmin {
    require(!usedSignatures[keccak256(abi.encodePacked(_delegationSig))], "Signature not unique");
    usedSignatures[keccak256(abi.encodePacked(_delegationSig))] = true;
    bytes32 _delegationDigest = signingLogic.generateVoteForDelegationSchemaHash(
      _choice,
      _voter,
      _nonce,
      this
    );
    require(_voter == signingLogic.recoverSigner(_delegationDigest, _delegationSig));
    voteForUser(_choice, _voter);
  }

  /**
   * @dev Cast or change your vote
   * @param _choice The index of the option in the corresponding IPFS document.
   */
  function voteForUser(uint16 _choice, address _voter) internal duringPoll {
    // Choices are indexed from 1 since the mapping returns 0 for "no vote cast"
    require(_choice <= numChoices && _choice > 0);
    uint256 _voterId = registry.accountIdForAddress(_voter);

    votes[_voterId] = _choice;
    emit VoteCast(_voter, _choice);
  }

  modifier duringPoll {
    require(now >= startTime && now <= endTime);
    _;
  }

  modifier onlyPollAdmin {
    require(msg.sender == pollAdmin);
    _;
  }
}
