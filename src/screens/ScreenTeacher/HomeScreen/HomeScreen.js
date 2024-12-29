import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../../services/firebaseConfiguration';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import styles from './HomeScreen.module.css';
import Notification from '../../../components/NotificationsComponent/Notifications'; // Componente para notificaciones
import ConfirmationDialog from '../../../components/ConfirmComponent/Confirm';

const HomeScreenTeacher = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Estado para simular loading
  const [selectedActivity, setSelectedActivity] = useState('activity1Enabled'); // Actividad seleccionada
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showEgressAllDialog, setShowEgressAllDialog] = useState(false);
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState(null);
  const [studentToEgress, setStudentToEgress] = useState(null)
  
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'DB'));
        const studentsData = querySnapshot.docs
          .filter((doc) => doc.data().role === 'student')
          .map((doc) => ({ id: doc.id, ...doc.data() }));
        setStudents(studentsData);
      } catch (error) {
        console.error('Error al obtener estudiantes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const toggleActivityState = async (studentId, activityKey) => {
    try {
      const student = students.find((s) => s.id === studentId);
      const currentState = student[activityKey];
      const studentDoc = doc(db, 'DB', studentId);
      await updateDoc(studentDoc, { [activityKey]: !currentState });
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId ? { ...s, [activityKey]: !currentState } : s
        )
      );
    } catch (error) {
      console.error('Error al actualizar estado:', error);
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

  const handleEgressAll = async () => {
    try {
      const batchPromises = students.map(async (student) => {
        const studentDoc = doc(db, 'DB', student.id);
        await updateDoc(studentDoc, { role: 'studentx' });
      });
      await Promise.all(batchPromises);
      setStudents([]); // Vaciar la lista local de estudiantes
      setNotification('Todos los estudiantes han sido egresados.');
      setNotificationType('success'); 
    } catch (error) {
      console.error('Error al egresar a todos los estudiantes:', error);
    }
  };

  const handleEgressStudent = async (studentId) => {
    try {
      const studentDoc = doc(db, 'DB', studentId);
      await updateDoc(studentDoc, { role: 'studentx' });
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      setNotification('Se ha egresado el estudiante');
      setNotificationType('success'); // Tipo para estudiante
    } catch (error) {
      console.error('Error al egresar estudiante:', error);
    }
  };

  if (loading) {
    return <p>Cargando estudiantes...</p>;
  }

  return (
    <div className={styles.container}>

      <button className={styles.logoutButton} onClick={() => setShowLogoutDialog(true)} disabled={isLoggingOut}>
        {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
      </button>

      {showLogoutDialog && (
        <ConfirmationDialog
          message="¿Estás seguro de que deseas cerrar sesión?"
          onConfirm={() => {
            handleLogout();
            setShowLogoutDialog(false);
          }}
          onCancel={() => setShowLogoutDialog(false)}
        />
      )}

      <button className={styles.egressAllButton} onClick={() => setShowEgressAllDialog(true)}>
        Egresar todos
      </button>

      {showEgressAllDialog && (
        <ConfirmationDialog
          message="¿Estás seguro de que deseas egresar a todos los estudiantes? Esta acción no se puede deshacer."
          onConfirm={() => {
            handleEgressAll();
            setShowEgressAllDialog(false);
          }}
          onCancel={() => setShowEgressAllDialog(false)}
        />
      )}

      <h1 className={styles.title}>Bienvenido, Profesor</h1>
      <p className={styles.description}>
        Selecciona una actividad de la parte inferior y habilítala/deshabilítala para los estudiantes.
      </p>

      <div className={styles.studentListHeader}>
        <span>ID</span>
        <span>Calificación</span>
        <span>Egresar</span>
        <span>Acción</span>
      </div>

      <ul className={styles.studentList}>
        {students.map((student) => {
          const gradeKey = `${selectedActivity.replace('Enabled', 'Grade')}`;
          return (
            <li key={student.id} className={styles.studentItem}>

              <span>{student.name || `Estudiante ${student.id}`}</span>
              
              <span className={styles.grade}>
                {student[gradeKey] !== '' ? `${student[gradeKey]}` : '-'}
              </span>
              
              <button className={styles.egressButton} onClick={() => setStudentToEgress(student)}>
                Egresar
              </button>

              {studentToEgress && studentToEgress.id === student.id && (
                <ConfirmationDialog
                  message={`¿Estás seguro de que deseas egresar al estudiante "${student.name || `Estudiante ${student.id}`}"?`}
                  onConfirm={() => {
                    handleEgressStudent(student.id);
                    setStudentToEgress(null);
                  }}
                  onCancel={() => setStudentToEgress(null)}
                />
              )}

              {selectedActivity && (
                <button
                  className={`${styles.toggleButton} ${
                    student[selectedActivity] ? styles.enabled : styles.disabled
                  }`}
                  onClick={() => toggleActivityState(student.id, selectedActivity)}
                >
                  {student[selectedActivity] ? 'Desactivar' : 'Activar'}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <footer className={styles.footer}>
        {Array.from({ length: 7 }).map((_, index) => {
          const activityKey = `activity${index + 1}Enabled`;
          return (
            <button
              key={activityKey}
              className={`${styles.footerButton} ${
                selectedActivity === activityKey ? styles.active : ''
              }`}
              onClick={() => setSelectedActivity(activityKey)}
            >
              Act {index + 1}
            </button>
          );
        })}
      </footer>

      {notification && (
        <Notification message={notification} type={notificationType} onConfirm={() => setNotification(null)} />
      )}
    </div>
  );
};

export default HomeScreenTeacher;
