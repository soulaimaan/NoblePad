// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

/**
 * @title PresaleFactory
 * @dev Factory contract for creating and managing presales
 */
contract PresaleFactory is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;
    
    struct PresaleInfo {
        address presaleContract;
        address creator;
        address token;
        uint256 createdAt;
        bool isActive;
    }
    
    mapping(address => PresaleInfo[]) public creatorPresales;
    mapping(address => PresaleInfo) public presaleDetails;
    address[] public allPresales;
    
    uint256 public creationFee = 0.05 ether;
    address public feeRecipient;
    
    event PresaleCreated(
        address indexed presaleContract,
        address indexed creator,
        address indexed token,
        uint256 softCap,
        uint256 hardCap
    );
    
    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Create a new presale
     */
    function createPresale(
        address token,
        uint256 softCap,
        uint256 hardCap,
        uint256 presaleRate,
        uint256 listingRate,
        uint256 liquidityPercent,
        uint256 startTime,
        uint256 endTime,
        uint256 maxContribution,
        uint256 tokensForPresale
    ) external payable nonReentrant whenNotPaused {
        require(msg.value >= creationFee, "PresaleFactory: Insufficient fee");
        require(token != address(0), "PresaleFactory: Invalid token");
        require(hardCap > softCap, "PresaleFactory: Invalid caps");
        require(startTime > block.timestamp, "PresaleFactory: Invalid start time");
        require(endTime > startTime, "PresaleFactory: Invalid end time");
        
        // Deploy presale contract
        Presale newPresale = new Presale(
            token,
            msg.sender,
            softCap,
            hardCap,
            presaleRate,
            listingRate,
            liquidityPercent,
            startTime,
            endTime,
            maxContribution
        );
        
        address presaleAddress = address(newPresale);
        
        // Store presale info
        PresaleInfo memory presaleInfo = PresaleInfo({
            presaleContract: presaleAddress,
            creator: msg.sender,
            token: token,
            createdAt: block.timestamp,
            isActive: true
        });
        
        creatorPresales[msg.sender].push(presaleInfo);
        presaleDetails[presaleAddress] = presaleInfo;
        allPresales.push(presaleAddress);
        
        // Transfer tokens to presale contract
        IERC20(token).safeTransferFrom(msg.sender, presaleAddress, tokensForPresale);
        
        emit PresaleCreated(presaleAddress, msg.sender, token, softCap, hardCap);
        
        // Send fee to recipient
        payable(feeRecipient).transfer(creationFee);
        
        // Refund excess
        if (msg.value > creationFee) {
            payable(msg.sender).transfer(msg.value - creationFee);
        }
    }
    
    function getCreatorPresales(address creator) external view returns (PresaleInfo[] memory) {
        return creatorPresales[creator];
    }
    
    function updateCreationFee(uint256 newFee) external onlyOwner {
        creationFee = newFee;
    }
    
    function updateFeeRecipient(address newRecipient) external onlyOwner {
        feeRecipient = newRecipient;
    }
}

/**
 * @title Presale
 * @dev Individual presale contract
 */
contract Presale is ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    enum PresaleStatus { PENDING, ACTIVE, SUCCESS, FAILED, CANCELLED }
    
    // Presale parameters
    IERC20 public immutable token;
    address public immutable creator;
    uint256 public immutable softCap;
    uint256 public immutable hardCap;
    uint256 public immutable presaleRate; // tokens per ETH
    uint256 public immutable listingRate; // tokens per ETH for listing
    uint256 public immutable liquidityPercent; // percentage for liquidity
    uint256 public immutable startTime;
    uint256 public immutable endTime;
    uint256 public immutable maxContribution;
    
    // Presale state
    uint256 public totalRaised;
    uint256 public totalSold;
    mapping(address => uint256) public contributions;
    mapping(address => bool) public claimed;
    mapping(address => bool) public whitelist;
    
    bool public whitelistEnabled = false;
    bool public liquidityAdded = false;
    PresaleStatus public status = PresaleStatus.PENDING;
    
    // Events
    event Contributed(address indexed user, uint256 amount, uint256 tokens);
    event Claimed(address indexed user, uint256 amount);
    event PresaleFinalized(bool success, uint256 totalRaised);
    event LiquidityAdded(uint256 ethAmount, uint256 tokenAmount);
    
    modifier onlyCreator() {
        require(msg.sender == creator, "Presale: Not creator");
        _;
    }
    
    modifier presaleActive() {
        require(status == PresaleStatus.ACTIVE, "Presale: Not active");
        require(block.timestamp >= startTime, "Presale: Not started");
        require(block.timestamp <= endTime, "Presale: Ended");
        _;
    }
    
    constructor(
        address _token,
        address _creator,
        uint256 _softCap,
        uint256 _hardCap,
        uint256 _presaleRate,
        uint256 _listingRate,
        uint256 _liquidityPercent,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxContribution
    ) {
        token = IERC20(_token);
        creator = _creator;
        softCap = _softCap;
        hardCap = _hardCap;
        presaleRate = _presaleRate;
        listingRate = _listingRate;
        liquidityPercent = _liquidityPercent;
        startTime = _startTime;
        endTime = _endTime;
        maxContribution = _maxContribution;
        
        status = PresaleStatus.ACTIVE;
    }
    
    /**
     * @dev Contribute to presale
     */
    function contribute() external payable nonReentrant presaleActive {
        require(msg.value > 0, "Presale: No ETH sent");
        require(totalRaised + msg.value <= hardCap, "Presale: Hard cap reached");
        require(contributions[msg.sender] + msg.value <= maxContribution, "Presale: Max contribution exceeded");
        
        if (whitelistEnabled) {
            require(whitelist[msg.sender], "Presale: Not whitelisted");
        }
        
        uint256 tokenAmount = (msg.value * presaleRate) / 1e18;
        
        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;
        totalSold += tokenAmount;
        
        emit Contributed(msg.sender, msg.value, tokenAmount);
    }
    
    /**
     * @dev Claim tokens after successful presale
     */
    function claimTokens() external nonReentrant {
        require(status == PresaleStatus.SUCCESS, "Presale: Not successful");
        require(contributions[msg.sender] > 0, "Presale: No contribution");
        require(!claimed[msg.sender], "Presale: Already claimed");
        
        claimed[msg.sender] = true;
        uint256 tokenAmount = (contributions[msg.sender] * presaleRate) / 1e18;
        
        token.safeTransfer(msg.sender, tokenAmount);
        emit Claimed(msg.sender, tokenAmount);
    }
    
    /**
     * @dev Claim refund after failed presale
     */
    function claimRefund() external nonReentrant {
        require(status == PresaleStatus.FAILED, "Presale: Not failed");
        require(contributions[msg.sender] > 0, "Presale: No contribution");
        
        uint256 contribution = contributions[msg.sender];
        contributions[msg.sender] = 0;
        
        payable(msg.sender).transfer(contribution);
    }
    
    /**
     * @dev Finalize presale
     */
    function finalize() external onlyCreator {
        require(status == PresaleStatus.ACTIVE, "Presale: Not active");
        require(block.timestamp > endTime || totalRaised >= hardCap, "Presale: Cannot finalize yet");
        
        if (totalRaised >= softCap) {
            status = PresaleStatus.SUCCESS;
            
            // Send raised ETH to creator (minus liquidity amount)
            uint256 liquidityEth = (totalRaised * liquidityPercent) / 100;
            uint256 creatorEth = totalRaised - liquidityEth;
            
            if (creatorEth > 0) {
                payable(creator).transfer(creatorEth);
            }
            
            // Add liquidity (simplified - in production use DEX router)
            // This would integrate with Uniswap/PancakeSwap
            
        } else {
            status = PresaleStatus.FAILED;
            
            // Return unsold tokens to creator
            uint256 unsoldTokens = token.balanceOf(address(this));
            if (unsoldTokens > 0) {
                token.safeTransfer(creator, unsoldTokens);
            }
        }
        
        emit PresaleFinalized(status == PresaleStatus.SUCCESS, totalRaised);
    }
    
    /**
     * @dev Emergency functions
     */
    function enableWhitelist() external onlyCreator {
        whitelistEnabled = true;
    }
    
    function addToWhitelist(address[] calldata users) external onlyCreator {
        for (uint i = 0; i < users.length; i++) {
            whitelist[users[i]] = true;
        }
    }
    
    function emergencyWithdraw() external onlyCreator {
        require(status == PresaleStatus.CANCELLED, "Presale: Not cancelled");
        token.safeTransfer(creator, token.balanceOf(address(this)));
    }
    
    /**
     * @dev View functions
     */
    function getPresaleInfo() external view returns (
        address tokenAddress,
        uint256 _softCap,
        uint256 _hardCap,
        uint256 _totalRaised,
        uint256 _startTime,
        uint256 _endTime,
        PresaleStatus _status
    ) {
        return (
            address(token),
            softCap,
            hardCap,
            totalRaised,
            startTime,
            endTime,
            status
        );
    }
}