import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { trackPageView } from './lib/analytics';

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Classes = lazy(() => import('./pages/Classes'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Contact = lazy(() => import('./pages/Contact'));
const BookingSuccess = lazy(() => import('./pages/booking/BookingSuccess'));
const BookPage = lazy(() => import('./pages/booking/BookPage.tsx'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin Imports
const Login = lazy(() => import('./pages/admin/Login'));
const DashboardLayout = lazy(() => import('./pages/admin/DashboardLayout'));
const DashboardOverview = lazy(() => import('./pages/admin/DashboardOverview'));
const AdminBookings = lazy(() => import('./pages/admin/Bookings'));
const CalendarManager = lazy(() => import('./pages/admin/CalendarManager'));
const ClientManager = lazy(() => import('./pages/admin/ClientManager'));
const CmsManager = lazy(() => import('./pages/admin/CmsManager'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));

// Client Portal Imports
const ClientLogin = lazy(() => import('./pages/client/ClientLogin'));
const ClientLayout = lazy(() => import('./pages/client/ClientLayout'));
const ClientDashboard = lazy(() => import('./pages/client/Dashboard'));
const ClientBookings = lazy(() => import('./pages/client/Bookings'));
const ClientMembership = lazy(() => import('./pages/client/Membership'));
const ClientProfile = lazy(() => import('./pages/client/Profile'));
const ClientPayments = lazy(() => import('./pages/client/Payments'));

// New Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const CheckEmailPage = lazy(() => import('./pages/auth/CheckEmailPage'));
const AuthCallbackPage = lazy(() => import('./pages/auth/AuthCallbackPage'));
const LoggedOutPage = lazy(() => import('./pages/auth/LoggedOutPage'));
import ClientProtectedRoute from './components/auth/ProtectedRoute';

// Protected Route Guard
import { Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import { supabase, adminSupabase } from './lib/supabase';
import { useState, useEffect } from 'react';

const ProtectedRoute = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await adminSupabase.auth.getSession();
        if (!active) return;
        if (!session || !session.user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const { data: profile, error } = await adminSupabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!active) return;
        if (error || !profile || profile.role !== 'admin') {
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Error verifying admin authorization:', err);
        if (active) setIsAdmin(false);
      } finally {
        if (active) setLoading(false);
      }
    };

    checkAdmin();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Loading />;
  return isAdmin ? <Outlet /> : <Navigate to="/admin/login" replace />;
};


// Luxury Lumaflow Loading Screen
const Loading = () => (
  <div className="min-h-screen bg-[#090D16] flex flex-col items-center justify-center relative overflow-hidden">
    {/* Soft glowing ambient backgrounds */}
    <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gold/5 rounded-full blur-[100px] animate-pulse" />
    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] animate-pulse delay-75" />
    
    <div className="relative z-10 flex flex-col items-center gap-6">
      {/* pulsing gold logo circle with breathing animation */}
      <div className="relative w-20 h-20 flex items-center justify-center animate-pulse" style={{ animationDuration: '3s' }}>
        {/* Pulsing outer ring */}
        <div className="absolute inset-0 rounded-full border border-gold/25 animate-ping opacity-60" style={{ animationDuration: '3s' }} />
        
        {/* Core spinning ring */}
        <div className="absolute inset-0 rounded-full border border-transparent border-t-gold/80 border-r-gold/40 animate-spin" style={{ animationDuration: '1.2s' }} />
        
        {/* Center brand mark */}
        <span className="font-serif text-lg text-gold tracking-widest font-extralight">LF</span>
      </div>
      
      {/* Elegantly styled branding text with breathing animation */}
      <div className="flex flex-col items-center gap-1.5 animate-pulse text-center" style={{ animationDuration: '3s' }}>
        <h2 className="font-serif text-gold/90 tracking-[0.25em] text-sm font-light uppercase">LUMAFLOW</h2>
        <p className="text-gold/60 font-sans text-[10px] tracking-[0.2em] font-light uppercase">Restoring your sanctuary...</p>
      </div>
    </div>
  </div>
);

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
};

export default function App() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Force session restore check on mount before rendering protected paths
        await Promise.all([
          adminSupabase.auth.getSession(),
          supabase.auth.getSession()
        ]);
      } catch (e) {
        console.error('Error during app boot session restore:', e);
      } finally {
        setAuthReady(true);
      }
    };
    restoreSession();
  }, []);

  if (!authReady) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <AuthProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="classes" element={<Classes />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="contact" element={<Contact />} />
              <Route path="book" element={<BookPage />} />
              <Route path="booking/success" element={<BookingSuccess />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<DashboardLayout />}>
                <Route index element={<DashboardOverview />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="calendar" element={<CalendarManager />} />
                <Route path="clients" element={<ClientManager />} />
                <Route path="cms" element={<CmsManager />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>

            {/* Client Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/client/login" element={<Navigate to="/login" replace />} />
            <Route path="/check-email" element={<CheckEmailPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/logged-out" element={<LoggedOutPage />} />

            <Route element={<ClientProtectedRoute />}>
              <Route element={<ClientLayout />}>
                <Route path="/dashboard" element={<ClientDashboard />} />
                <Route path="/sanctuary" element={<ClientDashboard />} />
                <Route path="/my-rituals" element={<ClientBookings />} />
                <Route path="/membership" element={<ClientMembership />} />
                <Route path="/profile" element={<ClientProfile />} />
                <Route path="/dashboard/payments" element={<ClientPayments />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
