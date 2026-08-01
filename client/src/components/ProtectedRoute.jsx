import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loader from './Loader';

/**
 * Guards a route so only an authenticated user of the given role can view it.
 * Usage: <ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>
 */
const ProtectedRoute = ({ role, children }) => {
  const { user, role: userRole, loading } = useAuth();

  if (loading) {
    return <Loader label="Checking your session…" />;
  }

  if (!user) {
    return <Navigate to={role === 'doctor' ? '/doctor/login' : '/patient/login'} replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
