import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  orderBy,
  writeBatch,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserProfile } from '../types';

export interface Notification {
  id: string;
  senderId: string;
  organizationId: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

// Envia notificação para TODAS as organizações (broadcast do CSM)
export const sendBroadcastNotification = async (data: { senderId: string, message: string }) => {
  try {
    const orgsRef = collection(db, 'organizations');
    const orgsSnapshot = await getDocs(orgsRef);
    if (orgsSnapshot.empty) return;

    const batch = writeBatch(db);
    const notificationsRef = collection(db, 'notifications');
    orgsSnapshot.forEach(orgDoc => {
      const newNotifRef = doc(notificationsRef);
      batch.set(newNotifRef, {
        ...data,
        organizationId: orgDoc.id,
        createdAt: serverTimestamp(),
      });
    });
    await batch.commit();
  } catch (error) {
    console.error("Erro ao enviar notificação em massa:", error);
  }
};

// Envia notificação direcionada (para Coordenadores)
export const sendNotification = async (data: { senderId: string, organizationId: string, message: string, recipientId?: string }) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      ...data,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
  }
};

// Busca notificações e o seu estado individual (lido/apagado)
export const getNotificationsForUser = (userProfile: UserProfile, callback: (notifications: Notification[]) => void) => {
  if (!userProfile?.organizationId || !userProfile.uid) return () => {};

  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('organizationId', '==', userProfile.organizationId),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, async (querySnapshot) => {
    const userStatusRef = collection(db, 'users', userProfile.uid, 'notificationStatus');
    const userStatusSnapshot = await getDocs(userStatusRef);
    
    const statusMap = new Map<string, { read?: boolean; deleted?: boolean }>();
    userStatusSnapshot.forEach(doc => {
      statusMap.set(doc.id, doc.data());
    });

    const notifications: Notification[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const status = statusMap.get(doc.id);

      if (
        !status?.deleted &&
        data.senderId !== userProfile.uid &&
        (!data.recipientId || data.recipientId === userProfile.uid)
      ) {
        notifications.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          read: status?.read ?? false,
        } as Notification);
      }
    });
    callback(notifications);
  });

  return unsubscribe;
};

// Marca notificações como lidas para um utilizador específico
export const markNotificationsAsReadForUser = async (userId: string, notificationIds: string[]) => {
  if (!userId || notificationIds.length === 0) return;
  const batch = writeBatch(db);
  notificationIds.forEach(id => {
    const statusRef = doc(db, 'users', userId, 'notificationStatus', id);
    batch.set(statusRef, { read: true }, { merge: true });
  });
  await batch.commit();
};

/**
 * ✅ A FUNÇÃO QUE FALTAVA EXPORTAR
 * Apaga uma notificação para um utilizador específico (marcando-a como apagada).
 */
export const deleteNotificationForUser = async (userId: string, notificationId: string) => {
  if (!userId || !notificationId) return;
  const statusRef = doc(db, 'users', userId, 'notificationStatus', notificationId);
  await setDoc(statusRef, { deleted: true }, { merge: true });
};