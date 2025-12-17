# Changelog

All notable changes to the NoblePad project will be documented in this file.

## [Unreleased]

### Added
- Created `AgentsDashboard` component for monitoring and managing automation agents
- Added `AgentsDashboard.module.css` for styling the new dashboard
- Enhanced token management with `tokenUtils.ts`
  - Token deployment via TokenFactory
  - Token validation and verification
  - Token balance and allowance management
  - Token transfer and approval functions
- Added TypeScript types for TokenFactory contract
- Created database migration for tokens table
- Updated chain configurations with TokenFactory contract addresses

### Changed
- Updated TokenFactory type definitions to be compatible with ethers v6
- Improved error handling in token operations
- Enhanced type safety across token-related functions

### Fixed
- Resolved TypeScript type errors in TokenFactory interface
- Fixed event parsing in token deployment
- Addressed potential race conditions in token operations

### Security
- Added input validation for all token operations
- Implemented proper error handling for contract interactions
- Added security checks for token transfers and approvals

## [0.2.0] - 2025-12-01

### Added
- Agent monitoring and management interface
- Real-time status updates for automation agents
- Token management utilities and integration
- Enhanced error handling and logging

## [0.1.0] - 2025-11-29

### Added
- Initial project setup
- Basic project structure
- Core smart contracts
- Basic frontend scaffolding

[Unreleased]: https://github.com/yourusername/noblepad/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/yourusername/noblepad/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/yourusername/noblepad/releases/tag/v0.1.0
