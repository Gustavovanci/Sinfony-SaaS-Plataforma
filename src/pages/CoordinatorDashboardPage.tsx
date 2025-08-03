import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsersByOrganization } from '../services/userService';
import { getFeedbackByOrganization } from '../services/feedbackService';
import type { EnrichedFeedback } from '../services/feedbackService';
import type { UserProfile } from '../types';
import { Smile, Users, Star, Download } from 'lucide-react';
import ProfessionChart from '../components/ProfessionChart';
import SectorChart from '../components/SectorChart'; // <-- 1. IMPORTA O NOVO GRÁFICO
import { exportToExcel } from '../services/exportService';

const CoordinatorDashboardPage = () => {
  const { userProfile } = useAuth();
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [feedbacks, setFeedbacks] = useState<EnrichedFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.organizationId) {
      setLoading(true);
      Promise.all([
        getUsersByOrganization(userProfile.organizationId),
        getFeedbackByOrganization(userProfile.organizationId),
      ]).then(([users, feedbackData]) => {
        const allEmployees = users.filter(u => u.role !== 'superadmin');
        setEmployees(allEmployees);
        setFeedbacks(feedbackData);
      }).catch(err => console.error("Erro ao buscar dados do painel:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [userProfile]);

  const kpis = useMemo(() => {
    if (feedbacks.length === 0) return { avgCsat: 'N/A', nps: 'N/A' };
    
    const totalCsat = feedbacks.reduce((acc, fb) => acc + fb.csat, 0);
    const avgCsat = (totalCsat / feedbacks.length).toFixed(1);

    const promoters = feedbacks.filter(f => f.nps >= 9).length;
    const detractors = feedbacks.filter(f => f.nps <= 6).length;
    const nps = Math.round(((promoters - detractors) / feedbacks.length) * 100);

    return { avgCsat, nps: nps.toString() };
  }, [feedbacks]);

  const employeesForTable = employees.filter(e => e.uid !== userProfile?.uid);

  const handleExport = () => {
    exportToExcel(employeesForTable, 'Relatorio_Equipe_VitalTrain');
  };

  if (loading) {
    return <div className="p-8">Carregando dados da equipe...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Painel de Análise</h1>
      <p className="mt-2 text-gray-600">Acompanhe o progresso e a satisfação da sua equipe.</p>

      {/* --- SEÇÃO DE KPIs --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <div className="bg-blue-100 p-3 rounded-full"><Users className="h-6 w-6 text-blue-600" /></div>
          <div className="ml-4"><p className="text-gray-500">Total na Equipe</p><p className="text-2xl font-bold">{employees.length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <div className="bg-green-100 p-3 rounded-full"><Smile className="h-6 w-6 text-green-600" /></div>
          <div className="ml-4"><p className="text-gray-500">Satisfação Média (CSAT)</p><p className="text-2xl font-bold">{kpis.avgCsat} / 5</p></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <div className="bg-yellow-100 p-3 rounded-full"><Star className="h-6 w-6 text-yellow-600" /></div>
          <div className="ml-4"><p className="text-gray-500">NPS</p><p className="text-2xl font-bold">{kpis.nps}</p></div>
        </div>
      </div>

      {/* --- SEÇÃO DE RELATÓRIOS VISUAIS --- */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Distribuição por Função</h3>
          <ProfessionChart employees={employees} />
        </div>
        {/* --- 2. SUBSTITUI O PLACEHOLDER PELO NOVO GRÁFICO --- */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Distribuição por Setor</h3>
          <SectorChart employees={employees} />
        </div>
      </div>

      {/* --- SEÇÃO DA TABELA DE FUNCIONÁRIOS --- */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="p-4 flex justify-between items-center border-b">
          <h3 className="text-xl font-semibold">Lista de Funcionários</h3>
          <button
            onClick={handleExport}
            className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-md shadow-sm hover:bg-gray-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold">Funcionário</th>
                <th className="p-4 font-semibold">E-mail</th>
                <th className="p-4 font-semibold">Profissão</th>
                <th className="p-4 font-semibold">Pontos</th>
              </tr>
            </thead>
            <tbody>
              {employeesForTable.map(employee => (
                <tr key={employee.uid} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <Link to={`/coordinator/employee/${employee.uid}`} className="text-blue-600 hover:underline font-medium">
                      {employee.displayName}
                    </Link>
                  </td>
                  <td className="p-4 text-gray-600">{employee.email}</td>
                  <td className="p-4 text-gray-600">{employee.profession || 'N/D'}</td>
                  <td className="p-4 font-semibold text-gray-800">{employee.gamification.points}</td>
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
