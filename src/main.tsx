import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import About from './pages/About.tsx'
import TeamAndPartners from './pages/TeamAndPartners.tsx'
import Feature from './pages/Feature.tsx'
import FeatureDetail from './pages/Feature_Detail.tsx'
import OurCommunity from './pages/OCommunity.tsx'
import OurCommunityDetail from './pages/OCommunity_Detail.tsx'
import CCommunity from './pages/CCommunity.tsx'
import Login from './pages/Login.tsx'
import Dashboard from './pages/Dashboard.tsx'
import BlogListPage from './pages/admin/BlogList.tsx'
import BlogEditor from './pages/admin/BlogEditor.tsx'
import AnnouncementList from './pages/admin/AnnouncementList.tsx'
import AnnouncementEditor from './pages/admin/AnnouncementEditor.tsx'
import EventListPage from './pages/admin/EventList.tsx'
import EventEditor from './pages/admin/EventEditor.tsx'
import HighlightList from './pages/admin/HighlightList.tsx'
import HighlightEditor from './pages/admin/HighlightEditor.tsx'
import PasswordChange from './pages/admin/PasswordChange.tsx'
import ProtectedRoute from './components/auth/ProtectedRoute.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import './index.css'
import './styles/dashboard.css'
import BlogDetail from './pages/BlogDetail.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<TeamAndPartners />} />
          <Route path="/feature" element={<Feature />} />
          <Route path="/feature/:id" element={<FeatureDetail />} />
          <Route path="/ourcommunity" element={<OurCommunity />} />
          <Route path="/ourcommunity/:id" element={<OurCommunityDetail />} />
          <Route path="/news" element={<CCommunity />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/blogs" element={<ProtectedRoute><BlogListPage /></ProtectedRoute>} />
          <Route path="/admin/blogs/new" element={<ProtectedRoute><BlogEditor /></ProtectedRoute>} />
          <Route path="/admin/blogs/edit/:id" element={<ProtectedRoute><BlogEditor /></ProtectedRoute>} />
          <Route path="/admin/announcements" element={<ProtectedRoute><AnnouncementList /></ProtectedRoute>} />
          <Route path="/admin/announcements/new" element={<ProtectedRoute><AnnouncementEditor /></ProtectedRoute>} />
          <Route path="/admin/announcements/edit/:id" element={<ProtectedRoute><AnnouncementEditor /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute><EventListPage /></ProtectedRoute>} />
          <Route path="/admin/events/new" element={<ProtectedRoute><EventEditor /></ProtectedRoute>} />
          <Route path="/admin/events/:id" element={<ProtectedRoute><EventEditor /></ProtectedRoute>} />
          <Route path="/admin/highlights" element={<ProtectedRoute><HighlightList /></ProtectedRoute>} />
          <Route path="/admin/highlights/new" element={<ProtectedRoute><HighlightEditor /></ProtectedRoute>} />
          <Route path="/admin/highlights/:id" element={<ProtectedRoute><HighlightEditor /></ProtectedRoute>} />
          <Route path="/admin/password" element={<ProtectedRoute><PasswordChange /></ProtectedRoute>} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)
