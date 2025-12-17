// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Presale
 * @notice Minimal presale contract skeleton implementing contribution, refund and finalize flows.
 *         This is a development skeleton and must be security audited and extended before production.
 */
contract Presale is Ownable {
    address public token;
    address public router;
    uint256 public softCap;
    uint256 public hardCap;
    uint256 public presaleRate;
    uint256 public listingRate;
    uint256 public liquidityPercent;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public lockPeriod;
    uint256 public maxSpendPerBuyer;
    uint256 public amount;

    uint256 public totalRaised;
    bool public finalized;

    mapping(address => uint256) public contributions;

    // Minimum enforced liquidity percent (from spec)
    uint256 public constant MIN_LIQUIDITY_PERCENT = 60;

    event PresaleInitialized(address indexed token, address indexed owner);
    event Contribution(address indexed buyer, uint256 amount);
    event PresaleFinalized(address indexed presale, uint256 totalRaised);
    event RefundClaimed(address indexed buyer, uint256 amount);
    event LiquidityAdded(uint256 tokenAmount, uint256 nativeAmount);

    constructor(
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
        uint256 _amount,
        // team vesting omitted for skeleton
        address /* _tokenLock */,
        address _owner
    ) Ownable(_owner) {
        token = _token;
        router = _router;
        softCap = _softCap;
        hardCap = _hardCap;
        presaleRate = _presaleRate;
        listingRate = _listingRate;
        liquidityPercent = _liquidityPercent;
        startTime = _startTime;
        endTime = _endTime;
        lockPeriod = _lockPeriod;
        maxSpendPerBuyer = _maxSpendPerBuyer;
        amount = _amount;
        emit PresaleInitialized(_token, _owner);
    }

    // Accept contributions via receive
    receive() external payable {
        contribute();
    }

    function contribute() public payable {
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Presale not active");
        require(totalRaised + msg.value <= hardCap, "Hard cap reached");
        require(contributions[msg.sender] + msg.value <= maxSpendPerBuyer, "Exceeds per-buyer cap");

        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;
        emit Contribution(msg.sender, msg.value);
    }

    /**
     * @notice Finalize the presale. Simplified: emits liquidity amounts and marks finalized.
     * @param tokenLockAddress optional token lock address to integrate locking flow
     */
    function finalize(address tokenLockAddress) external onlyOwner {
        require(!finalized, "already finalized");
        require(block.timestamp > endTime || totalRaised >= hardCap, "Presale not ended");
        require(totalRaised >= softCap, "Soft cap not reached");
        require(liquidityPercent >= MIN_LIQUIDITY_PERCENT, "Liquidity percent below minimum");

        // Calculate liquidity amounts (simplified): native amount to add
        uint256 nativeForLiquidity = (totalRaised * liquidityPercent) / 100;
        // token amount based on listingRate (tokens per native unit)
        uint256 tokenForLiquidity = nativeForLiquidity * listingRate;

        // Note: actual router interactions to add liquidity are not implemented in this skeleton.
        emit LiquidityAdded(tokenForLiquidity, nativeForLiquidity);

        // Lock token or LP representation via TokenLock (if provided)
        if (tokenLockAddress != address(0)) {
            // Approve and call would be here — skeleton emits event and relies on TokenLock to be called off-chain or by owner
            // uint256 lockId = TokenLock(tokenLockAddress).lockTokens(...)
        }

        finalized = true;
        emit PresaleFinalized(address(this), totalRaised);
    }

    function claimRefund() external {
        require(block.timestamp > endTime, "Presale not ended");
        require(totalRaised < softCap, "Soft cap was reached");
        uint256 contributed = contributions[msg.sender];
        require(contributed > 0, "No contribution");
        contributions[msg.sender] = 0;
        payable(msg.sender).transfer(contributed);
        emit RefundClaimed(msg.sender, contributed);
    }
}
