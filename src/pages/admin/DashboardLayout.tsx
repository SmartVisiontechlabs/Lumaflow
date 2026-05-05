import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, LogOut } from 'lucide-react';

export default function DashboardLayout() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Classes', path: '/admin/classes', icon: Calendar },
    { name: 'Bookings', path: '/admin/bookings', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-cream shadow-sm flex flex-col">
        <div className="p-6 border-b border-cream">
          <img src="/logo.png" alt="Lumaflow Admin" className="h-8 w-auto mix-blend-multiply opacity-80" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-gold mt-2">Admin Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-cream text-text-dark border border-gold/20 shadow-sm' 
                    : 'text-text-dark/60 hover:bg-cream hover:text-text-dark'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-gold' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-cream">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-dark/60 hover:bg-cream hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-cream px-8 py-5 shadow-sm flex justify-between items-center">
          <h1 className="font-display text-2xl text-text-dark">Admin Overview</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
              AD
            </div>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
