export const base44 = {
  entities: {
    ForumPost: {
      create: (data) => {
        console.log('Creating forum post:', data);
        return Promise.resolve({ id: `post-${Date.now()}`, created_date: new Date().toISOString(), ...data });
      },
      list: (sort = '-created_date', limit = 100) => {
        console.log('Listing forum posts (mock)');
        // Return some mock data
        const mockPosts = [
          { id: 'post-1', title: 'Welcome to NoblePad Forum', category: 'general', content: 'This is a mock post.', tags: ['welcome', 'general'], created_date: new Date().toISOString(), view_count: 100, upvotes: 50 },
          { id: 'post-2', title: 'Security Questions Thread', category: 'security_questions', content: 'Another mock post.', tags: ['security', 'faq'], created_date: new Date(Date.now() - 86400000).toISOString(), view_count: 50, upvotes: 20 },
        ];
        return Promise.resolve(mockPosts);
      },
      filter: (criteria, sort = '-created_date', limit = 100) => {
        console.log('Filtering forum posts (mock)', criteria);
        const mockPosts = [
          { id: 'post-1', title: 'Welcome to NoblePad Forum', category: 'general', content: 'This is a mock post.', tags: ['welcome', 'general'], created_date: new Date().toISOString(), view_count: 100, upvotes: 50 },
          { id: 'post-2', title: 'Security Questions Thread', category: 'security_questions', content: 'Another mock post.', tags: ['security', 'faq'], created_date: new Date(Date.now() - 86400000).toISOString(), view_count: 50, upvotes: 20 },
        ];
        return Promise.resolve(mockPosts.filter(post => {
          for (const key in criteria) {
            if (post[key] !== criteria[key]) return false;
          }
          return true;
        }));
      },
      update: (id, data) => {
        console.log(`Updating forum post ${id} (mock)`, data);
        return Promise.resolve({ id, ...data });
      }
    },
    Article: {
      list: (sort = '-created_date', limit = 100) => {
        console.log('Listing articles (mock)');
        // Return some mock data
        const mockArticles = [
          { id: 'article-1', title: 'Understanding Rug Pulls', category: 'rugpull_prevention', excerpt: 'A brief guide to rug pulls.', content: 'Full content of the article about rug pulls.', tags: ['rugpull', 'safety'], created_date: new Date().toISOString(), featured: true, read_time: 5 },
          { id: 'article-2', title: 'NoblePad Security Features', category: 'noblepad_features', excerpt: 'Explore our unique security.', content: 'Details about NoblePad features.', tags: ['noblepad', 'security'], created_date: new Date(Date.now() - 86400000).toISOString(), featured: false, read_time: 3 },
        ];
        return Promise.resolve(mockArticles);
      },
      filter: (criteria) => {
        console.log('Filtering articles (mock)', criteria);
        const mockArticles = [
          { id: 'article-1', title: 'Understanding Rug Pulls', category: 'rugpull_prevention', excerpt: 'A brief guide to rug pulls.', content: 'Full content of the article about rug pulls.', tags: ['rugpull', 'safety'], created_date: new Date().toISOString(), featured: true, read_time: 5 },
          { id: 'article-2', title: 'NoblePad Security Features', category: 'noblepad_features', excerpt: 'Explore our unique security.', content: 'Details about NoblePad features.', tags: ['noblepad', 'security'], created_date: new Date(Date.now() - 86400000).toISOString(), featured: false, read_time: 3 },
        ];
        return Promise.resolve(mockArticles.filter(article => {
          for (const key in criteria) {
            if (article[key] !== criteria[key]) return false;
          }
          return true;
        }));
      },
      create: (data) => {
        console.log('Creating article (mock)', data);
        return Promise.resolve({ id: `article-${Date.now()}`, created_date: new Date().toISOString(), ...data });
      },
      update: (id, data) => {
        console.log(`Updating article ${id} (mock)`, data);
        return Promise.resolve({ id, ...data });
      }
    },
  },
  auth: {
    me: () => {
      console.log('Getting current user (mock)');
      // Return a mock user object (e.g., for admin features)
      return Promise.resolve({ id: 'user-1', name: 'Lord Belgrave', role: 'admin' });
    },
  },
};