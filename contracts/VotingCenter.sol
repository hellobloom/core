pragma solidity 0.5.9;

import "./Poll.sol";

/*
 * @title Bloom voting center
 * @dev The voting center is the home of all polls conducted within the Bloom network.
 *   Anyone can create a new poll and there is no "owner" of the network. The Bloom dApp
 *   assumes that all polls are in the `polls` field so any Bloom poll should be created
 *   through the `createPoll` function.
 */
contract VotingCenter {
  Poll[] public polls;

  event PollCreated(address indexed poll, address indexed author);

  /**
   * @dev create a poll and store the address of the poll in this contract
   * @param _ipfsHash Multihash for IPFS file containing poll information
   * @param _numOptions Number of choices in this poll
   * @param _startTime Time after which a user can cast a vote in the poll
   * @param _endTime Time after which the poll no longer accepts new votes
   * @return The address of the new Poll
   */
  function createPoll(
    string calldata _name,
    uint256 _chainId,
    bytes calldata _ipfsHash,
    uint16 _numOptions,
    uint256 _startTime,
    uint256 _endTime
  ) external returns (address) {
    Poll newPoll = new Poll(
      _name,
      _chainId,
      _ipfsHash,
      _numOptions,
      _startTime,
      _endTime,
      msg.sender
      );
    polls.push(newPoll);

    emit PollCreated(address(newPoll), msg.sender);

    return address(newPoll);
  }

  function allPolls() external view returns (Poll[] memory) {
    return polls;
  }

  function numPolls() external view returns (uint256) {
    return polls.length;
  }
}
