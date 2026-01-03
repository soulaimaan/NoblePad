import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Search, BookOpen, Clock, Tag, Plus, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils/utils.js';

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: () => base44.entities.Article.list('-created_date', 100)
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const categories = [
    { value: 'all', label: 'All Resources' },
    { value: 'rugpull_prevention', label: 'Rugpull Prevention' },
    { value: 'defi_security', label: 'DeFi Security' },
    { value: 'smart_contracts', label: 'Smart Contracts' },
    { value: 'tokenomics', label: 'Tokenomics' },
    { value: 'noblepad_features', label: 'NoblePad Features' },
    { value: 'case_studies', label: 'Case Studies' }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredArticles = filteredArticles.filter(a => a.featured);
  const regularArticles = filteredArticles.filter(a => !a.featured);

  const getCategoryColor = (category) => {
    const colors = {
      rugpull_prevention: 'bg-red-100 text-red-800 border-red-200',
      defi_security: 'bg-blue-100 text-blue-800 border-blue-200',
      smart_contracts: 'bg-purple-100 text-purple-800 border-purple-200',
      tokenomics: 'bg-green-100 text-green-800 border-green-200',
      noblepad_features: 'bg-pink-100 text-pink-800 border-pink-200',
      case_studies: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-purple-900/30 border border-purple-600/50 rounded-full px-4 py-2 text-sm text-purple-300 mb-4">
            <BookOpen className="w-4 h-4" />
            <span>Knowledge Base</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Resource Library
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Comprehensive guides, articles, and case studies about DeFi security and NoblePad
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search articles, tags, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-900/50 border-purple-600/30 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
            {user?.role === 'admin' && (
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Article
              </Button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
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
        </div>

        {/* Create Article Form */}
        {showCreateForm && (
          <Link to={createPageUrl('CreateArticle')}>
            <Card className="bg-slate-900/50 border-purple-600/50 backdrop-blur-xl mb-8 cursor-pointer hover:border-purple-600 transition-all">
              <CardContent className="p-6 text-center">
                <Plus className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-white font-medium">Click to create a new article</p>
              </CardContent>
            </Card>
          </Link>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-slate-700 rounded w-full mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded w-5/6"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <Card className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery ? 'Try a different search term' : 'Be the first to create an article'}
              </p>
              {user?.role === 'admin' && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Create First Article
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Featured Articles */}
            {featuredArticles.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Star className="w-6 h-6 text-yellow-400 mr-2" />
                  Featured Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredArticles.map(article => (
                    <Link key={article.id} to={createPageUrl(`ArticleView?id=${article.id}`)}>
                      <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-600/50 backdrop-blur-xl hover:border-purple-600 transition-all cursor-pointer h-full">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <Badge className={getCategoryColor(article.category)}>
                              {article.category?.replace(/_/g, ' ')}
                            </Badge>
                            <div className="flex items-center text-sm text-gray-400">
                              <Clock className="w-4 h-4 mr-1" />
                              {article.read_time || 5} min
                            </div>
                          </div>
                          <CardTitle className="text-white text-xl hover:text-purple-400 transition-colors">
                            {article.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-300 mb-4">{article.excerpt}</p>
                          {article.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {article.tags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="inline-flex items-center text-xs px-2 py-1 bg-slate-800/50 text-purple-300 rounded">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Regular Articles */}
            {regularArticles.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  {featuredArticles.length > 0 ? 'All Articles' : 'Articles'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularArticles.map(article => (
                    <Link key={article.id} to={createPageUrl(`ArticleView?id=${article.id}`)}>
                      <Card className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl hover:border-purple-600/50 transition-all cursor-pointer h-full">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <Badge className={getCategoryColor(article.category)}>
                              {article.category?.replace(/_/g, ' ')}
                            </Badge>
                            <div className="flex items-center text-sm text-gray-400">
                              <Clock className="w-4 h-4 mr-1" />
                              {article.read_time || 5} min
                            </div>
                          </div>
                          <CardTitle className="text-white text-lg hover:text-purple-400 transition-colors">
                            {article.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-400 text-sm mb-4">{article.excerpt}</p>
                          {article.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {article.tags.slice(0, 2).map((tag, idx) => (
                                <span key={idx} className="inline-flex items-center text-xs px-2 py-1 bg-slate-800/50 text-purple-300 rounded">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}