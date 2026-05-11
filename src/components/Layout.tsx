import { useState, useEffect, useLayoutEffect, memo } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useBookingStore } from '../store/bookingStore';
import BookingModal from './booking/BookingModal';

const Nav = memo(({ openBooking }: { openBooking: () => void }) => (
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

      <div className="hidden md:flex items-center gap-12 text-[11px] font-bold uppercase tracking-[0.3em] text-white/80">
        {['Home', 'About', 'Classes', 'Pricing', 'Contact'].map(link => {
          let path = link === 'Home' ? '/' : `/${link.toLowerCase()}`;
          return (
            <Link key={link} to={path} className="relative group py-2 hover:text-[#CBAE73] transition-colors duration-500">
              {link}
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#CBAE73] transition-all duration-500 group-hover:w-full" />
            </Link>
          );
        })}
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={openBooking}
          className="bg-[#CBAE73] text-black px-8 py-2.5 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-500 shadow-[0_6px_20px_rgba(203,174,115,0.3)] hover:scale-105 active:scale-95 cursor-pointer"
        >
          Book Ritual
        </button>
      </div>
    </div>
  </nav>
));

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
          <a href="#" className="hover:text-gold transition-colors">Instagram</a>
          <a href="#" className="hover:text-gold transition-colors">Spotify</a>
          <Link to="/contact" className="hover:text-gold transition-colors">Contact</Link>
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
  const openBooking = useBookingStore(state => state.openBooking);
  const closeBooking = useBookingStore(state => state.closeBooking);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    // CRITICAL: Force reset and close on any route change
    closeBooking();
  }, [pathname, closeBooking]);

  return (
    <div className="min-h-screen bg-cream text-text-dark font-body flex flex-col relative">
      {/* Global Grain Texture Overlay */}
      <div className="fixed inset-0 z-[100] bg-grain pointer-events-none opacity-50" />
      
      <Nav openBooking={openBooking} />

      <main className="flex-grow pt-[88px]">
        <Outlet />
      </main>

      <Footer />

      <BookingModal />
    </div>
  );
}

