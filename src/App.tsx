import { Routes, Route } from 'react-router-dom';
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
import CSMDashboardPage from './pages/CSMDashboardPage';
import ManagementPage from './pages/ManagementPage';
import LandingPage from './pages/LandingPage'; // Importar a nova página

import { ProtectedRoute } from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import OnboardingGate from './components/OnboardingGate';

function App() {
  return (
    <Routes>
      {/* ✅ INÍCIO DAS ROTAS PÚBLICAS */}
      {/* A rota principal (/) agora aponta para a LandingPage e é pública */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      {/* ✅ FIM DAS ROTAS PÚBLICAS */}


      {/* ROTAS PROTEGIDAS (só para utilizadores com login) */}
      <Route element={<ProtectedRoute />}>
        {/* A rota do CSM é protegida, mas não precisa do MainLayout padrão */}
        <Route path="/csm" element={<CSMDashboardPage />} />
        
        <Route element={<OnboardingGate />}>
          <Route element={<MainLayout />}>
            {/* ✅ O painel do funcionário agora está em /dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} /> 
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/coordinator" element={<CoordinatorDashboardPage />} />
            <Route path="/coordinator/employee/:userId" element={<EmployeeDetailPage />} />
            <Route path="/superadmin" element={<SuperAdminDashboardPage />} />
            <Route path="/management" element={<ManagementPage />} />
          </Route>
          {/* A página do módulo fica fora do MainLayout para ocupar o ecrã inteiro */}
          <Route path="/module/:moduleId" element={<ModulePage />} />
        </Route>
      </Route>
      
      {/* Rota para páginas não encontradas */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;