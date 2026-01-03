import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { ArrowLeft, ThumbsUp, MessageSquare, Clock, User, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils/utils.js';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ForumPostView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');

  const [newComment, setNewComment] = useState('');

  const { data: post, isLoading } = useQuery({
    queryKey: ['forumPost', postId],
    queryFn: async () => {
      const posts = await base44.entities.ForumPost.filter({ id: postId });
      return posts[0];
    },
    enabled: !!postId
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['forumComments', postId],
    queryFn: () => base44.entities.ForumComment.filter({ post_id: postId }, '-created_date', 100),
    enabled: !!postId
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  // Increment view count on mount
  useEffect(() => {
    if (post) {
      base44.entities.ForumPost.update(post.id, {
        view_count: (post.view_count || 0) + 1
      });
    }
  }, [post]);

  const upvoteMutation = useMutation({
    mutationFn: () => base44.entities.ForumPost.update(post.id, {
      upvotes: (post.upvotes || 0) + 1
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['forumPost', postId]);
      toast.success('Upvoted!');
    }
  });

  const commentMutation = useMutation({
    mutationFn: (content) => base44.entities.ForumComment.create({
      post_id: postId,
      content
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['forumComments', postId]);
      setNewComment('');
      toast.success('Comment added');
    }
  });

  const upvoteCommentMutation = useMutation({
    mutationFn: (commentId) => {
      const comment = comments.find(c => c.id === commentId);
      return base44.entities.ForumComment.update(commentId, {
        upvotes: (comment.upvotes || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['forumComments', postId]);
    }
  });

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      commentMutation.mutate(newComment);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-blue-600',
      security_questions: 'bg-red-600',
      project_reviews: 'bg-purple-600',
      noblepad_support: 'bg-green-600',
      defi_news: 'bg-orange-600',
      community: 'bg-pink-600'
    };
    return colors[category] || 'bg-gray-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading discussion...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-slate-900/50 border-purple-900/30">
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Discussion not found</h2>
            <Button onClick={() => navigate(createPageUrl('Forum'))}>
              Back to Forum
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('Forum'))}
          className="text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Forum
        </Button>

        {/* Main Post */}
        <Card className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl mb-6">
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className={`${getCategoryColor(post.category)} text-white`}>
                  {post.category?.replace(/_/g, ' ')}
                </Badge>
                {post.tags?.map((tag, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-slate-800/50 text-purple-300 rounded">
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>

              <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Lord Belgrave
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {format(new Date(post.created_date), 'MMM d, yyyy')}
                </div>
              </div>

              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-purple-900/30">
              <Button
                variant="outline"
                size="sm"
                onClick={() => upvoteMutation.mutate()}
                disabled={upvoteMutation.isPending}
                className="border-purple-600/30 text-gray-300 hover:text-white hover:bg-purple-900/30"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                {post.upvotes || 0} Upvotes
              </Button>
              <div className="flex items-center gap-2 text-gray-400">
                <MessageSquare className="w-4 h-4" />
                <span>{comments.length} Comments</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              Comments ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Comment Form */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="bg-slate-800/50 border-purple-600/30 text-white"
                  rows={4}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={commentMutation.isPending || !newComment.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4 text-center">
                <p className="text-gray-300">Please sign in to comment</p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="bg-slate-800/30 rounded-lg p-4 border border-purple-900/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <User className="w-4 h-4" />
                        <span>Lord Belgrave</span>
                        <span>•</span>
                        <Clock className="w-4 h-4" />
                        <span>{format(new Date(comment.created_date), 'MMM d')}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => upvoteCommentMutation.mutate(comment.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        {comment.upvotes || 0}
                      </Button>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}