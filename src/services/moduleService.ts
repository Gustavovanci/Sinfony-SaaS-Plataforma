import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  getDoc, 
  documentId, 
  where, 
  writeBatch, 
  serverTimestamp,
  limit,
  startAfter,
  DocumentSnapshot,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { ModuleTopic, NewModuleData, QuizData } from '../types';
import { toast } from 'react-hot-toast';

export interface Module {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  category: string;
  estimatedDuration: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  topics?: Topic[];
  stats?: {
    totalCompletions: number;
    averageRating: number;
    totalViews: number;
  };
}

export interface Topic {
  id: string;
  title: string;
  type: 'video' | 'text' | 'image' | 'quiz';
  content?: string;
  videoUrl?: string;
  imageUrl?: string;
  quizId?: string;
  order: number;
}

// Cache para melhorar performance
const moduleCache = new Map<string, { data: Module; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Função para limpar cache expirado
const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of moduleCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      moduleCache.delete(key);
    }
  }
};

/**
 * Adiciona um novo módulo com quiz (versão melhorada com tratamento de erros)
 */
export const addModuleWithQuiz = async (moduleData: NewModuleData): Promise<string> => {
  try {
    const batch = writeBatch(db);
    const finalTopics: Topic[] = [];

    // Processa os tópicos e cria quizzes se necessário
    for (let i = 0; i < moduleData.topics.length; i++) {
      const topic = moduleData.topics[i];
      
      if (topic.type === 'quiz' && topic.quizData) {
        const quizRef = doc(collection(db, 'quizzes'));
        
        const quizPayload: QuizData = {
          title: `Quiz: ${topic.title}`,
          moduleId: '', // Será atualizado depois
          questions: topic.quizData.questions,
          createdAt: serverTimestamp(),
          isActive: true
        };

        batch.set(quizRef, quizPayload);
        
        finalTopics.push({ 
          ...topic, 
          quizId: quizRef.id, 
          order: i + 1,
          quizData: undefined 
        });
      } else {
        finalTopics.push({ 
          ...topic, 
          order: i + 1 
        });
      }
    }

    // Cria o módulo
    const moduleRef = doc(collection(db, 'modules'));
    const modulePayload = {
      ...moduleData,
      topics: finalTopics,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      stats: {
        totalCompletions: 0,
        averageRating: 0,
        totalViews: 0
      }
    };

    batch.set(moduleRef, modulePayload);

    // Atualiza os quizzes com o ID do módulo
    for (const topic of finalTopics) {
      if (topic.type === 'quiz' && topic.quizId) {
        const quizRef = doc(db, 'quizzes', topic.quizId);
        batch.update(quizRef, { 
          moduleId: moduleRef.id,
          updatedAt: serverTimestamp()
        });
      }
    }

    await batch.commit();
    
    // Limpa o cache relacionado
    moduleCache.clear();
    
    toast.success('Módulo criado com sucesso!');
    return moduleRef.id;

  } catch (error) {
    console.error('Erro ao criar módulo:', error);
    toast.error('Erro ao criar módulo. Tente novamente.');
    throw new Error('Falha ao criar módulo: ' + (error as Error).message);
  }
};

/**
 * Busca módulos com paginação e cache
 */
export const getModules = async (pageSize = 10, lastDoc?: DocumentSnapshot): Promise<{
  modules: Module[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}> => {
  try {
    cleanExpiredCache();
    
    const modulesRef = collection(db, 'modules');
    let q = query(
      modulesRef, 
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'), 
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    
    const modules: Module[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const module = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate()
      } as Module;

      // Adiciona ao cache
      moduleCache.set(doc.id, { 
        data: module, 
        timestamp: Date.now() 
      });

      return module;
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
    const hasMore = querySnapshot.docs.length === pageSize;

    return { modules, lastDoc: lastVisible, hasMore };

  } catch (error) {
    console.error('Erro ao buscar módulos:', error);
    toast.error('Erro ao carregar módulos');
    throw new Error('Falha ao buscar módulos: ' + (error as Error).message);
  }
};

/**
 * Busca módulo por ID com cache
 */
export const getModuleById = async (moduleId: string): Promise<Module | null> => {
  try {
    // Verifica cache primeiro
    const cached = moduleCache.get(moduleId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const moduleRef = doc(db, 'modules', moduleId);
    const docSnap = await getDoc(moduleRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    const module = { 
      id: docSnap.id, 
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate()
    } as Module;

    // Adiciona ao cache
    moduleCache.set(moduleId, { 
      data: module, 
      timestamp: Date.now() 
    });

    // Incrementa visualizações
    await updateDoc(moduleRef, {
      'stats.totalViews': (data.stats?.totalViews || 0) + 1,
      updatedAt: serverTimestamp()
    });

    return module;

  } catch (error) {
    console.error('Erro ao buscar módulo:', error);
    toast.error('Erro ao carregar módulo');
    throw new Error('Falha ao buscar módulo: ' + (error as Error).message);
  }
};

/**
 * Busca módulos por IDs (otimizado)
 */
export const getModulesByIds = async (moduleIds: string[]): Promise<Module[]> => {
  if (moduleIds.length === 0) return [];

  try {
    // Verifica cache primeiro
    const cachedModules: Module[] = [];
    const uncachedIds: string[] = [];

    moduleIds.forEach(id => {
      const cached = moduleCache.get(id);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        cachedModules.push(cached.data);
      } else {
        uncachedIds.push(id);
      }
    });

    // Busca módulos não cacheados em lotes (Firestore limita a 10 por consulta)
    const fetchedModules: Module[] = [];
    
    for (let i = 0; i < uncachedIds.length; i += 10) {
      const batch = uncachedIds.slice(i, i + 10);
      
      const modulesRef = collection(db, 'modules');
      const q = query(modulesRef, where(documentId(), 'in', batch));
      const querySnapshot = await getDocs(q);

      const batchModules = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const module = { 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate()
        } as Module;

        // Adiciona ao cache
        moduleCache.set(doc.id, { 
          data: module, 
          timestamp: Date.now() 
        });

        return module;
      });

      fetchedModules.push(...batchModules);
    }

    return [...cachedModules, ...fetchedModules];

  } catch (error) {
    console.error('Erro ao buscar módulos por IDs:', error);
    toast.error('Erro ao carregar módulos');
    throw new Error('Falha ao buscar módulos: ' + (error as Error).message);
  }
};

/**
 * Busca módulos por categoria
 */
export const getModulesByCategory = async (category: string): Promise<Module[]> => {
  try {
    const modulesRef = collection(db, 'modules');
    const q = query(
      modulesRef, 
      where('category', '==', category),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate()
      } as Module;
    });

  } catch (error) {
    console.error('Erro ao buscar módulos por categoria:', error);
    toast.error('Erro ao carregar módulos da categoria');
    throw new Error('Falha ao buscar módulos por categoria: ' + (error as Error).message);
  }
};

/**
 * Atualiza estatísticas do módulo
 */
export const updateModuleStats = async (
  moduleId: string, 
  updates: { 
    completions?: number; 
    rating?: number; 
    views?: number 
  }
): Promise<void> => {
  try {
    const moduleRef = doc(db, 'modules', moduleId);
    const updateData: any = { updatedAt: serverTimestamp() };

    if (updates.completions !== undefined) {
      updateData['stats.totalCompletions'] = updates.completions;
    }
    
    if (updates.rating !== undefined) {
      updateData['stats.averageRating'] = updates.rating;
    }
    
    if (updates.views !== undefined) {
      updateData['stats.totalViews'] = updates.views;
    }

    await updateDoc(moduleRef, updateData);
    
    // Remove do cache para forçar reload
    moduleCache.delete(moduleId);

  } catch (error) {
    console.error('Erro ao atualizar estatísticas do módulo:', error);
    throw new Error('Falha ao atualizar estatísticas: ' + (error as Error).message);
  }
};

/**
 * Desativa um módulo (soft delete)
 */
export const deactivateModule = async (moduleId: string): Promise<void> => {
  try {
    const moduleRef = doc(db, 'modules', moduleId);
    await updateDoc(moduleRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    });

    // Remove do cache
    moduleCache.delete(moduleId);
    
    toast.success('Módulo desativado com sucesso');

  } catch (error) {
    console.error('Erro ao desativar módulo:', error);
    toast.error('Erro ao desativar módulo');
    throw new Error('Falha ao desativar módulo: ' + (error as Error).message);
  }
};

/**
 * Limpa todo o cache (útil para logout ou refresh forçado)
 */
export const clearModuleCache = (): void => {
  moduleCache.clear();
};