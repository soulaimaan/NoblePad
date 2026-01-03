import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { ArrowLeft, Clock, Tag, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils/utils.js';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';

export default function ArticleView() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', articleId],
    queryFn: async () => {
      const articles = await base44.entities.Article.filter({ id: articleId });
      return articles[0];
    },
    enabled: !!articleId
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading article...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-slate-900/50 border-purple-900/30">
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Article not found</h2>
            <Button onClick={() => navigate(createPageUrl('Resources'))}>
              Back to Resources
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
          onClick={() => navigate(createPageUrl('Resources'))}
          className="text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resources
        </Button>

        <article>
          <Card className="bg-slate-900/50 border-purple-900/30 backdrop-blur-xl">
            <CardContent className="p-8 md:p-12">
              {/* Header */}
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge className={getCategoryColor(article.category)}>
                    {article.category?.replace(/_/g, ' ')}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    {article.read_time || 5} min read
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(new Date(article.created_date), 'MMM d, yyyy')}
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {article.title}
                </h1>

                <p className="text-xl text-gray-400 mb-6">
                  {article.excerpt}
                </p>

                {article.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center text-sm px-3 py-1 bg-slate-800/50 text-purple-300 rounded-full border border-purple-900/30">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="prose prose-invert prose-purple max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-3xl font-bold text-white mt-8 mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-2xl font-bold text-white mt-6 mb-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xl font-bold text-white mt-4 mb-2">{children}</h3>,
                    p: ({ children }) => <p className="text-gray-300 mb-4 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2">{children}</ol>,
                    li: ({ children }) => <li className="text-gray-300">{children}</li>,
                    strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                    a: ({ href, children }) => (
                      <a href={href} className="text-purple-400 hover:text-purple-300 underline" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-purple-600 pl-4 py-2 my-4 bg-purple-900/20 text-gray-300 italic">
                        {children}
                      </blockquote>
                    ),
                    code: ({ inline, children }) => 
                      inline ? (
                        <code className="bg-slate-800 text-purple-300 px-2 py-1 rounded text-sm">{children}</code>
                      ) : (
                        <code className="block bg-slate-800 text-purple-300 p-4 rounded-lg my-4 overflow-x-auto">{children}</code>
                      )
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              </div>

              {/* Footer */}
              <div className="mt-12 pt-8 border-t border-purple-900/30">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Published by Lord Belgrave
                  </div>
                  <Button
                    onClick={() => navigate(createPageUrl('Resources'))}
                    variant="outline"
                    className="border-purple-600 text-purple-400 hover:bg-purple-900/30"
                  >
                    Read More Articles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </article>
      </div>
    </div>
  );
}