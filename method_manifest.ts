interface IContractMethodArgument {
  type: string
  index: number
}

interface IContractMethodManifest {
  methods: {
    [key: string]: {
      args_arr: string[]
      args: {
        [key: string]: IContractMethodArgument
      }
    }
  }
}
export enum EContractNames {
  "AccountRegistryLogic" = "AccountRegistryLogic",
  "AccreditationRepo" = "AccreditationRepo",
  "AirdropProxy" = "AirdropProxy",
  "ApproveAndCallFallBack" = "ApproveAndCallFallBack",
  "AttestationLogic" = "AttestationLogic",
  "BasicToken" = "BasicToken",
  "BLT" = "BLT",
  "Controlled" = "Controlled",
  "ConvertLib" = "ConvertLib",
  "DependentOnIPFS" = "DependentOnIPFS",
  "ECRecovery" = "ECRecovery",
  "ERC20" = "ERC20",
  "ERC20Basic" = "ERC20Basic",
  "HasNoEther" = "HasNoEther",
  "Initializable" = "Initializable",
  "Math" = "Math",
  "MetaCoin" = "MetaCoin",
  "Migrations" = "Migrations",
  "MiniMeToken" = "MiniMeToken",
  "MiniMeTokenFactory" = "MiniMeTokenFactory",
  "MiniMeVestedToken" = "MiniMeVestedToken",
  "MockBLT" = "MockBLT",
  "Ownable" = "Ownable",
  "Pausable" = "Pausable",
  "Poll" = "Poll",
  "SafeERC20" = "SafeERC20",
  "SafeMath" = "SafeMath",
  "SigningLogic" = "SigningLogic",
  "StandardToken" = "StandardToken",
  "TokenController" = "TokenController",
  "TokenEscrowMarketplace" = "TokenEscrowMarketplace",
  "VotingCenter" = "VotingCenter"
}

export type TContractNames = keyof typeof EContractNames

export const AccountRegistryLogic: IContractMethodManifest = {
  methods: {
    initializing: {
      args_arr: [],
      args: {}
    },
    initializer: {
      args_arr: [],
      args: {}
    },
    linkIds: {
      args_arr: ["anonymous_0"],
      args: {
        anonymous_0: {
          type: "address",
          index: 0
        }
      }
    },
    endInitialization: {
      args_arr: [],
      args: {}
    },
    usedSignatures: {
      args_arr: ["anonymous_0"],
      args: {
        anonymous_0: {
          type: "bytes32",
          index: 0
        }
      }
    },

    linkAddresses: {
      args_arr: ["_currentAddress", "_currentAddressSig", "_newAddress", "_newAddressSig", "_nonce"],
      args: {
        _currentAddress: {
          type: "address",
          index: 0
        },
        _currentAddressSig: {
          type: "bytes",
          index: 1
        },
        _newAddress: {
          type: "address",
          index: 2
        },
        _newAddressSig: {
          type: "bytes",
          index: 3
        },
        _nonce: {
          type: "bytes32",
          index: 4
        }
      }
    },
    unlinkAddress: {
      args_arr: ["_addressToRemove", "_nonce", "_unlinkSignature"],
      args: {
        _addressToRemove: {
          type: "address",
          index: 0
        },
        _nonce: {
          type: "bytes32",
          index: 1
        },
        _unlinkSignature: {
          type: "bytes",
          index: 2
        }
      }
    },
    migrateLink: {
      args_arr: ["_currentAddress", "_newAddress"],
      args: {
        _currentAddress: {
          type: "address",
          index: 0
        },
        _newAddress: {
          type: "address",
          index: 1
        }
      }
    }
  }
}

export const AccreditationRepo: IContractMethodManifest = {
  methods: {
    accreditations: {
      args_arr: ["anonymous_0"],
      args: {
        anonymous_0: {
          type: "address",
          index: 0
        }
      }
    },
    owner: {
      args_arr: [],
      args: {}
    },
    transferOwnership: {
      args_arr: ["newOwner"],
      args: {
        newOwner: {
          type: "address",
          index: 0
        }
      }
    },
    admin: {
      args_arr: [],
      args: {}
    },

    grantAccreditation: {
      args_arr: ["_attester"],
      args: {
        _attester: {
          type: "address",
          index: 0
        }
      }
    },
    revokeAccreditation: {
      args_arr: ["_attester"],
      args: {
        _attester: {
          type: "address",
          index: 0
        }
      }
    },
    setAdmin: {
      args_arr: ["_newAdmin"],
      args: {
        _newAdmin: {
          type: "address",
          index: 0
        }
      }
    }
  }
}

export const AirdropProxy: IContractMethodManifest = {
  methods: {
    unpause: {
      args_arr: [],
      args: {}
    },
    paused: {
      args_arr: [],
      args: {}
    },
    pause: {
      args_arr: [],
      args: {}
    },
    owner: {
      args_arr: [],
      args: {}
    },
    reclaimEther: {
      args_arr: [],
      args: {}
    },
    transferOwnership: {
      args_arr: ["newOwner"],
      args: {
        newOwner: {
          type: "address",
          index: 0
        }
      }
    },
    token: {
      args_arr: [],
      args: {}
    },

    addManager: {
      args_arr: ["_manager"],
      args: {
        _manager: {
          type: "address",
          index: 0
        }
      }
    },
    removeManager: {
      args_arr: ["_oldManager"],
      args: {
        _oldManager: {
          type: "address",
          index: 0
        }
      }
    },
    airdrop: {
      args_arr: ["_to", "_amount"],
      args: {
        _to: {
          type: "address",
          index: 0
        },
        _amount: {
          type: "uint256",
          index: 1
        }
      }
    },
    isManager: {
      args_arr: ["_address"],
      args: {
        _address: {
          type: "address",
          index: 0
        }
      }
    },
    withdrawAllTokens: {
      args_arr: ["_to"],
      args: {
        _to: {
          type: "address",
          index: 0
        }
      }
    }
  }
}

export const ApproveAndCallFallBack: IContractMethodManifest = {
  methods: {
    receiveApproval: {
      args_arr: ["from", "_amount", "_token", "_data"],
      args: {
        from: {
          type: "address",
          index: 0
        },
        _amount: {
          type: "uint256",
          index: 1
        },
        _token: {
          type: "address",
          index: 2
        },
        _data: {
          type: "bytes",
          index: 3
        }
      }
    }
  }
}

export const AttestationLogic: IContractMethodManifest = {
  methods: {
    initializing: {
      args_arr: [],
      args: {}
    },
    tokenEscrowMarketplace: {
      args_arr: [],
      args: {}
    },
    initializer: {
      args_arr: [],
      args: {}
    },
    endInitialization: {
      args_arr: [],
      args: {}
    },
    usedSignatures: {
      args_arr: ["anonymous_0"],
      args: {
        anonymous_0: {
          type: "bytes32",
          index: 0
        }
      }
    },

    attest: {
      args_arr: ["_subject", "_requester", "_reward", "_requesterSig", "_dataHash", "_requestNonce", "_subjectSig"],
      args: {
        _subject: {
          type: "address",
          index: 0
        },
        _requester: {
          type: "address",
          index: 1
        },
        _reward: {
          type: "uint256",
          index: 2
        },
        _requesterSig: {
          type: "bytes",
          index: 3
        },
        _dataHash: {
          type: "bytes32",
          index: 4
        },
        _requestNonce: {
          type: "bytes32",
          index: 5
        },
        _subjectSig: {
          type: "bytes",
          index: 6
        }
      }
    },
    attestFor: {
      args_arr: ["_subject", "_attester", "_requester", "_reward", "_requesterSig", "_dataHash", "_requestNonce", "_subjectSig", "_delegationSig"],
      args: {
        _subject: {
          type: "address",
          index: 0
        },
        _attester: {
          type: "address",
          index: 1
        },
        _requester: {
          type: "address",
          index: 2
        },
        _reward: {
          type: "uint256",
          index: 3
        },
        _requesterSig: {
          type: "bytes",
          index: 4
        },
        _dataHash: {
          type: "bytes32",
          index: 5
        },
        _requestNonce: {
          type: "bytes32",
          index: 6
        },
        _subjectSig: {
          type: "bytes",
          index: 7
        },
        _delegationSig: {
          type: "bytes",
          index: 8
        }
      }
    },
    contest: {
      args_arr: ["_requester", "_reward", "_requestNonce", "_requesterSig"],
      args: {
        _requester: {
          type: "address",
          index: 0
        },
        _reward: {
          type: "uint256",
          index: 1
        },
        _requestNonce: {
          type: "bytes32",
          index: 2
        },
        _requesterSig: {
          type: "bytes",
          index: 3
        }
      }
    },
    contestFor: {
      args_arr: ["_attester", "_requester", "_reward", "_requestNonce", "_requesterSig", "_delegationSig"],
      args: {
        _attester: {
          type: "address",
          index: 0
        },
        _requester: {
          type: "address",
          index: 1
        },
        _reward: {
          type: "uint256",
          index: 2
        },
        _requestNonce: {
          type: "bytes32",
          index: 3
        },
        _requesterSig: {
          type: "bytes",
          index: 4
        },
        _delegationSig: {
          type: "bytes",
          index: 5
        }
      }
    },
    migrateAttestation: {
      args_arr: ["_requester", "_attester", "_subject", "_dataHash"],
      args: {
        _requester: {
          type: "address",
          index: 0
        },
        _attester: {
          type: "address",
          index: 1
        },
        _subject: {
          type: "address",
          index: 2
        },
        _dataHash: {
          type: "bytes32",
          index: 3
        }
      }
    },
    revokeAttestation: {
      args_arr: ["_link"],
      args: {
        _link: {
          type: "bytes32",
          index: 0
        }
      }
    },
    revokeAttestationFor: {
      args_arr: ["_sender", "_link", "_nonce", "_delegationSig"],
      args: {
        _sender: {
          type: "address",
          index: 0
        },
        _link: {
          type: "bytes32",
          index: 1
        },
        _nonce: {
          type: "bytes32",
          index: 2
        },
        _delegationSig: {
          type: "bytes",
          index: 3
        }
      }
    },
    setTokenEscrowMarketplace: {
      args_arr: ["_newTokenEscrowMarketplace"],
      args: {
        _newTokenEscrowMarketplace: {
          type: "address",
          index: 0
        }
      }
    }
  }
}

export const BasicToken: IContractMethodManifest = {
  methods: {
    totalSupply: {
      args_arr: [],
      args: {}
    },
    transfer: {
      args_arr: ["_to", "_value"],
      args: {
        _to: {
          type: "address",
          index: 0
        },
        _value: {
          type: "uint256",
          index: 1
        }
      }
    },
    balanceOf: {
      args_arr: ["_owner"],
      args: {
        _owner: {
          type: "address",
          index: 0
        }
      }
    }
  }
}

export const BLT: IContractMethodManifest = {
  methods: {
    tokenGrantsCount: {
      args_arr: ["_holder"],
      args: {
        _holder: {
          type: "address",
          index: 0
        }
      }
    },
    name: {
      args_arr: [],
      args: {}
    },
    approve: {
      args_arr: ["_spender", "_amount"],
      args: {
        _spender: {
          type: "address",
          index: 0
        },
        _amount: {
          type: "uint256",
          index: 1
        }
      }
    },
    spendableBalanceOf: {
      args_arr: ["_holder"],
      args: {
        _holder: {
          type: "address",
          index: 0
        }
      }
    },
    creationBlock: {
      args_arr: [],
      args: {}
    },
    totalSupply: {
      args_arr: [],
      args: {}
    },
    canCreateGrants: {
      args_arr: ["anonymous_0"],
      args: {
        anonymous_0: {
          type: "address",
          index: 0
        }
      }
    },
    setCanCreateGrants: {
      args_arr: ["_addr", "_allowed"],
      args: {
        _addr: {
          type: "address",
          index: 0
        },
        _allowed: {
          type: "bool",
          index: 1
        }
      }
    },
    transferFrom: {
      args_arr: ["_from", "_to", "_value"],
      args: {
        _from: {
          type: "address",
          index: 0
        },
        _to: {
          type: "address",
          index: 1
        },
        _value: {
          type: "uint256",
          index: 2
        }
      }
    },
    grants: {
      args_arr: ["anonymous_0", "anonymous_1"],
      args: {
        anonymous_0: {
          type: "address",
          index: 0
        },
        anonymous_1: {
          type: "uint256",
          index: 1
        }
      }
    },
    decimals: {
      args_arr: [],
      args: {}
    },
    changeController: {
      args_arr: ["_newController"],
      args: {
        _newController: {
          type: "address",
          index: 0
        }
      }
    },
    balanceOfAt: {
      args_arr: ["_owner", "_blockNumber"],
      args: {
        _owner: {
          type: "address",
          index: 0
        },
        _blockNumber: {
          type: "uint256",
          index: 1
        }
      }
    },
    version: {
      args_arr: [],
      args: {}
    },
    tokenGrant: {
      args_arr: ["_holder", "_grantId"],
      args: {
        _holder: {
          type: "address",
          index: 0
        },
        _grantId: {
          type: "uint256",
          index: 1
        }
      }
    },
    createCloneToken: {
      args_arr: ["_cloneTokenName", "_cloneDecimalUnits", "_cloneTokenSymbol", "_snapshotBlock", "_transfersEnabled"],
      args: {
        _cloneTokenName: {
          type: "string",
          index: 0
        },
        _cloneDecimalUnits: {
          type: "uint8",
          index: 1
        },
        _cloneTokenSymbol: {
          type: "string",
          index: 2
        },
        _snapshotBlock: {
          type: "uint256",
          index: 3
        },
        _transfersEnabled: {
          type: "bool",
          index: 4
        }
      }
    },
    lastTokenIsTransferableDate: {
      args_arr: ["holder"],
      args: {
        holder: {
          type: "address",
          index: 0
        }
      }
    },
    balanceOf: {
      args_arr: ["_owner"],
      args: {
        _owner: {
          type: "address",
          index: 0
        }
      }
    },
    parentToken: {
      args_arr: [],
      args: {}
    },
    generateTokens: {
      args_arr: ["_owner", "_amount"],
      args: {
        _owner: {
          type: "address",
          index: 0
        },
        _amount: {
          type: "uint256",
          index: 1
        }
      }
    },
    symbol: {
      args_arr: [],
      args: {}
    },
    grantVestedTokens: {
      args_arr: ["_to", "_value", "_start", "_cliff", "_vesting", "_revokable", "_burnsOnRevoke"],
      args: {
        _to: {
          type: "address",
          index: 0
        },
        _value: {
          type: "uint256",
          index: 1
        },
        _start: {
          type: "uint64",
          index: 2
        },
        _cliff: {
          type: "uint64",
          index: 3
        },
        _vesting: {
          type: "uint64",
          index: 4
        },
        _revokable: {
          type: "bool",
          index: 5
        },
        _burnsOnRevoke: {
          type: "bool",
          index: 6
        }
      }
    },
    totalSupplyAt: {
      args_arr: ["_blockNumber"],
      args: {
        _blockNumber: {
          type: "uint256",
          index: 0
        }
      }
    },
    transfer: {
      args_arr: ["_to", "_value"],
      args: {
        _to: {
          type: "address",
          index: 0
        },
        _value: {
          type: "uint256",
          index: 1
        }
      }
    },
    revokeTokenGrant: {
      args_arr: ["_holder", "_receiver", "_grantId"],
      args: {
        _holder: {
          type: "address",
          index: 0
        },
        _receiver: {
          type: "address",
          index: 1
        },
        _grantId: {
          type: "uint256",
          index: 2
        }
      }
    },
    transfersEnabled: {
      args_arr: [],
      args: {}
    },
    parentSnapShotBlock: {
      args_arr: [],
      args: {}
    },
    approveAndCall: {
      args_arr: ["_spender", "_amount", "_extraData"],
      args: {
        _spender: {
          type: "address",
          index: 0
        },
        _amount: {
          type: "uint256",
          index: 1
        },
        _extraData: {
          type: "bytes",
          index: 2
        }
      }
    },
    transferableTokens: {
      args_arr: ["holder", "time"],
      args: {
        holder: {
          type: "address",
          index: 0
        },
        time: {
          type: "uint64",
          index: 1
        }
      }
    },
    destroyTokens: {
      args_arr: ["_owner", "_amount"],
      args: {
        _owner: {
          type: "address",
          index: 0
        },
        _amount: {
          type: "uint256",
          index: 1
        }
      }
    },
    allowance: {
      args_arr: ["_owner", "_spender"],
      args: {
        _owner: {
          type: "address",
          index: 0
        },
        _spender: {
          type: "address",
          index: 1
        }
      }
    },
    claimTokens: {
      args_arr: ["_token"],
      args: {
        _token: {
          type: "address",
          index: 0
        }
      }
    },
    vestingWhitelister: {
      args_arr: [],
      args: {}
    },
    tokenFactory: {
      args_arr: [],
      args: {}
    },
    enableTransfers: {
      args_arr: ["_transfersEnabled"],
      args: {
        _transfersEnabled: {
          type: "bool",
          index: 0
        }
      }
    },
    controller: {
      args_arr: [],
      args: {}
    },
    changeVestingWhitelister: {
      args_arr: ["_newWhitelister"],
      args: {
        _newWhitelister: {
          type: "address",
          index: 0
        }
      }
    }
  }
}

export const Controlled: IContractMethodManifest = {
  methods: {
    controller: {
      args_arr: [],
      args: {}
    },

    changeController: {
      args_arr: ["_newController"],
      args: {
        _newController: {
          type: "address",
          index: 0
        }
      }
    }
  }
}

export const ConvertLib: IContractMethodManifest = {
  methods: {
    convert: {
      args_arr: ["amount", "conversionRate"],
      args: {
        amount: {
          type: "uint256",
          index: 0
        },
        conversionRate: {
          type: "uint256",
          index: 1
        }
      }
    }
  }
}

export const DependentOnIPFS: IContractMethodManifest = {
  methods: {}
}

export const ECRecovery: IContractMethodManifest = {
  methods: {
    recover: {
      args_arr: ["hash", "sig"],
      args: {
        hash: {
          type: "bytes32",
          index: 0
        },
        sig: {
          type: "bytes",
          index: 1
        }
      }
    }
  }
}

export const ERC20: IContractMethodManifest = {
  methods: {
    totalSupply: {
      args_arr: [],
      args: {}
    },
    balanceOf: {
      args_arr: ["who"],
      args: {
        who: {
          type: "address",
          index: 0
        }
      }
    },
    transfer: {
      args_arr: ["to", "value"],
      args: {
        to: {
          type: "address",
          index: 0
        },
        value: {
          type: "uint256",
          index: 1
        }
      }
    },

    allowance: {
      args_arr: ["owner", "spender"],
      args: {
        owner: {
          type: "address",
          index: 0
        },
        spender: {
          type: "address",
          index: 1
        }
      }
    },
    transferFrom: {
      args_arr: ["from", "to", "value"],
      args: {
        from: {
          type: "address",
          index: 0
        },
        to: {
          type: "address",
          index: 1
        },
        value: {
          type: "uint256",
          index: 2
        }
      }
    },
    approve: {
      args_arr: ["spender", "value"],
      args: {
        spender: {
          type: "address",
          index: 0
        },
        value: {
          type: "uint256",
          index: 1
        }
      }
    }
  }
}

export const ERC20Basic: IContractMethodManifest = {
  methods: {
    totalSupply: {
      args_arr: [],
      args: {}
    },
    balanceOf: {
      args_arr: ["who"],
      args: {
        who: {
          type: "address",
          index: 0
        }
      }
    },
    transfer: {
      args_arr: ["to", "value"],
      args: {
        to: {
          type: "address",
          index: 0
        },
        value: {
          type: "uint256",
          index: 1
        }
      }
    }
  }
}

export const HasNoEther: IContractMethodManifest = {
  methods: {
    owner: {
      args_arr: [],
      args: {}
    },
    transferOwnership: {
      args_arr: ["newOwner"],
      args: {
        newOwner: {
          type: "address",
          index: 0
        }
      }
    },

    reclaimEther: {
      args_arr: [],
      args: {}
    }
  }
}

export const Initializable: IContractMethodManifest = {
  methods: {
    initializing: {
      args_arr: [],
      args: {}
    },
    initializer: {
      args_arr: [],
      args: {}
    },

    endInitialization: {
      args_arr: [],
      args: {}
    }
  }
}

export const Math: IContractMethodManifest = {
  methods: {}
}

export const MetaCoin: IContractMethodManifest = {
  methods: {
    sendCoin: {
      args_arr: ["receiver", "amount"],
      args: {
        receiver: {
          type: "address",
          index: 0
        },
        amount: {
          type: "uint256",
          index: 1
        }
      }
    },
    getBalanceInEth: {
      args_arr: ["addr"],
      args: {
        addr: {
          type: "address",
          index: 0
        }
      }
    },
    getBalance: {
      args_arr: ["addr"],
      args: {
        addr: {
          type: "address",
          index: 0
        }
      }
    }
  }
}

export const Migrations: IContractMethodManifest = {
  methods: {
    last_completed_migration: {
      args_arr: [],
      args: {}
    },
    owner: {
      args_arr: [],
      args: {}
    },

    setCompleted: {
      args_arr: ["completed"],
      args: {
        completed: {
          type: "uint256",
          index: 0
        }
      }
    },
    upgrade: {
      args_arr: ["new_address"],
      args: {
        new_address: {
          type: "address",
          index: 0
        }
      }
    }
  }
}

export const MiniMeToken: IContractMethodManifest = {
  methods: {
    name: {
      args_arr: [],
      args: {}
    },
    creationBlock: {
      args_arr: [],
      args: {}
    },
    decimals: {
      args_arr: [],
      args: {}
    },
    changeController: {
      args_arr: ["_newController"],
      args: {
        _newController: {
          type: "address",
          index: 0
        }
      }
    },
    version: {
      args_arr: [],
      args: {}
    },
    parentToken: {
      args_arr: [],
      args: {}
    },
    symbol: {
      args_arr: [],
      args: {}
    },
    transfersEnabled: {
      args_arr: [],
      args: {}
    },
    parentSnapShotBlock: {
      args_arr: [],
      args: {}
    },
    tokenFactory: {
      args_arr: [],
      args: {}
    },
    controller: {
      args_arr: [],
      args: {}
    },

    transfer: {
      args_arr: ["_to", "_amount"],
      args: {
        _to: {
          type: "address",
          index: 0
        },
        _amount: {
          type: "uint256",
          index: 1
        }
      }
    },
    transferFrom: {
      args_arr: ["_from", "_to", "_amount"],
      args: {
        _from: {
          type: "address",
          index: 0
        },
        _to: {
          type: "address",
          index: 1
        },
        _amount: {
          type: "uint256",
          index: 2
        }
      }
    },
    balanceOf: {
      args_arr: ["_owner"],
      args: {
        _owner: {
          type: "address",
          index: 0
        }
      }
    },
    approve: {
      args_arr: ["_spender", "_amount"],
      args: {
        _spender: {
          type: "address",
          index: 0
        },
        _amount: {
          type: "uint256",
          index: 1
        }
      }
    },
    allowance: {
      args_arr: ["_owner", "_spender"],
      args: {
        _owner: {
          type: "address",
          index: 0
        },
        _spender: {
          type: "address",
          index: 1
        }
      }
    },
    approveAndCall: {
      args_arr: ["_spender", "_amount", "_extraData"],
      args: {
        _spender: {
          type: "address",
          index: 0
        },
        _amount: {
          type: "uint256",
          index: 1
        },
        _extraData: {
          type: "bytes",
          index: 2
        }
      }
    },
    totalSupply: {
      args_arr: [],
      args: {}
    },
    balanceOfAt: {
      args_arr: ["_owner", "_blockNumber"],
      args: {
        _owner: {
          type: "address",
          index: 0
        },
        _blockNumber: {
          type: "uint256",
          index: 1
        }
      }
    },
    totalSupplyAt: {
      args_arr: ["_blockNumber"],
      args: {
        _blockNumber: {
          type: "uint256",
          index: 0
        }
      }
    },
    createCloneToken: {
      args_arr: ["_cloneTokenName", "_cloneDecimalUnits", "_cloneTokenSymbol", "_snapshotBlock", "_transfersEnabled"],
      args: {
        _cloneTokenName: {
          type: "string",
          index: 0
        },
        _cloneDecimalUnits: {
          type: "uint8",
          index: 1
        },
        _cloneTokenSymbol: {
          type: "string",
          index: 2
        },
        _snapshotBlock: {
          type: "uint256",
          index: 3
        },
        _transfersEnabled: {
          type: "bool",
          index: 4
        }
      }
    },
    generateTokens: {
      args_arr: ["_owner", "_amount"],
      args: {
        _owner: {
          type: "address",
          index: 0
        },
        _amount: {
          type: "uint256",
          index: 1
        }
      }
    },
    destroyTokens: {
      args_arr: ["_owner", "_amount"],
      args: {
        _owner: {
          type: "address",
          index: 0
        },
        _amount: {
          type: "uint256",
          index: 1
        }
      }
    },
    enableTransfers: {
      args_arr: ["_transfersEnabled"],
      args: {
        _transfersEnabled: {
          type: "bool",
          index: 0
        }
      }
    },
    claimTokens: {
      args_arr: ["_token"],
      args: {
        _token: {
          type: "address",
          index: 0
        }
      }
    }
  }
}

export const MiniMeTokenFactory: IContractMethodManifest = {
  methods: {
    createCloneToken: {
      args_arr: ["_parentToken", "_snapshotBlock", "_tokenName", "_decimalUnits", "_tokenSymbol", "_transfersEnabled"],
      args: {
        _parentToken: {
          type: "address",
          index: 0
        },
        _snapshotBlock: {
          type: "uint256",
          index: 1
        },
        _tokenName: {
          type: "string",
          index: 2
        },
        _decimalUnits: {
          type: "uint8",
          index: 3
        },
        _tokenSymbol: {
          type: "string",
          index: 4
        },
        _transfersEnabled: {
          type: "bool",
          index: 5
        }
      }
    }
  }
}

export const MiniMeVestedToken: IContractMethodManifest = {
  methods: {
    name: {
      args_arr: [],
      args: {}
    },
    approve: {
      args_arr: ["_spender", "_amount"],
      args: {
        _spender: {
          type: "address",
          index: 0
        },
        _amount: {
          type: "uint256",
          index: 1
        }
      }
    },
    creationBlock: {
      args_arr: [],
      args: {}
    },
    totalSupply: {
      args_arr: [],
      args: {}
    },
    canCreateGrants: {
      args_arr: ["anonymous_0"],
      args: {
        anonymous_0: {
          type: "address",
          index: 0
        }
      }
    },
    grants: {
      args_arr: ["anonymous_0", "anonymous_1"],
      args: {
        anonymous_0: {
          type: "address",
          index: 0
        },
        anonymous_1: {
          type: "uint256",
          index: 1
        }
      }
    },
    decimals: {
      args_arr: [],
      args: {}
    },
    changeController: {
      args_arr: ["_newController"],
      args: {
        _newController: {
          type: "address",
          index: 0
        }
      }
    },
    balanceOfAt: {
      args_arr: ["_owner", "_blockNumber"],
      args: {
        _owner: {
          type: "address",
          index: 0
        },
        _blockNumber: {
          type: "uint256",
          index: 1
        }
      }
    },
    version: {
      args_arr: [],
      args: {}
    },
    createCloneToken: {
      args_arr: ["_cloneTokenName", "_cloneDecimalUnits", "_cloneTokenSymbol", "_snapshotBlock", "_transfersEnabled"],
      args: {
        _cloneTokenName: {
          type: "string",
          index: 0
        },
        _cloneDecimalUnits: {
          type: "uint8",
          index: 1
        },
        _cloneTokenSymbol: {
          type: "string",
          index: 2
        },
        _snapshotBlock: {
          type: "uint256",
          index: 3
        },
        _transfersEnabled: {
          type: "bool",
          index: 4
        }
      }
    },
    balanceOf: {
      args_arr: ["_owner"],
      args: {
        _owner: {
          type: "address",
          index: 0
        }
      }
    },
    parentToken: {
      args_arr: [],
      args: {}
    },
    generateTokens: {
      args_arr: ["_owner", "_amount"],
      args: {
        _owner: {
          type: "address",
          index: 0
        },
        _amount: {
          type: "uint256",
          index: 1
        }
      }
    },
    symbol: {
      args_arr: [],
      args: {}
    },
    totalSupplyAt: {
      args_arr: ["_blockNumber"],
      args: {
        _blockNumber: {
          type: "uint256",
          index: 0
        }
      }
    },
    transfersEnabled: {
      args_arr: [],
      args: {}
    },
    parentSnapShotBlock: {
      args_arr: [],
      args: {}
    },
    approveAndCall: {
      args_arr: ["_spender", "_amount", "_extraData"],
      args: {
        _spender: {
          type: "address",
          index: 0
        },
        _amount: {
          type: "uint256",
          index: 1
        },
        _extraData: {
          type: "bytes",
          index: 2
        }
      }
    },
    destroyTokens: {
      args_arr: ["_owner", "_amount"],
      args: {
        _owner: {
          type: "address",
          index: 0
        },
        _amount: {
          type: "uint256",
          index: 1
        }
      }
    },
    allowance: {
      args_arr: ["_owner", "_spender"],
      args: {
        _owner: {
          type: "address",
          index: 0
        },
        _spender: {
          type: "address",
          index: 1
        }
      }
    },
    claimTokens: {
      args_arr: ["_token"],
      args: {
        _token: {
          type: "address",
          index: 0
        }
      }
    },
    vestingWhitelister: {
      args_arr: [],
      args: {}
    },
    tokenFactory: {
      args_arr: [],
      args: {}
    },
    enableTransfers: {
      args_arr: ["_transfersEnabled"],
      args: {
        _transfersEnabled: {
          type: "bool",
          index: 0
        }
      }
    },
    controller: {
      args_arr: [],
      args: {}
    },

    transfer: {
      args_arr: ["_to", "_value"],
      args: {
        _to: {
          type: "address",
          index: 0
        },
        _value: {
          type: "uint256",
          index: 1
        }
      }
    },
    transferFrom: {
      args_arr: ["_from", "_to", "_value"],
      args: {
        _from: {
          type: "address",
          index: 0
        },
        _to: {
          type: "address",
          index: 1
        },
        _value: {
          type: "uint256",
          index: 2
        }
      }
    },
    spendableBalanceOf: {
      args_arr: ["_holder"],
      args: {
        _holder: {
          type: "address",
          index: 0
        }
      }
    },
    grantVestedTokens: {
      args_arr: ["_to", "_value", "_start", "_cliff", "_vesting", "_revokable", "_burnsOnRevoke"],
      args: {
        _to: {
          type: "address",
          index: 0
        },
        _value: {
          type: "uint256",
          index: 1
        },
        _start: {
          type: "uint64",
          index: 2
        },
        _cliff: {
          type: "uint64",
          index: 3
        },
        _vesting: {
          type: "uint64",
          index: 4
        },
        _revokable: {
          type: "bool",
          index: 5
        },
        _burnsOnRevoke: {
          type: "bool",
          index: 6
        }
      }
    },
    setCanCreateGrants: {
      args_arr: ["_addr", "_allowed"],
      args: {
        _addr: {
          type: "address",
          index: 0
        },
        _allowed: {
          type: "bool",
          index: 1
        }
      }
    },
    changeVestingWhitelister: {
      args_arr: ["_newWhitelister"],
      args: {
        _newWhitelister: {
          type: "address",
          index: 0
        }
      }
    },
    revokeTokenGrant: {
      args_arr: ["_holder", "_receiver", "_grantId"],
      args: {
        _holder: {
          type: "address",
          index: 0
        },
        _receiver: {
          type: "address",
          index: 1
        },
        _grantId: {
          type: "uint256",
          index: 2
        }
      }
    },
    tokenGrantsCount: {
      args_arr: ["_holder"],
      args: {
        _holder: {
          type: "address",
          index: 0
        }
      }
    },
    tokenGrant: {
      args_arr: ["_holder", "_grantId"],
      args: {
        _holder: {
          type: "address",
          index: 0
        },
        _grantId: {
          type: "uint256",
          index: 1
        }
      }
    },
    lastTokenIsTransferableDate: {
      args_arr: ["holder"],
      args: {
        holder: {
          type: "address",
          index: 0
        }
      }
    },
    transferableTokens: {
      args_arr: ["holder", "time"],
      args: {
        holder: {
          type: "address",
          index: 0
        },
        time: {
          type: "uint64",
          index: 1
        }
      }
    }
  }
}

export const MockBLT: IContractMethodManifest = {
  methods: {
    approve: {
      args_arr: ["_spender", "_value"],
      args: {
        _spender: {
          type: "address",
          index: 0
        },
        _value: {
          type: "uint256",
          index: 1
        }
      }
    },
    totalSupply: {
      args_arr: [],
      args: {}
    },
    transferFrom: {
      args_arr: ["_from", "_to", "_value"],
      args: {
        _from: {
          type: "address",
          index: 0
        },
        _to: {
          type: "address",
          index: 1
        },
        _value: {
          type: "uint256",
          index: 2
        }
      }
    },
    decreaseApproval: {
      args_arr: ["_spender", "_subtractedValue"],
      args: {
        _spender: {
          type: "address",
          index: 0
        },
        _subtractedValue: {
          type: "uint256",
          index: 1
        }
      }
    },
    balanceOf: {
      args_arr: ["_owner"],
      args: {
        _owner: {
          type: "address",
          index: 0
        }
      }
    },
    transfer: {
      args_arr: ["_to", "_value"],
      args: {
        _to: {
          type: "address",
          index: 0
        },
        _value: {
          type: "uint256",
          index: 1
        }
      }
    },
    increaseApproval: {
      args_arr: ["_spender", "_addedValue"],
      args: {
        _spender: {
          type: "address",
          index: 0
        },
        _addedValue: {
          type: "uint256",
          index: 1
        }
      }
    },
    allowance: {
      args_arr: ["_owner", "_spender"],
      args: {
        _owner: {
          type: "address",
          index: 0
        },
        _spender: {
          type: "address",
          index: 1
        }
      }
    },

    gift: {
      args_arr: ["_recipient", "_amount"],
      args: {
        _recipient: {
          type: "address",
          index: 0
        },
        _amount: {
          type: "uint256",
          index: 1
        }
      }
    }
  }
}

export const Ownable: IContractMethodManifest = {
  methods: {
    owner: {
      args_arr: [],
      args: {}
    },

    transferOwnership: {
      args_arr: ["newOwner"],
      args: {
        newOwner: {
          type: "address",
          index: 0
        }
      }
    }
  }
}

export const Pausable: IContractMethodManifest = {
  methods: {
    paused: {
      args_arr: [],
      args: {}
    },
    owner: {
      args_arr: [],
      args: {}
    },
    transferOwnership: {
      args_arr: ["newOwner"],
      args: {
        newOwner: {
          type: "address",
          index: 0
        }
      }
    },

    pause: {
      args_arr: [],
      args: {}
    },
    unpause: {
      args_arr: [],
      args: {}
    }
  }
}

export const Poll: IContractMethodManifest = {
  methods: {
    endTime: {
      args_arr: [],
      args: {}
    },
    startTime: {
      args_arr: [],
      args: {}
    },
    pollDataMultihash: {
      args_arr: [],
      args: {}
    },
    author: {
      args_arr: [],
      args: {}
    },
    numChoices: {
      args_arr: [],
      args: {}
    },
    usedSignatures: {
      args_arr: ["anonymous_0"],
      args: {
        anonymous_0: {
          type: "bytes32",
          index: 0
        }
      }
    },

    vote: {
      args_arr: ["_choice"],
      args: {
        _choice: {
          type: "uint16",
          index: 0
        }
      }
    },
    voteFor: {
      args_arr: ["_choice", "_voter", "_nonce", "_delegationSig"],
      args: {
        _choice: {
          type: "uint16",
          index: 0
        },
        _voter: {
          type: "address",
          index: 1
        },
        _nonce: {
          type: "bytes32",
          index: 2
        },
        _delegationSig: {
          type: "bytes",
          index: 3
        }
      }
    }
  }
}

export const SafeERC20: IContractMethodManifest = {
  methods: {}
}

export const SafeMath: IContractMethodManifest = {
  methods: {}
}

export const SigningLogic: IContractMethodManifest = {
  methods: {
    usedSignatures: {
      args_arr: ["anonymous_0"],
      args: {
        anonymous_0: {
          type: "bytes32",
          index: 0
        }
      }
    }
  }
}

export const StandardToken: IContractMethodManifest = {
  methods: {
    totalSupply: {
      args_arr: [],
      args: {}
    },
    balanceOf: {
      args_arr: ["_owner"],
      args: {
        _owner: {
          type: "address",
          index: 0
        }
      }
    },
    transfer: {
      args_arr: ["_to", "_value"],
      args: {
        _to: {
          type: "address",
          index: 0
        },
        _value: {
          type: "uint256",
          index: 1
        }
      }
    },

    transferFrom: {
      args_arr: ["_from", "_to", "_value"],
      args: {
        _from: {
          type: "address",
          index: 0
        },
        _to: {
          type: "address",
          index: 1
        },
        _value: {
          type: "uint256",
          index: 2
        }
      }
    },
    approve: {
      args_arr: ["_spender", "_value"],
      args: {
        _spender: {
          type: "address",
          index: 0
        },
        _value: {
          type: "uint256",
          index: 1
        }
      }
    },
    allowance: {
      args_arr: ["_owner", "_spender"],
      args: {
        _owner: {
          type: "address",
          index: 0
        },
        _spender: {
          type: "address",
          index: 1
        }
      }
    },
    increaseApproval: {
      args_arr: ["_spender", "_addedValue"],
      args: {
        _spender: {
          type: "address",
          index: 0
        },
        _addedValue: {
          type: "uint256",
          index: 1
        }
      }
    },
    decreaseApproval: {
      args_arr: ["_spender", "_subtractedValue"],
      args: {
        _spender: {
          type: "address",
          index: 0
        },
        _subtractedValue: {
          type: "uint256",
          index: 1
        }
      }
    }
  }
}

export const TokenController: IContractMethodManifest = {
  methods: {
    proxyPayment: {
      args_arr: ["_owner"],
      args: {
        _owner: {
          type: "address",
          index: 0
        }
      }
    },
    onTransfer: {
      args_arr: ["_from", "_to", "_amount"],
      args: {
        _from: {
          type: "address",
          index: 0
        },
        _to: {
          type: "address",
          index: 1
        },
        _amount: {
          type: "uint256",
          index: 2
        }
      }
    },
    onApprove: {
      args_arr: ["_owner", "_spender", "_amount"],
      args: {
        _owner: {
          type: "address",
          index: 0
        },
        _spender: {
          type: "address",
          index: 1
        },
        _amount: {
          type: "uint256",
          index: 2
        }
      }
    }
  }
}

export const TokenEscrowMarketplace: IContractMethodManifest = {
  methods: {
    attestationLogic: {
      args_arr: [],
      args: {}
    },
    tokenEscrow: {
      args_arr: ["anonymous_0"],
      args: {
        anonymous_0: {
          type: "address",
          index: 0
        }
      }
    },
    usedSignatures: {
      args_arr: ["anonymous_0"],
      args: {
        anonymous_0: {
          type: "bytes32",
          index: 0
        }
      }
    },
    token: {
      args_arr: [],
      args: {}
    },

    moveTokensToEscrowLockupFor: {
      args_arr: ["_sender", "_amount", "_nonce", "_delegationSig"],
      args: {
        _sender: {
          type: "address",
          index: 0
        },
        _amount: {
          type: "uint256",
          index: 1
        },
        _nonce: {
          type: "bytes32",
          index: 2
        },
        _delegationSig: {
          type: "bytes",
          index: 3
        }
      }
    },
    moveTokensToEscrowLockup: {
      args_arr: ["_amount"],
      args: {
        _amount: {
          type: "uint256",
          index: 0
        }
      }
    },
    releaseTokensFromEscrowFor: {
      args_arr: ["_sender", "_amount", "_nonce", "_delegationSig"],
      args: {
        _sender: {
          type: "address",
          index: 0
        },
        _amount: {
          type: "uint256",
          index: 1
        },
        _nonce: {
          type: "bytes32",
          index: 2
        },
        _delegationSig: {
          type: "bytes",
          index: 3
        }
      }
    },
    releaseTokensFromEscrow: {
      args_arr: ["_amount"],
      args: {
        _amount: {
          type: "uint256",
          index: 0
        }
      }
    },
    requestTokenPayment: {
      args_arr: ["_payer", "_receiver", "_amount", "_nonce", "_paymentSig"],
      args: {
        _payer: {
          type: "address",
          index: 0
        },
        _receiver: {
          type: "address",
          index: 1
        },
        _amount: {
          type: "uint256",
          index: 2
        },
        _nonce: {
          type: "bytes32",
          index: 3
        },
        _paymentSig: {
          type: "bytes",
          index: 4
        }
      }
    }
  }
}

export const VotingCenter: IContractMethodManifest = {
  methods: {
    polls: {
      args_arr: ["anonymous_0"],
      args: {
        anonymous_0: {
          type: "uint256",
          index: 0
        }
      }
    },

    createPoll: {
      args_arr: ["_name", "_chainId", "_ipfsHash", "_numOptions", "_startTime", "_endTime"],
      args: {
        _name: {
          type: "string",
          index: 0
        },
        _chainId: {
          type: "uint256",
          index: 1
        },
        _ipfsHash: {
          type: "bytes",
          index: 2
        },
        _numOptions: {
          type: "uint16",
          index: 3
        },
        _startTime: {
          type: "uint256",
          index: 4
        },
        _endTime: {
          type: "uint256",
          index: 5
        }
      }
    },
    allPolls: {
      args_arr: [],
      args: {}
    },
    numPolls: {
      args_arr: [],
      args: {}
    }
  }
}
