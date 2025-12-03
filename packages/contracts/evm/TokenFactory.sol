// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title TokenFactory
 * @dev Factory contract for creating standardized ERC20 tokens for launchpad
 */
contract TokenFactory is ReentrancyGuard, Pausable, Ownable {
    struct TokenInfo {
        address tokenAddress;
        address creator;
        string name;
        string symbol;
        uint256 totalSupply;
        uint256 createdAt;
        bool isActive;
    }
    
    mapping(address => TokenInfo[]) public creatorTokens;
    mapping(address => TokenInfo) public tokenDetails;
    address[] public allTokens;
    
    uint256 public creationFee = 0.01 ether; // Platform fee
    uint256 public constant MAX_SUPPLY = 1e30; // Maximum token supply
    
    event TokenCreated(
        address indexed tokenAddress,
        address indexed creator,
        string name,
        string symbol,
        uint256 totalSupply
    );
    
    event CreationFeeUpdated(uint256 oldFee, uint256 newFee);
    
    modifier validTokenParams(
        string memory name,
        string memory symbol,
        uint256 totalSupply
    ) {
        require(bytes(name).length > 0, "TokenFactory: Empty name");
        require(bytes(symbol).length > 0, "TokenFactory: Empty symbol");
        require(totalSupply > 0 && totalSupply <= MAX_SUPPLY, "TokenFactory: Invalid supply");
        _;
    }
    
    /**
     * @dev Create a new ERC20 token
     * @param name Token name
     * @param symbol Token symbol  
     * @param totalSupply Total token supply
     * @param decimals Token decimals (usually 18)
     */
    function createToken(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint8 decimals
    ) external payable nonReentrant whenNotPaused validTokenParams(name, symbol, totalSupply) {
        require(msg.value >= creationFee, "TokenFactory: Insufficient fee");
        
        // Deploy new token contract
        LaunchpadToken newToken = new LaunchpadToken(
            name,
            symbol,
            totalSupply,
            decimals,
            msg.sender
        );
        
        address tokenAddress = address(newToken);
        
        // Store token info
        TokenInfo memory tokenInfo = TokenInfo({
            tokenAddress: tokenAddress,
            creator: msg.sender,
            name: name,
            symbol: symbol,
            totalSupply: totalSupply,
            createdAt: block.timestamp,
            isActive: true
        });
        
        creatorTokens[msg.sender].push(tokenInfo);
        tokenDetails[tokenAddress] = tokenInfo;
        allTokens.push(tokenAddress);
        
        emit TokenCreated(tokenAddress, msg.sender, name, symbol, totalSupply);
        
        // Refund excess payment
        if (msg.value > creationFee) {
            payable(msg.sender).transfer(msg.value - creationFee);
        }
    }
    
    /**
     * @dev Get tokens created by an address
     */
    function getCreatorTokens(address creator) external view returns (TokenInfo[] memory) {
        return creatorTokens[creator];
    }
    
    /**
     * @dev Get total number of tokens created
     */
    function getTokenCount() external view returns (uint256) {
        return allTokens.length;
    }
    
    /**
     * @dev Update creation fee (owner only)
     */
    function updateCreationFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = creationFee;
        creationFee = newFee;
        emit CreationFeeUpdated(oldFee, newFee);
    }
    
    /**
     * @dev Withdraw collected fees (owner only)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "TokenFactory: No fees to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Emergency pause (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}

/**
 * @title LaunchpadToken
 * @dev Standard ERC20 token with additional launchpad features
 */
contract LaunchpadToken is ERC20, Ownable {
    uint8 private _decimals;
    uint256 public immutable maxSupply;
    
    mapping(address => bool) public isPresaleContract;
    bool public tradingEnabled = false;
    
    event TradingEnabled(uint256 timestamp);
    event PresaleContractAdded(address presaleContract);
    
    modifier onlyOwnerOrPresale() {
        require(
            owner() == msg.sender || isPresaleContract[msg.sender],
            "LaunchpadToken: Caller not authorized"
        );
        _;
    }
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint8 tokenDecimals,
        address creator
    ) ERC20(name, symbol) {
        _decimals = tokenDecimals;
        maxSupply = totalSupply;
        
        // Mint total supply to creator
        _mint(creator, totalSupply);
        
        // Transfer ownership to creator
        _transferOwnership(creator);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Enable trading (can only be called once)
     */
    function enableTrading() external onlyOwner {
        require(!tradingEnabled, "LaunchpadToken: Trading already enabled");
        tradingEnabled = true;
        emit TradingEnabled(block.timestamp);
    }
    
    /**
     * @dev Add presale contract (can transfer before trading enabled)
     */
    function addPresaleContract(address presaleContract) external onlyOwner {
        require(presaleContract != address(0), "LaunchpadToken: Zero address");
        isPresaleContract[presaleContract] = true;
        emit PresaleContractAdded(presaleContract);
    }
    
    /**
     * @dev Override transfer to enforce trading rules
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        
        // Allow transfers if trading is enabled or if it involves presale contracts
        if (!tradingEnabled && from != address(0) && to != address(0)) {
            require(
                isPresaleContract[from] || isPresaleContract[to] || from == owner(),
                "LaunchpadToken: Trading not yet enabled"
            );
        }
    }
}