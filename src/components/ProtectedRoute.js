import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './UseAuth'; // Asegúrate de importar el hook useAuth

const ProtectedRoute = ({ element, role }) => {
  const { user, role: userRole } = useAuth();

  // Si no hay usuario autenticado, redirige a /login
  if (!user || user === null) {
    console.log("Usuario no autenticado, redirigiendo a /login");
    return <Navigate to="/login" />;
  }

  // Si el rol del usuario no coincide con el rol permitido, redirige a /acceso-denegado o cualquier otra página
  if (userRole !== role) {
    console.log("Rol incorrecto, redirigiendo a /acceso-denegado");
    return <Navigate to="/acceso-denegado" />;
  }

  // Si el usuario está autenticado y tiene el rol adecuado, muestra la ruta protegida
  return element;
};

export default ProtectedRoute;
