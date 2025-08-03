import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Award, User, LogOut, ShieldCheck, Settings, MessageSquare, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../services/authService';

const employeeLinks = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'O Meu Progresso', href: '/progress', icon: BarChart3 },
  { name: 'Certificados', href: '/certificates', icon: Award },
];

const Sidebar = () => {
  const { userProfile } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2.5 rounded-lg transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-600 hover:bg-gray-100'
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
            {/* NOVO LINK PARA A GESTÃO */}
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

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center justify-center border-b font-bold text-xl text-blue-600">
        VitalTrain
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {renderNavLinks()}
        <hr className="my-4 border-gray-200" />
        <NavLink to="/account" className={linkClass}>
          <User className="w-5 h-5 mr-3" />
          A Minha Conta
        </NavLink>
      </nav>
      <div className="px-4 py-4 border-t">
        <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100">
          <LogOut className="w-5 h-5 mr-3" />
          Sair
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
