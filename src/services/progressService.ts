import { doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Module } from './moduleService';

export interface ModuleProgress {
  moduleId: string;
  status: 'in-progress' | 'completed';
  completedTopics: string[];
  lastAccessed: any;
  score?: number;
}

/**
 * Busca o progresso de um utilizador para um módulo específico.
 */
export const getProgressForModule = async (userId: string, moduleId: string): Promise<ModuleProgress | null> => {
  const progressRef = doc(db, 'users', userId, 'progress', moduleId);
  const docSnap = await getDoc(progressRef);
  return docSnap.exists() ? (docSnap.data() as ModuleProgress) : null;
};

/**
 * Marca um tópico simples (sem quiz) como concluído.
 */
export const markTopicAsCompleted = async (userId: string, moduleId: string, topicId: string) => {
  const progressRef = doc(db, 'users', userId, 'progress', moduleId);
  const progressDoc = await getDoc(progressRef);

  if (progressDoc.exists()) {
    return updateDoc(progressRef, {
      completedTopics: arrayUnion(topicId),
      lastAccessed: serverTimestamp(),
    });
  } else {
    return setDoc(progressRef, {
      moduleId: moduleId,
      status: 'in-progress',
      completedTopics: [topicId],
      lastAccessed: serverTimestamp(),
    });
  }
};

/**
 * Função completa para lidar com a conclusão do quiz.
 */
export const completeQuizAndUpdateProgress = async (
  userId: string,
  module: Module,
  quizTopicId: string,
  score: number
): Promise<{ moduleCompleted: boolean }> => {
  const progressRef = doc(db, 'users', userId, 'progress', module.id);
  
  await markTopicAsCompleted(userId, module.id, quizTopicId);
  
  await updateDoc(progressRef, {
    score: score,
    lastAccessed: serverTimestamp(),
  });

  const updatedProgressSnap = await getDoc(progressRef);
  const updatedProgress = updatedProgressSnap.data() as ModuleProgress;
  
  const allTopics = module.topics?.map(t => t.id) || [];
  const completedTopics = updatedProgress.completedTopics || [];

  const moduleCompleted = allTopics.every(topicId => completedTopics.includes(topicId));

  if (moduleCompleted) {
    await updateDoc(progressRef, {
      status: 'completed',
    });
  }

  return { moduleCompleted };
};

/**
 * Busca todos os documentos de progresso para um utilizador específico.
 */
export const getAllProgressForUser = async (userId: string): Promise<ModuleProgress[]> => {
  const progressRef = collection(db, 'users', userId, 'progress');
  const querySnapshot = await getDocs(progressRef);

  const progressList: ModuleProgress[] = [];
  querySnapshot.forEach((doc) => {
    progressList.push(doc.data() as ModuleProgress);
  });
  
  return progressList;
};
