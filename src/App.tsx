import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Admin from './pages/Admin';
import AdminArticles from './pages/AdminArticles';
import AdminArticleForm from './pages/AdminArticleForm';
import AdminUsers from './pages/AdminUsers';
import './App.css';

// Only enable signup in development or when explicitly enabled
const ENABLE_SIGNUP = import.meta.env.VITE_ENABLE_SIGNUP === 'true';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        {/* Signup only available if explicitly enabled (for initial admin setup) */}
        {ENABLE_SIGNUP && <Route path="/signup" element={<Signup />} />}

        {/* Admin Routes - Protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Admin />} />
          <Route path="articles" element={<AdminArticles />} />
          <Route path="articles/new" element={<AdminArticleForm />} />
          <Route path="articles/:id/edit" element={<AdminArticleForm />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
