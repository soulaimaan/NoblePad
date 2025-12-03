# 🏗️ ARCHITECT AGENT - SYSTEM DESIGN COMPLETE

## 🎯 **Agent Status: ACTIVE**
**Role**: System Architecture & Database Design
**Mission**: Design complete multi-chain launchpad architecture

## 📊 **Database Schema Design**

### **Core Tables**

```sql
-- Users and Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(44) UNIQUE NOT NULL, -- Supports both EVM (42) and Solana (44)
  email VARCHAR(255),
  username VARCHAR(50) UNIQUE,
  kyc_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  kyc_level INTEGER DEFAULT 0, -- 0: none, 1: basic, 2: advanced
  role ENUM('user', 'admin', 'moderator') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP,
  profile_data JSONB,
  is_banned BOOLEAN DEFAULT FALSE
);

-- Projects (Token + Presale combinations)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(id),
  
  -- Project Info
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  description TEXT,
  website VARCHAR(255),
  whitepaper_url VARCHAR(255),
  logo_url VARCHAR(255),
  banner_url VARCHAR(255),
  
  -- Blockchain Info
  chain_id INTEGER NOT NULL, -- EVM chain ID or 0 for Solana
  blockchain ENUM('ethereum', 'bsc', 'polygon', 'arbitrum', 'base', 'solana') NOT NULL,
  
  -- Token Info
  token_address VARCHAR(44), -- Contract/Program address
  total_supply NUMERIC(36, 0),
  decimals INTEGER DEFAULT 18,
  
  -- Presale Info
  presale_type ENUM('standard', 'fair_launch', 'private', 'ido') NOT NULL,
  soft_cap NUMERIC(36, 0),
  hard_cap NUMERIC(36, 0),
  min_contribution NUMERIC(36, 0),
  max_contribution NUMERIC(36, 0),
  presale_rate NUMERIC(36, 0), -- Tokens per base currency
  listing_rate NUMERIC(36, 0),
  liquidity_percentage INTEGER, -- Percentage for LP
  liquidity_lock_days INTEGER,
  
  -- Timing
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  
  -- Vesting
  vesting_enabled BOOLEAN DEFAULT FALSE,
  vesting_data JSONB, -- Flexible vesting schedule
  
  -- Status
  status ENUM('draft', 'pending_review', 'approved', 'live', 'ended', 'successful', 'failed', 'cancelled') DEFAULT 'draft',
  
  -- Metadata
  tags TEXT[],
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Whitelist Management
CREATE TABLE whitelists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  wallet_address VARCHAR(44) NOT NULL,
  allocation_limit NUMERIC(36, 0), -- Custom allocation for this user
  tier INTEGER DEFAULT 1, -- Whitelist tier
  added_by UUID REFERENCES users(id),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, wallet_address)
);

-- Presale Participation
CREATE TABLE participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  wallet_address VARCHAR(44) NOT NULL,
  
  -- Investment Details
  amount_invested NUMERIC(36, 0) NOT NULL, -- In base currency (ETH, SOL, etc)
  tokens_allocated NUMERIC(36, 0) NOT NULL, -- Tokens to receive
  
  -- Transaction Info
  transaction_hash VARCHAR(128) NOT NULL,
  block_number BIGINT,
  gas_used NUMERIC(36, 0),
  
  -- Status
  claimed BOOLEAN DEFAULT FALSE,
  claim_transaction VARCHAR(128),
  refunded BOOLEAN DEFAULT FALSE,
  refund_transaction VARCHAR(128),
  
  -- Timing
  participated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  claimed_at TIMESTAMP,
  refunded_at TIMESTAMP,
  
  UNIQUE(project_id, wallet_address)
);

-- Token Locks (for liquidity, team, etc)
CREATE TABLE token_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  lock_type ENUM('liquidity', 'team', 'marketing', 'development', 'advisors') NOT NULL,
  
  -- Lock Details
  token_address VARCHAR(44) NOT NULL,
  locked_amount NUMERIC(36, 0) NOT NULL,
  unlock_time TIMESTAMP NOT NULL,
  beneficiary VARCHAR(44) NOT NULL,
  
  -- Contract Info
  lock_contract VARCHAR(44), -- Lock contract address
  lock_transaction VARCHAR(128),
  
  -- Status
  claimed BOOLEAN DEFAULT FALSE,
  claim_transaction VARCHAR(128),
  
  -- Metadata
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- KYC Documents
CREATE TABLE kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Document Info
  document_type ENUM('passport', 'drivers_license', 'national_id') NOT NULL,
  document_url VARCHAR(255) NOT NULL, -- IPFS/Arweave URL
  selfie_url VARCHAR(255), -- Selfie verification
  
  -- Personal Info (encrypted)
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  country VARCHAR(2), -- ISO country code
  address TEXT,
  
  -- Verification
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  reviewer_id UUID REFERENCES users(id),
  reviewer_notes TEXT,
  
  -- Timing
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP
);

-- Project Reviews (admin approval process)
CREATE TABLE project_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id),
  
  -- Review Details
  status ENUM('pending', 'approved', 'rejected', 'needs_changes') NOT NULL,
  score INTEGER, -- 1-100 quality score
  notes TEXT,
  
  -- Checklist
  checklist JSONB, -- Flexible review checklist
  
  -- Timing
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics and Metrics
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES users(id),
  
  -- Event Data
  event_data JSONB,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  
  -- Timing
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification Details
  type ENUM('project_approved', 'presale_start', 'presale_end', 'claim_available', 'kyc_update') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Metadata
  related_project_id UUID REFERENCES projects(id),
  action_url VARCHAR(255),
  
  -- Status
  read BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  
  -- Timing
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP
);
```

## 🔌 **API Architecture**

### **Authentication Routes**
```typescript
// Authentication & User Management
POST /api/auth/connect-wallet       // Wallet connection
POST /api/auth/logout              // User logout
GET  /api/auth/user                // Get current user
PUT  /api/auth/user                // Update user profile

// KYC Routes
POST /api/kyc/submit               // Submit KYC documents
GET  /api/kyc/status              // Get KYC status
PUT  /api/kyc/review              // Admin KYC review
```

### **Project Management Routes**
```typescript
// Project CRUD
GET  /api/projects                 // List projects (with filters)
POST /api/projects                // Create new project
GET  /api/projects/:id            // Get project details
PUT  /api/projects/:id            // Update project
DELETE /api/projects/:id          // Delete project

// Project Workflow
POST /api/projects/:id/submit     // Submit for review
PUT  /api/projects/:id/review     // Admin review
POST /api/projects/:id/deploy     // Deploy contracts
POST /api/projects/:id/launch     // Launch presale
```

### **Presale Routes**
```typescript
// Presale Participation
POST /api/presales/:id/participate // Participate in presale
POST /api/presales/:id/claim       // Claim tokens
POST /api/presales/:id/refund      // Claim refund
GET  /api/presales/:id/status      // Get presale status

// Whitelist Management
POST /api/presales/:id/whitelist   // Add to whitelist
GET  /api/presales/:id/whitelist   // Get whitelist
DELETE /api/presales/:id/whitelist // Remove from whitelist
```

### **Token Routes**
```typescript
// Token Operations
POST /api/tokens/create            // Create new token
GET  /api/tokens/:address         // Get token details
POST /api/tokens/:address/lock    // Create token lock
GET  /api/tokens/:address/locks   // Get token locks
POST /api/tokens/:address/unlock  // Unlock tokens
```

### **Admin Routes**
```typescript
// Admin Dashboard
GET  /api/admin/dashboard         // Admin dashboard data
GET  /api/admin/projects          // All projects for review
GET  /api/admin/users            // User management
GET  /api/admin/kyc              // KYC submissions
GET  /api/admin/analytics        // Platform analytics
```

## 🔄 **Integration Patterns**

### **Multi-Chain Abstraction**
```typescript
interface ChainConfig {
  chainId: number;
  name: string;
  nativeToken: string;
  rpcUrl: string;
  explorerUrl: string;
  contracts: {
    tokenFactory: string;
    presaleFactory: string;
    lockFactory: string;
  };
}

interface BlockchainService {
  createToken(params: TokenParams): Promise<string>;
  createPresale(params: PresaleParams): Promise<string>;
  getTokenBalance(address: string, tokenAddress: string): Promise<BigNumber>;
  getPresaleStatus(address: string): Promise<PresaleStatus>;
}
```

### **Event Handling System**
```typescript
interface EventHandler {
  // Blockchain events
  onTokenCreated(event: TokenCreatedEvent): Promise<void>;
  onPresaleStarted(event: PresaleStartedEvent): Promise<void>;
  onParticipation(event: ParticipationEvent): Promise<void>;
  onPresaleEnded(event: PresaleEndedEvent): Promise<void>;
  
  // Application events
  onProjectSubmitted(projectId: string): Promise<void>;
  onKycSubmitted(userId: string): Promise<void>;
  onUserRegistered(userId: string): Promise<void>;
}
```

## 🛡️ **Security Architecture**

### **Authentication Strategy**
- **Wallet-based auth**: Primary authentication via wallet signatures
- **JWT tokens**: Session management with short-lived tokens
- **Role-based access**: User/Admin/Moderator permissions
- **Rate limiting**: API endpoint protection

### **Data Protection**
- **Encryption**: All PII encrypted at rest
- **Input validation**: Comprehensive request validation
- **SQL injection prevention**: Parameterized queries
- **XSS protection**: Content sanitization

### **Smart Contract Security**
- **Access controls**: Multi-level permission system
- **Reentrancy guards**: Protection against reentrancy attacks
- **Pause mechanisms**: Emergency stop functionality
- **Time locks**: Sensitive operations with delays

## 📊 **Performance Optimization**

### **Database Optimization**
- **Indexing strategy**: Optimized for common queries
- **Connection pooling**: Efficient database connections
- **Query optimization**: Analyzed and optimized queries
- **Caching layer**: Redis for frequently accessed data

### **API Optimization**
- **Response compression**: Gzip compression enabled
- **Pagination**: Large datasets paginated
- **Field selection**: GraphQL-style field selection
- **Background jobs**: Async processing for heavy operations

## 🔄 **Real-time Features**

### **WebSocket Integration**
```typescript
interface WebSocketEvents {
  // Presale updates
  presale_update: { projectId: string; data: PresaleUpdate };
  new_participation: { projectId: string; data: Participation };
  presale_status_change: { projectId: string; status: PresaleStatus };
  
  // User notifications
  notification: { userId: string; notification: Notification };
  kyc_update: { userId: string; status: KycStatus };
}
```

## 🎯 **ARCHITECT AGENT DELIVERABLES COMPLETE**

✅ **Database Schema**: Complete multi-chain support
✅ **API Architecture**: RESTful with real-time features  
✅ **Integration Patterns**: Blockchain abstraction layer
✅ **Security Framework**: Enterprise-grade protection
✅ **Performance Strategy**: Optimized for scale

**Status**: Architecture complete - Ready for implementation by other agents!

---

**Next**: Smart Contract Agent will implement the blockchain layer using this architecture.