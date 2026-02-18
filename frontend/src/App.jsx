/**
 * Main Application Component
 * Sets up routing and authentication
 */
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import SecretaireLayout from './components/SecretaireLayout';
import AgentLayout from './components/AgentLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SecretaireDashboard from './pages/SecretaireDashboard';
import AgentDashboard from './pages/AgentDashboard';
import MedecinDashboard from './pages/MedecinDashboard';
import Patients from './pages/Patients';
import SecretairePatients from './pages/SecretairePatients';
import AgentPatients from './pages/AgentPatients';
import Medecins from './pages/Medecins';
import RendezVous from './pages/RendezVous';
import SecretaireRendezVous from './pages/SecretaireRendezVous';
import AgentRendezVous from './pages/AgentRendezVous';
import Dossiers from './pages/Dossiers';
import SecretaireDossiers from './pages/SecretaireDossiers';
import Rapports from './pages/Rapports';
import Secretaires from './pages/Secretaires';
import AgentsAcceuil from './pages/AgentsAcceuil';
import Contrats from './pages/Contrats';
import Revenus from './pages/Revenus';
import Acces from './pages/Acces';
import DownloadRequests from './pages/DownloadRequests';
import Loading from './components/Loading';

// Protected Route Component
const ProtectedRoute = ({ children, requireSecretaire = false, requireAgent = false, requireMedecin = false }) => {
  const { isAuthenticated, isSecretaire, isAgentAcceuil, isMedecin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <Loading />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireSecretaire && !isSecretaire) {
    return <Navigate to="/" replace />;
  }

  if (requireAgent && !isAgentAcceuil) {
    return <Navigate to="/" replace />;
  }

  if (requireMedecin && !isMedecin) {
    return <Navigate to="/" replace />;
  }

  // Prevent Medecin/Secretaire/Agent from accessing Admin routes if they are strictly separated
  // But for now, "require" flags handle specific routes.
  // We might want to prevent "Admin" routes (/) for Medecin?
  // If isMedecin and trying to access root / ?
  // currently / routes are protected but don't specify role.

  return children;
};

// Public Route (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isSecretaire, isAgentAcceuil, isMedecin, loading } = useAuth();

  if (loading) {
    return <Loading />; // simplified
  }

  if (isAuthenticated) {
    if (isSecretaire) {
      return <Navigate to="/secretaire" replace />;
    }
    if (isAgentAcceuil) {
      return <Navigate to="/agent" replace />;
    }
    if (isMedecin) {
      return <Navigate to="/medecin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

// App Routes
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />


      {/* Admin/User Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="medecins" element={<Medecins />} />
        <Route path="rendez-vous" element={<RendezVous />} />
        <Route path="dossiers" element={<Dossiers />} />
        <Route path="rapports" element={<Rapports />} />
        <Route path="secretaires" element={<Secretaires />} />
        <Route path="agents-acceuil" element={<AgentsAcceuil />} />
        <Route path="contrats" element={<Contrats />} />
        <Route path="revenus" element={<Revenus />} />
        <Route path="acces" element={<Acces />} />
        <Route path="download-requests" element={<DownloadRequests />} />
      </Route>

      {/* Secretaire Protected Routes */}
      <Route
        path="/secretaire"
        element={
          <ProtectedRoute requireSecretaire={true}>
            <SecretaireLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SecretaireDashboard />} />
        <Route path="patients" element={<SecretairePatients />} />
        <Route path="rendez-vous" element={<SecretaireRendezVous />} />
        <Route path="dossiers" element={<SecretaireDossiers />} />
      </Route>

      {/* Medecin Protected Routes */}
      <Route
        path="/medecin"
        element={
          <ProtectedRoute requireMedecin={true}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MedecinDashboard />} />
        {/* Reusing existing pages but normally they should be filtered.
            For now, user just asked for Dashboard.
            If I link to /medecin/patients, I need to map it here.
        */}
      </Route>

      {/* Agent Protected Routes */}
      <Route
        path="/agent"
        element={
          <ProtectedRoute requireAgent={true}>
            <AgentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AgentDashboard />} />
        <Route path="patients" element={<AgentPatients />} />
        <Route path="rendez-vous" element={<AgentRendezVous />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component
function App() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
