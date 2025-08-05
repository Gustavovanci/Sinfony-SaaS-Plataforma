import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getModules } from '../services/moduleService';
import type { Module } from '../services/moduleService';
import { getAllProgressForUser } from '../services/progressService';
import type { ModuleProgress } from '../services/progressService';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, Play, CheckCircle, Star, Trophy, Zap } from 'lucide-react';
import LoadingSpinner, { SkeletonList, PageLoader } from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';

// Imagem padrão para módulos
const defaultCoverImage = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

interface ModuleWithProgress extends Module {
  progress?: ModuleProgress;
  isCompleted: boolean;
  isStarted: boolean;
  progressPercent: number;
}

const DashboardPage = () => {
  const { userProfile, user } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [userProgress, setUserProgress] = useState<ModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch de dados com tratamento de erro melhorado
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        
        const [modulesResult, progressResult] = await Promise.all([
          getModules(),
          getAllProgressForUser(user.uid),
        ]);

        setModules(modulesResult.modules);
        setUserProgress(progressResult);

      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        setError('Erro ao carregar treinamentos. Tente novamente.');
        toast.error('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Combina módulos com progresso do usuário
  const modulesWithProgress: ModuleWithProgress[] = useMemo(() => {
    return modules.map(module => {
      const progress = userProgress.find(p => p.moduleId === module.id);
      const isCompleted = progress?.status === 'completed';
      const isStarted = Boolean(progress);
      
      let progressPercent = 0;
      if (progress && module.topics) {
        const completedTopics = progress.completedTopics?.length || 0;
        const totalTopics = module.topics.length;
        progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
      }

      return {
        ...module,
        progress,
        isCompleted,
        isStarted,
        progressPercent
      };
    });
  }, [modules, userProgress]);

  // Estatísticas do usuário
  const userStats = useMemo(() => {
    const totalModules = modules.length;
    const completedModules = modulesWithProgress.filter(m => m.isCompleted).length;
    const inProgressModules = modulesWithProgress.filter(m => m.isStarted && !m.isCompleted).length;
    const totalPoints = userProfile?.gamification?.points || 0;

    return {
      totalModules,
      completedModules,
      inProgressModules,
      totalPoints,
      completionRate: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0
    };
  }, [modulesWithProgress, modules.length, userProfile]);

  // Função para obter nível baseado nos pontos
  const getUserLevel = (points: number): { level: string; color: string; icon: typeof Star } => {
    if (points >= 1000) return { level: 'Expert', color: 'text-purple-600', icon: Trophy };
    if (points >= 500) return { level: 'Avançado', color: 'text-blue-600', icon: Star };
    if (points >= 200) return { level: 'Intermediário', color: 'text-green-600', icon: Zap };
    return { level: 'Iniciante', color: 'text-gray-600', icon: BookOpen };
  };

  const currentLevel = getUserLevel(userStats.totalPoints);
  const LevelIcon = currentLevel.icon;

  if (loading) {
    return <PageLoader text="Carregando seus treinamentos..." />;
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao Carregar</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header de Boas-vindas */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Olá, {userProfile?.displayName || 'Usuário'}! 👋
        </h1>
        <p className="text-lg text-gray-600">
          {userStats.completedModules > 0 
            ? `Continue sua jornada de aprendizado! Você já completou ${userStats.completedModules} módulo${userStats.completedModules > 1 ? 's' : ''}.`
            : 'Pronto para começar? Escolha um treinamento abaixo para iniciar sua jornada.'
          }
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Nível do Usuário */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg bg-white shadow-sm ${currentLevel.color}`}>
              <LevelIcon className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Seu Nível</h3>
          <p className={`text-2xl font-bold ${currentLevel.color}`}>{currentLevel.level}</p>
          <p className="text-sm text-gray-500">{userStats.totalPoints} pontos</p>
        </div>

        {/* Módulos Completados */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-white shadow-sm">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Completados</h3>
          <p className="text-2xl font-bold text-green-600">{userStats.completedModules}</p>
          <p className="text-sm text-gray-500">de {userStats.totalModules} módulos</p>
        </div>

        {/* Módulos em Progresso */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-white shadow-sm">
              <Play className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Em Progresso</h3>
          <p className="text-2xl font-bold text-yellow-600">{userStats.inProgressModules}</p>
          <p className="text-sm text-gray-500">módulos iniciados</p>
        </div>

        {/* Taxa de Conclusão */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-white shadow-sm">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Taxa de Conclusão</h3>
          <p className="text-2xl font-bold text-purple-600">{userStats.completionRate}%</p>
          <p className="text-sm text-gray-500">dos módulos concluídos</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;