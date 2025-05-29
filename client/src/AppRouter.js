import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminPanel from './pages/admin/AdminPanel';

// Auth Guard - Normal kullanıcılar için
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/" />;
};

// Admin Guard - Admin kullanıcıları için
const AdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  return adminToken ? children : <Navigate to="/admin/login" />;
};

const AppRouter = () => {
  return (
    <Routes>
        {/* Normal kullanıcı rotaları */}
        <Route path="/" element={<Login />} />
        <Route 
          path="/dashboard/*" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        
        {/* Admin rotaları */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/panel/*" 
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
        
        {/* Diğer rotalar için yönlendirme */}
        <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRouter;
