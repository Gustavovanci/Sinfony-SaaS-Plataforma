import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {/* O conteúdo da página atual será renderizado aqui */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
