import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAllProgressForUser } from '../services/progressService';
import { getModules } from '../services/moduleService';
import type { UserProfile } from '../types';
import type { ModuleProgress } from '../services/progressService';
import type { Module } from '../services/moduleService';
import { ArrowLeft } from 'lucide-react';

const EmployeeDetailPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [employee, setEmployee] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<ModuleProgress[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Busca os dados em paralelo para mais eficiência
        const [employeeDocSnap, progressData, modulesData] = await Promise.all([
          getDoc(doc(db, 'users', userId)),
          getAllProgressForUser(userId),
          getModules()
        ]);

        if (employeeDocSnap.exists()) {
          setEmployee({ uid: employeeDocSnap.id, ...employeeDocSnap.data() } as UserProfile);
        }

        setProgress(progressData);
        // Correção aqui: acesse a propriedade 'modules' do objeto retornado
        setModules(modulesData.modules);

      } catch (error) {
        console.error("Erro ao buscar detalhes do funcionário:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Função para encontrar o título de um módulo a partir do seu ID
  const getModuleTitle = (moduleId: string) => {
    return modules.find(m => m.id === moduleId)?.title || 'Módulo desconhecido';
  };

  if (loading) {
    return <div className="p-8">A carregar detalhes...</div>;
  }

  if (!employee) {
    return <div className="p-8">Funcionário não encontrado.</div>;
  }

  return (
    <div className="p-8">
      <Link to="/coordinator" className="flex items-center text-sm text-gray-600 hover:text-blue-600 mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar ao Painel
      </Link>
      <h1 className="text-3xl font-bold">Progresso de {employee.displayName}</h1>
      <p className="mt-2 text-gray-600">E-mail: {employee.email}</p>

      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold">Treinamento</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Tópicos Concluídos</th>
                <th className="p-4 font-semibold">Pontuação do Quiz</th>
              </tr>
            </thead>
            <tbody>
              {progress.map(p => (
                <tr key={p.moduleId} className="border-b">
                  <td className="p-4 font-medium">{getModuleTitle(p.moduleId)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      p.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {p.status === 'completed' ? 'Concluído' : 'Em Andamento'}
                    </span>
                  </td>
                  <td className="p-4">{p.completedTopics.length}</td>
                  <td className="p-4">{p.score ?? 'N/A'}</td>
                </tr>
              ))}
              {progress.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    Este funcionário ainda não iniciou nenhum treinamento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailPage;