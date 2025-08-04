import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { UserProfile } from '../types';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refreshUserProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  error: null,
  refreshUserProfile: async () => {},
  clearError: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listener para mudanças de autenticação
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(
      auth, 
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
        
        if (!currentUser) {
          setUserProfile(null);
          setError(null);
        }
      },
      (authError) => {
        console.error('Erro de autenticação:', authError);
        setError('Erro de autenticação. Tente fazer login novamente.');
        setLoading(false);
      }
    );

    return () => unsubscribeAuth();
  }, []);

  // Listener para mudanças no perfil do usuário
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribeProfile = onSnapshot(
      userDocRef, 
      (doc) => {
        if (doc.exists()) {
          const profileData = { uid: user.uid, ...doc.data() } as UserProfile;
          setUserProfile(profileData);
          setError(null);
        } else {
          // Documento não existe ainda (novo usuário)
          setUserProfile(null);
        }
      },
      (profileError) => {
        console.error('Erro ao carregar perfil:', profileError);
        setError('Erro ao carregar perfil do usuário.');
        toast.error('Erro ao carregar dados do perfil');
      }
    );

    return () => unsubscribeProfile();
  }, [user]);

  const refreshUserProfile = async () => {
    // Com o listener em tempo real, esta função é menos necessária
    // mas mantemos para compatibilidade
    try {
      setError(null);
      // O listener já cuida da atualização automática
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError('Erro ao atualizar perfil do usuário.');
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = { 
    user, 
    userProfile, 
    loading, 
    error,
    refreshUserProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};