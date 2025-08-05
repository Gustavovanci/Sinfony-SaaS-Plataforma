import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  setDoc, 
  doc, 
  getDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { SignUpData, SignInData, UserProfile } from '../types';
import { toast } from 'react-hot-toast';

// Interface para erros customizados
interface AuthError extends Error {
  code?: string;
}

/**
 * Mapeia códigos de erro do Firebase para mensagens amigáveis
 */
const getErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'Usuário não encontrado. Verifique o e-mail.';
    case 'auth/wrong-password':
      return 'Senha incorreta. Tente novamente.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está em uso. Tente fazer login.';
    case 'auth/weak-password':
      return 'A senha deve ter no mínimo 6 caracteres.';
    case 'auth/invalid-email':
      return 'E-mail inválido. Verifique o formato.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente em alguns minutos.';
    case 'auth/network-request-failed':
      return 'Erro de conexão. Verifique sua internet.';
    case 'auth/requires-recent-login':
      return 'Por segurança, você precisa fazer login novamente.';
    default:
      return error.message || 'Ocorreu um erro inesperado.';
  }
};

/**
 * Valida domínio de e-mail para organizações cadastradas
 */
const validateEmailDomain = async (email: string): Promise<string> => {
  const domain = email.split('@')[1];
  if (!domain) {
    throw new Error('Formato de e-mail inválido.');
  }

  try {
    const organizationsRef = collection(db, 'organizations');
    const q = query(organizationsRef, where('domain', '==', domain));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error(
        'Sua empresa não está cadastrada na plataforma. Contate o administrador para mais informações.'
      );
    }

    return querySnapshot.docs[0].id;
  } catch (error) {
    console.error('Erro ao validar domínio:', error);
    throw error;
  }
};

/**
 * Cadastra um novo usuário com validação completa
 */
export const signUp = async ({ email, password, displayName }: SignUpData): Promise<UserProfile> => {
  try {
    // Valida inputs básicos
    if (!email || !password || !displayName) {
      throw new Error('Todos os campos são obrigatórios.');
    }

    if (password.length < 6) {
      throw new Error('A senha deve ter no mínimo 6 caracteres.');
    }

    if (displayName.trim().length < 2) {
      throw new Error('O nome deve ter no mínimo 2 caracteres.');
    }

    // Valida domínio da empresa
    const organizationId = await validateEmailDomain(email.toLowerCase());

    // Cria usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      email.toLowerCase(), 
      password
    );
    const user = userCredential.user;

    // Atualiza perfil no Firebase Auth
    await updateProfile(user, { displayName: displayName.trim() });

    // Cria documento do usuário no Firestore
    const userProfile: Omit<UserProfile, 'uid'> = {
      email: user.email!,
      displayName: displayName.trim(),
      organizationId: organizationId,
      role: 'employee',
      status: 'active',
      profileCompleted: false,
      gamification: {
        points: 0,
        badges: ['iniciante'],
      },
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, userProfile);

    const finalProfile: UserProfile = {
      uid: user.uid,
      ...userProfile,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    toast.success(`Bem-vindo ao Sinfony, ${displayName}!`);
    return finalProfile;

  } catch (error) {
    console.error('Erro no cadastro:', error);
    const message = getErrorMessage(error as AuthError);
    toast.error(message);
    throw new Error(message);
  }
};

/**
 * Realiza login com validação completa
 */
export const signIn = async ({ email, password }: SignInData): Promise<UserProfile> => {
  try {
    if (!email || !password) {
      throw new Error('E-mail e senha são obrigatórios.');
    }

    // Faz login no Firebase Auth
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      email.toLowerCase(), 
      password
    );
    const user = userCredential.user;

    // Busca perfil do usuário no Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      // Se o documento não existe, tenta criá-lo (usuário migrado)
      const organizationId = await validateEmailDomain(email.toLowerCase());
      
      const newProfile: Omit<UserProfile, 'uid'> = {
        email: user.email!,
        displayName: user.displayName || 'Usuário',
        organizationId: organizationId,
        role: 'employee',
        status: 'active',
        profileCompleted: false,
        gamification: {
          points: 0,
          badges: ['iniciante'],
        },
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      };

      await setDoc(userDocRef, newProfile);
      
      const finalProfile: UserProfile = {
        uid: user.uid,
        ...newProfile,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      toast.success('Perfil criado com sucesso!');
      return finalProfile;
    }

    // Atualiza último login
    await updateDoc(userDocRef, {
      lastLoginAt: serverTimestamp()
    });

    const userData = userDocSnap.data();
    const userProfile: UserProfile = { 
      uid: user.uid, 
      ...userData,
      createdAt: userData.createdAt?.toDate() || new Date(),
      lastLoginAt: new Date()
    } as UserProfile;

    // Verifica se a conta está ativa
    if (userProfile.status === 'inactive') {
      await firebaseSignOut(auth);
      throw new Error('Sua conta foi desativada. Contate o administrador.');
    }

    toast.success(`Bem-vindo de volta, ${userProfile.displayName}!`);
    return userProfile;

  } catch (error) {
    console.error('Erro no login:', error);
    const message = getErrorMessage(error as AuthError);
    toast.error(message);
    throw new Error(message);
  }
};

/**
 * Altera senha com reautenticação
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('Usuário não autenticado.');
    }

    if (!currentPassword || !newPassword) {
      throw new Error('Senha atual e nova senha são obrigatórias.');
    }

    if (newPassword.length < 6) {
      throw new Error('A nova senha deve ter no mínimo 6 caracteres.');
    }

    if (currentPassword === newPassword) {
      throw new Error('A nova senha deve ser diferente da atual.');
    }

    // Reautentica o usuário
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Atualiza a senha
    await updatePassword(user, newPassword);

    toast.success('Senha alterada com sucesso!');

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    const message = getErrorMessage(error as AuthError);
    toast.error(message);
    throw new Error(message);
  }
};

/**
 * Envia e-mail de recuperação de senha
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    if (!email) {
      throw new Error('E-mail é obrigatório.');
    }

    // Valida se o e-mail existe na plataforma
    await validateEmailDomain(email.toLowerCase());

    await sendPasswordResetEmail(auth, email.toLowerCase());
    
    toast.success('E-mail de recuperação enviado! Verifique sua caixa de entrada.');

  } catch (error) {
    console.error('Erro ao enviar e-mail de recuperação:', error);
    const message = getErrorMessage(error as AuthError);
    toast.error(message);
    throw new Error(message);
  }
};

/**
 * Logout com limpeza de dados
 */
export const signOut = async (): Promise<void> => {
  try {
    // Limpa cache local se existir
    if (typeof Storage !== 'undefined') {
      localStorage.removeItem('sinfony_cache');
      sessionStorage.clear();
    }

    await firebaseSignOut(auth);
    toast.success('Logout realizado com sucesso!');

  } catch (error) {
    console.error('Erro no logout:', error);
    toast.error('Erro ao fazer logout');
    throw error;
  }
};

/**
 * Verifica se o usuário está online
 */
export const checkAuthState = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * Atualiza perfil do usuário no Firebase Auth
 */
export const updateUserAuthProfile = async (updates: {
  displayName?: string;
  photoURL?: string;
}): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuário não autenticado.');
    }

    await updateProfile(user, updates);
    
    // Também atualiza no Firestore se necessário
    if (updates.displayName) {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: updates.displayName,
        updatedAt: serverTimestamp()
      });
    }

    toast.success('Perfil atualizado com sucesso!');

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    const message = getErrorMessage(error as AuthError);
    toast.error(message);
    throw new Error(message);
  }
};

/**
 * Deleta conta do usuário (apenas desativa)
 */
export const deleteAccount = async (password: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('Usuário não autenticado.');
    }

    // Reautentica antes de desativar
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);

    // Marca como inativo no Firestore (soft delete)
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      status: 'inactive',
      deactivatedAt: serverTimestamp()
    });

    // Faz logout
    await signOut();
    
    toast.success('Conta desativada com sucesso.');

  } catch (error) {
    console.error('Erro ao desativar conta:', error);
    const message = getErrorMessage(error as AuthError);
    toast.error(message);
    throw new Error(message);
  }
};