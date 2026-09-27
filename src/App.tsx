import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/ui/Navbar';
import { Footer } from './components/ui/Footer';
import { CookieBanner } from './components/ui/CookieBanner';

import { GroupDetails } from './pages/GroupDetails';
import { EventDetails } from './pages/EventDetails';
import { JoinGroup } from './pages/JoinGroup';

import { LegalMentions } from './pages/LegalMentions';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { CookiePolicy } from './pages/CookiePolicy';

// Composant pour protéger les routes privées
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" aria-hidden="true" />
        <span className="sr-only">Chargement en cours...</span>
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/mentions-legales" element={<LegalMentions />} />
              <Route path="/confidentialite" element={<PrivacyPolicy />} />
              <Route path="/cookies" element={<CookiePolicy />} />

              {/* Route d'invitation partageable — accessible avec ou sans connexion */}
              <Route path="/join/:inviteCode" element={<JoinGroup />} />

              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/groups/:groupId"
                element={
                  <PrivateRoute>
                    <GroupDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/groups/:groupId/events/:eventId"
                element={
                  <PrivateRoute>
                    <EventDetails />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
          <CookieBanner />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
