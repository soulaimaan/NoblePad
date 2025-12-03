// API Client for Edge Functions
// Frontend integration with Application Logic Tier

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Helper to get auth token
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('noble_auth_token')
}

// Helper to make authenticated requests
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken()
  
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(errorData.error || `HTTP ${response.status}`)
  }

  return response.json()
}

// Presales API
export const presalesAPI = {
  // Get all presales with filtering
  async getPresales(params: {
    status?: string
    chain?: string
    search?: string
    limit?: number
    offset?: number
  } = {}) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })
    
    return apiCall(`get-presales?${searchParams.toString()}`)
  },

  // Get individual presale details
  async getPresaleDetails(presaleId: string) {
    return apiCall('get-presale-details', {
      method: 'POST',
      body: JSON.stringify({ presale_id: presaleId }),
    })
  },

  // Create new presale
  async createPresale(presaleData: any) {
    return apiCall('create-presale', {
      method: 'POST',
      body: JSON.stringify(presaleData),
    })
  },

  // Commit to presale
  async commitToPresale(commitmentData: {
    presale_id: string
    amount: string
    transaction_hash: string
    block_number?: number
  }) {
    return apiCall('commit-to-presale', {
      method: 'POST',
      body: JSON.stringify(commitmentData),
    })
  },
}

// User Tier API
export const userAPI = {
  // Get user's tier information
  async getUserTier() {
    return apiCall('user-tier', {
      method: 'GET',
    })
  },

  // Update user's staked amount
  async updateStake(stakeData: {
    staked_amount: string
    transaction_hash?: string
  }) {
    return apiCall('user-tier', {
      method: 'POST',
      body: JSON.stringify(stakeData),
    })
  },
}

// Admin API
export const adminAPI = {
  // Approve presale
  async approvePresale(presaleId: string, notes?: string) {
    return apiCall('admin-actions', {
      method: 'POST',
      body: JSON.stringify({
        action: 'approve',
        presale_id: presaleId,
        notes,
      }),
    })
  },

  // Reject presale
  async rejectPresale(presaleId: string, reason: string, notes?: string) {
    return apiCall('admin-actions', {
      method: 'POST',
      body: JSON.stringify({
        action: 'reject',
        presale_id: presaleId,
        reason,
        notes,
      }),
    })
  },

  // Verify KYC
  async verifyKYC(presaleId: string) {
    return apiCall('admin-actions', {
      method: 'POST',
      body: JSON.stringify({
        action: 'verify_kyc',
        presale_id: presaleId,
      }),
    })
  },

  // Verify Audit
  async verifyAudit(presaleId: string) {
    return apiCall('admin-actions', {
      method: 'POST',
      body: JSON.stringify({
        action: 'verify_audit',
        presale_id: presaleId,
      }),
    })
  },
}

// Upload API (for KYC documents)
export const uploadAPI = {
  // Upload KYC document
  async uploadKYCDocument(file: File, presaleId: string) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('presale_id', presaleId)
    
    const token = getAuthToken()
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/kyc-documents/${presaleId}/${file.name}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: file,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    return response.json()
  },
}

// Error handling utility
export class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'APIError'
  }
}