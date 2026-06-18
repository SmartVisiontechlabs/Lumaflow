import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Sparkles, 
  User, 
  LogOut,
  Menu,
  X,
  Compass,
  ArrowUpRight,
  CreditCard
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Bookings', path: '/my-rituals', icon: Calendar },
    { name: 'Payments', path: '/dashboard/payments', icon: CreditCard },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const handleLogout = async () => {
    console.log('[ClientLayout] Logout clicked, signing out and navigating to /login');
    await supabase.auth.signOut();
    navigate('/login');
  };

  const currentPathName = navItems.find(item => 
    item.path === location.pathname
  )?.name || 'Sanctuary';

  return (
    <div className="min-h-screen bg-cream flex overflow-hidden font-sans selection:bg-gold/10 selection:text-gold relative">
      {/* Background grain texture */}
      <div className="absolute inset-0 bg-grain pointer-events-none" />

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-80 bg-white/40 backdrop-blur-3xl border-r border-text-dark/5 flex-col relative z-20">
        <div className="p-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-text-dark rounded-full flex items-center justify-center shadow-button">
              <Compass className="w-4 h-4 text-gold animate-breathe" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-text-dark/40 italic">LumaFlow</span>
          </div>
          <h2 className="font-display text-2xl text-text-dark tracking-tight">Sanctuary</h2>
        </div>
        
        <nav className="flex-1 px-8 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 mb-4">Navigation</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
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
                    layoutId="activeClientTab"
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
            className="flex items-center justify-between w-full px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] text-text-dark/40 bg-white/40 border border-text-dark/5 hover:bg-white hover:text-text-dark transition-all duration-500 group"
          >
            Sanctuary Home
            <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
          </Link>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] text-text-dark/30 hover:text-[#CBAE73] transition-all duration-500 group cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-text-dark/10 group-hover:text-[#CBAE73]/60 transition-colors" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header Nav */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Subtle Background Accents */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[70%] bg-gold/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[60%] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

        <header className="px-8 lg:px-16 py-8 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-3 bg-white/60 backdrop-blur-md rounded-xl border border-text-dark/5 lg:hidden text-text-dark/60 hover:text-text-dark transition-all duration-500"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="space-y-1">
              <h1 className="font-display text-3xl lg:text-4xl text-text-dark tracking-tight">{currentPathName}</h1>
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/20 italic">Welcome to your Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-luxury border border-text-dark/5 p-1 group hover:border-gold/30 transition-all duration-700 cursor-pointer">
              <div className="w-full h-full bg-cream rounded-full flex items-center justify-center text-[10px] font-bold text-gold tracking-widest group-hover:bg-text-dark transition-all duration-700">
                SC
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
              className="fixed inset-y-0 left-0 w-72 bg-cream/95 backdrop-blur-2xl border-r border-text-dark/5 z-50 flex flex-col p-8 lg:hidden shadow-luxury"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-gold animate-breathe" />
                  <span className="font-display text-xl text-text-dark">Sanctuary</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-text-dark/40 hover:text-text-dark transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${
                        isActive 
                          ? 'bg-text-dark text-white shadow-luxury' 
                          : 'text-text-dark/40 hover:bg-white hover:text-text-dark'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-gold' : 'text-text-dark/20'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="space-y-3 pt-6 border-t border-text-dark/5">
                <Link 
                  to="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between w-full px-6 py-4 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] text-text-dark/40 bg-white/40 border border-text-dark/5"
                >
                  Sanctuary Home
                  <ArrowUpRight className="w-3.5 h-3.5 text-text-dark/20" />
                </Link>
                <button 
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await handleLogout();
                  }}
                  className="flex items-center gap-4 w-full px-6 py-4 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] text-text-dark/30 hover:text-[#CBAE73] cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-text-dark/10" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Render Area */}
        <div className="flex-1 overflow-y-auto px-8 lg:px-16 pb-16 custom-scrollbar relative z-10">
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
      </div>
    </div>
  );
}
