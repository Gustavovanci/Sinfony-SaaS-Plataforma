import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
// --- CORREÇÃO AQUI ---
import { getModules } from '../services/moduleService';
import type { Module } from '../services/moduleService';
import { getAllProgressForUser } from '../services/progressService';
// --- FIM DA CORREÇÃO ---
import { generateCertificatePDF } from '../services/certificateService';
import { Award } from 'lucide-react';
import { Link } from 'react-router-dom';

// Define a estrutura de um certificado, que é um módulo concluído
type Certificate = Module;

const CertificatesPage = () => {
  const { user, userProfile } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedModules = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // Busca todos os módulos e todo o progresso do usuário
        const [allModules, userProgress] = await Promise.all([
          getModules(),
          getAllProgressForUser(user.uid),
        ]);

        // Filtra para encontrar apenas os IDs dos módulos que foram concluídos
        const completedModuleIds = userProgress
          .filter(p => p.status === 'completed')
          .map(p => p.moduleId);

        // Filtra a lista de todos os módulos para manter apenas os que o usuário completou
        const completedModules = allModules.filter(module =>
          completedModuleIds.includes(module.id)
        );

        setCertificates(completedModules);
      } catch (error) {
        console.error("Erro ao buscar certificados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedModules();
  }, [user]);

  const handleDownloadCertificate = (module: Module) => {
    if (!userProfile) return;
    generateCertificatePDF({
      userName: userProfile.displayName || "Usuário",
      moduleTitle: module.title,
      completionDate: new Date().toLocaleDateString('pt-BR'), // Idealmente, a data real deveria ser salva no progresso
    });
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando seus certificados...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Meus Certificados</h1>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map(cert => (
            <div key={cert.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center mb-3">
                  <Award className="h-6 w-6 text-yellow-500 mr-3" />
                  <h2 className="text-xl font-semibold">{cert.title}</h2>
                </div>
                <p className="text-gray-600 text-sm mb-4">{cert.description}</p>
              </div>
              <button
                onClick={() => handleDownloadCertificate(cert)}
                className="w-full mt-4 px-4 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700"
              >
                Baixar Novamente
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">Você ainda não concluiu nenhum treinamento para ganhar um certificado.</p>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Ver treinamentos disponíveis
          </Link>
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;
