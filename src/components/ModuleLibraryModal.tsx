import { useState, useEffect } from 'react';
import { X, FileText, Eye, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { ModuleTemplate } from '../types';

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
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          category: data.category,
          isActive: data.isActive,
          estimatedDuration: data.estimatedDuration,
          uploadedAt: data.createdAt.toDate(),
          createdBy: data.createdBy,
          topics: data.topics || [],
          quizQuestions: data.topics?.filter((t: any) => t.type === 'quiz').length || 0
        };
      });
      
      setModules(modulesList.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()));
    } catch (error) {
      console.error('Erro ao carregar módulos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (module: ModuleWithDetails) => {
    setActionLoading(module.id);
    try {
      const moduleRef = doc(db, 'modules', module.id);
      await updateDoc(moduleRef, { isActive: !module.isActive });
      await loadModules(); // Recarrega para ter a certeza
      onModuleUpdated();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteModule = async (module: ModuleWithDetails) => {
    if (window.confirm(`Tem a certeza de que quer excluir o módulo "${module.title}"?`)) {
      setActionLoading(module.id);
      try {
        await deleteDoc(doc(db, 'modules', module.id));
        // TODO: Excluir quiz associado
        setSelectedModule(null);
        await loadModules();
        onModuleUpdated();
      } catch (error) {
        console.error("Erro ao excluir módulo:", error);
      } finally {
        setActionLoading(null);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          {/* ... (código do modal com a lógica de renderização, sem alterações estruturais, apenas as funções acima são usadas) ... */}
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">{categoryLabel}</h2>
            <button onClick={onClose}><X size={24}/></button>
          </div>
          <div className="flex-1 flex overflow-hidden">
            <div className="w-1/2 overflow-y-auto p-4 border-r">
                {/* ... lista de módulos ... */}
            </div>
            <div className="w-1/2 overflow-y-auto p-6">
                {selectedModule ? (
                    <div>
                        <h3 className="text-lg font-bold">{selectedModule.title}</h3>
                        <p>{selectedModule.description}</p>
                        <div className="mt-4 space-x-2">
                            <button onClick={() => handleToggleActive(selectedModule)} disabled={!!actionLoading}>
                                {selectedModule.isActive ? 'Desativar' : 'Ativar'}
                            </button>
                            <button onClick={() => handleDeleteModule(selectedModule)} disabled={!!actionLoading}>
                                Excluir
                            </button>
                        </div>
                    </div>
                ) : <p>Selecione um módulo para ver os detalhes.</p>}
            </div>
          </div>
      </div>
    </div>
  );
};

export default ModuleLibraryModal;