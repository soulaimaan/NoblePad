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
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateArticle() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    excerpt: '',
    tags: '',
    featured: false,
    read_time: 5
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Article.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['articles']);
      toast.success('Article created successfully');
      navigate(createPageUrl('Resources'));
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
          onClick={() => navigate(createPageUrl('Resources'))}
          className="text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resources
        </Button>

        <Card className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Create New Article</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                    <SelectItem value="rugpull_prevention">Rugpull Prevention</SelectItem>
                    <SelectItem value="defi_security">DeFi Security</SelectItem>
                    <SelectItem value="smart_contracts">Smart Contracts</SelectItem>
                    <SelectItem value="tokenomics">Tokenomics</SelectItem>
                    <SelectItem value="noblepad_features">NoblePad Features</SelectItem>
                    <SelectItem value="case_studies">Case Studies</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-white">Excerpt (Short Summary)</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  className="bg-slate-800/50 border-purple-600/30 text-white h-20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-white">Content (Markdown supported)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="bg-slate-800/50 border-purple-600/30 text-white h-64"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-white">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="security, defi, smart-contracts"
                    className="bg-slate-800/50 border-purple-600/30 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="read_time" className="text-white">Read Time (minutes)</Label>
                  <Input
                    id="read_time"
                    type="number"
                    value={formData.read_time}
                    onChange={(e) => setFormData({...formData, read_time: parseInt(e.target.value)})}
                    className="bg-slate-800/50 border-purple-600/30 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  className="w-4 h-4"
                />
                <Label htmlFor="featured" className="text-white cursor-pointer">Mark as Featured Article</Label>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl('Resources'))}
                  className="border-purple-600 text-purple-400"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {createMutation.isPending ? 'Creating...' : 'Create Article'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}