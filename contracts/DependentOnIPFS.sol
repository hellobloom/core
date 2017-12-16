pragma solidity 0.4.18;

contract DependentOnIPFS {
  struct IPFSMultihash {
    uint8 hashFunction;
    uint8 size;
    bytes32 hash;
  }

  function ipfsMultihashFromBytes(bytes _multihashBytes) internal pure returns (IPFSMultihash) {
    uint8 _fn;
    uint8 _size;
    bytes32 _hash;

    assembly {
      _fn := byte(0, mload(add(_multihashBytes, 32)))
      _size := byte(0, mload(add(_multihashBytes, 33)))
      _hash := mload(add(_multihashBytes, 34))
    }

    return IPFSMultihash(_fn, _size, _hash);
  }
}
