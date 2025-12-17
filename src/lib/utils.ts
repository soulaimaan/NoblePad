import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string, start = 6, end = 4) {
  if (!address) return ''
  return `${address.slice(0, start)}...${address.slice(-end)}`
}

export function formatNumber(num: number, decimals = 2) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatTimeLeft(endTime: Date) {
  const now = new Date()
  const timeDiff = endTime.getTime() - now.getTime()
  
  if (timeDiff <= 0) return { expired: true, timeString: 'Ended' }
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
  
  return {
    expired: false,
    timeString: `${days}d ${hours}h ${minutes}m`,
    days,
    hours,
    minutes
  }
}

export function calculateUserTier(stakedAmount: number) {
  if (stakedAmount >= 10000) return { tier: 'Gold', allocation: 5000, color: 'text-yellow-400' }
  if (stakedAmount >= 5000) return { tier: 'Silver', allocation: 2500, color: 'text-gray-300' }
  if (stakedAmount >= 1000) return { tier: 'Bronze', allocation: 1000, color: 'text-orange-400' }
  return { tier: 'None', allocation: 0, color: 'text-gray-500' }
}