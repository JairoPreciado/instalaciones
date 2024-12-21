import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../../services/firebaseConfiguration';
import { doc, onSnapshot } from 'firebase/firestore';
import styles from './HomeScreen.module.css';

const HomeScreenStudent = () => {
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    const studentDoc = doc(db, 'DB', userId);
    const unsubscribe = onSnapshot(studentDoc, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setButtonEnabled(docSnapshot.data().buttonEnabled || false);
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
      <h1 className={styles.title}>Bienvenido, Estudiante</h1>
      <p className={styles.description}>
        Esta es tu área de estudiante. Accede a tus actividades y más.
      </p>

      <button
        className={styles.button}
        disabled={!buttonEnabled}
      >
        {buttonEnabled ? 'Acción habilitada' : 'Botón deshabilitado'}
      </button>

      <button
        className={styles.logoutButton}
        onClick={handleLogout}
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default HomeScreenStudent;
