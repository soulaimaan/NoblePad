// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Presale.sol";

contract PresaleFactory {
    event PresaleCreated(address indexed presale, address indexed owner, address indexed token);

    address public owner;
    address public tokenLock;
    uint256 public creationFee = 0.01 ether;

    constructor(address _tokenLock) {
        owner = msg.sender;
        tokenLock = _tokenLock;
    }

    function createPresale(
        address _token,
        address _router,
        uint256 _softCap,
        uint256 _hardCap,
        uint256 _presaleRate,
        uint256 _listingRate,
        uint256 _liquidityPercent,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _lockPeriod,
        uint256 _maxSpendPerBuyer,
        uint256 _amount
    ) external payable returns (address) {
        require(msg.value >= creationFee, "Insufficient fee");
        Presale presale = new Presale(
            _token,
            _router,
            _softCap,
            _hardCap,
            _presaleRate,
            _listingRate,
            _liquidityPercent,
            _startTime,
            _endTime,
            _lockPeriod,
            _maxSpendPerBuyer,
            _amount,
            tokenLock,
            msg.sender
        );
        emit PresaleCreated(address(presale), msg.sender, _token);
        return address(presale);
    }
}
