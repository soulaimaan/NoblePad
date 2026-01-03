import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { MessageSquare, Plus, Eye, ThumbsUp, Pin, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils/utils.js';
import { format } from 'date-fns';

export default function Forum() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['forumPosts'],
    queryFn: () => base44.entities.ForumPost.list('-created_date', 100)
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const categories = [
    { value: 'all', label: 'All Discussions', color: 'bg-gray-600' },
    { value: 'general', label: 'General', color: 'bg-blue-600' },
    { value: 'security_questions', label: 'Security Questions', color: 'bg-red-600' },
    { value: 'project_reviews', label: 'Project Reviews', color: 'bg-purple-600' },
    { value: 'noblepad_support', label: 'NoblePad Support', color: 'bg-green-600' },
    { value: 'defi_news', label: 'DeFi News', color: 'bg-orange-600' },
    { value: 'community', label: 'Community', color: 'bg-pink-600' }
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(p => p.category === selectedCategory);

  const pinnedPosts = filteredPosts.filter(p => p.pinned);
  const regularPosts = filteredPosts.filter(p => !p.pinned);

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || 'bg-gray-600';
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-purple-900/30 border border-purple-600/50 rounded-full px-4 py-2 text-sm text-purple-300 mb-4">
            <MessageSquare className="w-4 h-4" />
            <span>Community Hub</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Community Forum
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join discussions about DeFi security, ask questions, and connect with the community
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-900/50 text-gray-300 border border-purple-900/30 hover:bg-purple-900/30'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Create Post Button */}
        <div className="mb-8">
          <Link to={createPageUrl('CreateForumPost')}>
            <Card className="bg-slate-900/50 border-purple-600/50 backdrop-blur-xl hover:border-purple-600 transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-3">
                  <Plus className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-medium">Start a New Discussion</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-slate-700 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No discussions yet</h3>
              <p className="text-gray-400 mb-6">Be the first to start a conversation</p>
              <Link to={createPageUrl('CreateForumPost')}>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                  Create First Post
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Pinned Posts */}
            {pinnedPosts.length > 0 && (
              <div className="space-y-4 mb-6">
                {pinnedPosts.map(post => (
                  <Link key={post.id} to={createPageUrl(`ForumPostView?id=${post.id}`)}>
                    <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-600/30 backdrop-blur-xl hover:border-yellow-600/50 transition-all cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Pin className="w-4 h-4 text-yellow-400" />
                              <Badge className={`${getCategoryColor(post.category)} text-white`}>
                                {post.category?.replace(/_/g, ' ')}
                              </Badge>
                              <span className="text-xs text-gray-400">Pinned</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2 hover:text-purple-400 transition-colors">
                              {post.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                Lord Belgrave
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {format(new Date(post.created_date), 'MMM d')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {post.view_count || 0}
                              </div>
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="w-4 h-4" />
                                {post.upvotes || 0}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Regular Posts */}
            {regularPosts.map(post => (
              <Link key={post.id} to={createPageUrl(`ForumPostView?id=${post.id}`)}>
                <Card className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl hover:border-purple-600/50 transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getCategoryColor(post.category)} text-white`}>
                            {post.category?.replace(/_/g, ' ')}
                          </Badge>
                          {post.tags?.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-slate-800/50 text-purple-300 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2 hover:text-purple-400 transition-colors">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Lord Belgrave
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {format(new Date(post.created_date), 'MMM d')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.view_count || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            {post.upvotes || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}