import { doc, updateDoc, increment, collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserProfile } from '../types';

interface UpdateProfilePayload {
  profession: string;
  sector: string;
}

export const updateUserProfile = async (uid: string, data: UpdateProfilePayload) => {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    ...data,
    profileCompleted: true,
  });
};

export const addGamificationPoints = async (userId: string, points: number) => {
  if (points <= 0) return;
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    'gamification.points': increment(points)
  });
};

export const getUsersByIds = async (userIds: string[]): Promise<UserProfile[]> => {
  if (userIds.length === 0) return [];
  
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where(documentId(), 'in', userIds));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
};

export const updateEmployeeProfile = async (uid: string, data: {
  displayName: string;
  profession: string;
  sector: string;
}) => {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, data);
};

export const updateUserRole = async (uid: string, newRole: 'employee' | 'coordinator') => {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    role: newRole,
  });
};

/**
 * Atualiza o status de um usuário (de 'active' para 'inactive' ou vice-versa).
 * ESTA É A FUNÇÃO QUE ESTAVA FALTANDO.
 */
export const updateUserStatus = async (uid: string, newStatus: 'active' | 'inactive') => {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    status: newStatus,
  });
};

/**
 * Busca todos os perfis de usuário ATIVOS de uma organização específica.
 * ESTA FUNÇÃO FOI ATUALIZADA PARA FILTRAR USUÁRIOS INATIVOS.
 */
export const getUsersByOrganization = async (organizationId: string): Promise<UserProfile[]> => {
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef,
    where('organizationId', '==', organizationId),
    where('status', '==', 'active') // Filtra apenas usuários ativos
  );
  const querySnapshot = await getDocs(q);

  const users: UserProfile[] = [];
  querySnapshot.forEach((doc) => {
    users.push({ uid: doc.id, ...doc.data() } as UserProfile);
  });
  
  return users;
};
