import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getUsersByIds } from './userService';
import { getModulesByIds } from './moduleService';

export interface FeedbackData {
  userId: string;
  moduleId: string;
  organizationId?: string;
  nps: number;
  csat: number;
  comment?: string;
}

// Interface para os dados de feedback enriquecidos que serão exibidos
export interface EnrichedFeedback extends FeedbackData {
  id: string;
  userName: string;
  moduleTitle: string;
  createdAt: Date;
}

/**
 * Envia um novo documento de feedback para o Firestore.
 */
export const submitFeedback = async (data: FeedbackData) => {
  try {
    const feedbackCollection = collection(db, 'feedback');
    await addDoc(feedbackCollection, {
      ...data,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Erro ao enviar feedback:", error);
    throw new Error("Não foi possível enviar seu feedback. Tente novamente.");
  }
};

/**
 * Busca todos os feedbacks de uma organização e os enriquece com
 * nomes de usuários e títulos de módulos.
 */
export const getFeedbackByOrganization = async (organizationId: string): Promise<EnrichedFeedback[]> => {
  const feedbackRef = collection(db, 'feedback');
  const q = query(feedbackRef, where('organizationId', '==', organizationId));
  const feedbackSnapshot = await getDocs(q);

  if (feedbackSnapshot.empty) {
    return [];
  }

  const feedbacks = feedbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

  const userIds = [...new Set(feedbacks.map(f => f.userId))];
  const moduleIds = [...new Set(feedbacks.map(f => f.moduleId))];

  const [users, modules] = await Promise.all([
    getUsersByIds(userIds),
    getModulesByIds(moduleIds)
  ]);

  const usersMap = new Map(users.map(u => [u.uid, u.displayName]));
  const modulesMap = new Map(modules.map(m => [m.id, m.title]));

  const enrichedFeedbacks = feedbacks.map(f => ({
    ...f,
    userName: usersMap.get(f.userId) || 'Usuário Desconhecido',
    moduleTitle: modulesMap.get(f.moduleId) || 'Módulo Desconhecido',
    createdAt: f.createdAt.toDate(),
  }));

  return enrichedFeedbacks;
};
