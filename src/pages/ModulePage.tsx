import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getModuleById } from '../services/moduleService';
import type { Module as ModuleType, Topic } from '../services/moduleService';
import { getProgressForModule, markTopicAsCompleted, completeQuizAndUpdateProgress } from '../services/progressService';
import type { ModuleProgress } from '../services/progressService';
import { addGamificationPoints } from '../services/userService';
import { generateCertificatePDF } from '../services/certificateService';
import { CheckCircle, Circle, ArrowLeft, Clock, BookOpen, AlertCircle } from 'lucide-react';
import QuizComponent from '../components/QuizComponent';
import FeedbackModal from '../components/FeedbackModal';
import { submitFeedback } from '../services/feedbackService';

// Componente interno para renderizar o conteúdo do tópico
const TopicContent = ({ topic, onComplete }: { topic: Topic; onComplete: (score?: number) => void }) => {
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  const handleComplete = useCallback((score?: number) => {
    onComplete(score);
  }, [onComplete]);

  const renderContent = () => {
    try {
      switch (topic.type) {
        case 'video':
          if (!topic.videoUrl) {
            return <div className="text-red-500">URL do vídeo não encontrada</div>;
          }
          return (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe 
                width="100%" 
                height="100%" 
                src={topic.videoUrl} 
                title={topic.title} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                onLoad={() => setContentLoading(false)}
                onError={() => setContentError('Erro ao carregar vídeo')}
              />
            </div>
          );

        case 'text':
          return (
            <div 
              className="prose max-w-none text-gray-700 leading-relaxed" 
              dangerouslySetInnerHTML={{ __html: topic.content || 'Conteúdo não disponível' }} 
            />
          );

        case 'image':
          if (!topic.imageUrl) {
            return <div className="text-red-500">URL da imagem não encontrada</div>;
          }
          return (
            <img 
              src={topic.imageUrl} 
              alt={topic.title} 
              className="w-full h-auto rounded-lg shadow-md"
              onLoad={() => setContentLoading(false)}
              onError={() => setContentError('Erro ao carregar imagem')}
            />
          );

        case 'quiz':
          if (!topic.quizId) {
            return <div className="text-red-500">ID do Quiz não encontrado</div>;
          }
          return (
            <QuizComponent
              quizId={topic.quizId}
              onQuizComplete={handleComplete}
            />
          );

        default:
          return <div className="text-gray-500">Tipo de conteúdo não suportado</div>;
      }
    } catch (error) {
      console.error('Erro ao renderizar conteúdo:', error);
      return <div className="text-red-500">Erro ao carregar conteúdo</div>;
    }
  };

  if (contentError) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700">{contentError}</p>
          <button 
            onClick={() => {
              setContentError(null);
              setContentLoading(true);
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {contentLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      {renderContent()}
    </div>
  );
};

const ModulePage = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  // Estados principais
  const [module, setModule] = useState<ModuleType | null>(null);
  const [progress, setProgress] = useState<ModuleProgress | null>(null);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCertificateButton, setShowCertificateButton] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [completingTopic, setCompletingTopic] = useState(false);

  // Fetch data com tratamento de erro melhorado
  const fetchData = useCallback(async () => {
    if (!moduleId || !user) return;
    
    try {
      setError(null);
      const [moduleData, progressData] = await Promise.all([
        getModuleById(moduleId),
        getProgressForModule(user.uid, moduleId),
      ]);

      if (!moduleData) {
        setError('Módulo não encontrado');
        return;
      }

      setModule(moduleData);
      setProgress(progressData);
      
      // Define o primeiro tópico como ativo apenas se não houver um ativo
      if (moduleData.topics?.length && !activeTopic) {
        setActiveTopic(moduleData.topics[0]);
      }
      
      // Verifica se o módulo foi completado
      if (progressData?.status === 'completed') {
        setShowCertificateButton(true);
      }

    } catch (error) {
      console.error("Erro ao carregar dados do módulo:", error);
      setError('Erro ao carregar módulo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [moduleId, user, activeTopic]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler para marcar tópico como concluído
  const handleMarkAsCompleted = useCallback(async (score?: number) => {
    if (!user || !module || !activeTopic || completingTopic) return;
  
    setCompletingTopic(true);
    
    try {
      if (activeTopic.type === 'quiz' && typeof score === 'number') {
        // Adiciona pontos pela conclusão do quiz
        await addGamificationPoints(user.uid, score * 10);
        
        const { moduleCompleted } = await completeQuizAndUpdateProgress(
          user.uid, 
          module, 
          activeTopic.id, 
          score
        );
        
        if (moduleCompleted) {
          setShowFeedbackModal(true);
        }
      } else if (activeTopic.type !== 'quiz') {
        await markTopicAsCompleted(user.uid, module.id, activeTopic.id);
      }
  
      // Recarrega os dados para atualizar a interface
      await fetchData();
      
    } catch (error) {
      console.error('Erro ao marcar tópico como concluído:', error);
    } finally {
      setCompletingTopic(false);
    }
  }, [user, module, activeTopic, completingTopic, fetchData]);

  // Handler para envio de feedback
  const handleFeedbackSubmit = useCallback(async (feedback: { nps: number; csat: number; comment: string }) => {
    if (!user || !userProfile || !module) return;

    try {
      const feedbackData = {
        ...feedback,
        userId: user.uid,
        moduleId: module.id,
        ...(userProfile.organizationId && { organizationId: userProfile.organizationId }),
      };

      await submitFeedback(feedbackData);
      setShowFeedbackModal(false);
      setShowCertificateButton(true);
      
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
    }
  }, [user, userProfile, module]);

  // Handler para gerar certificado
  const handleGenerateCertificate = useCallback(() => {
    if (!userProfile || !module) return;
    
    try {
      generateCertificatePDF({
        userName: userProfile.displayName || "Usuário",
        moduleTitle: module.title,
        completionDate: new Date().toLocaleDateString('pt-BR'),
        organizationName: userProfile.organizationId ? 'Organização' : undefined
      });
    } catch (error) {
      console.error('Erro ao gerar certificado:', error);
    }
  }, [userProfile, module]);

  // Função para verificar se tópico está completo
  const isTopicCompleted = useCallback((topicId: string) => {
    return progress?.completedTopics?.includes(topicId) ?? false;
  }, [progress]);

  // Calcular progresso geral
  const moduleProgressPercent = useMemo(() => {
    if (!module?.topics || !progress) return 0;
    const totalTopics = module.topics.length;
    const completedTopics = progress.completedTopics?.length || 0;
    return Math.round((completedTopics / totalTopics) * 100);
  }, [module?.topics, progress]);

  // Estados de carregamento e erro
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao Carregar</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button 
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchData();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Tentar Novamente
            </button>
            <Link 
              to="/dashboard"
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!module) return null;

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar com lista de tópicos */}
        <aside className="w-80 flex-shrink-0 bg-white border-r flex flex-col">
          {/* Header da sidebar */}
          <div className="p-4 border-b bg-gray-50">
            <Link 
              to="/dashboard" 
              className="flex items-center text-sm text-gray-600 hover:text-blue-600 mb-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Link>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{module.title}</h2>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <Clock className="w-4 h-4 mr-1" />
              <span>{module.estimatedDuration} minutos</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${moduleProgressPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{moduleProgressPercent}% concluído</p>
          </div>

          {/* Lista de tópicos */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {module.topics?.map((topic, index) => (
              <button 
                key={topic.id} 
                onClick={() => setActiveTopic(topic)}
                className={`w-full text-left flex items-center p-3 rounded-lg transition-all duration-200 ${
                  activeTopic?.id === topic.id 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {isTopicCompleted(topic.id) ? (
                  <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="text-xs text-gray-500 mr-2">#{index + 1}</span>
                    <BookOpen className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="font-medium">{topic.title}</span>
                  <div className="text-xs text-gray-500 mt-1 capitalize">
                    {topic.type === 'quiz' ? '📝 Quiz' : 
                     topic.type === 'video' ? '🎥 Vídeo' :
                     topic.type === 'text' ? '📄 Texto' : '🖼️ Imagem'}
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 p-8 overflow-y-auto">
          {activeTopic ? (
            <>
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">{activeTopic.title}</h1>
                
                <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                  <TopicContent topic={activeTopic} onComplete={handleMarkAsCompleted} />
                </div>

                {/* Botão para marcar como concluído */}
                {activeTopic.type !== 'quiz' && !isTopicCompleted(activeTopic.id) && (
                  <div className="flex justify-center">
                    <button 
                      onClick={() => handleMarkAsCompleted()} 
                      disabled={completingTopic}
                      className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {completingTopic ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          <span>Salvando...</span>
                        </>
                      ) : (
                        'Marcar como Concluído'
                      )}
                    </button>
                  </div>
                )}

                {/* Seção de certificado */}
                {showCertificateButton && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg text-center">
                    <div className="mb-4">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-green-800 mb-2">
                        🎉 Parabéns! Módulo Concluído!
                      </h3>
                      <p className="text-green-700">
                        Você completou com sucesso o treinamento "{module.title}"
                      </p>
                    </div>
                    <button 
                      onClick={handleGenerateCertificate} 
                      className="px-8 py-3 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors shadow-lg"
                    >
                      📜 Baixar Certificado
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Selecione um tópico na barra lateral para começar</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal de Feedback */}
      {showFeedbackModal && module && (
        <FeedbackModal 
          moduleTitle={module.title} 
          onSubmit={handleFeedbackSubmit}
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