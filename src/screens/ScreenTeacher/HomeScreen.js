import React from 'react';
import styles from './HomeScreen.module.css'; // Archivo CSS para estilos

const HomeScreenTeacher = () => {
  return (
    <div className={styles.container}>
      <h1>Bienvenido, Profesor</h1>
      {/* Aquí puedes agregar funcionalidades específicas para profesores */}
      <p>Esta es tu área de profesor. Gestiona estudiantes y actividades.</p>
    </div>
  );
};

export default HomeScreenTeacher;
