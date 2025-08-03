import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Question {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

export const getQuizById = async (quizId: string): Promise<Quiz | null> => {
  const quizRef = doc(db, 'quizzes', quizId);
  const docSnap = await getDoc(quizRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Quiz;
  } else {
    console.error("Nenhum quiz encontrado com o ID:", quizId);
    return null;
  }
};
