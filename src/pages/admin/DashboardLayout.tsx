import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  Users, 
  Settings, 
  LogOut,
  ExternalLink,
  ShieldCheck,
  Database,
  Menu,
  X
} from 'lucide-react';
import { adminSupabase as supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Bookings', path: '/admin/bookings', icon: BookOpen },
    { name: 'Calendar', path: '/admin/calendar', icon: Calendar },
    { name: 'Clients', path: '/admin/clients', icon: Users },
    { name: 'Content CMS', path: '/admin/cms', icon: Database },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const currentPathName = navItems.find(item => 
    item.path === location.pathname || (item.path !== '/admin' && location.pathname.startsWith(item.path))
  )?.name || 'Operations';

  return (
    <div className="h-screen w-screen bg-cream flex flex-col lg:flex-row overflow-hidden font-sans selection:bg-gold/10 selection:text-gold">
      
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-white/60 backdrop-blur-md border-b border-text-dark/5 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-text-dark rounded-full flex items-center justify-center shadow-button">
            <ShieldCheck className="w-4 h-4 text-gold" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/40 italic leading-none">Lumaflow</span>
            <span className="font-display text-sm text-text-dark tracking-tight leading-none mt-1">Sanctuary Ops</span>
          </div>
        </div>
        
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-text-dark/60 hover:text-gold focus:outline-none transition-colors"
          aria-label="Toggle admin menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 bottom-0 left-0 w-80 bg-white/95 backdrop-blur-xl border-r border-text-dark/5 z-50 flex flex-col p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-text-dark rounded-full flex items-center justify-center shadow-button">
                    <ShieldCheck className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40 italic">Lumaflow</span>
                    <h2 className="font-display text-lg text-text-dark tracking-tight">Sanctuary Ops</h2>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-text-dark/40 hover:text-text-dark transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar">
                <p className="px-4 text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 mb-4">Management</p>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group flex items-center gap-4 px-6 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-500 relative ${
                        isActive 
                          ? 'bg-text-dark text-white shadow-luxury' 
                          : 'text-text-dark/40 hover:bg-white hover:text-text-dark'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 transition-colors duration-500 ${isActive ? 'text-gold' : 'text-text-dark/20 group-hover:text-gold/60'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto space-y-3 pt-6 border-t border-text-dark/5">
                <Link 
                  to="/" 
                  target="_blank"
                  className="flex items-center justify-between w-full px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] text-text-dark/40 bg-white border border-text-dark/5 hover:bg-white hover:text-text-dark transition-all duration-500 group"
                >
                  View Sanctuary
                  <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-4 w-full px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] text-text-dark/30 hover:text-red-400 transition-all duration-500 group"
                >
                  <LogOut className="w-4 h-4 text-text-dark/10 group-hover:text-red-400/60 transition-colors" />
                  End Session
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-80 bg-white/60 backdrop-blur-3xl border-r border-text-dark/5 flex-col relative z-20">
        <div className="p-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-text-dark rounded-full flex items-center justify-center shadow-button">
              <ShieldCheck className="w-4 h-4 text-gold" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-text-dark/40 italic">Lumaflow</span>
          </div>
          <h2 className="font-display text-2xl text-text-dark tracking-tight">Sanctuary Ops</h2>
        </div>
        
        <nav className="flex-1 px-8 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 mb-4">Management</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`group flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-500 relative ${
                  isActive 
                    ? 'bg-text-dark text-white shadow-luxury' 
                    : 'text-text-dark/40 hover:bg-white hover:text-text-dark'
                }`}
              >
                <item.icon className={`w-4 h-4 transition-colors duration-500 ${isActive ? 'text-gold' : 'text-text-dark/20 group-hover:text-gold/60'}`} />
                {item.name}
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-text-dark rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-8 space-y-3">
          <Link 
            to="/" 
            target="_blank"
            className="flex items-center justify-between w-full px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] text-text-dark/40 bg-white/40 border border-text-dark/5 hover:bg-white hover:text-text-dark transition-all duration-500 group"
          >
            View Sanctuary
            <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
          </Link>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] text-text-dark/30 hover:text-red-400 transition-all duration-500 group"
          >
            <LogOut className="w-4 h-4 text-text-dark/10 group-hover:text-red-400/60 transition-colors" />
            End Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Subtle Background Accents */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[70%] bg-gold/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[60%] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

        <header className="px-6 md:px-16 py-6 md:py-10 flex justify-between items-center relative z-10">
          <div className="space-y-1">
            <h1 className="font-display text-2xl md:text-4xl text-text-dark tracking-tight">{currentPathName}</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-dark/20 italic">Ritual Operations Center</p>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-text-dark/60 uppercase tracking-widest mb-1">Admin Portal</p>
              <p className="text-[9px] font-medium text-text-dark/20 uppercase tracking-widest">Alanna • New York</p>
            </div>
            <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center shadow-luxury border border-text-dark/5 p-1 group hover:border-gold/30 transition-all duration-700 cursor-pointer">
              <div className="w-full h-full bg-cream rounded-full flex items-center justify-center text-[10px] font-bold text-gold tracking-widest group-hover:bg-text-dark transition-all duration-700">
                AL
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 md:px-16 pb-6 md:pb-16 custom-scrollbar relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
