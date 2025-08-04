// 1. CORREÇÃO NO App.tsx - Adicionar rota do CSM

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
import CSMDashboardPage from './pages/CSMDashboardPage'; // ✅ IMPORTAR CSM
import FeedbackListPage from './pages/FeedbackListPage';
import ManagementPage from './pages/ManagementPage';

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
            <Route path="/csm" element={<CSMDashboardPage />} /> {/* ✅ ADICIONAR ROTA CSM */}
            <Route path="/management" element={<ManagementPage />} />
          </Route>
          <Route path="/module/:moduleId" element={<ModulePage />} />
        </Route>
      </Route>
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;

// 2. CORREÇÃO NO LoginPage.tsx - Adicionar redirecionamento CSM

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const userProfile = await signIn({ email, password });

    // --- LÓGICA DE REDIRECIONAMENTO CORRIGIDA ---
    if (userProfile.role === 'superadmin') {
      navigate('/superadmin');
    } else if (userProfile.role === 'csm') {  // ✅ TRATAR CSM
      navigate('/csm');
    } else if (userProfile.role === 'coordinator') {
      navigate('/coordinator');
    } else {
      navigate('/'); // Employees vão para dashboard normal
    }

  } catch (err: any) {
    setError('E-mail ou senha inválidos. Tente novamente.');
  } finally {
    setLoading(false);
  }
};

// 3. CORREÇÃO NO Sidebar.tsx - Adicionar navegação para CSM

const renderNavLinks = () => {
  if (!userProfile) return null;

  switch (userProfile.role) {
    case 'superadmin':
      return (
        <NavLink to="/superadmin" className={linkClass}>
          <Settings className="w-5 h-5 mr-3" />
          Painel SuperAdmin
        </NavLink>
      );
    
    case 'csm':  // ✅ ADICIONAR CASO CSM
      return (
        <NavLink to="/csm" className={linkClass}>
          <ShieldCheck className="w-5 h-5 mr-3" />
          Painel CSM
        </NavLink>
      );
    
    case 'coordinator':
      return (
        <>
          <NavLink to="/coordinator" className={linkClass} end>
            <ShieldCheck className="w-5 h-5 mr-3" />
            Dashboard
          </NavLink>
          <NavLink to="/coordinator/feedbacks" className={linkClass}>
            <MessageSquare className="w-5 h-5 mr-3" />
            Feedbacks
          </NavLink>
          <NavLink to="/management" className={linkClass}>
            <SlidersHorizontal className="w-5 h-5 mr-3" />
            Gestão da Equipe
          </NavLink>
        </>
      );
    
    case 'employee':
    default:
      return employeeLinks.map((link) => (
        <NavLink to={link.href} key={link.name} className={linkClass} end>
          <link.icon className="w-5 h-5 mr-3" />
          {link.name}
        </NavLink>
      ));
  }
};