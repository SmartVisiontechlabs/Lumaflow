import React, { useState, useEffect } from 'react';
import { useClientPortal } from '../../hooks/useClientPortal';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
  const { profile, loading, error, updateProfile } = useClientPortal();
  const [fullName, setFullName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setSuccessMsg(null);
    setUpdateError(null);

    const res = await updateProfile(fullName);
    setIsUpdating(false);

    if (res.success) {
      setSuccessMsg('Your sanctuary profile credentials have been successfully updated.');
      setTimeout(() => setSuccessMsg(null), 5000);
    } else {
      setUpdateError(res.error || 'Failed to update credentials.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-red-500/5 border border-red-500/10 p-8 rounded-3xl text-center">
        <p className="text-sm text-red-400 font-bold uppercase tracking-wider">Error Loading Profile</p>
        <p className="text-xs text-text-dark/40 mt-2">{error || 'Could not load your client profile details.'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12">
      <div className="bg-white/40 border border-white/60 p-10 rounded-[2.5rem] shadow-luxury relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[200px] h-[200px] bg-gold/5 blur-[50px] rounded-full pointer-events-none" />
        
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="space-y-6">
            <h3 className="font-display text-2xl text-text-dark tracking-tight">Your Credentials</h3>

            {/* Email Address (read only) */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-dark/40">Email Address</label>
              <div className="flex items-center gap-3 bg-white/30 border border-text-dark/5 p-5 rounded-2xl text-sm text-text-dark/40 select-none">
                <Mail className="w-4 h-4 text-text-dark/20" />
                <span>{profile.email}</span>
              </div>
            </div>

            {/* Full Name (edit) */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-dark/40">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-text-dark/20 group-focus-within:text-gold transition-colors duration-500" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/50 border border-text-dark/5 py-5 pl-12 pr-6 rounded-2xl text-sm focus:outline-none focus:border-gold/30 focus:bg-white transition-all duration-700 placeholder:text-text-dark/20 text-text-dark font-medium"
                  placeholder="Enter full name"
                />
              </div>
            </div>
          </div>

          {successMsg && (
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-bold uppercase tracking-[0.1em] text-green-600 italic text-center"
            >
              {successMsg}
            </motion.p>
          )}

          {updateError && (
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-bold uppercase tracking-[0.1em] text-red-400 italic text-center"
            >
              “{updateError}”
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full py-5 bg-text-dark hover:bg-gold text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] shadow-button transition-all duration-700 disabled:opacity-50"
          >
            {isUpdating ? 'Saving Credentials...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Account Info Details */}
      <div className="bg-white/20 border border-white/40 p-8 rounded-[2.5rem] shadow-soft grid grid-cols-2 gap-6 text-center">
        <div className="space-y-1">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mx-auto mb-2 border border-text-dark/5">
            <Shield className="w-4 h-4 text-gold" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-dark/40">Portal Role</p>
          <p className="text-sm font-semibold text-text-dark capitalize">{profile.role}</p>
        </div>

        <div className="space-y-1">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mx-auto mb-2 border border-text-dark/5">
            <Calendar className="w-4 h-4 text-gold" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-dark/40">Sanctuary Joined</p>
          <p className="text-sm font-semibold text-text-dark">
            {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}
