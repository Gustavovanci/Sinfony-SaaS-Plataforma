import { Routes, Route } from 'react-router-dom';

// Importação das Páginas
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProgressPage from './pages/ProgressPage';
import CertificatesPage from './pages/CertificatesPage';
import AccountPage from './pages/AccountPage';
import NotFoundPage from './pages/NotFoundPage';
import ModulePage from './pages/ModulePage';
import CoordinatorDashboardPage from './pages/CoordinatorDashboardPage';
import EmployeeDetailPage from './pages/EmployeeDetailPage';
import SuperAdminDashboardPage from './pages/SuperAdminDashboardPage';
import FeedbackListPage from './pages/FeedbackListPage';
import ManagementPage from './pages/ManagementPage'; // <-- IMPORTA A NOVA PÁGINA

// Importação dos Componentes de Layout e Proteção
import { ProtectedRoute } from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import OnboardingGate from './components/OnboardingGate';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<OnboardingGate />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/coordinator" element={<CoordinatorDashboardPage />} />
            <Route path="/coordinator/employee/:userId" element={<EmployeeDetailPage />} />
            <Route path="/coordinator/feedbacks" element={<FeedbackListPage />} />
            <Route path="/superadmin" element={<SuperAdminDashboardPage />} />
            <Route path="/management" element={<ManagementPage />} /> {/* <-- ADICIONA A NOVA ROTA */}
          </Route>
          <Route path="/module/:moduleId" element={<ModulePage />} />
        </Route>
      </Route>
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
