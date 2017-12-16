pragma solidity 0.4.18;

import "./VotingCenter.sol";
import "./DependentOnIPFS.sol";

contract Poll is DependentOnIPFS {
  IPFSMultihash public pollDataMultihash;
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
    pollDataMultihash = ipfsMultihashFromBytes(_ipfsHash);
    author = _author;
  }

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
