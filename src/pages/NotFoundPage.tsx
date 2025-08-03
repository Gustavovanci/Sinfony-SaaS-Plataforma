// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl mt-4">Página Não Encontrada</p>
      <p className="mt-2 text-gray-600">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link
        to="/"
        className="px-4 py-2 mt-6 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        Voltar para a Página Inicial
      </Link>
    </div>
  );
};

// E a exportação padrão para corrigir o erro de importação
export default NotFoundPage;