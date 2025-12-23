// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NoblePadTokenLock
 * @notice Secure token locker for liquidity and team tokens.
 */
contract TokenLock is ReentrancyGuard {
    using SafeERC20 for IERC20;

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
    event TokensClaimed(uint256 indexed lockId, address indexed owner, uint256 amount);

    /**
     * @notice Lock tokens for a specific period
     * @param token Address of the token to lock
     * @param amount Amount of tokens to lock
     * @param unlockTime Timestamp when tokens can be claimed
     * @param description Brief description of the lock (e.g. "Liquidity lock")
     */
    function lockTokens(address token, uint256 amount, uint256 unlockTime, string calldata description) external nonReentrant returns (uint256) {
        require(amount > 0, "Amount must be > 0");
        require(unlockTime > block.timestamp, "Unlock time must be in future");
        
        uint256 lockId = nextLockId++;
        locks[lockId] = Lock(token, msg.sender, amount, unlockTime, false, description);
        
        // Transfer tokens from user to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        emit TokensLocked(lockId, msg.sender, token, amount, unlockTime);
        return lockId;
    }

    /**
     * @notice Claim locked tokens once unlock time has passed
     * @param lockId The ID of the lock to claim
     */
    function claimTokens(uint256 lockId) external nonReentrant {
        Lock storage l = locks[lockId];
        require(msg.sender == l.owner, "Not owner");
        require(!l.claimed, "Already claimed");
        require(block.timestamp >= l.unlockTime, "Not unlocked yet");
        
        l.claimed = true;
        IERC20(l.token).safeTransfer(msg.sender, l.amount);
        
        emit TokensClaimed(lockId, msg.sender, l.amount);
    }

    /**
     * @notice Helper to get all locks for a user (Simplified view)
     */
    function getLock(uint256 lockId) external view returns (Lock memory) {
        return locks[lockId];
    }
}
