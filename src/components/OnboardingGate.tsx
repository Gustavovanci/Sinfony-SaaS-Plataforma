import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileSetupModal from './ProfileSetupModal';

const OnboardingGate = () => {
  const { user, userProfile, refreshUserProfile } = useAuth();

  // --- LÓGICA CORRIGIDA ---

  // Se temos um utilizador autenticado (user), mas ainda não carregámos
  // o seu perfil da base de dados (userProfile), significa que estamos
  // no meio do processo de login/registo. Mostramos uma mensagem de espera.
  if (user && !userProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>A finalizar configuração do perfil...</p>
      </div>
    );
  }
  
  // Se o perfil já foi carregado (userProfile existe) e não está completo,
  // então mostramos o modal para escolher a profissão.
  if (userProfile && !userProfile.profileCompleted) {
    return <ProfileSetupModal onProfileUpdate={refreshUserProfile} />;
  }

  // Se nenhuma das condições acima for verdadeira, significa que o utilizador
  // está com o perfil completo e pode aceder à aplicação.
  return <Outlet />;
};

export default OnboardingGate;
