import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layout components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNavigation from './components/BottomNavigation';
import PublicHeader from './components/PublicHeader';

// Public/Auth Pages
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateProfile from './pages/candidate/CandidateProfile';
import JobSearch from './pages/candidate/JobSearch';
import Assessments from './pages/candidate/Assessments';
import LiveAssessment from './pages/candidate/LiveAssessment';
import CodeChallenge from './pages/candidate/CodeChallenge';
import SkillsGraph from './pages/candidate/SkillsGraph';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import JobManager from './pages/recruiter/JobManager';
import TalentDiscovery from './pages/recruiter/TalentDiscovery';
import AIRankingDashboard from './pages/recruiter/AIRankingDashboard';
import Copilot from './pages/recruiter/Copilot';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';

const App = () => {
  const { token, user } = useSelector((state) => state.auth);

  // Protected route wrapper
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="min-h-screen bg-darkBg text-slate-900 flex flex-col">
        {!token && <PublicHeader />}
        <div className="flex-1 flex">
          {token && <Sidebar />}
          <div className={`flex-1 flex flex-col min-w-0 ${token ? 'md:pl-64 pt-16 pb-16 md:pb-0' : ''}`}>
            {token && <Navbar />}
            <main className={`flex-1 ${token ? 'p-6 overflow-y-auto' : ''}`}>
            <Routes>
              {/* About Page as permanent Home Page */}
              <Route path="/" element={<About />} />

              {/* Auth Routes */}
              <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
              <Route path="/register" element={!token ? <Register /> : <Navigate to="/" />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Candidate Routes */}
              <Route
                path="/candidate/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <CandidateDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/profile"
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <CandidateProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/jobs"
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <JobSearch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/applications"
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <JobSearch defaultTab="applications" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/assessments"
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <Assessments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/assessment/:id"
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <LiveAssessment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/coding/:id"
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <CodeChallenge />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/skills-graph"
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <SkillsGraph />
                  </ProtectedRoute>
                }
              />

              {/* Recruiter Routes */}
              <Route
                path="/recruiter/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                    <RecruiterDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs"
                element={
                  <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                    <JobManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/:id/rankings"
                element={
                  <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                    <AIRankingDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/talent-discovery"
                element={
                  <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                    <TalentDiscovery />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/copilot"
                element={
                  <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                    <Copilot />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />

              {/* Catch All */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          {token && <BottomNavigation />}
        </div>
      </div>
    </div>
  </Router>
  );
};

export default App;
