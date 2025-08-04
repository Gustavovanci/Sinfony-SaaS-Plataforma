import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/authService';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AccountPage = () => {
  const { userProfile } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Define o caminho de volta com base na role do utilizador
  const getBackPath = () => {
    switch (userProfile?.role) {
      case 'coordinator':
        return '/coordinator';
      case 'csm':
        return '/csm';
      case 'superadmin':
        return '/superadmin';
      case 'employee':
      default:
        return '/';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    setLoading(true);
    try {
      await changePassword(newPassword);
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error("Erro ao alterar a senha:", error);
      setMessage({ type: 'error', text: 'Ocorreu um erro ao alterar a senha. Pode ser necessário fazer logout e login novamente.' });
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return <div className="p-8">A carregar informações do perfil...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to={getBackPath()} className="flex items-center text-sm text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar ao Painel
      </Link>

      <h1 className="text-3xl font-bold mb-8">Minha Conta</h1>

      {/* ✅ INÍCIO DO CONTEÚDO RESTAURADO */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Informações do Perfil</h2>
        <div className="space-y-3">
          <p><strong>Nome:</strong> {userProfile.displayName}</p>
          <p><strong>E-mail:</strong> {userProfile.email}</p>
          {userProfile.profession && <p><strong>Profissão:</strong> {userProfile.profession}</p>}
          {userProfile.sector && <p><strong>Setor:</strong> {userProfile.sector}</p>}
          {userProfile.role === 'employee' && (
            <p><strong>Pontos:</strong> {userProfile.gamification.points}</p>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Alterar Senha</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newPassword">Nova Senha</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-md"
              required
            />
          </div>
          {message && (
            <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </p>
          )}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'A salvar...' : 'Salvar Nova Senha'}
            </button>
          </div>
        </form>
      </div>
      {/* ✅ FIM DO CONTEÚDO RESTAURADO */}
    </div>
  );
};

export default AccountPage;