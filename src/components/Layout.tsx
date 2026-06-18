import { useState, useEffect, useLayoutEffect, memo } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useBookingStore } from '../store/bookingStore';

import { useAuth } from '../providers/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LogOut, LayoutDashboard, Calendar, Sparkles, User, Compass, Clock, Menu, X, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Nav = memo(({ openBooking }: { openBooking: () => void }) => {
  const { isAuthenticated, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    console.log('[Layout Nav] Logout clicked, signing out and navigating to /login');
    setIsOpen(false);
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navLinks = isAuthenticated
    ? [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Services', path: '/services' },
        { name: 'Classes', path: '/classes' },
        { name: 'Pricing', path: '/pricing' },
        { name: 'CONTINUE YOUR JOURNEY', path: '/dashboard' },
        { name: 'Contact', path: '/contact' },
      ]
    : [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Services', path: '/services' },
        { name: 'Classes', path: '/classes' },
        { name: 'Pricing', path: '/pricing' },
        { name: 'CONTINUE YOUR JOURNEY', path: '/login' },
        { name: 'Contact', path: '/contact' },
      ];

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Bookings', path: '/my-rituals', icon: Calendar },
    { name: 'Payments', path: '/dashboard/payments', icon: CreditCard },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  // Close dropdown on click outside helper
  useEffect(() => {
    if (!isOpen) return;
    const handleClose = () => setIsOpen(false);
    document.addEventListener('click', handleClose);
    return () => document.removeEventListener('click', handleClose);
  }, [isOpen]);

  const initials = profile?.full_name 
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
    : 'SC';

  return (
    <nav className="fixed top-0 w-full z-[1000] bg-[#1A1A1A]/90 backdrop-blur-md border-b border-white/10 shadow-2xl transition-all duration-700 [.modal-open_&]:opacity-20 [.modal-open_&]:blur-sm">
      <div className="max-w-7xl mx-auto px-8 flex items-center justify-between h-[88px]">
        <div className="flex items-center w-[200px] h-[64px]">
          <Link to="/" className="flex items-center h-full w-full">
            <img
               src="/gold-logo.png"
              alt="Lumaflow"
              className="h-full w-auto object-contain drop-shadow-[0_0_8px_rgba(203,174,115,0.6)] brightness-110"
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.3em] text-white/80">
          {navLinks.map(link => (
            <Link key={link.name} to={link.path} className="relative group py-2 hover:text-[#CBAE73] transition-colors duration-500">
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#CBAE73] transition-all duration-500 group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-end relative gap-6">
          {/* Always show Book Session gold CTA button */}
          <button
            onClick={() => {
              openBooking();
              navigate('/book');
            }}
            className="bg-[#CBAE73] text-black px-8 py-2.5 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-500 shadow-[0_6px_20px_rgba(203,174,115,0.3)] hover:scale-105 active:scale-95 cursor-pointer"
          >
            Book Session
          </button>

          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(!isOpen);
                }}
                className="flex items-center gap-3 group focus:outline-none cursor-pointer select-none"
              >
                {/* Gold glowing initials avatar */}
                <div className="w-10 h-10 rounded-full bg-[#CBAE73]/10 border border-[#CBAE73]/30 hover:border-[#CBAE73] flex items-center justify-center text-[11px] font-bold text-[#CBAE73] tracking-widest transition-all duration-500 shadow-[0_0_15px_rgba(203,174,115,0.15)] group-hover:shadow-[0_0_20px_rgba(203,174,115,0.3)] group-hover:scale-105">
                  {initials}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 group-hover:text-[#CBAE73] transition-colors duration-500 hidden sm:inline-block">
                  {profile?.full_name?.split(' ')[0] || 'Sanctuary'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/40 group-hover:text-[#CBAE73] transition-all duration-500 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 mt-4 w-72 bg-[#1A1A1A]/95 border border-[#CBAE73]/20 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl overflow-hidden py-4 z-[1100]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* User Profile Header */}
                    <div className="px-6 py-4 border-b border-white/5 flex items-center gap-4 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[#CBAE73]/10 border border-[#CBAE73]/20 flex items-center justify-center text-[10px] font-bold text-[#CBAE73]">
                        {initials}
                      </div>
                      <div className="space-y-0.5 truncate">
                        <p className="text-xs font-bold text-white/90 truncate">{profile?.full_name || 'Client Sanctuary'}</p>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-[#CBAE73]/60 truncate">Sanctuary seeker</p>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-1">
                      {menuItems.map(item => (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-4 px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:bg-white/5 hover:text-[#CBAE73] transition-all duration-500"
                        >
                          <item.icon className="w-4 h-4 text-[#CBAE73]/40" />
                          {item.name}
                        </Link>
                      ))}

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-4 px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:bg-white/5 hover:text-[#CBAE73] border-t border-white/5 mt-2 pt-4 transition-all duration-500 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-white/10" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center p-2 text-white/80 hover:text-[#CBAE73] focus:outline-none transition-colors duration-300"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sliding Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden absolute top-[88px] left-0 w-full bg-[#1A1A1A]/95 border-b border-[#CBAE73]/20 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[999] flex flex-col px-8 py-6 gap-4"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/80 hover:text-[#CBAE73] transition-colors duration-500 py-3 border-b border-white/5 last:border-0"
              >
                {link.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
});

const Footer = memo(() => (
  <footer className="bg-text-dark py-24 px-6 relative overflow-hidden">
    <div className="absolute inset-0 bg-grain opacity-5" />
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
      <div className="flex flex-col items-center md:items-start gap-6">
        <img src="/gold-logo.png" alt="Lumaflow Logo" className="h-10 w-auto object-contain" />
        <div className="text-[9px] text-white/20 uppercase tracking-[0.4em]">
          &copy; 2026 Lumaflow. Stillness.
        </div>
      </div>

      <div className="flex flex-col items-center md:items-end gap-8">
        <div className="flex gap-8 text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <Link to="/about" className="hover:text-gold transition-colors">About</Link>
          <Link to="/services" className="hover:text-gold transition-colors">Services</Link>
          <Link to="/classes" className="hover:text-gold transition-colors">Classes</Link>
          <Link to="/pricing" className="hover:text-gold transition-colors">Pricing</Link>
          <Link to="/contact" className="hover:text-gold transition-colors">Contact</Link>
          <a href="https://www.instagram.com/lumaflow" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">Instagram</a>
          <a href="https://open.spotify.com/user/lumaflow" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">Spotify</a>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="email"
            placeholder="Your Email"
            className="bg-white/5 border border-white/10 rounded-full px-6 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 w-full sm:w-64 transition-all"
          />
          <button className="bg-gold text-white px-8 py-3 rounded-full text-[9px] font-bold tracking-widest uppercase hover:bg-gold-light transition-all shadow-xl shadow-gold/10">
            Join
          </button>
        </div>
      </div>
    </div>
  </footer>
));

export default function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const openBooking = useBookingStore(state => state.openBooking);
  const closeBooking = useBookingStore(state => state.closeBooking);
  const isOpen = useBookingStore(state => state.isOpen);

  // Sync state: Redirect to /book when isOpen is true
  useEffect(() => {
    if (isOpen && pathname !== '/book') {
      navigate('/book');
    }
  }, [isOpen, pathname, navigate]);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    // CRITICAL: Force reset and close on any route change EXCEPT book or booking/success
    if (pathname !== '/book' && !pathname.startsWith('/booking/')) {
      closeBooking();
    }
  }, [pathname, closeBooking]);

  const isBookPage = pathname === '/book';

  return (
    <div className="min-h-screen bg-cream text-text-dark font-body flex flex-col relative overflow-x-hidden">
      {/* Global Grain Texture Overlay */}
      <div className="fixed inset-0 z-[100] bg-grain pointer-events-none opacity-30 mix-blend-overlay" />
      
      {/* Sitewide Luminous Background System */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {/* Soft radial gold glow in top center */}
        <div className="absolute -top-[10%] left-[10%] w-[60vw] h-[60vw] rounded-full ambient-glow-gold opacity-90" />
        
        {/* Soft radial gold glow in middle right */}
        <div className="absolute top-[30%] -right-[10%] w-[50vw] h-[50vw] rounded-full ambient-glow-gold opacity-70" />
        
        {/* Soft ambient white glow in center left */}
        <div className="absolute top-[50%] -left-[10%] w-[60vw] h-[60vw] rounded-full ambient-glow-white opacity-60" />

        {/* Soft gold glow at bottom center */}
        <div className="absolute -bottom-[10%] left-[20%] w-[50vw] h-[50vw] rounded-full ambient-glow-gold opacity-80" />

        {/* Extremely subtle sun rays */}
        <div className="absolute top-0 right-[5%] w-[40vw] h-[90vh] sun-beam-ray opacity-60 pointer-events-none" />
        <div className="absolute top-12 right-[20%] w-[30vw] h-[75vh] sun-beam-ray opacity-30 rotate-[8deg] pointer-events-none" />
      </div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Nav openBooking={openBooking} />

        <main className="flex-grow pt-[88px] relative z-10">
          <Outlet />
        </main>

        {!isBookPage && <Footer />}
      </div>
    </div>
  );
}

