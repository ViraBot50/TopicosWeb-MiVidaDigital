import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-900">
      <Sidebar />

      <div className="min-h-screen pl-64">
        <Header />

        <main className="mx-auto w-full max-w-[1600px] p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
