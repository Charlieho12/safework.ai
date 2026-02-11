import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { TranslationProvider } from '@/contexts/TranslationContext';
import { initializeStorage } from '@/lib/mockData';

// Layout
import DashboardLayout from '@/components/layout/DashboardLayout';

// Landing & Payment
import LandingPage from '@/pages/landing/LandingPage';
import PricingPage from '@/pages/payment/PricingPage';
import CheckoutPage from '@/pages/payment/CheckoutPage';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';

// Main Pages
import DashboardPage from '@/pages/DashboardPage';

// Lavori Pages
import LavoriListPage from '@/pages/lavori/LavoriListPage';
import LavoroFormPage from '@/pages/lavori/LavoroFormPage';
import LavoroDetailPage from '@/pages/lavori/LavoroDetailPage';

// Camera Page
import CameraPage from '@/pages/camera/CameraPage';

// Report Page
import ReportPage from '@/pages/report/ReportPage';

// CSTA Page
import CstaPage from '@/pages/csta/CstaPage';

// Profile & Settings Pages
import ProfilePage from '@/pages/profile/ProfilePage';
import SettingsPage from '@/pages/settings/SettingsPage';

// Payment Pages
import CheckoutSuccessPage from '@/pages/payment/CheckoutSuccessPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Inizializza storage
initializeStorage();

// Protected Route Component - verifica autenticazione E pagamento
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hasActiveSubscription } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Verifica se ha un abbonamento attivo
  const hasAccess = hasActiveSubscription();
  
  // Se non ha accesso e non è già sulla pagina di pricing/checkout
  if (!hasAccess && !location.pathname.includes('/pricing') && !location.pathname.includes('/checkout')) {
    return <Navigate to="/pricing" replace />;
  }
  
  return <>{children}</>;
}

// Public Route Component (redirect if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Landing Page - Homepage */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Pricing */}
      <Route path="/pricing" element={<PricingPage />} />
      
      {/* Checkout - richiede autenticazione */}
      <Route path="/checkout" element={
        <ProtectedRoute>
          <CheckoutPage />
        </ProtectedRoute>
      } />
      
      {/* Checkout Success */}
      <Route path="/checkout/success" element={
        <ProtectedRoute>
          <ErrorBoundary>
            <CheckoutSuccessPage />
          </ErrorBoundary>
        </ProtectedRoute>
      } />

      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPasswordPage />
        </PublicRoute>
      } />

      {/* Protected Routes - App Dashboard */}
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Lavori */}
        <Route path="lavori" element={<LavoriListPage />} />
        <Route path="lavori/nuovo" element={<LavoroFormPage />} />
        <Route path="lavori/:id" element={<LavoroDetailPage />} />
        <Route path="lavori/:id/modifica" element={<LavoroFormPage />} />
        <Route path="lavori/:lavoroId/camera" element={<CameraPage />} />
        <Route path="lavori/:lavoroId/report" element={<ReportPage />} />
        
        {/* Camera standalone */}
        <Route path="camera" element={<Navigate to="/lavori" replace />} />
        
        {/* Report standalone */}
        <Route path="report" element={<Navigate to="/lavori" replace />} />
        
        {/* CSTA Portal */}
        <Route path="csta" element={<CstaPage />} />
        
        {/* Profile & Settings */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <TranslationProvider>
            <AuthProvider>
              <DataProvider>
                <AppProvider />
              </DataProvider>
            </AuthProvider>
          </TranslationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

// Componente wrapper per fornire i context
function AppProvider() {
  return <AppRoutes />;
}

export default App;
