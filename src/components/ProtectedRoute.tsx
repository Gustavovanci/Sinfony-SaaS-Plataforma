// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // Enquanto o status de autenticação está sendo verificado, mostramos uma mensagem.
  // Isso evita um "piscar" da tela de login antes de redirecionar.
  if (loading) {
    return <div>Carregando...</div>;
  }

  // Se não houver usuário após o carregamento, redireciona para a página de login.
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Se houver um usuário, renderiza a página que a rota está tentando acessar.
  // O <Outlet /> é o espaço onde a página (ex: Dashboard) será renderizada.
  return <Outlet />;
};