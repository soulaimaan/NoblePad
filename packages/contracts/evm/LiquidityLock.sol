// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title LiquidityLock
 * @dev Contract for locking liquidity pool tokens
 */
contract LiquidityLock is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    
    struct Lock {
        address token; // LP token address
        address owner; // Lock owner
        uint256 amount; // Locked amount
        uint256 unlockTime; // Unlock timestamp
        bool claimed; // Whether tokens were claimed
        string description; // Lock description
    }
    
    mapping(uint256 => Lock) public locks;
    mapping(address => uint256[]) public userLocks;
    uint256 public nextLockId = 1;
    uint256 public lockFee = 0.01 ether;
    
    event TokensLocked(
        uint256 indexed lockId,
        address indexed token,
        address indexed owner,
        uint256 amount,
        uint256 unlockTime
    );
    
    event TokensUnlocked(
        uint256 indexed lockId,
        address indexed token,
        address indexed owner,
        uint256 amount
    );
    
    event LockExtended(
        uint256 indexed lockId,
        uint256 oldUnlockTime,
        uint256 newUnlockTime
    );
    
    /**
     * @dev Lock LP tokens
     */
    function lockTokens(
        address token,
        uint256 amount,
        uint256 unlockTime,
        string memory description
    ) external payable nonReentrant {
        require(msg.value >= lockFee, "LiquidityLock: Insufficient fee");
        require(token != address(0), "LiquidityLock: Invalid token");
        require(amount > 0, "LiquidityLock: Invalid amount");
        require(unlockTime > block.timestamp, "LiquidityLock: Invalid unlock time");
        
        // Transfer tokens to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Create lock
        locks[nextLockId] = Lock({
            token: token,
            owner: msg.sender,
            amount: amount,
            unlockTime: unlockTime,
            claimed: false,
            description: description
        });
        
        userLocks[msg.sender].push(nextLockId);
        
        emit TokensLocked(nextLockId, token, msg.sender, amount, unlockTime);
        
        nextLockId++;
        
        // Refund excess fee
        if (msg.value > lockFee) {
            payable(msg.sender).transfer(msg.value - lockFee);
        }
    }
    
    /**
     * @dev Unlock tokens when time is reached
     */
    function unlockTokens(uint256 lockId) external nonReentrant {
        Lock storage lockInfo = locks[lockId];
        require(lockInfo.owner == msg.sender, "LiquidityLock: Not owner");
        require(!lockInfo.claimed, "LiquidityLock: Already claimed");
        require(block.timestamp >= lockInfo.unlockTime, "LiquidityLock: Still locked");
        
        lockInfo.claimed = true;
        
        IERC20(lockInfo.token).safeTransfer(lockInfo.owner, lockInfo.amount);
        
        emit TokensUnlocked(lockId, lockInfo.token, lockInfo.owner, lockInfo.amount);
    }
    
    /**
     * @dev Extend lock time (can only extend, not reduce)
     */
    function extendLock(uint256 lockId, uint256 newUnlockTime) external {
        Lock storage lockInfo = locks[lockId];
        require(lockInfo.owner == msg.sender, "LiquidityLock: Not owner");
        require(!lockInfo.claimed, "LiquidityLock: Already claimed");
        require(newUnlockTime > lockInfo.unlockTime, "LiquidityLock: Cannot reduce lock time");
        
        uint256 oldUnlockTime = lockInfo.unlockTime;
        lockInfo.unlockTime = newUnlockTime;
        
        emit LockExtended(lockId, oldUnlockTime, newUnlockTime);
    }
    
    /**
     * @dev Get user's lock IDs
     */
    function getUserLocks(address user) external view returns (uint256[] memory) {
        return userLocks[user];
    }
    
    /**
     * @dev Get lock details
     */
    function getLockDetails(uint256 lockId) external view returns (
        address token,
        address owner,
        uint256 amount,
        uint256 unlockTime,
        bool claimed,
        string memory description
    ) {
        Lock memory lockInfo = locks[lockId];
        return (
            lockInfo.token,
            lockInfo.owner,
            lockInfo.amount,
            lockInfo.unlockTime,
            lockInfo.claimed,
            lockInfo.description
        );
    }
    
    /**
     * @dev Check if lock is unlockable
     */
    function isUnlockable(uint256 lockId) external view returns (bool) {
        Lock memory lockInfo = locks[lockId];
        return !lockInfo.claimed && block.timestamp >= lockInfo.unlockTime;
    }
    
    /**
     * @dev Admin functions
     */
    function updateLockFee(uint256 newFee) external onlyOwner {
        lockFee = newFee;
    }
    
    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}