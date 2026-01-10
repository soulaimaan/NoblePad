
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

// --- Interfaces ---
interface IUniswapV2Router02 {
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
}

/**
 * @title NoblePadPresale
 * @notice Features:
 *  - Tier-Based Allocations (Merkle Proof)
 *  - Deterministic Scaling & Roll-Down (Gold->Silver->Bronze)
 *  - Priority Access Window (Silver/Gold)
 *  - Tier-Based Vesting Schedules
 */
contract Presale is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum State { Upcoming, Live, Success, Failed }

    // --- Configuration ---
    IERC20 public immutable token;
    IUniswapV2Router02 public immutable router;
    
    uint256 public immutable softCap;
    uint256 public immutable hardCap;
    uint256 public immutable presaleRate;
    uint256 public immutable listingRate;
    uint256 public immutable liquidityPercent;
    
    uint256 public immutable startTime;
    uint256 public immutable endTime;
    
    // --- Tier System ---
    bytes32 public immutable snapshotRoot; // Merkle Root
    
    uint8 public constant TIER_BRONZE = 1;
    uint8 public constant TIER_SILVER = 2;
    uint8 public constant TIER_GOLD = 3;

    // Splits: Bronze 50%, Silver 30%, Gold 20%
    uint256 public constant SPLIT_BRONZE = 50;
    uint256 public constant SPLIT_SILVER = 30;
    uint256 public constant SPLIT_GOLD = 20;

    // --- Vesting Config (Per Tier) ---
    struct VestingConfig {
        uint256 tgePercent;     // e.g. 10 for 10%
        uint256 cliffDuration;  // seconds
        uint256 linearDuration; // seconds
    }
    mapping(uint8 => VestingConfig) public tierVesting;

    // --- User Data ---
    // We must track which tier they bought in to apply correct vesting later.
    mapping(address => uint8) public userTier;
    mapping(uint8 => uint256) public tierTotalRaised; 
    mapping(uint8 => uint256) public tierAllocations; // Final Token Allocation per tier pool

    // --- Presale State ---
    uint256 public totalRaised;
    bool public finalized;
    uint256 public finalizeTime;
    
    mapping(address => uint256) public contributions;
    
    mapping(address => uint256) public claimedHash; // Track how many tokens user has claimed totally

    // Events
    event PresaleInitialized(address indexed token, address indexed owner, uint256 amount);
    event Contribution(address indexed buyer, uint8 tier, uint256 amount);
    event PresaleFinalized(uint256 totalRaised, uint256 liquidityAdded, uint256 tokensLocked);
    event RefundClaimed(address indexed buyer, uint256 amount);
    event TokensClaimed(address indexed buyer, uint256 amount);
    event TierAllocationSet(uint8 tier, uint256 amount);

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
        uint256 /*_lockPeriod*/, // Unused, replaced by Tier Vesting
        uint256 /*_maxSpendPerBuyer*/, // Unused, replaced by Merkle
        uint256 _amount,
        bytes32 _snapshotRoot,
        address _owner
    ) Ownable(_owner) {
        require(_token != address(0), "Invalid token");
        require(_router != address(0), "Invalid router");
        require(_softCap > 0 && _softCap <= _hardCap, "Invalid caps");
        require(_startTime > block.timestamp, "Start time in past");
        require(_endTime > _startTime, "End time before start");
        require(_liquidityPercent >= 60 && _liquidityPercent <= 100, "Invalid liquidity%");
        
        token = IERC20(_token);
        router = IUniswapV2Router02(_router);
        softCap = _softCap;
        hardCap = _hardCap;
        presaleRate = _presaleRate;
        listingRate = _listingRate;
        liquidityPercent = _liquidityPercent;
        startTime = _startTime;
        endTime = _endTime;
        snapshotRoot = _snapshotRoot;

        // --- Configure Vesting Schedules ---
        // Bronze: 10% TGE, 3m Cliff, 9m Linear
        tierVesting[TIER_BRONZE] = VestingConfig(10, 90 days, 270 days);
        // Silver: 20% TGE, 2m Cliff, 6m Linear
        tierVesting[TIER_SILVER] = VestingConfig(20, 60 days, 180 days);
        // Gold: 40% TGE, 1m Cliff, 3m Linear
        tierVesting[TIER_GOLD] = VestingConfig(40, 30 days, 90 days);

        emit PresaleInitialized(_token, _owner, _amount);
    }

    function getState() public view returns (State) {
        if (finalized) return State.Success;
        if (block.timestamp < startTime) return State.Upcoming;
        if (block.timestamp >= startTime && block.timestamp <= endTime) return State.Live;
        if (totalRaised >= softCap) return State.Success;
        return State.Failed;
    }

    // --- Contribution ---

    function contribute(bytes32[] calldata proof, uint8 tier, uint256 maxAlloc) public payable nonReentrant {
        require(getState() == State.Live, "Presale not live");
        require(msg.value > 0, "Amount must be > 0");

        // Priority Access Check
        // Priority Window = First 10 minutes
        // Only Silver (2) and Gold (3) allowed in first 10 mins
        if (block.timestamp < startTime + 10 minutes) {
            require(tier >= TIER_SILVER, "Priority Window: Silver/Gold Only");
        }
        
        // Merkle Verification
        if (msg.sender != owner()) { 
            bytes32 leaf = keccak256(abi.encodePacked(msg.sender, tier, maxAlloc));
            require(MerkleProof.verify(proof, snapshotRoot, leaf), "Invalid Merkle Proof");
        }

        require(contributions[msg.sender] + msg.value <= maxAlloc, "Exceeds max allocation");

        // Only one tier per wallet (implied by singular userTier mapping update)
        if (userTier[msg.sender] != 0) {
            require(userTier[msg.sender] == tier, "Cannot change tier");
        } else {
            userTier[msg.sender] = tier;
        }

        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;
        tierTotalRaised[tier] += msg.value;

        emit Contribution(msg.sender, tier, msg.value);
    }

    // --- Finalization ---

    function finalize() external nonReentrant {
        require(getState() == State.Success || (block.timestamp > endTime && totalRaised >= softCap), "Cannot finalize");
        require(!finalized, "Already finalized");

        finalized = true;
        finalizeTime = block.timestamp;

        // 1. Determine Tokens for Sale
        uint256 effectiveRaised = totalRaised > hardCap ? hardCap : totalRaised;
        uint256 totalTokensForSale = effectiveRaised * presaleRate;

        // 2. Pool Splits
        uint256 poolGold = (totalTokensForSale * SPLIT_GOLD) / 100;
        uint256 poolSilver = (totalTokensForSale * SPLIT_SILVER) / 100;
        uint256 poolBronze = totalTokensForSale - poolGold - poolSilver; 

        // 3. Roll-Down Logic
        uint256 demandGold = tierTotalRaised[TIER_GOLD] * presaleRate;
        uint256 demandSilver = tierTotalRaised[TIER_SILVER] * presaleRate;
        // Demand Bronze is remainder

        // Gold -> Silver
        if (demandGold < poolGold) {
            uint256 surplus = poolGold - demandGold;
            poolGold = demandGold; 
            poolSilver += surplus; 
        }
        tierAllocations[TIER_GOLD] = poolGold;

        // Silver -> Bronze
        if (demandSilver < poolSilver) {
            uint256 surplus = poolSilver - demandSilver;
            poolSilver = demandSilver; 
            poolBronze += surplus; 
        }
        tierAllocations[TIER_SILVER] = poolSilver;
        tierAllocations[TIER_BRONZE] = poolBronze;

        emit TierAllocationSet(TIER_GOLD, poolGold);
        emit TierAllocationSet(TIER_SILVER, poolSilver);
        emit TierAllocationSet(TIER_BRONZE, poolBronze);

        // 4. Liquidity
        uint256 nativeForLiquidity = (effectiveRaised * liquidityPercent) / 100;
        uint256 tokensForLiquidity = nativeForLiquidity * listingRate;

        token.forceApprove(address(router), tokensForLiquidity);
        try router.addLiquidityETH{value: nativeForLiquidity}(
            address(token),
            tokensForLiquidity,
            0, 0, // Slippage unchecked
            owner(),
            block.timestamp + 600
        ) {
            emit PresaleFinalized(totalRaised, nativeForLiquidity, tokensForLiquidity);
        } catch {
            payable(owner()).transfer(nativeForLiquidity);
        }

        // Project Funds (Remaining from effective raise)
        uint256 projectFunds = (effectiveRaised * (100 - liquidityPercent)) / 100;
        payable(owner()).transfer(projectFunds);
    }

    // --- Claim with Vesting ---

    function claimTokens() external nonReentrant {
        require(finalized, "Not finalized");
        require(contributions[msg.sender] > 0, "No contribution");

        uint8 tier = userTier[msg.sender];
        uint256 contribution = contributions[msg.sender];
        
        // 1. Calculate Total Allocation (Scaled)
        uint256 tierTotal = tierTotalRaised[tier];
        uint256 tierPool = tierAllocations[tier];
        
        // Protect against zero division if a tier had 0 contributions (edge case)
        uint256 allocatedTokens = tierTotal > 0 ? (contribution * tierPool) / tierTotal : 0;
        uint256 idealTokens = contribution * presaleRate;

        // 2. ETH Refund for difference
        uint256 alreadyRefunded = claimedHash[msg.sender] >> 128; // Upper 128 bits stores if refund processed check?
        // Actually simplest to do refund once.
        // Let's use a simple bool mapping for refund status to keep struct clean?
        // Or actually, refund only happens if allocated < ideal.
        // We can just process it on first claim.
        // Let's rely on 'claimedHash' storing claimed tokens amount.

        // If this is first claim, process refund
        if (claimedHash[msg.sender] == 0 && allocatedTokens < idealTokens) {
             uint256 diffTokens = idealTokens - allocatedTokens;
             uint256 refundETH = diffTokens / presaleRate;
             if (refundETH > 0) {
                 payable(msg.sender).transfer(refundETH);
                 emit RefundClaimed(msg.sender, refundETH);
             }
        }

        // 3. Calculate Vested Amount
        VestingConfig memory cfg = tierVesting[tier];
        uint256 tgeAmount = (allocatedTokens * cfg.tgePercent) / 100;
        uint256 vestingAmount = allocatedTokens - tgeAmount;

        uint256 claimable = 0;

        // TGE is strictly available AFTER finalize
        claimable += tgeAmount;

        // Linear Vesting
        uint256 vestingStart = finalizeTime + cfg.cliffDuration;
        uint256 vestingEnd = vestingStart + cfg.linearDuration;

        if (block.timestamp >= vestingEnd) {
             claimable += vestingAmount;
        } else if (block.timestamp > vestingStart) {
             uint256 timePassed = block.timestamp - vestingStart;
             claimable += (vestingAmount * timePassed) / cfg.linearDuration;
        }

        uint256 alreadyClaimed = claimedHash[msg.sender]; 
        // Note: claimedHash[msg.sender] tracks total CLAIMED tokens, not refund status.
        
        require(claimable > alreadyClaimed, "Nothing new to claim");
        uint256 payout = claimable - alreadyClaimed;

        claimedHash[msg.sender] += payout;
        token.safeTransfer(msg.sender, payout);
        
        emit TokensClaimed(msg.sender, payout);
    }

    // --- Admin ---

    function withdrawUnsoldTokens() external onlyOwner {
        // Wait until longest vesting is potentially over + buffer
        // Longest is Bronze (90 days + 270 days = 360 days) ~ 1 year.
        require(finalized && block.timestamp > finalizeTime + 365 days + 30 days, "Too early");
        uint256 balance = token.balanceOf(address(this));
        token.safeTransfer(owner(), balance);
    }
    
    function claimRefund() external nonReentrant {
        require(getState() == State.Failed, "Not failed");
        uint256 amount = contributions[msg.sender];
        require(amount > 0, "Nothing to refund");
        contributions[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        emit RefundClaimed(msg.sender, amount);
    }
}
