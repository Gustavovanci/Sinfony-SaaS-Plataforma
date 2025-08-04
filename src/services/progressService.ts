import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp, 
  collection, 
  getDocs, 
  query, 
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Module } from './moduleService';
import { toast } from 'react-hot-toast';

export interface ModuleProgress {
  moduleId: string;
  status: 'in-progress' | 'completed';
  completedTopics: string[];
  lastAccessed: any;
  score?: number;
  completedAt?: any;
  startedAt?: any;
  attempts?: number;
  timeSpent?: number; // em minutos
}

// Cache para melhorar performance
const progressCache = new Map<string, { data: ModuleProgress; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

/**
 * Limpa cache expirado
 */
const cleanExpiredCache = (userId: string) => {
  const now = Date.now();
  for (const [key, value] of progressCache.entries()) {
    if (key.startsWith(userId) && now - value.timestamp > CACHE_DURATION) {
      progressCache.delete(key);
    }
  }
};

/**
 * Busca o progresso de um usuário para um módulo específico
 */
export const getProgressForModule = async (
  userId: string, 
  moduleId: string
): Promise<ModuleProgress | null> => {
  try {
    // Verifica cache primeiro
    const cacheKey = `${userId}-${moduleId}`;
    const cached = progressCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const progressRef = doc(db, 'users', userId, 'progress', moduleId);
    const docSnap = await getDoc(progressRef);
    
    if (docSnap.exists()) {
      const progress = docSnap.data() as ModuleProgress;
      
      // Adiciona ao cache
      progressCache.set(cacheKey, {
        data: progress,
        timestamp: Date.now()
      });
      
      return progress;
    }
    
    return null;

  } catch (error) {
    console.error('Erro ao buscar progresso do módulo:', error);
    toast.error('Erro ao carregar progresso');
    throw new Error('Falha ao buscar progresso: ' + (error as Error).message);
  }
};

/**
 * Marca um tópico simples como concluído
 */
export const markTopicAsCompleted = async (
  userId: string, 
  moduleId: string, 
  topicId: string
): Promise<void> => {
  try {
    const progressRef = doc(db, 'users', userId, 'progress', moduleId);
    const progressDoc = await getDoc(progressRef);
    const now = serverTimestamp();

    if (progressDoc.exists()) {
      const currentProgress = progressDoc.data() as ModuleProgress;
      
      // Evita duplicatas
      if (!currentProgress.completedTopics?.includes(topicId)) {
        await updateDoc(progressRef, {
          completedTopics: arrayUnion(topicId),
          lastAccessed: now,
          attempts: (currentProgress.attempts || 0) + 1
        });
      }
    } else {
      // Cria novo documento de progresso
      await setDoc(progressRef, {
        moduleId: moduleId,
        status: 'in-progress',
        completedTopics: [topicId],
        lastAccessed: now,
        startedAt: now,
        attempts: 1,
        timeSpent: 0
      });
    }

    // Remove do cache para forçar reload
    const cacheKey = `${userId}-${moduleId}`;
    progressCache.delete(cacheKey);

  } catch (error) {
    console.error('Erro ao marcar tópico como concluído:', error);
    toast.error('Erro ao salvar progresso');
    throw new Error('Falha ao marcar tópico: ' + (error as Error).message);
  }
};

/**
 * Função completa para lidar com a conclusão do quiz
 */
export const completeQuizAndUpdateProgress = async (
  userId: string,
  module: Module,
  quizTopicId: string,
  score: number
): Promise<{ moduleCompleted: boolean }> => {
  try {
    const progressRef = doc(db, 'users', userId, 'progress', module.id);
    const now = serverTimestamp();
    
    // Primeiro marca o tópico como concluído
    await markTopicAsCompleted(userId, module.id, quizTopicId);
    
    // Depois atualiza o score
    await updateDoc(progressRef, {
      score: score,
      lastAccessed: now,
    });

    // Verifica se o módulo foi completado
    const updatedProgressSnap = await getDoc(progressRef);
    const updatedProgress = updatedProgressSnap.data() as ModuleProgress;
    
    const allTopics = module.topics?.map(t => t.id) || [];
    const completedTopics = updatedProgress.completedTopics || [];
    const moduleCompleted = allTopics.every(topicId => completedTopics.includes(topicId));

    if (moduleCompleted) {
      await updateDoc(progressRef, {
        status: 'completed',
        completedAt: now,
      });

      // Atualiza estatísticas do módulo (se necessário)
      try {
        const moduleRef = doc(db, 'modules', module.id);
        const moduleDoc = await getDoc(moduleRef);
        
        if (moduleDoc.exists()) {
          const moduleData = moduleDoc.data();
          const currentCompletions = moduleData.stats?.totalCompletions || 0;
          
          await updateDoc(moduleRef, {
            'stats.totalCompletions': currentCompletions + 1,
            updatedAt: serverTimestamp()
          });
        }
      } catch (statsError) {
        console.warn('Erro ao atualizar estatísticas do módulo:', statsError);
        // Não bloqueia o fluxo principal
      }
    }

    // Remove do cache
    const cacheKey = `${userId}-${module.id}`;
    progressCache.delete(cacheKey);

    return { moduleCompleted };

  } catch (error) {
    console.error('Erro ao completar quiz:', error);
    toast.error('Erro ao salvar resultado do quiz');
    throw new Error('Falha ao completar quiz: ' + (error as Error).message);
  }
};

/**
 * Busca todo o progresso de um usuário (com cache)
 */
export const getAllProgressForUser = async (userId: string): Promise<ModuleProgress[]> => {
  try {
    cleanExpiredCache(userId);
    
    const progressRef = collection(db, 'users', userId, 'progress');
    const querySnapshot = await getDocs(progressRef);

    const progressList: ModuleProgress[] = [];
    
    querySnapshot.forEach((doc) => {
      const progress = doc.data() as ModuleProgress;
      progressList.push(progress);
      
      // Adiciona ao cache
      const cacheKey = `${userId}-${progress.moduleId}`;
      progressCache.set(cacheKey, {
        data: progress,
        timestamp: Date.now()
      });
    });
    
    return progressList;

  } catch (error) {
    console.error('Erro ao buscar todo o progresso:', error);
    toast.error('Erro ao carregar progresso');
    throw new Error('Falha ao buscar progresso: ' + (error as Error).message);
  }
};

/**
 * Busca progresso de múltiplos usuários (para coordenadores)
 */
export const getProgressForUsers = async (
  userIds: string[],
  moduleId?: string
): Promise<{ userId: string; progress: ModuleProgress[] }[]> => {
  try {
    const results: { userId: string; progress: ModuleProgress[] }[] = [];
    
    // Processa em lotes para evitar muitas consultas simultâneas
    for (const userId of userIds) {
      const progressRef = collection(db, 'users', userId, 'progress');
      let q = query(progressRef);
      
      if (moduleId) {
        q = query(progressRef, where('moduleId', '==', moduleId));
      }
      
      const querySnapshot = await getDocs(q);
      const userProgress: ModuleProgress[] = [];
      
      querySnapshot.forEach((doc) => {
        userProgress.push(doc.data() as ModuleProgress);
      });
      
      results.push({ userId, progress: userProgress });
    }
    
    return results;

  } catch (error) {
    console.error('Erro ao buscar progresso de usuários:', error);
    throw new Error('Falha ao buscar progresso dos usuários: ' + (error as Error).message);
  }
};

/**
 * Atualiza tempo gasto em um módulo
 */
export const updateTimeSpent = async (
  userId: string,
  moduleId: string,
  additionalMinutes: number
): Promise<void> => {
  try {
    const progressRef = doc(db, 'users', userId, 'progress', moduleId);
    const progressDoc = await getDoc(progressRef);
    
    if (progressDoc.exists()) {
      const currentProgress = progressDoc.data() as ModuleProgress;
      const currentTimeSpent = currentProgress.timeSpent || 0;
      
      await updateDoc(progressRef, {
        timeSpent: currentTimeSpent + additionalMinutes,
        lastAccessed: serverTimestamp()
      });
      
      // Remove do cache
      const cacheKey = `${userId}-${moduleId}`;
      progressCache.delete(cacheKey);
    }

  } catch (error) {
    console.error('Erro ao atualizar tempo gasto:', error);
    // Não mostra toast para não incomodar o usuário
  }
};

/**
 * Reinicia o progresso de um módulo
 */
export const resetModuleProgress = async (
  userId: string,
  moduleId: string
): Promise<void> => {
  try {
    const progressRef = doc(db, 'users', userId, 'progress', moduleId);
    
    await setDoc(progressRef, {
      moduleId: moduleId,
      status: 'in-progress',
      completedTopics: [],
      lastAccessed: serverTimestamp(),
      startedAt: serverTimestamp(),
      attempts: 1,
      timeSpent: 0,
      score: undefined,
      completedAt: undefined
    });

    // Remove do cache
    const cacheKey = `${userId}-${moduleId}`;
    progressCache.delete(cacheKey);
    
    toast.success('Progresso do módulo reiniciado');

  } catch (error) {
    console.error('Erro ao reiniciar progresso:', error);
    toast.error('Erro ao reiniciar progresso');
    throw new Error('Falha ao reiniciar progresso: ' + (error as Error).message);
  }
};

/**
 * Busca estatísticas de progresso para dashboard de coordenador
 */
export const getProgressStats = async (organizationId: string): Promise<{
  totalUsers: number;
  activeUsers: number;
  completedModules: number;
  averageCompletion: number;
  topPerformers: { userId: string; completedModules: number }[];
}> => {
  try {
    // Esta função seria mais complexa em um cenário real
    // Por ora, retorna dados básicos
    
    return {
      totalUsers: 0,
      activeUsers: 0,
      completedModules: 0,
      averageCompletion: 0,
      topPerformers: []
    };

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    throw new Error('Falha ao buscar estatísticas: ' + (error as Error).message);
  }
};

/**
 * Limpa todo o cache de progresso
 */
export const clearProgressCache = (userId?: string): void => {
  if (userId) {
    // Remove apenas o cache do usuário específico
    for (const key of progressCache.keys()) {
      if (key.startsWith(userId)) {
        progressCache.delete(key);
      }
    }
  } else {
    // Remove todo o cache
    progressCache.clear();
  }
};