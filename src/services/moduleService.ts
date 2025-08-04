import { collection, getDocs, query, orderBy, doc, getDoc, documentId, where, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { ModuleTopic, NewModuleData, QuizData } from '../types'; // Importaremos os novos tipos

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
  topics?: Topic[];
}

export interface Topic {
  id: string;
  title: string;
  type: 'video' | 'text' | 'image' | 'quiz';
  content?: string;
  videoUrl?: string;
  imageUrl?: string;
  quizId?: string;
}

/**
 * Adiciona um novo módulo e o seu respetivo quiz (se existir) ao Firestore.
 */
export const addModuleWithQuiz = async (moduleData: NewModuleData): Promise<string> => {
  const batch = writeBatch(db);
  let finalTopics: Topic[] = [];

  // Verifica se existe um tópico de quiz para criar o documento de quiz
  for (const topic of moduleData.topics) {
    if (topic.type === 'quiz' && topic.quizData) {
      const quizRef = doc(collection(db, 'quizzes')); // Cria uma referência para o novo quiz
      
      const quizPayload: QuizData = {
        title: `Quiz para ${moduleData.title}`,
        moduleId: '', // Será atualizado depois
        questions: topic.quizData.questions,
      };

      batch.set(quizRef, quizPayload);

      // Atualiza o tópico para conter o ID do quiz em vez dos dados completos
      finalTopics.push({ ...topic, quizId: quizRef.id, quizData: undefined });
    } else {
      finalTopics.push(topic);
    }
  }

  // Cria a referência para o novo módulo
  const moduleRef = doc(collection(db, 'modules'));
  batch.set(moduleRef, {
    ...moduleData,
    topics: finalTopics,
    createdAt: serverTimestamp(), // Usa o timestamp do servidor
  });

  // Executa todas as operações (criar módulo e quiz) de uma vez
  await batch.commit();

  // Agora que o módulo foi criado, atualizamos o quiz com o ID do módulo
  const quizTopic = finalTopics.find(t => t.type === 'quiz');
  if (quizTopic && quizTopic.quizId) {
    const quizRef = doc(db, 'quizzes', quizTopic.quizId);
    await updateDoc(quizRef, { moduleId: moduleRef.id });
  }

  return moduleRef.id; // Retorna o ID do novo módulo
};


// --- Funções existentes ---

export const getModules = async (): Promise<Module[]> => {
  const modulesRef = collection(db, 'modules');
  const q = query(modulesRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  })) as Module[];
};

export const getModuleById = async (moduleId: string): Promise<Module | null> => {
  const moduleRef = doc(db, 'modules', moduleId);
  const docSnap = await getDoc(moduleRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return { 
      id: docSnap.id, 
      ...data,
      createdAt: data.createdAt.toDate(),
    } as Module;
  } else {
    return null;
  }
};

export const getModulesByIds = async (moduleIds: string[]): Promise<Module[]> => {
  if (moduleIds.length === 0) return [];

  const modulesRef = collection(db, 'modules');
  const q = query(modulesRef, where(documentId(), 'in', moduleIds));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  } as Module));
};