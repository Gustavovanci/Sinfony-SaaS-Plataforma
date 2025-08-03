import { useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { X } from 'lucide-react';
import { updateEmployeeProfile } from '../services/userService';

interface EditUserModalProps {
  user: UserProfile;
  onClose: () => void;
  onSave: () => void;
}

const EditUserModal = ({ user, onClose, onSave }: EditUserModalProps) => {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [profession, setProfession] = useState(user.profession || '');
  const [sector, setSector] = useState(user.sector || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateEmployeeProfile(user.uid, { displayName, profession, sector });
      onSave(); // Avisa a página principal para recarregar os dados
    } catch (error) {
      console.error("Erro ao atualizar o perfil:", error);
      // Adicionar feedback de erro para o usuário aqui
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4">Editar Perfil de {user.displayName}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="profession" className="block text-sm font-medium text-gray-700">Função</label>
            <select id="profession" value={profession} onChange={(e) => setProfession(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
              {/* As mesmas opções do modal de onboarding */}
              <option value="Médico">Médico</option>
              <option value="Enfermeiro">Enfermeiro</option>
              <option value="Técnico de Enfermagem">Técnico de Enfermagem</option>
              <option value="Auxiliar de Enfermagem">Auxiliar de Enfermagem</option>
              <option value="Fisioterapeuta">Fisioterapeuta</option>
              <option value="Nutricionista">Nutricionista</option>
              <option value="Técnico de Raio X">Técnico de Raio X</option>
              <option value="Psicólogo">Psicólogo</option>
              <option value="Oficial Administrativo">Oficial Administrativo</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div>
            <label htmlFor="sector" className="block text-sm font-medium text-gray-700">Setor</label>
            <select id="sector" value={sector} onChange={(e) => setSector(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
              <option value="UTI">UTI</option>
              <option value="Centro Cirúrgico">Centro Cirúrgico</option>
              <option value="Pronto Socorro">Pronto Socorro</option>
              <option value="Enfermaria">Enfermaria</option>
              <option value="Administrativo">Administrativo</option>
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
