// src/components/Sidebar.tsx

import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Award, User, LogOut, ShieldCheck, Settings, MessageSquare, SlidersHorizontal, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../services/authService';

const employeeLinks = [
  { to: '/', text: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
  { to: '/meu-progresso', text: 'O Meu Progresso', icon: <BarChart3 className="w-5 h-5 mr-3" /> },
  { to: '/certificados', text: 'Certificados', icon: <Award className="w-5 h-5 mr-3" /> },
  { to: '/minha-conta', text: 'A Minha Conta', icon: <User className="w-5 h-5 mr-3" /> },
];

const coordinatorLinks = [
  { to: '/coordinator', text: 'Painel do Coordenador', icon: <SlidersHorizontal className="w-5 h-5 mr-3" /> },
  { to: '/minha-conta', text: 'Minha Conta', icon: <User className="w-5 h-5 mr-3" /> },
];

const Sidebar = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-sm font-medium transition-colors duration-150 ${
      isActive ? 'text-white bg-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`;

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
      
      // CASE ADICIONADO PARA O CSM
      case 'csm':
        return (
          <NavLink to="/csm" className={linkClass}>
            <Briefcase className="w-5 h-5 mr-3" />
            Painel CSM
          </NavLink>
        );

      case 'coordinator':
        return coordinatorLinks.map((link) => (
          <NavLink key={link.to} to={link.to} className={linkClass}>
            {link.icon}
            {link.text}
          </NavLink>
        ));
        
      case 'employee':
      default:
        return employeeLinks.map((link) => (
          <NavLink key={link.to} to={link.to} className={linkClass}>
            {link.icon}
            {link.text}
          </NavLink>
        ));
    }
  };


  return (
    <aside className="flex flex-col w-64 bg-white border-r">
      <div className="flex items-center justify-center h-20 border-b">
        <h1 className="text-2xl font-bold text-gray-800">VitalTrain</h1>
      </div>
      <nav className="flex-grow py-4">
        {renderNavLinks()}
      </nav>
      <div className="px-4 py-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 transition-colors duration-150 rounded-md hover:text-gray-900 hover:bg-gray-100"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sair
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;