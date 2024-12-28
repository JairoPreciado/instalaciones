import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../../services/firebaseConfiguration';
import { doc, onSnapshot } from 'firebase/firestore';
import styles from './HomeScreen.module.css';

const HomeScreenStudent = () => {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Estado para simular loading
  const [loading, setLoading] = useState(true);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    const studentDoc = doc(db, 'DB', userId);
    const unsubscribe = onSnapshot(studentDoc, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const activitiesArray = Array.from({ length: 7 }, (_, i) => ({
          id: i + 1,
          enabled: data[`activity${i + 1}Enabled`] || false,
        }));
        setActivities(activitiesArray);
      } else {
        console.error('El documento del usuario no existe');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleLogout = () => {
      const confirmLogout = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
      if (confirmLogout) {
        setIsLoggingOut(true); // Activar estado de loading
        setTimeout(() => {
          signOut(auth)
            .then(() => {
              console.log('Sesión cerrada con éxito');
              window.location.href = '/login';
            })
            .catch((error) => {
              console.error('Error al cerrar sesión:', error);
              setIsLoggingOut(false); // Revertir loading en caso de error
            });
        }, 2000); // Simular 2 segundos de carga
      }
    };

  if (loading) {
    return <p className={styles.description}>Cargando...</p>;
  }

  return (
    <div className={styles.container}>
      <button className={styles.logoutButton} onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
      </button>
      <h1 className={styles.title}>Bienvenido, Estudiante</h1>
      <p className={styles.description}>
        Accede a tus actividades habilitadas a continuación.
      </p>

      {/* Mostrar información de la actividad seleccionada */}
      {selectedActivity && (
        <div className={styles.activityDetails}>
          <button className={styles.detailButton}>Actividad</button>
          <button className={styles.detailButton}>Práctica/Teoría</button>
          <input
            type="text"
            value=""
            disabled
            className={styles.gradeInput}
            placeholder="Calificación"
          />
          <button className={styles.detailButton}>Enviar calificación</button>
        </div>
      )}

      {/* Footer con botones de actividades */}
      <footer className={styles.footer}>
        {activities.map((activity) => (
          <button
            key={activity.id}
            className={`${styles.activityButton} ${
              activity.enabled ? styles.enabled : styles.disabled
            }`}
            disabled={!activity.enabled}
            onClick={() => setSelectedActivity(activity)}
          >
            Act {activity.id}
          </button>
        ))}
      </footer>
    </div>
  );
};


export default HomeScreenStudent;
