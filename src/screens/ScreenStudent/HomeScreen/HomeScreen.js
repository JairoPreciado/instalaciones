import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../../services/firebaseConfiguration';
import { doc, onSnapshot } from 'firebase/firestore';
import styles from './HomeScreen.module.css';
import Notification from '../../../components/NotificationsComponent/Notifications'; // Componente para notificaciones
import ConfirmationDialog from '../../../components/ConfirmComponent/Confirm';

const HomeScreenStudent = () => {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityGrade, setActivityGrade] = useState(''); // Estado para la calificación
  const [googleFormUrl, setGoogleFormUrl] = useState(''); // Estado para la URL del formulario
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Estado para simular loading
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('Estudiante'); // Estado para el nombre del estudiante
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState(null);
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
          grade: data[`activity${i + 1}Grade`] || '',
        }));
        setActivities(activitiesArray);

        // Obtener el nombre del estudiante desde Firestore
        setStudentName(data.name || 'Estudiante'); // Reemplaza 'name' por el campo que almacena el nombre
      } else {
        console.error('El documento del usuario no existe');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleSendGrade = async () => {
    if (!googleFormUrl) {
      setNotification('Ingresa una URL valida');
      setNotificationType('error'); // Tipo para roles indefinidos
      return;
    }

    if (!activityGrade) {
      setNotification('No hay ninguna calificacion para mandar');
      setNotificationType('error'); // Tipo para roles indefinidos
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append('entry.XXXXXXX', auth.currentUser?.email || ''); // Reemplaza con el ID del campo para correo
      formData.append('entry.YYYYYYY', activityGrade); // Reemplaza con el ID del campo para calificación

      await fetch(googleFormUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      setNotification('Calificacion enviada correctamente');
      setNotificationType('success'); // Tipo para roles indefinidos
    } catch (error) {
      console.error('Error al enviar la calificación:', error);
      setNotification('Error al enviar la calificacion');
      setNotificationType('error'); // Tipo para roles indefinidos
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      signOut(auth)
        .then(() => {
          console.log('Sesión cerrada con éxito');
          window.location.href = '/login';
        })
        .catch((error) => {
          console.error('Error al cerrar sesión:', error);
          setIsLoggingOut(false);
        });
    }, 2000);
  };

  const handleGoToARScene = () => {
    if (window.Unity && window.Unity.call) {
        window.Unity.call("SaveCurrentUrl:" + window.location.href); // Enviar la URL actual
        window.Unity.call("goToARScene"); // Cambiar de escena
    } else {
        console.error("Unity no está disponible.");
    }
};



  if (loading) {
    return <p className={styles.description}>Cargando...</p>;
  }

  return (
    <div className={styles.container}>
      <button className={styles.logoutButton} onClick={() => setShowDialog(true)} disabled={isLoggingOut}>
        {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
      </button>

      {showDialog && (
        <ConfirmationDialog
          message="¿Estás seguro de que deseas cerrar sesión?"
          onConfirm={() => {
            handleLogout();
            setShowDialog(false);
          }}
          onCancel={() => setShowDialog(false)}
        />
      )}

      <h1 className={styles.title}>Bienvenido, Estudiante {studentName} </h1>
      <p className={styles.description}>
        Accede a tus actividades habilitadas a continuación.
      </p>

      {/* Mostrar información de la actividad seleccionada */}
      {selectedActivity && (
        <div className={styles.activityDetails}>
          <button className={styles.detailButton} onClick={handleGoToARScene}>Actividad {selectedActivity.id}</button>
          <button className={styles.detailButton} onClick={handleGoToARScene}>Práctica/Teoría</button>
          <input
            type="text"
            value={selectedActivity.grade || ''}
            disabled
            className={styles.gradeInput}
            placeholder="Sin calificar"
          />
          <input
            type="url"
            className={styles.formUrlInput}
            placeholder="Pega la URL del formulario de Google"
            value={googleFormUrl}
            onChange={(e) => setGoogleFormUrl(e.target.value)}
          />
          <button className={styles.detailButton} onClick={handleSendGrade}>
            Enviar calificación
          </button>
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
      {notification && (
        <Notification message={notification} type={notificationType} onConfirm={() => setNotification(null)} />
      )}
    </div>
  );
};

export default HomeScreenStudent;
