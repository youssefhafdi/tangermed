import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './router/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CampaignsPage from './pages/campaigns/CampaignsPage';
import CampaignCreatePage from './pages/campaigns/CampaignCreatePage';
import CampaignDetailPage from './pages/campaigns/CampaignDetailPage';
import TemplatesPage from './pages/templates/TemplatesPage';
import TemplateEditorPage from './pages/templates/TemplateEditorPage';
import GroupsPage from './pages/groups/GroupsPage';
import GroupDetailPage from './pages/groups/GroupDetailPage';
import ResultsPage from './pages/results/ResultsPage';
import LandingPagesPage from './pages/LandingPagesPage';
import LandingPageEditorPage from './pages/LandingPageEditorPage';
import UsersPage from './pages/users/UsersPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="campaigns/new" element={<CampaignCreatePage />} />
          <Route path="campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="templates/:id" element={<TemplateEditorPage />} />
          <Route path="groups" element={<GroupsPage />} />
          <Route path="groups/:id" element={<GroupDetailPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="landing-pages" element={<LandingPagesPage />} />
          <Route path="landing-pages/:id" element={<LandingPageEditorPage />} />
          <Route path="users" element={
            <ProtectedRoute adminOnly>
              <UsersPage />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
