import { useState } from 'react';
import { X, Upload, FileText, Video, Image, HelpCircle } from 'lucide-react';

interface UploadModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ModuleTopic {
  id: string;
  title: string;
  type: 'video' | 'text' | 'image' | 'quiz';
  content?: string;
  videoUrl?: string;
  imageUrl?: string;
  quizId?: string;
}

const UploadModuleModal = ({ isOpen, onClose, onSuccess }: UploadModuleModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'geral',
    estimatedDuration: 30,
    coverImageUrl: ''
  });
  const [topics, setTopics] = useState<ModuleTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'topics'>('info');

  const categories = [
    { value: 'uti', label: 'UTI' },
    { value: 'centro_cirurgico', label: 'Centro Cirúrgico' },
    { value: 'enfermagem', label: 'Enfermagem' },
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'geral', label: 'Geral' }
  ];

  const topicTypes = [
    { value: 'video', label: 'Vídeo', icon: Video },
    { value: 'text', label: 'Texto', icon: FileText },
    { value: 'image', label: 'Imagem', icon: Image },
    { value: 'quiz', label: 'Quiz', icon: HelpCircle }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'estimatedDuration' ? parseInt(value) || 0 : value
    }));
  };

  const addTopic = () => {
    const newTopic: ModuleTopic = {
      id: `topic_${topics.length + 1}`,
      title: '',
      type: 'text',
      content: ''
    };
    setTopics([...topics, newTopic]);
  };

  const updateTopic = (index: number, field: keyof ModuleTopic, value: string) => {
    const updatedTopics = topics.map((topic, i) => 
      i === index ? { ...topic, [field]: value } : topic
    );
    setTopics(updatedTopics);
  };

  const removeTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.title || !formData.description) {
        throw new Error('Título e descrição são obrigatórios');
      }

      if (topics.length === 0) {
        throw new Error('Adicione pelo menos um tópico ao módulo');
      }

      const moduleData = {
        ...formData,
        topics,
        isActive: true,
        uploadedAt: new Date(),
        createdBy: 'csm'
      };

      console.log('Fazendo upload do módulo:', moduleData);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setFormData({
        title: '',
        description: '',
        category: 'geral',
        estimatedDuration: 30,
        coverImageUrl: ''
      });
      setTopics([]);
      setActiveTab('info');
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload do módulo. Tente novamente.');
      console.error('Erro ao fazer upload:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <Upload className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Upload de Novo Módulo</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Informações Básicas
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'topics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Tópicos ({topics.length})
            </button>
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Título do Módulo *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Introdução aos Cuidados de UTI"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 mb-2">
                    Duração Estimada (minutos) *
                  </label>
                  <input
                    type="number"
                    id="estimatedDuration"
                    name="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={handleInputChange}
                    min="1"
                    max="480"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    URL da Imagem de Capa
                  </label>
                  <input
                    type="url"
                    id="coverImageUrl"
                    name="coverImageUrl"
                    value={formData.coverImageUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descreva o conteúdo e objetivos do módulo..."
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'topics' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Tópicos do Módulo</h3>
                <button
                  type="button"
                  onClick={addTopic}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Adicionar Tópico
                </button>
              </div>

              {topics.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum tópico adicionado</h3>
                  <p className="mt-1 text-sm text-gray-500">Comece adicionando o primeiro tópico do seu módulo.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topics.map((topic, index) => {
                    const TypeIcon = topicTypes.find(t => t.value === topic.type)?.icon || FileText;
                    return (
                      <div key={topic.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <TypeIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">Tópico {index + 1}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTopic(index)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Título do Tópico
                            </label>
                            <input
                              type="text"
                              value={topic.title}
                              onChange={(e) => updateTopic(index, 'title', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Ex: Conceitos Básicos"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tipo de Conteúdo
                            </label>
                            <select
                              value={topic.type}
                              onChange={(e) => updateTopic(index, 'type', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                              {topicTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {topic.type === 'text' && (
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Conteúdo
                              </label>
                              <textarea
                                value={topic.content || ''}
                                onChange={(e) => updateTopic(index, 'content', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Digite o conteúdo do tópico..."
                              />
                            </div>
                          )}

                          {topic.type === 'video' && (
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                URL do Vídeo
                              </label>
                              <input
                                type="url"
                                value={topic.videoUrl || ''}
                                onChange={(e) => updateTopic(index, 'videoUrl', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="https://www.youtube.com/embed/..."
                              />
                            </div>
                          )}

                          {topic.type === 'image' && (
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                URL da Imagem
                              </label>
                              <input
                                type="url"
                                value={topic.imageUrl || ''}
                                onChange={(e) => updateTopic(index, 'imageUrl', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="https://exemplo.com/imagem.jpg"
                              />
                            </div>
                          )}

                          {topic.type === 'quiz' && (
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                ID do Quiz
                              </label>
                              <input
                                type="text"
                                value={topic.quizId || ''}
                                onChange={(e) => updateTopic(index, 'quizId', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="quiz_id_123"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Fazendo Upload...
                </div>
              ) : (
                'Fazer Upload do Módulo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModuleModal;