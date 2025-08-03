import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy, writeBatch, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserProfile } from '../types';

export interface Notification {
  id: string;
  senderId: string;
  organizationId: string;
  message: string;
  recipientId?: string;
  recipientName?: string;
  createdAt: Date;
  read: boolean;
}

interface NotificationData {
  senderId: string;
  organizationId: string;
  message: string;
  recipientId?: string;
  recipientName?: string;
}

/**
 * Cria um novo documento de notificação no Firestore.
 */
export const sendNotification = async (data: NotificationData) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      ...data,
      createdAt: serverTimestamp(),
      read: false,
    });
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    throw new Error("Não foi possível enviar a notificação.");
  }
};

/**
 * Busca notificações para um usuário em tempo real.
 */
export const getNotificationsForUser = (userProfile: UserProfile, callback: (notifications: Notification[]) => void) => {
  const notificationsRef = collection(db, 'notifications');
  
  const q = query(
    notificationsRef,
    where('organizationId', '==', userProfile.organizationId),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const notifications: Notification[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.recipientId || data.recipientId === userProfile.uid) {
        notifications.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
        } as Notification);
      }
    });
    callback(notifications);
  });

  return unsubscribe;
};

/**
 * Marca uma lista de notificações como lidas no Firestore.
 */
export const markNotificationsAsRead = async (notificationIds: string[]) => {
  if (notificationIds.length === 0) return;

  const batch = writeBatch(db);
  notificationIds.forEach(id => {
    const notifRef = doc(db, 'notifications', id);
    batch.update(notifRef, { read: true });
  });

  await batch.commit();
};
