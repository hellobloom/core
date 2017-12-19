pragma solidity 0.4.18;

import "./VotingCenter.sol";
import "./DependentOnIPFS.sol";

/**
 * @title Voteable poll with associated IPFS data
 *
 * A poll records votes on a variable number of choices. A poll specifies
 * a window during which users can vote. Information like the poll title and
 * the descriptions for each option are stored on IPFS.
 */
contract Poll is DependentOnIPFS {
  bytes public pollDataMultihash;
  uint16 public numChoices;
  uint256 public startTime;
  uint256 public endTime;
  address public author;

  mapping(address => uint16) public votes;

  event Vote(address indexed voter, uint16 indexed choice);

  function Poll(
    bytes _ipfsHash,
    uint16 _numChoices,
    uint256 _startTime,
    uint256 _endTime,
    address _author
  ) public {
    numChoices = _numChoices;
    startTime = _startTime;
    endTime = _endTime;
    pollDataMultihash = _ipfsHash;
    author = _author;

    require(isValidIPFSMultihash(pollDataMultihash));
  }

  /**
   * @dev Cast or change your vote
   * @param _choice The index of the option in the corresponding IPFS document.
   */
  function vote(uint16 _choice) public duringPoll {
    // Choices are indexed from 1 since the mapping returns 0 for "no vote cast"
    require(_choice <= numChoices && _choice > 0);

    votes[msg.sender] = _choice;
    Vote(msg.sender, _choice);
  }

  modifier duringPoll {
    require(now >= startTime && now <= endTime);
    _;
  }
}
