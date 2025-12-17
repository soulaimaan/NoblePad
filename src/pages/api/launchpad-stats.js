// Mock API endpoint for launchpad stats
export default function handler(req, res) {
  res.status(200).json({
    presaleCount: 12,
    totalRaised: 320.5,
    liquidityLocked: '62%',
    vestingEnforced: true,
    kycProjects: 10,
    antiRugCompliant: 11,
  });
}
