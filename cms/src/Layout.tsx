import { Outlet, Link, useLocation } from 'react-router-dom';
import { Database, BookOpen, Settings, LayoutDashboard } from 'lucide-react';

export function Layout() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Problems', path: '/problems', icon: Database },
    { name: 'Resources', path: '/resources', icon: BookOpen },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            PrepGoat CMS
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-zinc-800 text-white' 
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 border-b border-zinc-800 bg-zinc-900/50">
          <h2 className="text-lg font-medium">Admin Dashboard</h2>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span>Admin Mode</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
