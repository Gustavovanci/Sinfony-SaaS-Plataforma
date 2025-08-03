import { useEffect, useState } from 'react';
import { getQuizById } from '../services/quizService';
import type { Quiz, Question } from '../services/quizService';

interface QuizComponentProps {
  quizId: string;
  onQuizComplete: (score: number, totalQuestions: number) => void;
}

const QuizComponent = ({ quizId, onQuizComplete }: QuizComponentProps) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      const quizData = await getQuizById(quizId);
      setQuiz(quizData);
      setLoading(false);
    };
    fetchQuiz();
  }, [quizId]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    if (answerIndex === quiz?.questions[currentQuestionIndex].correctAnswerIndex) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResult(true);
      onQuizComplete(score, quiz?.questions.length || 0);
    }
  };

  if (loading) return <p className="text-center">A carregar o quiz...</p>;
  if (!quiz) return <p className="text-center text-red-500">Não foi possível carregar o quiz.</p>;
  if (showResult) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold">Quiz Concluído!</h3>
        <p className="mt-4 text-xl">
          A sua pontuação: <span className="font-bold text-blue-600">{score}</span> de <span className="font-bold">{quiz.questions.length}</span>
        </p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="font-bold text-xl mb-4">{currentQuestion.questionText}</h3>
      <div className="space-y-3">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(index)}
            disabled={selectedAnswer !== null}
            className={`block w-full text-left p-4 rounded-lg border-2 transition-all
              ${selectedAnswer !== null
                ? index === currentQuestion.correctAnswerIndex
                  ? 'bg-green-100 border-green-500' // Resposta correta
                  : index === selectedAnswer
                    ? 'bg-red-100 border-red-500' // Resposta errada selecionada
                    : 'bg-gray-50'
                : 'hover:bg-blue-50 hover:border-blue-300'
              }
            `}
          >
            {option}
          </button>
        ))}
      </div>
      {selectedAnswer !== null && (
        <button
          onClick={handleNextQuestion}
          className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
        >
          {currentQuestionIndex < quiz.questions.length - 1 ? 'Próxima Pergunta' : 'Finalizar Quiz'}
        </button>
      )}
    </div>
  );
};

export default QuizComponent;
