'use client'

import { Button } from '@/components/ui/Button'
import { useAccount } from '@/hooks/useCompatibleAccount'
import { MessageSquare, Send, ThumbsUp, User } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Comment {
  id: string
  address: string
  content: string
  timestamp: number
  likes: number
}

export function PresaleComments({ presaleId }: { presaleId: string }) {
  const { address, isConnected } = useAccount()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  // Load comments from local storage on mount (Simulation)
  useEffect(() => {
    const saved = localStorage.getItem(`comments-${presaleId}`)
    if (saved) {
      setComments(JSON.parse(saved))
    } else {
      // Mock initial comments
      setComments([
        {
          id: '1',
          address: '0x1234...5678',
          content: 'This project looks amazing! The security score is very reassuring.',
          timestamp: Date.now() - 3600000,
          likes: 12
        },
        {
          id: '2',
          address: '0x8765...4321',
          content: 'Does anyone know the vesting schedule for the team?',
          timestamp: Date.now() - 7200000,
          likes: 5
        }
      ])
    }
  }, [presaleId])

  const handlePost = () => {
    if (!newComment.trim()) return
    if (!isConnected || !address) {
      alert('Please connect your wallet to comment.')
      return
    }

    setLoading(true)
    
    // Simulate network delay
    setTimeout(() => {
      const comment: Comment = {
        id: Date.now().toString(),
        address: address,
        content: newComment,
        timestamp: Date.now(),
        likes: 0
      }

      const updated = [comment, ...comments]
      setComments(updated)
      localStorage.setItem(`comments-${presaleId}`, JSON.stringify(updated))
      setNewComment('')
      setLoading(false)
    }, 500)
  }

  const formatAddress = (addr: string) => {
    if (addr.length < 10) return addr
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="bg-noble-black/40 border border-noble-gold/10 rounded-2xl p-6">
      <div className="flex items-center space-x-2 mb-6">
        <MessageSquare className="text-noble-gold" size={24} />
        <h2 className="text-xl font-bold text-white">Community Discussion</h2>
        <span className="text-xs bg-noble-gray px-2 py-1 rounded text-gray-400">{comments.length}</span>
      </div>

      {/* Input Area */}
      <div className="mb-8">
        {!isConnected ? (
          <div className="bg-noble-gray/20 p-4 rounded-xl text-center border dashed border-noble-gold/20">
             <p className="text-gray-400 mb-2">Connect your wallet to join the discussion.</p>
          </div>
        ) : (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-noble-gold to-orange-500 flex items-center justify-center flex-shrink-0">
               <User className="text-black" size={20} />
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What do you think about this project?"
                className="w-full bg-black/40 border border-noble-gold/20 rounded-xl p-4 text-white focus:outline-none focus:border-noble-gold min-h-[100px]"
              />
              <div className="flex justify-end mt-2">
                <Button onClick={handlePost} disabled={loading || !newComment.trim()}>
                  {loading ? 'Posting...' : 'Post Comment'}
                  <Send size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4 group">
            <div className="flex-shrink-0">
               <div className="w-10 h-10 rounded-full bg-noble-gray flex items-center justify-center">
                 <User className="text-gray-400" size={20} />
               </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-noble-gold text-sm">{formatAddress(comment.address)}</span>
                <span className="text-xs text-gray-600">•</span>
                <span className="text-xs text-gray-500">{timeAgo(comment.timestamp)}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-2">{comment.content}</p>
              
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-noble-gold transition-colors">
                  <ThumbsUp size={12} />
                  {comment.likes}
                </button>
                <button className="text-xs text-gray-500 hover:text-noble-gold transition-colors">
                  Reply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
