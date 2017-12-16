pragma solidity 0.4.18;

/**
 * @title IPFS hash handler
 *
 * @dev IPFS multihash handler. Supports taking a variable length bytes type
 *   and converting the data into a tighly packed struct for each part of the hash.
 *   This is a convience over taking the three fields separately or requiring additional
 *   assembly off-chain in order to resolve the full multihash.
 *
 * @dev See multihash format: https://git.io/vbooc
 */
contract DependentOnIPFS {
  /**
   * Struct for holding the data contained in an IPFS multihash. For example, the
   * IPFS Multihash "QmPtkU87jX1SnyhjAgUwnirmabAmeASQ4wGfwxviJSA4wf" is the base58
   * encoded form of the following data:
   *
   *   ┌────┬────┬───────────────────────────────────────────────────────────────────┐
   *   │byte│byte│                             32 bytes                              │
   *   ├────┼────┼───────────────────────────────────────────────────────────────────┤
   *   │0x12│0x20│0x1714c8d0fa5dbe9e6c04059ddac50c3860fb0370d67af53f2bd51a4def656526 │
   *   └────┴────┴───────────────────────────────────────────────────────────────────┘
   *     ▲    ▲                                   ▲
   *     │    └───────────┐                       │
   * hash function    digest size             hash value
   *
   * The goal here is to accurately represent a multihash and store it efficiently so we
   * hardcode 32 bytes.
   */
  struct IPFSMultihash {
    uint8 hashFunction;
    uint8 size;
    bytes32 hash;
  }

  /**
   * @dev Convert a bytes value into an IPFSMultihash struct
   * @param _multihashBytes Bytes value, expected to be 34 bytes, to parse.
   */
  function ipfsMultihashFromBytes(bytes _multihashBytes) internal pure returns (IPFSMultihash) {
    uint8 _fn;
    uint8 _size;
    bytes32 _hash;

    assembly {
      // Seek forward beyond the length header and load the hash function byte
      _fn := byte(0, mload(add(_multihashBytes, 32)))
      // Seek forward one more byte beyond the hash function byte to get the digest size byte
      _size := byte(0, mload(add(_multihashBytes, 33)))
      // Seek forward to the hash portion and read the word
      _hash := mload(add(_multihashBytes, 34))
    }

    return IPFSMultihash(_fn, _size, _hash);
  }
}
