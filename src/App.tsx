import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

import { GroupDetails } from './pages/GroupDetails';
import { EventDetails } from './pages/EventDetails';

// Composant pour protéger les routes privées
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
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
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
