import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Classes = lazy(() => import('./pages/Classes'));
const Booking = lazy(() => import('./pages/Booking'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin Imports
const DashboardLayout = lazy(() => import('./pages/admin/DashboardLayout'));
const AdminClasses = lazy(() => import('./pages/admin/Classes'));
const AdminBookings = lazy(() => import('./pages/admin/Bookings'));

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
            <Route path="book" element={<Booking />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<div className="animate-fade-in"><h2 className="text-xl font-bold mb-4">Welcome to Lumaflow Admin</h2><p className="text-text-dark/60">Select an option from the sidebar to manage your studio.</p></div>} />
            <Route path="classes" element={<AdminClasses />} />
            <Route path="bookings" element={<AdminBookings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
