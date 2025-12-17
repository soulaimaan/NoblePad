// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/*
  Simple vesting contract skeleton. Stores vesting schedules and allows beneficiaries to release vested tokens.
  Integrate with Presale/Factory by transferring team allocation to this contract.
*/

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Vesting is Ownable {
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

    function createVesting(
        address beneficiary,
        address token,
        uint256 totalAmount,
        uint256 start,
        uint256 cliff,
        uint256 duration
    ) external onlyOwner returns (uint256) {
        schedules[nextScheduleId] = Schedule(beneficiary, token, totalAmount, start, cliff, duration, 0);
        emit VestingCreated(nextScheduleId, beneficiary, totalAmount, start, duration);
        nextScheduleId++;
        return nextScheduleId - 1;
    }

    function releasableAmount(uint256 vestingId) public view returns (uint256) {
        Schedule storage s = schedules[vestingId];
        if (block.timestamp < s.start + s.cliff) return 0;
        uint256 elapsed = block.timestamp - s.start;
        if (elapsed >= s.duration) return s.totalAmount - s.released;
        uint256 vested = (s.totalAmount * elapsed) / s.duration;
        return vested - s.released;
    }

    function release(uint256 vestingId) external {
        Schedule storage s = schedules[vestingId];
        require(msg.sender == s.beneficiary || msg.sender == owner(), "Not authorized");
        uint256 amount = releasableAmount(vestingId);
        require(amount > 0, "No releasable amount");
        s.released += amount;
        IERC20(s.token).transfer(s.beneficiary, amount);
        emit Released(vestingId, amount);
    }
}
