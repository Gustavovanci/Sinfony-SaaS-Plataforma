import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  updatePassword, // Importa a função de alteração de senha
} from 'firebase/auth';
import { collection, query, where, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { SignUpData, SignInData, UserProfile } from '../types';

/**
 * Cadastra um novo usuário, validando o domínio e criando o perfil no Firestore.
 */
export const signUp = async ({ email, password, displayName }: SignUpData) => {
  const domain = email.split('@')[1];
  if (!domain) {
    throw new Error('E-mail inválido.');
  }

  const organizationsRef = collection(db, 'organizations');
  const q = query(organizationsRef, where('domain', '==', domain));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('A sua empresa não está cadastrada na plataforma. Contate o suporte.');
  }

  const organizationDoc = querySnapshot.docs[0];
  const organizationId = organizationDoc.id;

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName });

  const userDocRef = doc(db, 'users', user.uid);
  await setDoc(userDocRef, {
    uid: user.uid,
    email: user.email,
    displayName: displayName,
    organizationId: organizationId,
    role: 'employee',
    profileCompleted: false,
    gamification: {
      points: 0,
      badges: ['iniciante'],
    },
    createdAt: new Date(),
  });

  return userCredential;
};

/**
 * Realiza o login de um usuário existente e retorna o seu perfil do Firestore.
 */
export const signIn = async ({ email, password }: SignInData): Promise<UserProfile> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const userDocRef = doc(db, 'users', user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    throw new Error("Perfil de usuário não encontrado na base de dados.");
  }

  return { uid: user.uid, ...userDocSnap.data() } as UserProfile;
};

/**
 * Altera a senha do usuário atualmente autenticado.
 */
export const changePassword = async (newPassword: string) => {
  if (!auth.currentUser) {
    throw new Error("Nenhum usuário autenticado para alterar a senha.");
  }
  await updatePassword(auth.currentUser, newPassword);
};

/**
 * Realiza o logout do usuário.
 */
export const signOut = async () => {
  return firebaseSignOut(auth);
};
