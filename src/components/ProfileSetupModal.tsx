import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/userService';

const ProfileSetupModal = ({ onProfileUpdate }: { onProfileUpdate: () => void }) => {
  const { user } = useAuth();
  const [profession, setProfession] = useState('');
  const [sector, setSector] = useState(''); // <-- NOVO ESTADO PARA O SETOR
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profession || !sector) return;

    setLoading(true);
    try {
      // Envia ambos os campos para o serviço
      await updateUserProfile(user.uid, { profession, sector });
      onProfileUpdate();
    } catch (error) {
      console.error("Erro ao atualizar o perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Complete seu Perfil</h2>
        <p className="mb-6 text-gray-600">Para continuar, precisamos de mais algumas informações.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo de Profissão Atualizado */}
          <div>
            <label htmlFor="profession" className="block text-sm font-medium text-gray-700">
              Qual é a sua função?
            </label>
            <select
              id="profession"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="" disabled>Selecione...</option>
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

          {/* NOVO CAMPO DE SETOR */}
          <div>
            <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
              Qual é o seu setor?
            </label>
            <select
              id="sector"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="" disabled>Selecione...</option>
              <option value="UTI">UTI</option>
              <option value="Centro Cirúrgico">Centro Cirúrgico</option>
              <option value="Pronto Socorro">Pronto Socorro</option>
              <option value="Enfermaria">Enfermaria</option>
              <option value="Administrativo">Administrativo</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !profession || !sector}
            className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Salvando...' : 'Salvar e Continuar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupModal;
