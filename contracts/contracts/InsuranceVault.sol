// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title NobleInsuranceVault
 * @notice Collects 1% tax to compensate users in case of rug-pulls or exploits.
 */
contract InsuranceVault is Ownable {
    using SafeERC20 for IERC20;

    uint256 public totalInsuranceClaims;
    mapping(address => bool) public authorizedClaims;

    event FundsAdded(address indexed project, uint256 amount);
    event CompensationPaid(address indexed user, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Projects call this to deposit their 1% security tax
     */
    function depositTax(address _project) external payable {
        require(msg.value > 0, "No tax provided");
        emit FundsAdded(_project, msg.value);
    }

    /**
     * @notice Admin or DAO can approve a compensation for a distressed project
     */
    function payCompensation(address payable _user, uint256 _amount) external onlyOwner {
        require(address(this).balance >= _amount, "Insufficient pool funds");
        _user.transfer(_amount);
        totalInsuranceClaims += _amount;
        emit CompensationPaid(_user, _amount);
    }

    receive() external payable {}
}
