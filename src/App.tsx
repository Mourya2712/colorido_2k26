import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// ── Lazy-loaded Public Pages ──────────────────────────────────────
const PublicLayout = lazy(() => import('./layouts/PublicLayout'));
const HomePage = lazy(() => import('./pages/public/HomePage'));
const CulturalPage = lazy(() => import('./pages/public/CulturalPage'));
const SportsPage = lazy(() => import('./pages/public/SportsPage'));
const SchedulePage = lazy(() => import('./pages/public/SchedulePage'));
const AnnouncementsPage = lazy(() => import('./pages/public/AnnouncementsPage'));
const ResultsPage = lazy(() => import('./pages/public/ResultsPage'));
const GalleryPage = lazy(() => import('./pages/public/GalleryPage'));
const SponsorsPage = lazy(() => import('./pages/public/SponsorsPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage'));
const RegistrationSuccessPage = lazy(() => import('./pages/public/RegistrationSuccessPage'));
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage'));

// ── Lazy-loaded Admin Pages ───────────────────────────────────────
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminRegistrations = lazy(() => import('./pages/admin/AdminRegistrations'));
const AdminRegistrationDetail = lazy(() => import('./pages/admin/AdminRegistrationDetail'));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));
const AdminSchedule = lazy(() => import('./pages/admin/AdminSchedule'));
const AdminResults = lazy(() => import('./pages/admin/AdminResults'));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'));
const AdminSponsors = lazy(() => import('./pages/admin/AdminSponsors'));
const AdminContact = lazy(() => import('./pages/admin/AdminContact'));

// ── Page Loading Fallback ─────────────────────────────────────────
const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-[#07070a] flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      <p className="text-xs font-bold tracking-widest uppercase text-purple-400 animate-pulse">COLORIDO 2K26</p>
    </div>
  </div>
);

// ── Protected Admin Route ─────────────────────────────────────────
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

// ── Error Boundary ────────────────────────────────────────────────
interface ErrorBoundaryProps {
  children: React.ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App render error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07070a] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-4">
            <h2 className="text-2xl font-bold text-rose-400">Unable to load page</h2>
            <p className="text-sm text-slate-400">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/';
              }}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Root App ──────────────────────────────────────────────────────
const AppRoutes: React.FC = () => {
  const isAdminDomain = typeof window !== 'undefined' && (
    window.location.hostname.includes('admin') ||
    import.meta.env.VITE_APP_MODE === 'admin'
  );

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {isAdminDomain && (
            <Route path="/" element={<Navigate to="/admin/login" replace />} />
          )}
          {/* ── Public Routes ── */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
        <Route path="/cultural" element={<CulturalPage />} />
        <Route path="/cultural/:category" element={<CulturalPage />} />
        <Route path="/sports" element={<SportsPage />} />
        <Route path="/sports/:gender" element={<SportsPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/sponsors" element={<SponsorsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/register/:eventId" element={<RegisterPage />} />
        <Route path="/register/:eventSlug" element={<RegisterPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/registration/:regNumber" element={<RegistrationSuccessPage />} />
      </Route>

      {/* ── Admin Routes ── */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="registrations" element={<AdminRegistrations />} />
        <Route path="registrations/:id" element={<AdminRegistrationDetail />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="schedule" element={<AdminSchedule />} />
        <Route path="results" element={<AdminResults />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="sponsors" element={<AdminSponsors />} />
        <Route path="contact" element={<AdminContact />} />
      </Route>

      {/* ── 404 ── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </Suspense>
  </ErrorBoundary>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1025',
            color: '#e2d9f3',
            border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '600',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#1a1025' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#1a1025' },
          },
        }}
      />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
