import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import EducationHub from './pages/EducationHub.jsx';
import SafetyChecker from './pages/SafetyChecker.jsx';
import Features from './pages/Features.jsx';
import Resources from './pages/Resources.jsx';
import Forum from './pages/Forum.jsx';
import StakingDashboard from './pages/StakingDashboard.jsx';
import ForumPostView from './pages/ForumPostView.jsx';
import CreateForumPost from './pages/CreateForumPost.jsx';
import ArticleView from './pages/ArticleView.jsx';
import CreateArticle from './pages/CreateArticle.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/EducationHub" element={<EducationHub />} />
          <Route path="/SafetyChecker" element={<SafetyChecker />} />
          <Route path="/Features" element={<Features />} />
          <Route path="/Resources" element={<Resources />} />
          <Route path="/Forum" element={<Forum />} />
          <Route path="/StakingDashboard" element={<StakingDashboard />} />
          <Route path="/ForumPostView" element={<ForumPostView />} />
          <Route path="/CreateForumPost" element={<CreateForumPost />} />
          <Route path="/ArticleView" element={<ArticleView />} />
          <Route path="/CreateArticle" element={<CreateArticle />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
