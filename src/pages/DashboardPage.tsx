import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getModules } from '../services/moduleService';
import type { Module } from '../services/moduleService';
import { Link } from 'react-router-dom';
import coverImage from '../assets/treinamento-cover.jpg'; // <-- 1. IMPORTA A IMAGEM LOCAL

const DashboardPage = () => {
  const { userProfile } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const modulesData = await getModules();
        setModules(modulesData);
      } catch (error) {
        console.error("Erro ao buscar módulos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  if (loading) {
    return <div className="p-8">Carregando treinamentos...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800">
        Olá, {userProfile?.displayName}!
      </h1>
      <p className="mt-2 text-gray-600">
        Pronto para começar? Escolha um treinamento abaixo.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <div key={module.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
            {/* 2. USA A IMAGEM IMPORTADA EM VEZ DA URL DO FIREBASE */}
            <img src={coverImage} alt={module.title} className="w-full h-40 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2 h-14">{module.title}</h3>
              <p className="text-gray-600 mb-4 h-20 overflow-hidden">{module.description}</p>
              <Link to={`/module/${module.id}`} className="w-full text-center block bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
                Iniciar Treinamento
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
