import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell'; // <-- 1. IMPORTA O NOVO COMPONENTE

const Header = () => {
  const { userProfile } = useAuth();

  const getSubtitle = () => {
    if (!userProfile) return '';
    if (userProfile.profession) {
      return userProfile.profession;
    }
    return userProfile.role;
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-end px-8">
      <div className="flex items-center space-x-6">
        {/* 2. SUBSTITUI O BOTÃO ANTIGO PELO NOVO COMPONENTE */}
        <NotificationBell />

        {/* Informações do Utilizador */}
        <div className="text-right">
          <p className="font-semibold text-sm">{userProfile?.displayName}</p>
          <p className="text-xs text-gray-500 capitalize">{getSubtitle()}</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
