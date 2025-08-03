import { collection, getDocs, query, orderBy, doc, getDoc, documentId, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Topic {
  id: string;
  title: string;
  type: 'video' | 'text' | 'image' | 'quiz' | '3d';
  content?: string;
  videoUrl?: string;
  imageUrl?: string;
  quizId?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  topics?: Topic[];
}

export const getModules = async (): Promise<Module[]> => {
  const modulesRef = collection(db, 'modules');
  const q = query(modulesRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Module[];
};

export const getModuleById = async (moduleId: string): Promise<Module | null> => {
  const moduleRef = doc(db, 'modules', moduleId);
  const docSnap = await getDoc(moduleRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Module;
  } else {
    return null;
  }
};

/**
 * Busca um conjunto de módulos com base em uma lista de IDs.
 */
export const getModulesByIds = async (moduleIds: string[]): Promise<Module[]> => {
  if (moduleIds.length === 0) return [];

  const modulesRef = collection(db, 'modules');
  const q = query(modulesRef, where(documentId(), 'in', moduleIds));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Module));
};
