import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
// Importa a função de ouvinte em tempo real
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  // A função de refresh manual se torna menos necessária, mas podemos manter
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  refreshUserProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Este useEffect agora lida APENAS com o estado de autenticação (logado/deslogado)
  useEffect(() => {
    const unsubscribeAuthState = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    // Limpa o ouvinte de autenticação ao desmontar
    return () => unsubscribeAuthState();
  }, []);

  // Este NOVO useEffect lida com o perfil do usuário usando um ouvinte em tempo real
  useEffect(() => {
    // Se existe um usuário logado, começa a ouvir por mudanças no seu perfil
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      
      // onSnapshot anexa um ouvinte. Ele dispara imediatamente e depois sempre que o documento mudar.
      const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          // Se o documento existe, atualiza o estado do perfil
          setUserProfile({ uid: user.uid, ...doc.data() } as UserProfile);
        } else {
          // Isso acontece brevemente durante o cadastro, antes do documento ser criado.
          // Mantemos o perfil como nulo para que o OnboardingGate mostre a mensagem de "finalizando...".
          setUserProfile(null);
        }
      });

      // Limpa o ouvinte do perfil quando o usuário desloga ou o componente é desmontado
      return () => unsubscribeProfile();
    } else {
      // Se não há usuário, não há perfil
      setUserProfile(null);
    }
  }, [user]); // Este efeito depende do objeto 'user'

  const refreshUserProfile = async () => {
    // Esta função agora é largamente redundante, pois o onSnapshot faz o trabalho
    // automaticamente, mas não há mal em mantê-la.
  };

  const value = { user, userProfile, loading, refreshUserProfile };

  return (
    <AuthContext.Provider value={value}>
      {/* Renderiza os filhos assim que o estado de autenticação for conhecido */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
