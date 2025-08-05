import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsersByOrganization } from '../services/userService';
import { getFeedbackByOrganization } from '../services/feedbackService';
import type { EnrichedFeedback } from '../services/feedbackService';
import { getProgressForUsers } from '../services/progressService';
import { getModules } from '../services/moduleService';
import type { UserProfile } from '../types';
import type { Module } from '../services/moduleService';
import { Smile, Users, Star, Download, CheckCircle } from 'lucide-react';
import ProfessionChart from '../components/ProfessionChart';
import TrendChart from '../components/TrendChart';
import { exportToExcel } from '../services/exportService';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interface para combinar dados do funcionário com seu progresso
interface EmployeeWithProgress extends UserProfile {
  averageProgress: number;
  completedModules: number;
  lastActivity?: Date;
}

const CoordinatorDashboardPage = () => {
  const { userProfile } = useAuth();
  const [employees, setEmployees] = useState<EmployeeWithProgress[]>([]);
  const [feedbacks, setFeedbacks] = useState<EnrichedFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.organizationId) {
      setLoading(true);
      
      const fetchData = async () => {
        try {
          const orgId = userProfile.organizationId!;
          
          const users = await getUsersByOrganization(orgId);

          if (users.length === 0) {
            setEmployees([]);
            setFeedbacks([]);
            setLoading(false);
            return;
          }

          const [feedbackData, allModulesResult, allProgressData] = await Promise.all([
            getFeedbackByOrganization(orgId),
            getModules(),
            getProgressForUsers(users.map(u => u.uid))
          ]);
          
          const allModules = allModulesResult.modules;
          setFeedbacks(feedbackData);

          const progressMap = new Map(allProgressData.map(p => [p.userId, p.progress]));

          const employeesWithProgress = users.map(user => {
            const userProgress = progressMap.get(user.uid) || [];
            const totalModulesForUser = allModules.length;
            const completedModules = userProgress.filter(p => p.status === 'completed').length;
            
            let totalProgress = 0;
            userProgress.forEach(p => {
              const module = allModules.find(m => m.id === p.moduleId);
              if (module && module.topics && module.topics.length > 0) {
                totalProgress += (p.completedTopics.length / module.topics.length) * 100;
              }
            });

            return {
              ...user,
              completedModules,
              averageProgress: totalModulesForUser > 0 ? Math.round(totalProgress / totalModulesForUser) : 0,
              lastActivity: user.lastLoginAt,
            };
          });

          setEmployees(employeesWithProgress);

        } catch (err) {
          console.error("Erro ao buscar dados do painel:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [userProfile]);

  const kpis = useMemo(() => {
    const totalEmployees = employees.length;
    const activeLast30Days = employees.filter(e => e.lastActivity && (new Date().getTime() - new Date(e.lastActivity).getTime()) < 30 * 24 * 60 * 60 * 1000).length;
    
    let avgCsat = 'N/A';
    let nps = 'N/A';
    if (feedbacks.length > 0) {
      const totalCsat = feedbacks.reduce((acc, fb) => acc + fb.csat, 0);
      avgCsat = (totalCsat / feedbacks.length).toFixed(1);
      const promoters = feedbacks.filter(f => f.nps >= 9).length;
      const detractors = feedbacks.filter(f => f.nps <= 6).length;
      nps = feedbacks.length > 0 ? Math.round(((promoters - detractors) / feedbacks.length) * 100).toString() : 'N/A';
    }

    return {
      totalEmployees,
      engagementRate: totalEmployees > 0 ? Math.round((activeLast30Days / totalEmployees) * 100) : 0,
      avgCsat,
      nps,
    };
  }, [employees, feedbacks]);

  const handleExport = () => {
    const dataToExport = employees
        .filter(e => e.uid !== userProfile?.uid)
        .map(e => ({
            'Funcionário': e.displayName,
            'E-mail': e.email,
            'Profissão': e.profession || 'N/D',
            'Setor': e.sector || 'N/D',
            'Progresso Médio (%)': e.averageProgress,
            'Módulos Concluídos': e.completedModules,
            'Pontos': e.gamification.points,
            'Última Atividade': e.lastActivity ? formatDistanceToNow(new Date(e.lastActivity), { addSuffix: true, locale: ptBR }) : 'Nunca'
        }));
    exportToExcel(dataToExport, 'Relatorio_Equipe_Sinfony');
  };

  if (loading) {
    return <div className="p-8">Carregando dados da equipe...</div>;
  }

  return (
    <div className="p-8 bg-gray-50 flex-1">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold">Painel de Análise</h1>
            <p className="mt-2 text-gray-600">Acompanhe o progresso e a satisfação da sua equipe.</p>
        </div>
        <div>
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white shadow-sm">
                <option>Últimos 30 dias</option>
                <option>Últimos 90 dias</option>
                <option>Todo o período</option>
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Total na Equipe</p>
                <Users className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold mt-2">{kpis.totalEmployees}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Taxa de Engajamento</p>
                <CheckCircle className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold mt-2">{kpis.engagementRate}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Satisfação (CSAT)</p>
                <Smile className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold mt-2">{kpis.avgCsat} / 5</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">NPS</p>
                <Star className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold mt-2">{kpis.nps}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Evolução da Satisfação (CSAT)</h3>
          <TrendChart feedbacks={feedbacks} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Distribuição por Função</h3>
          <ProfessionChart employees={employees} />
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 flex justify-between items-center border-b">
          <h3 className="text-lg font-semibold text-gray-800">Performance da Equipe</h3>
          <button
            onClick={handleExport}
            className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-md shadow-sm hover:bg-gray-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-semibold text-sm text-gray-600">Funcionário</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Progresso Médio</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Pontos</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Última Atividade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.filter(e => e.uid !== userProfile?.uid).map(employee => (
                <tr key={employee.uid} className="hover:bg-gray-50">
                  <td className="p-4">
                    <Link to={`/coordinator/employee/${employee.uid}`} className="text-blue-600 hover:underline font-medium">
                      {employee.displayName}
                    </Link>
                    <p className="text-xs text-gray-500">{employee.profession}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                        <span className="font-semibold w-10 text-sm text-gray-800">{employee.averageProgress}%</span>
                        <div className="w-full bg-gray-200 rounded-full h-2 ml-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${employee.averageProgress}%` }}></div>
                        </div>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-gray-800">{employee.gamification.points}</td>
                  <td className="p-4 text-sm text-gray-600">
                    {employee.lastActivity ? formatDistanceToNow(new Date(employee.lastActivity), { addSuffix: true, locale: ptBR }) : 'Nunca'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorDashboardPage;