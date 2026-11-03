import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import { HostLayout } from '../components/layout/HostLayout';
import { AdminLayout } from '../components/layout/AdminLayout';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { FeaturesPage } from '../pages/public/FeaturesPage';
import { HowItWorksPage } from '../pages/public/HowItWorksPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { PublicFeedbackPage } from '../pages/public/PublicFeedbackPage';

// Host Pages
import { HostDashboard } from '../pages/host/HostDashboard';
import { EventListPage } from '../pages/host/EventListPage';
import { CreateEventPage } from '../pages/host/CreateEventPage';
import { EventDetailPage } from '../pages/host/EventDetailPage';
import { FormBuilderPage } from '../pages/host/FormBuilderPage';
import { QRCodePage } from '../pages/host/QRCodePage';
import { FeedbackResponsesPage } from '../pages/host/FeedbackResponsesPage';
import { AIInsightsPage } from '../pages/host/AIInsightsPage';
import { EventComparisonPage } from '../pages/host/EventComparisonPage';
import { AIAssistantPage } from '../pages/host/AIAssistantPage';
import { ImprovementTrackerPage } from '../pages/host/ImprovementTrackerPage';
import { ReportsPage } from '../pages/host/ReportsPage';
import { OrganizationSettingsPage } from '../pages/host/OrganizationSettingsPage';
import { ProfilePage } from '../pages/host/ProfilePage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { OrganizationManagementPage } from '../pages/admin/OrganizationManagementPage';
import { EventMonitoringPage } from '../pages/admin/EventMonitoringPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated && isAdmin ? children : <Navigate to="/dashboard" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/feedback/:code" element={<PublicFeedbackPage />} />

      {/* Host Portal Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HostLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<HostDashboard />} />
        <Route path="events" element={<EventListPage />} />
        <Route path="events/create" element={<CreateEventPage />} />
        <Route path="events/compare" element={<EventComparisonPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />
        <Route path="events/:id/builder" element={<FormBuilderPage />} />
        <Route path="events/:id/qr" element={<QRCodePage />} />
        <Route path="events/:id/responses" element={<FeedbackResponsesPage />} />
        <Route path="events/:id/ai" element={<AIInsightsPage />} />
        <Route path="ai-insights" element={<AIInsightsPage />} />
        <Route path="ai-assistant" element={<AIAssistantPage />} />
        <Route path="tasks" element={<ImprovementTrackerPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="organization/settings" element={<OrganizationSettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Admin Platform Console */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="organizations" element={<OrganizationManagementPage />} />
        <Route path="events" element={<EventMonitoringPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
