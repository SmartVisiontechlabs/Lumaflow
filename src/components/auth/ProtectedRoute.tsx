import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Soft glowing ambient backgrounds */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#CBAE73]/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] animate-pulse delay-75" />
        
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative w-20 h-20 flex items-center justify-center animate-pulse" style={{ animationDuration: '3s' }}>
            <div className="absolute inset-0 rounded-full border border-[#CBAE73]/25 animate-ping opacity-60" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-0 rounded-full border border-transparent border-t-[#CBAE73]/80 border-r-[#CBAE73]/40 animate-spin" style={{ animationDuration: '1.2s' }} />
            <span className="font-serif text-lg text-[#CBAE73] tracking-widest font-extralight">LF</span>
          </div>
          
          <div className="flex flex-col items-center gap-1.5 animate-pulse text-center" style={{ animationDuration: '3s' }}>
            <h2 className="font-serif text-[#CBAE73]/90 tracking-[0.25em] text-sm font-light uppercase">LUMAFLOW</h2>
            <p className="text-[#CBAE73]/60 font-sans text-[10px] tracking-[0.2em] font-light uppercase">Entering Sanctuary...</p>
          </div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
