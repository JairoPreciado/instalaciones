import React from 'react';
import { signOut } from 'firebase/auth'; // Importa la función de cierre de sesión de Firebase
import { auth } from '../../services/firebaseConfiguration'; // Asegúrate de tener la configuración de Firebase

const HomeScreenStudent = () => {
  // Función para cerrar sesión
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log('Sesión cerrada con éxito');
        // Redirige a la página de login o a la página principal después de cerrar sesión
        window.location.href = '/login'; // Puedes redirigir a la página de login
      })
      .catch((error) => {
        console.error('Error al cerrar sesión:', error);
      });
  };

  return (
    <div>
      <h1>Bienvenido, Estudiante</h1>
      <p>Esta es tu área de estudiante. Accede a tus actividades y más.</p>

      {/* Botón de cierre de sesión */}
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
};

export default HomeScreenStudent;
