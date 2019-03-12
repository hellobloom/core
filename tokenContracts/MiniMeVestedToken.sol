pragma solidity ^0.4.15;

import "./MiniMeToken.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/math/Math.sol";

/*
    Based on MiniMeIrrevocableVestedToken from https://git.io/vdTQI

    SafeMath – Copyright (c) 2016 Smart Contract Solutions, Inc.
    MiniMeToken – Copyright 2017, Jordi Baylina (Giveth)
    Aragon Foundation - Copyright 2017, Jorge Izquierdo
 */

// @dev MiniMeVestedToken is a combination of the MiniMeToken adding the ability to
// createTokenGrants and revokeTokenGrants from VestedToken by OpenZeppelin.
//
// You can think of this contact as being a merging of VestedToken and MiniMeToken
// that makes small modifications for checking and altering balance so that the two
// separate contracts interoperate properly.
//
// For simplicity, token grants are not saved in MiniMe type checkpoints.
// Vanilla cloning BLT will clone it into a MiniMeToken without vesting.
// More complex cloning could account for past vesting calendars.
contract MiniMeVestedToken is MiniMeToken {
  using SafeMath for uint256;
  using Math for uint64;

  struct TokenGrant {
    address granter;     // 20 bytes
    uint256 value;       // 32 bytes
    uint64 cliff;
    uint64 vesting;
    uint64 start;        // 3 * 8 = 24 bytes
    bool revokable;
    bool burnsOnRevoke;  // 2 * 1 = 2 bits? or 2 bytes?
  } // total 78 bytes = 3 sstore per operation (32 per sstore)

  event NewTokenGrant(address indexed from, address indexed to, uint256 value, uint256 grantId);

  mapping (address => TokenGrant[]) public grants;

  mapping (address => bool) public canCreateGrants;
  address public vestingWhitelister;

  modifier canTransfer(address _sender, uint _value) {
    require(spendableBalanceOf(_sender) >= _value);
    _;
  }

  modifier onlyVestingWhitelister {
    require(msg.sender == vestingWhitelister);
    _;
  }

  function MiniMeVestedToken (
      address _tokenFactory,
      address _parentToken,
      uint _parentSnapShotBlock,
      string _tokenName,
      uint8 _decimalUnits,
      string _tokenSymbol,
      bool _transfersEnabled
  ) public
    MiniMeToken(_tokenFactory, _parentToken, _parentSnapShotBlock, _tokenName, _decimalUnits, _tokenSymbol, _transfersEnabled) {
    vestingWhitelister = msg.sender;
    doSetCanCreateGrants(vestingWhitelister, true);
  }

  // @dev Add canTransfer modifier before allowing transfer and transferFrom to go through
  function transfer(address _to, uint _value)
           public
           canTransfer(msg.sender, _value)
           returns (bool success) {
    return super.transfer(_to, _value);
  }

  function transferFrom(address _from, address _to, uint _value)
           public
           canTransfer(_from, _value)
           returns (bool success) {
    return super.transferFrom(_from, _to, _value);
  }

  function spendableBalanceOf(address _holder) public constant returns (uint) {
    return transferableTokens(_holder, uint64(now)); // solhint-disable not-rely-on-time
  }

  /**
   * @dev Grant tokens to a specified address
   * @param _to address The address which the tokens will be granted to.
   * @param _value uint256 The amount of tokens to be granted.
   * @param _start uint64 Time of the beginning of the grant.
   * @param _cliff uint64 Time of the cliff period.
   * @param _vesting uint64 The vesting period.
   */
  function grantVestedTokens(
    address _to,
    uint256 _value,
    uint64 _start,
    uint64 _cliff,
    uint64 _vesting,
    bool _revokable,
    bool _burnsOnRevoke
  ) public {
    // Check start, cliff and vesting are properly order to ensure correct functionality of the formula.
    require(_cliff >= _start);
    require(_vesting >= _start);
    require(_vesting >= _cliff);

    require(canCreateGrants[msg.sender]);
    require(tokenGrantsCount(_to) < 20);   // To prevent a user being spammed and have his balance locked (out of gas attack when calculating vesting).

    TokenGrant memory grant = TokenGrant(
      _revokable ? msg.sender : 0,
      _value,
      _cliff,
      _vesting,
      _start,
      _revokable,
      _burnsOnRevoke
    );

    uint256 count = grants[_to].push(grant);

    assert(transfer(_to, _value));

    NewTokenGrant(msg.sender, _to, _value, count - 1);
  }

  function setCanCreateGrants(address _addr, bool _allowed)
           public onlyVestingWhitelister {
    doSetCanCreateGrants(_addr, _allowed);
  }

  function changeVestingWhitelister(address _newWhitelister) public onlyVestingWhitelister {
    doSetCanCreateGrants(vestingWhitelister, false);
    vestingWhitelister = _newWhitelister;
    doSetCanCreateGrants(vestingWhitelister, true);
  }

  /**
   * @dev Revoke the grant of tokens of a specifed address.
   * @param _holder The address which will have its tokens revoked.
   * @param _receiver Recipient of revoked tokens.
   * @param _grantId The id of the token grant.
   */
  function revokeTokenGrant(address _holder, address _receiver, uint256 _grantId) public onlyVestingWhitelister {
    TokenGrant storage grant = grants[_holder][_grantId];

    require(grant.revokable);
    require(grant.granter == msg.sender); // Only granter can revoke it

    address receiver = grant.burnsOnRevoke ? 0xdead : _receiver;

    uint256 nonVested = nonVestedTokens(grant, uint64(now));

    // remove grant from array
    delete grants[_holder][_grantId];
    grants[_holder][_grantId] = grants[_holder][grants[_holder].length.sub(1)];
    grants[_holder].length -= 1;

    doTransfer(_holder, receiver, nonVested);
  }

  /**
   * @dev Check the amount of grants that an address has.
   * @param _holder The holder of the grants.
   * @return A uint256 representing the total amount of grants.
   */
  function tokenGrantsCount(address _holder) public constant returns (uint index) {
    return grants[_holder].length;
  }

  /**
   * @dev Get all information about a specific grant.
   * @param _holder The address which will have its tokens revoked.
   * @param _grantId The id of the token grant.
   * @return Returns all the values that represent a TokenGrant(address, value, start, cliff,
   * revokability, burnsOnRevoke, and vesting) plus the vested value at the current time.
   */
  function tokenGrant(address _holder, uint256 _grantId) public constant returns (address granter, uint256 value, uint256 vested, uint64 start, uint64 cliff, uint64 vesting, bool revokable, bool burnsOnRevoke) {
    TokenGrant storage grant = grants[_holder][_grantId];

    granter = grant.granter;
    value = grant.value;
    start = grant.start;
    cliff = grant.cliff;
    vesting = grant.vesting;
    revokable = grant.revokable;
    burnsOnRevoke = grant.burnsOnRevoke;

    vested = vestedTokens(grant, uint64(now));
  }

  // @dev The date in which all tokens are transferable for the holder
  // Useful for displaying purposes (not used in any logic calculations)
  function lastTokenIsTransferableDate(address holder) public constant returns (uint64 date) {
    date = uint64(now);
    uint256 grantIndex = tokenGrantsCount(holder);
    for (uint256 i = 0; i < grantIndex; i++) {
      date = grants[holder][i].vesting.max64(date);
    }
    return date;
  }

  // @dev How many tokens can a holder transfer at a point in time
  function transferableTokens(address holder, uint64 time) public constant returns (uint256) {
    uint256 grantIndex = tokenGrantsCount(holder);

    if (grantIndex == 0) return balanceOf(holder); // shortcut for holder without grants

    // Iterate through all the grants the holder has, and add all non-vested tokens
    uint256 nonVested = 0;
    for (uint256 i = 0; i < grantIndex; i++) {
      nonVested = nonVested.add(nonVestedTokens(grants[holder][i], time));
    }

    // Balance - totalNonVested is the amount of tokens a holder can transfer at any given time
    return balanceOf(holder).sub(nonVested);
  }

  function doSetCanCreateGrants(address _addr, bool _allowed)
           internal {
    canCreateGrants[_addr] = _allowed;
  }

  /**
   * @dev Calculate amount of vested tokens at a specific time
   * @param tokens uint256 The amount of tokens granted
   * @param time uint64 The time to be checked
   * @param start uint64 The time representing the beginning of the grant
   * @param cliff uint64  The cliff period, the period before nothing can be paid out
   * @param vesting uint64 The vesting period
   * @return An uint256 representing the amount of vested tokens of a specific grant
   *  transferableTokens
   *   |                         _/--------   vestedTokens rect
   *   |                       _/
   *   |                     _/
   *   |                   _/
   *   |                 _/
   *   |                /
   *   |              .|
   *   |            .  |
   *   |          .    |
   *   |        .      |
   *   |      .        |
   *   |    .          |
   *   +===+===========+---------+----------> time
   *      Start       Cliff    Vesting
   */
  function calculateVestedTokens(
    uint256 tokens,
    uint256 time,
    uint256 start,
    uint256 cliff,
    uint256 vesting) internal constant returns (uint256)
    {

    // Shortcuts for before cliff and after vesting cases.
    if (time < cliff) return 0;
    if (time >= vesting) return tokens;

    // Interpolate all vested tokens.
    // As before cliff the shortcut returns 0, we can use just this function to
    // calculate it.

    // vested = tokens * (time - start) / (vesting - start)
    uint256 vested = tokens.mul(
                             time.sub(start)
                           ).div(vesting.sub(start));

    return vested;
  }

  /**
   * @dev Calculate the amount of non vested tokens at a specific time.
   * @param grant TokenGrant The grant to be checked.
   * @param time uint64 The time to be checked
   * @return An uint256 representing the amount of non vested tokens of a specific grant on the
   * passed time frame.
   */
  function nonVestedTokens(TokenGrant storage grant, uint64 time) internal constant returns (uint256) {
    // Of all the tokens of the grant, how many of them are not vested?
    // grantValue - vestedTokens
    return grant.value.sub(vestedTokens(grant, time));
  }

  /**
   * @dev Get the amount of vested tokens at a specific time.
   * @param grant TokenGrant The grant to be checked.
   * @param time The time to be checked
   * @return An uint256 representing the amount of vested tokens of a specific grant at a specific time.
   */
  function vestedTokens(TokenGrant grant, uint64 time) private constant returns (uint256) {
    return calculateVestedTokens(
      grant.value,
      uint256(time),
      uint256(grant.start),
      uint256(grant.cliff),
      uint256(grant.vesting)
    );
  }
}
