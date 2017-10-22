## Outline

- Account Registry
    - Tracks accounts by address
    - Tracks pending invites as `mapping(address => mapping(address => bool))`
    - Tracks invites as `mapping(address => bool)`
    - Should only allow the collateralizer transition things from pending invite to invite
    - `createAccount` converts an invite to an account
- Invite Collateralizer
    - Locks up a certain amount of BLT
    - Finalizes invites when BLT is secured
    - Locks up for specified period

### Extra Credit

- Maybe the registry should be hooked up to an `InvitePromotionGateway` which could include both a simple bloom contract and the invite collateralizer?
