// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./StandardToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenFactory
 * @dev Factory contract to deploy Standard ERC20 tokens
 */
contract TokenFactory is Ownable {
    event TokenCreated(address indexed token, address indexed owner, string name, string symbol);

    uint256 public deploymentFee = 0.01 ether;

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setDeploymentFee(uint256 newFee) external onlyOwner {
        deploymentFee = newFee;
    }

    /**
     * @dev Deploys a new StandardToken
     */
    function createStandardToken(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 totalSupply
    ) external payable returns (address) {
        require(msg.value >= deploymentFee, "Insufficient fee");
        
        StandardToken token = new StandardToken(
            name,
            symbol,
            decimals,
            totalSupply,
            msg.sender
        );

        emit TokenCreated(address(token), msg.sender, name, symbol);

        // Refund excess fee
        if (msg.value > deploymentFee) {
            payable(msg.sender).transfer(msg.value - deploymentFee);
        }

        return address(token);
    }

    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
