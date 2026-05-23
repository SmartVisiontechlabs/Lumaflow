import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

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

// Protected Route Guard
import { Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import { adminSupabase } from './lib/supabase';
import { useState, useEffect } from 'react';

const ProtectedRoute = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await adminSupabase.auth.getSession();
        if (!session || !session.user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const { data: profile } = await adminSupabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        setIsAdmin(profile?.role === 'admin');
      } catch (err) {
        console.error('Error verifying admin authorization:', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();

    const { data: { subscription } } = adminSupabase.auth.onAuthStateChange(async (_event, session) => {
      if (session && session.user) {
        try {
          const { data: profile } = await adminSupabase
            .from('user_profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();
          setIsAdmin(profile?.role === 'admin');
        } catch (err) {
          console.error('Error fetching role in auth state change:', err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <Loading />;
  return isAdmin ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

const ClientProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loading />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/client/login" replace />;
};

// Loading Fallback
const Loading = () => (
  <div className="min-h-screen bg-cream flex items-center justify-center">
    <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
            <Route path="/client/login" element={<ClientLogin />} />

            <Route element={<ClientProtectedRoute />}>
              <Route path="/client" element={<ClientLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<ClientDashboard />} />
                <Route path="bookings" element={<ClientBookings />} />
                <Route path="membership" element={<ClientMembership />} />
                <Route path="profile" element={<ClientProfile />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
