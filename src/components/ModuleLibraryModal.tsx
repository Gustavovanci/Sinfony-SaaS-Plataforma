import { useState, useEffect } from 'react';
import { X, FileText, Eye, Edit, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { ModuleTemplate } from '../types'; // Importe de /types

interface ModuleLibraryModalProps {
  isOpen: boolean;
  category: string;
  categoryLabel: string;
  onClose: () => void;
  onModuleUpdated: () => void;
}

interface ModuleWithDetails extends ModuleTemplate {
  topics?: any[];
  quizQuestions?: number;
}

const ModuleLibraryModal = ({ isOpen, category, categoryLabel, onClose, onModuleUpdated }: ModuleLibraryModalProps) => {
  const [modules, setModules] = useState<ModuleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<ModuleWithDetails | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && category) {
      loadModules();
    }
  }, [isOpen, category]);

  const loadModules = async () => {
    try {
      setLoading(true);
      
      const modulesRef = collection(db, 'modules');
      const q = query(modulesRef, where('category', '==', category));
      const modulesSnapshot = await getDocs(q);
      
      const modulesList: ModuleWithDetails[] = modulesSnapshot.docs.map(doc => {
        const moduleData = doc.data();
        return {
          id: doc.id,
          title: moduleData.title || 'Módulo Sem Título',
          description: moduleData.description || 'Sem descrição',
          category: moduleData.category || 'geral',
          estimatedDuration: moduleData.estimatedDuration || 30,
          isActive: moduleData.isActive ?? true,
          uploadedAt: moduleData.createdAt ? moduleData.createdAt.toDate() : new Date(),
          createdBy: moduleData.createdBy || 'system',
          topics: moduleData.topics || [],
          quizQuestions: moduleData.topics?.find((t: any) => t.type === 'quiz') ? 1 : 0
        };
      });
      
      const sortedModules = modulesList.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
      setModules(sortedModules);
      
    } catch (error) {
      console.error('❌ Erro ao carregar módulos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (moduleId: string, currentStatus: boolean) => {
    try {
      setActionLoading(moduleId);
      
      const moduleRef = doc(db, 'modules', moduleId);
      await updateDoc(moduleRef, { isActive: !currentStatus });
      
      setModules(prev => prev.map(m => m.id === moduleId ? { ...m, isActive: !currentStatus } : m));
      onModuleUpdated();
      
    } catch (error) {
      console.error('❌ Erro ao alterar status do módulo:', error);
      alert('Erro ao alterar status do módulo');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteModule = async (moduleId: string, moduleTitle: string) => {
    if (!confirm(`Tem certeza que deseja excluir permanentemente o módulo "${moduleTitle}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }
    
    try {
      setActionLoading(moduleId);
      
      const moduleRef = doc(db, 'modules', moduleId);
      await deleteDoc(moduleRef);
      
      setModules(prev => prev.filter(m => m.id !== moduleId));
      onModuleUpdated();
      
    } catch (error) {
      console.error('❌ Erro ao excluir módulo:', error);
      alert('Erro ao excluir módulo');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex">
        {/* Lista de Módulos */}
        <div className="w-1/2 border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{categoryLabel}</h2>
                <p className="text-sm text-gray-500">{modules.length} módulo(s) encontrado(s)</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Carregando...</div>
            ) : modules.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum módulo encontrado</h3>
              </div>
            ) : (
              <div className="space-y-3">
                {modules.map(module => (
                  <div
                    key={module.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedModule?.id === module.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'} ${!module.isActive ? 'opacity-60' : ''}`}
                    onClick={() => setSelectedModule(module)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 line-clamp-2">{module.title}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${module.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {module.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{module.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{module.estimatedDuration} min</span>
                      <span>{module.topics?.length || 0} tópicos</span>
                      <span>{module.uploadedAt.toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detalhes do Módulo */}
        <div className="w-1/2 flex flex-col">
          {selectedModule ? (
            <>
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedModule.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>⏱️ {selectedModule.estimatedDuration} min</span>
                      <span>📚 {selectedModule.topics?.length || 0} tópicos</span>
                      <span>❓ {selectedModule.quizQuestions || 0} quiz</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(selectedModule.id, selectedModule.isActive)}
                      disabled={actionLoading === selectedModule.id}
                      className={`flex items-center px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedModule.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'} ${actionLoading === selectedModule.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {selectedModule.isActive ? <><ToggleRight className="h-4 w-4 mr-1" /> Desativar</> : <><ToggleLeft className="h-4 w-4 mr-1" /> Ativar</>}
                    </button>
                    <button
                      onClick={() => handleDeleteModule(selectedModule.id, selectedModule.title)}
                      disabled={actionLoading === selectedModule.id}
                      className="flex items-center px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Excluir
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
                    <p className="text-gray-700">{selectedModule.description}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Estrutura do Módulo</h4>
                    <div className="space-y-3">
                      {selectedModule.topics?.map((topic, index) => (
                        <div key={topic.id || index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0 mr-3 text-lg">
                            {topic.type === 'video' && '🎥'}
                            {topic.type === 'text' && '📄'}
                            {topic.type === 'quiz' && '❓'}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{topic.title}</p>
                            <p className="text-sm text-gray-500 capitalize">
                              {topic.type === 'video' && 'Vídeo Explicativo'}
                              {topic.type === 'text' && 'Conteúdo Teórico'}
                              {topic.type === 'quiz' && 'Quiz de Avaliação'}
                            </p>
                          </div>
                          <div className="flex-shrink-0"><Eye className="h-4 w-4 text-gray-400" /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Informações</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500">Criado por:</span><p className="font-medium">{selectedModule.createdBy}</p></div>
                      <div><span className="text-gray-500">Data de upload:</span><p className="font-medium">{selectedModule.uploadedAt.toLocaleDateString('pt-BR')}</p></div>
                      <div><span className="text-gray-500">Categoria:</span><p className="font-medium capitalize">{selectedModule.category.replace('_', ' ')}</p></div>
                      <div><span className="text-gray-500">Status:</span><p className={`font-medium ${selectedModule.isActive ? 'text-green-600' : 'text-red-600'}`}>{selectedModule.isActive ? 'Ativo' : 'Inativo'}</p></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Eye className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Selecione um módulo</h3>
                <p className="mt-1 text-sm text-gray-500">Clique em um módulo à esquerda para ver os detalhes</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleLibraryModal; // ✅ ESTA É A LINHA QUE FALTAVA