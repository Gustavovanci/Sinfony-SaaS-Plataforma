import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '../services/authService';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userProfile = await signIn({ email, password });

      // --- LÓGICA DE REDIRECIONAMENTO CORRIGIDA ---
      if (userProfile.role === 'superadmin') {
        navigate('/superadmin');
      } else if (userProfile.role === 'csm') { // ✅ CORREÇÃO AQUI
        navigate('/csm'); // Redireciona para o painel do CSM
      } else if (userProfile.role === 'coordinator') {
        navigate('/coordinator');
      } else {
        navigate('/'); // Redireciona para o dashboard padrão de funcionários
      }

    } catch (err: any) {
      setError('E-mail ou senha inválidos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-2 border rounded-md"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'A entrar...' : 'Entrar'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center">
          Não tem uma conta?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;