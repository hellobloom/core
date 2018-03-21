pragma solidity ^0.4.18;

/**
 * @title IPFS hash handler
 *
 * @dev IPFS multihash handler. Does a small check to validate that a multihash is
 *   correct by validating the digest size byte of the hash. For example, the IPFS
 *   Multihash "QmPtkU87jX1SnyhjAgUwnirmabAmeASQ4wGfwxviJSA4wf" is the base58
 *   encoded form of the following data:
 *
 *     ┌────┬────┬───────────────────────────────────────────────────────────────────┐
 *     │byte│byte│             variable length hash based on digest size             │
 *     ├────┼────┼───────────────────────────────────────────────────────────────────┤
 *     │0x12│0x20│0x1714c8d0fa5dbe9e6c04059ddac50c3860fb0370d67af53f2bd51a4def656526 │
 *     └────┴────┴───────────────────────────────────────────────────────────────────┘
 *       ▲    ▲                                   ▲
 *       │    └───────────┐                       │
 *   hash function    digest size             hash value
 *
 * we still store the data as `bytes` since it is inherently a variable length structure.
 *
 * @dev See multihash format: https://git.io/vbooc
 */
contract DependentOnIPFS {
  /**
   * @dev Validate a multihash bytes value
   */
  function isValidIPFSMultihash(bytes _multihashBytes) internal pure returns (bool) {
    require(_multihashBytes.length > 2);

    uint8 _size;

    // There isn't another way to extract only this byte into a uint8
    // solhint-disable no-inline-assembly
    assembly {
      // Seek forward 33 bytes beyond the solidity length value and the hash function byte
      _size := byte(0, mload(add(_multihashBytes, 33)))
    }

    return (_multihashBytes.length == _size + 2);
  }
}
