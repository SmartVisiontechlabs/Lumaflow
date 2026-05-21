import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

// Protected Route Guard
import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from './lib/supabase';

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) return <Loading />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

// Loading Fallback
const Loading = () => (
  <div className="min-h-screen bg-cream flex items-center justify-center">
    <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
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
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
