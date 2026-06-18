import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { fromZonedTime } from 'date-fns-tz';
import { useNavigate, useLocation } from 'react-router-dom';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface MembershipCredits {
  id: string;
  user_id: string;
  email: string;
  total_credits: number;
  used_credits: number;
  remaining_credits: number;
  created_at: string;
  updated_at: string;
}

export interface BookingHistory {
  id: string;
  user_id: string;
  booking_id: string;
  ritual_name: string;
  session_date_time: string;
  status: string;
  created_at: string;
}

export interface LiveBooking {
  id: string;
  booking_reference: string;
  full_name: string;
  email: string;
  selected_session: string;
  session_format: string;
  duration: number;
  selected_date: string;
  selected_time: string;
  timezone: string;
  booking_status: string;
  stripe_payment_id: string;
  package_id: string;
  package_name: string;
  package_price: number;
  package_credits: number;
  zoom_meeting_id: string;
  zoom_join_url: string;
  zoom_start_url: string;
  meeting_password: string;
  zoom_status: string;
  created_at: string;
  used_package_credit: boolean;
}

export interface UserPackage {
  id: string;
  user_email: string;
  package_id: string;
  stripe_payment_id: string | null;
  total_credits: number;
  remaining_credits: number;
  status: string;
  created_at: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  membership: MembershipCredits | null;
  activePackages: UserPackage[];
  upcomingBooking: LiveBooking | null;
  remainingCredits: number;
  isAuthenticated: boolean;
  bookings: LiveBooking[];
  history: BookingHistory[];
  loading: boolean;
  refresh: () => Promise<void>;
  updateProfile: (fullName: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [membership, setMembership] = useState<MembershipCredits | null>(null);
  const [bookings, setBookings] = useState<LiveBooking[]>([]);
  const [history, setHistory] = useState<BookingHistory[]>([]);
  const [activePackages, setActivePackages] = useState<UserPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [upcomingBooking, setUpcomingBooking] = useState<LiveBooking | null>(null);
  const [remainingCredits, setRemainingCredits] = useState(0);

  const fetchPortalData = useCallback(async (authUser: any) => {
    if (!authUser) {
      setUser(null);
      setProfile(null);
      setMembership(null);
      setBookings([]);
      setHistory([]);
      setActivePackages([]);
      setUpcomingBooking(null);
      setRemainingCredits(0);
      setLoading(false);
      return;
    }

    try {
      setUser(authUser);

      // Fetch in parallel for speed
      const [profileRes, membershipRes, bookingsRes, historyRes, userPkgsRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', authUser.id).maybeSingle(),
        supabase.from('membership_credits').select('*').eq('user_id', authUser.id).maybeSingle(),
        supabase.from('bookings').select('*').or(`user_id.eq.${authUser.id},email.eq.${authUser.email}`).order('selected_date', { ascending: false }),
        supabase.from('booking_history').select('*').eq('user_id', authUser.id).order('session_date_time', { ascending: false }),
        supabase.from('user_packages').select('*').ilike('user_email', authUser.email).eq('status', 'active')
      ]);

      if (profileRes.error) console.error('Error fetching profile:', profileRes.error);
      if (membershipRes.error) console.error('Error fetching membership:', membershipRes.error);
      if (bookingsRes.error) console.error('Error fetching bookings:', bookingsRes.error);
      if (historyRes.error) console.error('Error fetching history:', historyRes.error);
      if (userPkgsRes.error) console.error('Error fetching package credits:', userPkgsRes.error);

      const profileData = profileRes.data || null;
      const membershipData = membershipRes.data || null;
      const bookingsList = bookingsRes.data || [];
      const historyList = historyRes.data || [];
      const packageCreditsList = (userPkgsRes.data || []).filter((p: any) => {
        if (p.expires_at && new Date(p.expires_at) < new Date()) {
          return false;
        }
        return true;
      });

      setProfile(profileData);
      setMembership(membershipData);
      setBookings(bookingsList);
      setHistory(historyList);
      setActivePackages(packageCreditsList);

      // Calculate upcoming booking (nearest confirmed future/ongoing booking)
      const now = new Date();
      const activeBookings = bookingsList.filter((b: LiveBooking) => {
        if (b.booking_status === 'cancelled') return false;
        const tz = b.timezone || 'America/New_York';
        const startUTC = fromZonedTime(`${b.selected_date}T${b.selected_time}:00`, tz);
        const durationMs = (b.duration || 60) * 60 * 1000;
        return startUTC.getTime() + durationMs > now.getTime();
      });

      if (activeBookings.length > 0) {
        const sorted = [...activeBookings].sort((a: LiveBooking, b: LiveBooking) => {
          const tzValA = a.timezone || 'America/New_York';
          const tzValB = b.timezone || 'America/New_York';
          const timeA = fromZonedTime(`${a.selected_date}T${a.selected_time}:00`, tzValA).getTime();
          const timeB = fromZonedTime(`${b.selected_date}T${b.selected_time}:00`, tzValB).getTime();
          return timeA - timeB;
        });
        setUpcomingBooking(sorted[0]);
      } else {
        setUpcomingBooking(null);
      }

      // Calculate total remaining credits
      let remainingCreditsValue = 0;
      if (membershipData) {
        remainingCreditsValue = membershipData.remaining_credits;
      } else {
        remainingCreditsValue = packageCreditsList.reduce((sum: number, p: any) => sum + (p.remaining_credits || 0), 0);
      }
      setRemainingCredits(remainingCreditsValue);

    } catch (err) {
      console.error('Error loading auth-dependent data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    await fetchPortalData(authUser);
  }, [fetchPortalData]);

  const updateProfile = async (fullName: string) => {
    if (!user) return { success: false, error: 'No user session found' };
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, full_name: fullName } : null);
      return { success: true };
    } catch (err: any) {
      console.error('Error updating profile:', err);
      return { success: false, error: err.message || 'Failed to update sanctuary credentials' };
    }
  };

  useEffect(() => {
    let checkDone = false;
    
    // Check if we are in an auth redirect flow (hash or search code)
    const hash = window.location.hash;
    const search = window.location.search;
    const isRedirectFlow = hash.includes('access_token=') || hash.includes('id_token=') || search.includes('code=') || search.includes('token=');

    // Initial fetch
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (checkDone) return;
      if (isRedirectFlow && !authUser) {
        console.log('[AuthProvider] Auth redirect flow detected, deferring initial loading resolution.');
        // Set a safety timeout to resolve loading if onAuthStateChange doesn't fire
        setTimeout(() => {
          if (!checkDone) {
            console.log('[AuthProvider] Defer safety timeout fired.');
            fetchPortalData(null);
            checkDone = true;
          }
        }, 3000);
      } else {
        fetchPortalData(authUser);
        checkDone = true;
      }
    }).catch(() => {
      if (checkDone) return;
      if (!isRedirectFlow) {
        fetchPortalData(null);
        checkDone = true;
      }
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[AuthProvider] Auth state changed: ${event}`);
      if (session) {
        fetchPortalData(session.user);
        checkDone = true;
        
        // Rule 9: Clear temporary success/booking items from localStorage/sessionStorage
        localStorage.removeItem('pending_booking_id');
        try {
          for (let i = sessionStorage.length - 1; i >= 0; i--) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith('magic_link_sent_for_')) {
              sessionStorage.removeItem(key);
            }
          }
        } catch (e) {
          console.error('Error clearing temporary sessionStorage items:', e);
        }
      } else {
        if (!isRedirectFlow || event === 'SIGNED_OUT') {
          fetchPortalData(null);
          checkDone = true;
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchPortalData]);

  const isAuthenticated = !!user;

  useEffect(() => {
    if (loading) return;

    const path = location.pathname;
    console.log('[AuthProvider Central Redirect Check] path:', path, 'isAuthenticated:', isAuthenticated);

    if (isAuthenticated && (path === '/login' || path === '/client/login')) {
      console.log('[AuthProvider Central Redirect] Authenticated user on login page. Redirecting to dashboard.');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  const value: AuthContextType = {
    user,
    profile,
    membership,
    activePackages,
    upcomingBooking,
    remainingCredits,
    isAuthenticated: !!user,
    bookings,
    history,
    loading,
    refresh,
    updateProfile
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6 relative font-sans selection:bg-gold/10 selection:text-gold">
        {/* Background grain overlay */}
        <div className="absolute inset-0 bg-grain pointer-events-none opacity-[0.03] mix-blend-overlay" />
        
        {/* Soft atmospheric golden glows */}
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[80%] bg-gold/5 blur-[160px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[70%] bg-gold/5 blur-[140px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col items-center gap-8 relative z-10 text-center">
          {/* pulsing gold logo circle with breathing animation */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Pulsing outer ring */}
            <div className="absolute inset-0 rounded-full border border-gold/25 animate-ping opacity-60" style={{ animationDuration: '3s' }} />
            
            {/* Core spinning ring */}
            <div className="absolute inset-0 rounded-full border border-transparent border-t-gold/80 border-r-gold/40 animate-spin" style={{ animationDuration: '1.2s' }} />
            
            {/* Center brand mark */}
            <span className="font-serif text-lg text-gold tracking-widest font-extralight animate-pulse" style={{ animationDuration: '2s' }}>LF</span>
          </div>
          
          {/* Elegantly styled branding text with breathing animation */}
          <div className="flex flex-col items-center gap-1.5 animate-pulse text-center" style={{ animationDuration: '3s' }}>
            <h2 className="font-serif text-gold/90 tracking-[0.25em] text-sm font-light uppercase">LUMAFLOW</h2>
            <p className="text-gold/60 font-sans text-[10px] tracking-[0.2em] font-light uppercase">Restoring your sanctuary...</p>
          </div>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
