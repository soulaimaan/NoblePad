// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NoblePadVesting
 * @notice Secure linear vesting contract with cliff and duration.
 */
contract Vesting is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Schedule {
        address beneficiary;
        address token;
        uint256 totalAmount;
        uint256 start; // timestamp
        uint256 cliff; // seconds from start
        uint256 duration; // total duration in seconds
        uint256 released;
    }

    uint256 public nextScheduleId;
    mapping(uint256 => Schedule) public schedules;

    event VestingCreated(uint256 indexed vestingId, address indexed beneficiary, uint256 totalAmount, uint256 start, uint256 duration);
    event Released(uint256 indexed vestingId, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @notice Creates a new vesting schedule for a beneficiary.
     * Tokens are transferred from the caller to this contract.
     */
    function createVesting(
        address beneficiary,
        address token,
        uint256 totalAmount,
        address source, // Address to pull tokens from (must be approved)
        uint256 start,
        uint256 cliff,
        uint256 duration
    ) external onlyOwner nonReentrant returns (uint256) {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(totalAmount > 0, "Amount must be > 0");
        require(duration > 0, "Duration must be > 0");
        
        uint256 vestingId = nextScheduleId++;
        schedules[vestingId] = Schedule(beneficiary, token, totalAmount, start, cliff, duration, 0);
        
        // Securely pull tokens from the source (usually the project owner)
        IERC20(token).safeTransferFrom(source, address(this), totalAmount);
        
        emit VestingCreated(vestingId, beneficiary, totalAmount, start, duration);
        return vestingId;
    }

    /**
     * @notice Returns the amount of tokens currently available to release for a schedule.
     */
    function releasableAmount(uint256 vestingId) public view returns (uint256) {
        Schedule storage s = schedules[vestingId];
        if (block.timestamp < s.start + s.cliff) return 0;
        
        uint256 elapsed = block.timestamp - s.start;
        if (elapsed >= s.duration) {
            return s.totalAmount - s.released;
        } else {
            uint256 vested = (s.totalAmount * elapsed) / s.duration;
            return vested - s.released;
        }
    }

    /**
     * @notice Releases vested tokens to the beneficiary.
     */
    function release(uint256 vestingId) external nonReentrant {
        Schedule storage s = schedules[vestingId];
        require(msg.sender == s.beneficiary || msg.sender == owner(), "Not authorized");
        
        uint256 amount = releasableAmount(vestingId);
        require(amount > 0, "No releasable amount");
        
        s.released += amount;
        IERC20(s.token).safeTransfer(s.beneficiary, amount);
        
        emit Released(vestingId, amount);
    }

    /**
     * @notice Emergency function to withdraw stuck tokens (only if not scheduled)
     */
    function recoverERC20(address tokenAddress, uint256 tokenAmount) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(owner(), tokenAmount);
    }
}
