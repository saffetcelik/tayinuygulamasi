import React from 'react';
import { Navigate } from 'react-router-dom';

// Kimlik doğrulama gerektiren sayfalar için koruma bileşeni
const PrivateRoute = ({ children }) => {
  // localStorage'dan kullanıcı oturum durumunu kontrol et
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  // Kullanıcı giriş yapmışsa ilgili sayfaya izin ver
  return children;
};

export default PrivateRoute;
