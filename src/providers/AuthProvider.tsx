import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { fromZonedTime } from 'date-fns-tz';

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

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  membership: MembershipCredits | null;
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
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [membership, setMembership] = useState<MembershipCredits | null>(null);
  const [bookings, setBookings] = useState<LiveBooking[]>([]);
  const [history, setHistory] = useState<BookingHistory[]>([]);
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
        supabase.from('user_packages').select('remaining_credits').eq('user_email', authUser.email).eq('status', 'active')
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
      const packageCreditsList = userPkgsRes.data || [];

      setProfile(profileData);
      setMembership(membershipData);
      setBookings(bookingsList);
      setHistory(historyList);

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
      const mCredits = membershipData ? membershipData.remaining_credits : 0;
      const pCredits = packageCreditsList.reduce((sum: number, p: any) => sum + (p.remaining_credits || 0), 0);
      setRemainingCredits(mCredits + pCredits);

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
    // Initial fetch
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      fetchPortalData(authUser);
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchPortalData(session.user);
      } else {
        fetchPortalData(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchPortalData]);

  const value: AuthContextType = {
    user,
    profile,
    membership,
    upcomingBooking,
    remainingCredits,
    isAuthenticated: !!user,
    bookings,
    history,
    loading,
    refresh,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
