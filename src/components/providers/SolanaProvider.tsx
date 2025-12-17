'use client'

import React from 'react'

interface SolanaProviderProps {
  children: React.ReactNode
}

// Simplified Solana provider for now - can be enhanced later
// This allows the app to work while maintaining Solana UI support
export function SolanaProvider({ children }: SolanaProviderProps) {
  return <>{children}</>
}