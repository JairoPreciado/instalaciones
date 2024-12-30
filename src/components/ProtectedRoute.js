import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './UseAuth';

const ProtectedRoute = ({ element, role }) => {
  const { user, role: userRole, loading } = useAuth();

  // Mostrar un estado de carga mientras se verifica la autenticación
  if (loading) {
    return <div>Cargando...</div>; // Puedes reemplazar esto con un spinner o un componente personalizado
  }

  if (!user) {
    console.log('Usuario no autenticado, redirigiendo a /login');
    return <Navigate to="/login" />;
  }

  if (userRole !== role) {
    console.log('Rol incorrecto, redirigiendo a /acceso-denegado');
    return <Navigate to="/acceso-denegado" />;
  }

  return element;
};

export default ProtectedRoute;
