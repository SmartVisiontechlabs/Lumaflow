import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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

export function useClientPortal() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [credits, setCredits] = useState<MembershipCredits | null>(null);
  const [bookings, setBookings] = useState<LiveBooking[]>([]);
  const [history, setHistory] = useState<BookingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortalData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get authenticated user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        setUser(null);
        setProfile(null);
        setCredits(null);
        setBookings([]);
        setHistory([]);
        return;
      }
      
      setUser(authUser);

      // 2. Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error loading client profile:', profileError);
      } else if (profileData) {
        setProfile(profileData);
      }

      // 3. Fetch membership credits
      const { data: creditsData, error: creditsError } = await supabase
        .from('membership_credits')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (creditsError) {
        console.error('Error loading membership credits:', creditsError);
      } else {
        setCredits(creditsData);
      }

      // 4. Fetch bookings (where user_id matches OR guest email matches)
      // Standard supabase JS client doesn't support OR across relations easily, so we can do two checks or use simple .or() query on bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .or(`user_id.eq.${authUser.id},email.eq.${authUser.email}`)
        .order('selected_date', { ascending: false });

      if (bookingsError) {
        console.error('Error loading bookings:', bookingsError);
      } else {
        setBookings(bookingsData || []);
      }

      // 5. Fetch booking history
      const { data: historyData, error: historyError } = await supabase
        .from('booking_history')
        .select('*')
        .eq('user_id', authUser.id)
        .order('session_date_time', { ascending: false });

      if (historyError) {
        console.error('Error loading booking history:', historyError);
      } else {
        setHistory(historyData || []);
      }
    } catch (err: any) {
      console.error('Portal data loading catch error:', err);
      setError(err.message || 'Sanctuary details could not be fetched.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortalData();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchPortalData();
      } else {
        setUser(null);
        setProfile(null);
        setCredits(null);
        setBookings([]);
        setHistory([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
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

  return {
    user,
    profile,
    credits,
    bookings,
    history,
    loading,
    error,
    refresh: fetchPortalData,
    updateProfile
  };
}
