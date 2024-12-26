import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../../services/firebaseConfiguration';
import { doc, onSnapshot } from 'firebase/firestore';
import styles from './HomeScreen.module.css';

const HomeScreenStudent = () => {
  const [activities, setActivities] = useState([]);
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
    signOut(auth)
      .then(() => {
        console.log('Sesión cerrada con éxito');
        window.location.href = '/login';
      })
      .catch((error) => {
        console.error('Error al cerrar sesión:', error);
      });
  };

  if (loading) {
    return <p className={styles.description}>Cargando...</p>;
  }

  return (
    <div className={styles.container}>
      <button className={styles.logoutButton} onClick={handleLogout}>
        Cerrar sesión
      </button>
      <h1 className={styles.title}>Bienvenido, Estudiante</h1>
      <p className={styles.description}>
        Accede a tus actividades habilitadas a continuación.
      </p>

      <footer className={styles.footer}>
        {activities.map((activity) => (
          <button
            key={activity.id}
            className={`${styles.activityButton} ${
              activity.enabled ? styles.enabled : styles.disabled
            }`}
            disabled={!activity.enabled}
          >
            {activity.enabled ? `Act ${activity.id}` : `Act ${activity.id}`}
          </button>
        ))}
      </footer>
    </div>
  );
};

export default HomeScreenStudent;
