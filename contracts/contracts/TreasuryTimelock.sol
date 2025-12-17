// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/*
  Minimal Timelock controller for treasury actions.
  For production use, prefer OpenZeppelin TimelockController or Gnosis Safe + delegatecall patterns.
*/

import "@openzeppelin/contracts/access/Ownable.sol";

contract TreasuryTimelock is Ownable {
    uint256 public delay; // seconds

    event Scheduled(bytes32 indexed txHash, address indexed target, uint256 value, bytes data, uint256 when);
    event Executed(bytes32 indexed txHash, address indexed target, uint256 value, bytes data);

    constructor(uint256 _delay, address initialOwner) Ownable(initialOwner) {
        delay = _delay;
    }

    function schedule(address target, uint256 value, bytes calldata data, uint256 when) external onlyOwner returns (bytes32) {
        require(when >= block.timestamp + delay, "Must satisfy delay");
        bytes32 txHash = keccak256(abi.encode(target, value, data, when));
        emit Scheduled(txHash, target, value, data, when);
        return txHash;
    }

    function execute(address target, uint256 value, bytes calldata data, uint256 when) external onlyOwner payable returns (bytes memory) {
        require(block.timestamp >= when, "Not ready");
        bytes32 txHash = keccak256(abi.encode(target, value, data, when));
        (bool success, bytes memory result) = target.call{value: value}(data);
        require(success, "Execution failed");
        emit Executed(txHash, target, value, data);
        return result;
    }
}
