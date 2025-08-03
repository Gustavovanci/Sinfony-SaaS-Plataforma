import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getModuleById } from '../services/moduleService';
import type { Module as ModuleType, Topic } from '../services/moduleService';
import { getProgressForModule, markTopicAsCompleted, completeQuizAndUpdateProgress } from '../services/progressService';
import type { ModuleProgress } from '../services/progressService';
import { addGamificationPoints } from '../services/userService';
import { generateCertificatePDF } from '../services/certificateService';
import { CheckCircle, Circle, ArrowLeft } from 'lucide-react';
import QuizComponent from '../components/QuizComponent';
import FeedbackModal from '../components/FeedbackModal';
import { submitFeedback } from '../services/feedbackService';

// Componente interno para renderizar o conteúdo do tópico
const TopicContent = ({ topic, onComplete }: { topic: Topic; onComplete: (score?: number) => void }) => {
  switch (topic.type) {
    case 'video':
      return <div className="aspect-video bg-black rounded-lg overflow-hidden"><iframe width="100%" height="100%" src={topic.videoUrl} title={topic.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe></div>;
    case 'text':
      return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: topic.content || '' }} />;
    case 'image':
      return <img src={topic.imageUrl} alt={topic.title} className="w-full h-auto rounded-lg shadow-md" />;
    case 'quiz':
      if (!topic.quizId) return <p>ID do Quiz não encontrado.</p>;
      return (
        <QuizComponent
          quizId={topic.quizId}
          onQuizComplete={(score) => onComplete(score)}
        />
      );
    default:
      return <p>Tipo de conteúdo não suportado.</p>;
  }
};

const ModulePage = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { user, userProfile } = useAuth();

  const [module, setModule] = useState<ModuleType | null>(null);
  const [progress, setProgress] = useState<ModuleProgress | null>(null);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCertificateButton, setShowCertificateButton] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!moduleId || !user) return;
      
      try {
        const [moduleData, progressData] = await Promise.all([
          getModuleById(moduleId),
          getProgressForModule(user.uid, moduleId),
        ]);

        setModule(moduleData);
        setProgress(progressData);

        if (moduleData?.topics?.length && !activeTopic) {
          setActiveTopic(moduleData.topics[0]);
        }
        
        if (progressData?.status === 'completed') {
          setShowCertificateButton(true);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do módulo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [moduleId, user]);

  const handleMarkAsCompleted = async (score?: number) => {
    if (!user || !module || !activeTopic) return;
  
    if (activeTopic.type === 'quiz' && typeof score === 'number') {
      await addGamificationPoints(user.uid, score * 10);
      const { moduleCompleted } = await completeQuizAndUpdateProgress(user.uid, module, activeTopic.id, score);
      
      if (moduleCompleted) {
        setShowFeedbackModal(true);
      }
    } else {
      await markTopicAsCompleted(user.uid, module.id, activeTopic.id);
    }
  
    await fetchData();
  };

  const handleFeedbackSubmit = async (feedback: { nps: number; csat: number; comment: string }) => {
    if (!user || !userProfile || !module) return;

    const feedbackData = {
      ...feedback,
      userId: user.uid,
      moduleId: module.id,
      ...(userProfile.organizationId && { organizationId: userProfile.organizationId }),
    };

    await submitFeedback(feedbackData);
    setShowFeedbackModal(false);
    setShowCertificateButton(true);
  };

  const handleGenerateCertificate = () => {
    if (!userProfile || !module) return;
    generateCertificatePDF({
      userName: userProfile.displayName || "Usuário",
      moduleTitle: module.title,
      completionDate: new Date().toLocaleDateString('pt-BR'),
    });
  };

  const isTopicCompleted = (topicId: string) => {
    return progress?.completedTopics?.includes(topicId) ?? false;
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Carregando módulo...</div>;
  if (!module) return <div className="flex items-center justify-center h-screen">Módulo não encontrado.</div>;

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        <aside className="w-80 flex-shrink-0 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <Link to="/" className="flex items-center text-sm text-gray-600 hover:text-blue-600 mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Link>
            <h2 className="text-xl font-bold">{module.title}</h2>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {module.topics?.map((topic) => (
              <button key={topic.id} onClick={() => setActiveTopic(topic)}
                className={`w-full text-left flex items-center p-3 rounded-lg transition-colors ${activeTopic?.id === topic.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
                {isTopicCompleted(topic.id) ? <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" /> : <Circle className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />}
                <span className="flex-1">{topic.title}</span>
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-8 overflow-y-auto">
          {activeTopic ? (
            <>
              <h1 className="text-3xl font-bold mb-6">{activeTopic.title}</h1>
              <div className="mb-8 p-6 bg-white rounded-lg shadow">
                <TopicContent topic={activeTopic} onComplete={handleMarkAsCompleted} />
              </div>
              {activeTopic.type !== 'quiz' && !isTopicCompleted(activeTopic.id) && (
                <button onClick={() => handleMarkAsCompleted()} className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">
                  Marcar como Concluído
                </button>
              )}
              {showCertificateButton && (
                <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg text-center">
                  <p className="font-bold text-green-800">Parabéns, você concluiu este treinamento!</p>
                  <button onClick={handleGenerateCertificate} className="mt-2 px-6 py-2 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600">
                    Gerar Certificado
                  </button>
                </div>
              )}
            </>
          ) : (
            <p>Selecione um tópico para começar.</p>
          )}
        </main>
      </div>
      {showFeedbackModal && module && (
        <FeedbackModal moduleTitle={module.title} onSubmit={handleFeedbackSubmit}
          onClose={() => {
            setShowFeedbackModal(false);
            setShowCertificateButton(true);
          }}
        />
      )}
    </>
  );
};

export default ModulePage;
