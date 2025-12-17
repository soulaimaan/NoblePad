// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TokenLock {
    struct Lock {
        address token;
        address owner;
        uint256 amount;
        uint256 unlockTime;
        bool claimed;
        string description;
    }
    mapping(uint256 => Lock) public locks;
    uint256 public nextLockId;

    event TokensLocked(uint256 indexed lockId, address indexed owner, address indexed token, uint256 amount, uint256 unlockTime);
    event TokensClaimed(uint256 indexed lockId, address indexed owner);

    function lockTokens(address token, uint256 amount, uint256 unlockTime, string calldata description) external returns (uint256) {
        require(unlockTime > block.timestamp, "Unlock time must be in future");
        locks[nextLockId] = Lock(token, msg.sender, amount, unlockTime, false, description);
        emit TokensLocked(nextLockId, msg.sender, token, amount, unlockTime);
        nextLockId++;
        return nextLockId - 1;
    }

    function claimTokens(uint256 lockId) external {
        Lock storage l = locks[lockId];
        require(msg.sender == l.owner, "Not owner");
        require(!l.claimed, "Already claimed");
        require(block.timestamp >= l.unlockTime, "Not unlocked yet");
        l.claimed = true;
        // Transfer logic here
        emit TokensClaimed(lockId, msg.sender);
    }
}
