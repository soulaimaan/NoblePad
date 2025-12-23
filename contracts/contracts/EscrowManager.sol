// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title NobleEscrowManager
 * @notice Handles milestone-based fund releases with DAO governance.
 */
contract EscrowManager is Ownable, ReentrancyGuard {
    
    struct Milestone {
        string description;
        uint256 percentage; // e.g. 3000 for 30%
        bool released;
        uint256 voteEndTime;
        uint256 votesApprove;
        uint256 votesDispute;
    }

    struct Project {
        address creator;
        uint256 totalFunds;
        uint256 fundsReleased;
        uint8 currentMilestone;
        bool disputed;
        Milestone[] milestones;
    }

    mapping(address => Project) public projects; // Presale Address -> Project Data
    mapping(address => mapping(address => bool)) public hasVoted; // Presale -> User -> Voted

    event MilestoneCreated(address indexed presale, uint8 index, string description);
    event FundsReleased(address indexed presale, uint256 amount);
    event DisputeTriggered(address indexed presale);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Registers a presale for escrow management
     */
    function registerProject(
        address _presale,
        address _creator,
        uint256 _totalFunds
    ) external {
        // In production, only the PresaleFactory can call this
        Project storage p = projects[_presale];
        p.creator = _creator;
        p.totalFunds = _totalFunds;
        
        // Default Milestones: 40% (TGE), 30% (M1), 30% (M2)
        _addMilestone(_presale, "TGE Release", 4000);
        _addMilestone(_presale, "Development Milestone 1", 3000);
        _addMilestone(_presale, "Final Delivery", 3000);
    }

    function _addMilestone(address _presale, string memory _desc, uint256 _percent) internal {
        projects[_presale].milestones.push(Milestone({
            description: _desc,
            percentage: _percent,
            released: false,
            voteEndTime: 0,
            votesApprove: 0,
            votesDispute: 0
        }));
    }

    /**
     * @notice Start a release vote for a milestone
     */
    function requestRelease(address _presale) external {
        Project storage p = projects[_presale];
        require(msg.sender == p.creator, "Only creator");
        uint8 mIndex = p.currentMilestone;
        require(mIndex < p.milestones.length, "All milestones released");
        
        p.milestones[mIndex].voteEndTime = block.timestamp + 3 days;
    }

    /**
     * @notice Vote to approve or dispute a milestone
     * @param _presale Presale address
     * @param _approve True to approve, false to dispute
     */
    function vote(address _presale, bool _approve) external {
        Project storage p = projects[_presale];
        uint8 mIndex = p.currentMilestone;
        require(block.timestamp < p.milestones[mIndex].voteEndTime, "No active vote");
        require(!hasVoted[_presale][msg.sender], "Already voted");

        // Logic: Voting power is weighted by their contribution in that presale
        // (This would interface with the Presale contract)
        uint256 weight = 1; // Simplified for now, will link to Presale contributions
        
        if (_approve) p.milestones[mIndex].votesApprove += weight;
        else p.milestones[mIndex].votesDispute += weight;
        
        hasVoted[_presale][msg.sender] = true;
    }

    /**
     * @notice Finalize the vote and release funds if approved
     */
    function finalizeRelease(address _presale) external nonReentrant {
        Project storage p = projects[_presale];
        uint8 mIndex = p.currentMilestone;
        require(block.timestamp >= p.milestones[mIndex].voteEndTime, "Voting active");
        
        if (p.milestones[mIndex].votesApprove > p.milestones[mIndex].votesDispute) {
            uint256 amount = (p.totalFunds * p.milestones[mIndex].percentage) / 10000;
            p.milestones[mIndex].released = true;
            p.currentMilestone++;
            p.fundsReleased += amount;
            
            payable(p.creator).transfer(amount);
            emit FundsReleased(_presale, amount);
        } else {
            p.disputed = true;
            emit DisputeTriggered(_presale);
        }
    }

    receive() external payable {}
}
