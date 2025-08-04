// src/components/Sidebar.tsx

import { NavLink, useNavigate } from 'react-router-dom';
// ✅ AQUI: Adicionado o ícone "Users" que estava em falta
import { LayoutDashboard, BarChart3, Award, User, Users, LogOut, ShieldCheck, Settings, MessageSquare, SlidersHorizontal, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../services/authService';

const employeeLinks = [
  { to: '/', text: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
  { to: '/progress', text: 'O Meu Progresso', icon: <BarChart3 className="w-5 h-5 mr-3" /> },
  { to: '/certificates', text: 'Certificados', icon: <Award className="w-5 h-5 mr-3" /> },
];

const coordinatorLinks = [
  { to: '/coordinator', text: 'Painel do Coordenador', icon: <SlidersHorizontal className="w-5 h-5 mr-3" /> },
  { to: '/management', text: 'Gestão da Equipe', icon: <Users className="w-5 h-5 mr-3" /> },
];

const Sidebar = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-sm font-medium transition-colors duration-150 rounded-lg ${
      isActive ? 'text-white bg-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`;

  const renderNavLinks = () => {
    if (!userProfile) return null;

    let linksToRender = [];

    switch (userProfile.role) {
      case 'superadmin':
        linksToRender.push({ to: '/superadmin', text: 'Painel SuperAdmin', icon: <Settings className="w-5 h-5 mr-3" /> });
        break;
      case 'csm':
        linksToRender.push({ to: '/csm', text: 'Painel CSM', icon: <Briefcase className="w-5 h-5 mr-3" /> });
        break;
      case 'coordinator':
        linksToRender = coordinatorLinks;
        break;
      case 'employee':
      default:
        linksToRender = employeeLinks;
        break;
    }

    return (
      <>
        {linksToRender.map((link) => (
          <NavLink key={link.to} to={link.to} className={linkClass} end>
            {link.icon}
            {link.text}
          </NavLink>
        ))}
        <hr className="my-4 border-gray-200" />
        <NavLink to="/account" className={linkClass}>
          <User className="w-5 h-5 mr-3" />
          A Minha Conta
        </NavLink>
      </>
    );
  };

  return (
    <aside className="flex flex-col w-64 bg-white border-r">
      <div className="flex items-center justify-center h-20 border-b">
        <h1 className="text-2xl font-bold text-gray-800">Sinfony</h1>
      </div>
      <nav className="flex-grow p-4 space-y-2">
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