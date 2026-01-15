// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BelgraveMilestoneEscrow
 * @dev Handles milestone-based fund releases for presale projects with governance and inactivity fail-safes.
 */
contract BelgraveMilestoneEscrow is Ownable, ReentrancyGuard {
    struct Milestone {
        string description;
        uint256 percentage; // 1-100
        bool isReleased;
        uint256 approvalVotes;
        uint256 rejectionVotes;
        uint256 deadline;
        string proofOfWork;
    }

    address public immutable projectAddress;
    uint256 public totalFundsRaised;
    uint256 public totalReleasedFunds;
    uint256 public lastMilestoneClaimTimestamp;
    uint256 public constant INACTIVITY_THRESHOLD = 180 days;
    
    bool public emergencyRefundEnabled;
    bool public projectKilled;

    Milestone[] public milestones;
    mapping(address => uint256) public contributions;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    uint256 public totalVotingPower;

    event MilestoneAdded(uint256 milestoneId, string description, uint256 percentage);
    event VoteCast(address voter, uint256 milestoneId, bool approved, uint256 weight);
    event MilestoneReleased(uint256 milestoneId, uint256 amount);
    event EmergencyRefundEnabled();
    event ProjectKilled(string reason);
    event RefundClaimed(address user, uint256 amount);

    constructor(address _projectAddress, address _initialOwner) Ownable(_initialOwner) {
        projectAddress = _projectAddress;
        lastMilestoneClaimTimestamp = block.timestamp;
    }

    /**
     * @dev Allows the factory/owner to record contributions.
     * In a production environment, this would be called by the Presale contract.
     */
    function addContribution(address _contributor, uint256 _amount) external onlyOwner {
        contributions[_contributor] += _amount;
        totalFundsRaised += _amount;
        totalVotingPower += _amount;
    }

    /**
     * @dev Add milestones for the project.
     */
    function addMilestones(string[] calldata _descriptions, uint256[] calldata _percentages, uint256[] calldata _deadlines) external onlyOwner {
        uint256 totalPercent = 0;
        for (uint256 i = 0; i < _descriptions.length; i++) {
            milestones.push(Milestone({
                description: _descriptions[i],
                percentage: _percentages[i],
                isReleased: false,
                approvalVotes: 0,
                rejectionVotes: 0,
                deadline: _deadlines[i],
                proofOfWork: ""
            }));
            totalPercent += _percentages[i];
            emit MilestoneAdded(milestones.length - 1, _descriptions[i], _percentages[i]);
        }
        require(totalPercent <= 100, "Total percentage exceeds 100");
    }

    /**
     * @dev Project developer submits proof of work for a milestone.
     */
    function submitProofOfWork(uint256 _milestoneId, string calldata _proof) external {
        require(msg.sender == projectAddress, "Only project can submit proof");
        require(_milestoneId < milestones.length, "Invalid milestone");
        milestones[_milestoneId].proofOfWork = _proof;
    }

    /**
     * @dev Investors vote on whether to release funds for a milestone.
     */
    function voteForRelease(uint256 _milestoneId, bool _approve) external {
        require(_milestoneId < milestones.length, "Invalid milestone");
        require(!milestones[_milestoneId].isReleased, "Already released");
        require(contributions[msg.sender] > 0, "No voting power");
        require(!hasVoted[_milestoneId][msg.sender], "Already voted");
        require(!projectKilled, "Project is killed");

        uint256 weight = contributions[msg.sender];
        if (_approve) {
            milestones[_milestoneId].approvalVotes += weight;
        } else {
            milestones[_milestoneId].rejectionVotes += weight;
        }

        hasVoted[_milestoneId][msg.sender] = true;
        emit VoteCast(msg.sender, _milestoneId, _approve, weight);

        // Check if rejection > 50%
        if (milestones[_milestoneId].rejectionVotes > totalVotingPower / 2) {
            projectKilled = true;
            emergencyRefundEnabled = true;
            emit ProjectKilled("Milestone rejected by majority");
        }

        // Auto-release if > 50% approval (Belgrave Oracle can also trigger)
        if (milestones[_milestoneId].approvalVotes > totalVotingPower / 2) {
            releaseMilestone(_milestoneId);
        }
    }

    /**
     * @dev Release funds for a given milestone.
     */
    function releaseMilestone(uint256 _milestoneId) public nonReentrant {
        require(_milestoneId < milestones.length, "Invalid milestone");
        Milestone storage m = milestones[_milestoneId];
        require(!m.isReleased, "Already released");
        require(!projectKilled, "Project is killed");

        // Release if approved by community or if deadline passed (and not rejected)
        bool approvedByCommunity = m.approvalVotes > totalVotingPower / 2;
        
        // If deadline missed, we don't auto-release, we enable refund unless approved
        if (block.timestamp > m.deadline && !approvedByCommunity) {
            projectKilled = true;
            emergencyRefundEnabled = true;
            emit ProjectKilled("Deadline missed");
            return;
        }

        require(approvedByCommunity, "Not enough approval votes");
        
        m.isReleased = true;
        uint256 amount = (totalFundsRaised * m.percentage) / 100;
        totalReleasedFunds += amount;
        lastMilestoneClaimTimestamp = block.timestamp;
        
        (bool success, ) = projectAddress.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit MilestoneReleased(_milestoneId, amount);
    }

    /**
     * @dev Enable emergency refund if inactivity threshold reached.
     */
    function enableEmergencyRefund() external {
        require(block.timestamp > lastMilestoneClaimTimestamp + INACTIVITY_THRESHOLD, "Inactivity threshold not reached");
        emergencyRefundEnabled = true;
        emit EmergencyRefundEnabled();
    }

    /**
     * @dev Investors claim their fair share of remaining funds.
     */
    function claimEmergencyRefund() external nonReentrant {
        require(emergencyRefundEnabled, "Refund not enabled");
        uint256 contributed = contributions[msg.sender];
        require(contributed > 0, "Nothing to claim");

        // Calculate remaining share
        // Using address(this).balance ensures we distribute what's actually left
        uint256 totalRemaining = address(this).balance;
        
        // We use the remaining balance and the ratio of user's contribution to total voting power
        // Note: This logic assumes all contributors would claim. 
        // A more robust way might track total claimed to prevent issues.
        uint256 share = (totalRemaining * contributed) / totalVotingPower;
        
        // Deduct from totalVotingPower to keep ratios correct as people claim
        totalVotingPower -= contributed;
        contributions[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: share}("");
        require(success, "Refund failed");
        
        emit RefundClaimed(msg.sender, share);
    }

    /**
     * @dev View function to get current milestone count
     */
    function getMilestonesCount() external view returns (uint256) {
        return milestones.length;
    }

    /**
     * @dev Fallback to receive funds from presale
     */
    receive() external payable {}
}
