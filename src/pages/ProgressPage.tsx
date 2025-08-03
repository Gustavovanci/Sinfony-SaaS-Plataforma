import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
// --- CORREÇÃO AQUI ---
import { getModules } from '../services/moduleService';
import type { Module } from '../services/moduleService';
import { getAllProgressForUser } from '../services/progressService';
import type { ModuleProgress } from '../services/progressService';
// --- FIM DA CORREÇÃO ---
import { Link } from 'react-router-dom';
import { CheckCircle, Lock, PlayCircle } from 'lucide-react';

// Define a estrutura combinada de um módulo com o progresso do usuário
interface ModuleWithProgress extends Module {
  status: 'completed' | 'in-progress' | 'locked';
}

// Função para determinar o nível do usuário com base nos pontos
const getUserLevel = (points: number): string => {
  if (points >= 500) return 'Mestre';
  if (points >= 300) return 'Conhecedor';
  if (points >= 100) return 'Aprendiz';
  return 'Iniciante';
};

const ProgressPage = () => {
  const { user, userProfile } = useAuth();
  const [modulesWithProgress, setModulesWithProgress] = useState<ModuleWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // Busca todos os módulos e todo o progresso do usuário em paralelo
        const [allModules, userProgress] = await Promise.all([
          getModules(),
          getAllProgressForUser(user.uid),
        ]);

        // Combina os dados
        const combinedData = allModules.map(module => {
          const progress = userProgress.find(p => p.moduleId === module.id);
          let status: 'completed' | 'in-progress' | 'locked' = 'locked';

          if (progress) {
            status = progress.status === 'completed' ? 'completed' : 'in-progress';
          }
          
          return { ...module, status };
        });

        // Lógica para desbloquear o próximo módulo
        let canUnlockNext = true;
        for (const module of combinedData) {
          if (module.status === 'completed' && canUnlockNext) {
            continue;
          }
          if (module.status === 'locked' && canUnlockNext) {
            module.status = 'in-progress'; // Desbloqueia o primeiro módulo não concluído
            canUnlockNext = false;
          } else {
            canUnlockNext = false;
          }
        }

        setModulesWithProgress(combinedData);
      } catch (error) {
        console.error("Erro ao buscar dados de progresso:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center">Carregando seu progresso...</div>;
  }
  
  const userLevel = getUserLevel(userProfile?.gamification.points || 0);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Meu Progresso</h1>
      <p className="text-gray-600 mb-8">Acompanhe sua jornada de aprendizado e continue evoluindo!</p>

      {/* Card de Status do Usuário */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Seu Nível</p>
          <p className="text-2xl font-bold text-blue-600">{userLevel}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total de Pontos</p>
          <p className="text-2xl font-bold text-green-600">{userProfile?.gamification.points || 0}</p>
        </div>
      </div>

      {/* Trilha de Aprendizado */}
      <div className="space-y-4">
        {modulesWithProgress.map((module, index) => (
          <div key={module.id} className={`p-4 rounded-lg shadow-sm flex items-center transition-all ${
            module.status === 'locked' ? 'bg-gray-100' : 'bg-white'
          }`}>
            <div className={`mr-4 ${
              module.status === 'completed' ? 'text-green-500' :
              module.status === 'in-progress' ? 'text-blue-500' : 'text-gray-400'
            }`}>
              {module.status === 'completed' && <CheckCircle size={32} />}
              {module.status === 'in-progress' && <PlayCircle size={32} />}
              {module.status === 'locked' && <Lock size={32} />}
            </div>
            <div className="flex-1">
              <p className={`text-xs ${
                module.status === 'locked' ? 'text-gray-400' : 'text-gray-500'
              }`}>Módulo {index + 1}</p>
              <h3 className={`text-lg font-semibold ${
                module.status === 'locked' ? 'text-gray-400' : 'text-gray-800'
              }`}>{module.title}</h3>
            </div>
            {module.status !== 'locked' ? (
              <Link to={`/module/${module.id}`} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700">
                {module.status === 'completed' ? 'Revisar' : 'Continuar'}
              </Link>
            ) : (
              <span className="px-4 py-2 bg-gray-200 text-gray-500 text-sm font-semibold rounded-md cursor-not-allowed">
                Em Breve
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressPage;
