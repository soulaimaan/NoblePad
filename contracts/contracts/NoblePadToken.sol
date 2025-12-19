// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title NoblePadToken
 * @dev Standard ERC20 token for the NoblePad ecosystem ($NPAD)
 */
contract NoblePadToken is ERC20, Ownable, ERC20Permit {
    constructor(address initialOwner)
        ERC20("NoblePad", "NPAD")
        Ownable(initialOwner)
        ERC20Permit("NoblePad")
    {
        // Total supply: 1,000,000,000 $NPAD
        _mint(initialOwner, 1000000000 * 10**decimals());
    }

    /**
     * @dev Function to mint tokens if needed (for ecosystem growth)
     * In production, this would be governed by the DAO or locked
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
