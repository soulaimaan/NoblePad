import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils/utils.js';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateForumPost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    tags: ''
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ForumPost.create(data),
    onSuccess: (newPost) => {
      queryClient.invalidateQueries(['forumPosts']);
      toast.success('Discussion created successfully');
      navigate(createPageUrl(`ForumPostView?id=${newPost.id}`));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    createMutation.mutate({
      ...formData,
      tags: tagsArray
    });
  };

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

        <Card className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Start a New Discussion</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">Discussion Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="What would you like to discuss?"
                  className="bg-slate-800/50 border-purple-600/30 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-white">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="bg-slate-800/50 border-purple-600/30 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="security_questions">Security Questions</SelectItem>
                    <SelectItem value="project_reviews">Project Reviews</SelectItem>
                    <SelectItem value="noblepad_support">NoblePad Support</SelectItem>
                    <SelectItem value="defi_news">DeFi News</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-white">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Share your thoughts, ask questions, or start a discussion..."
                  className="bg-slate-800/50 border-purple-600/30 text-white h-48"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-white">Tags (optional, comma separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="security, defi, smart-contracts"
                  className="bg-slate-800/50 border-purple-600/30 text-white"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl('Forum'))}
                  className="border-purple-600 text-purple-400"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {createMutation.isPending ? 'Posting...' : 'Post Discussion'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}