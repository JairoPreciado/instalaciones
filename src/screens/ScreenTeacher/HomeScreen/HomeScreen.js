import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../../services/firebaseConfiguration';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import styles from './HomeScreen.module.css';

const HomeScreenTeacher = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null); // Actividad seleccionada

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

  if (loading) {
    return <p>Cargando estudiantes...</p>;
  }

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

  return (
    <div className={styles.container}>
      <button className={styles.logoutButton} onClick={handleLogout}>
        Cerrar sesión
      </button>
      <h1 className={styles.title}>Bienvenido, Profesor</h1>
      <p className={styles.description}>Selecciona una actividad de la parte inferior y habilítala/deshabilítala para los estudiantes.</p>

      <ul className={styles.studentList}>
        {students.map((student) => (
          <li
          key={student.id}
          className={`${styles.studentItem} ${
            selectedActivity && student[selectedActivity]
              ? styles.enabled
              : selectedActivity && !student[selectedActivity]
              ? styles.disabled
              : ''
          }`}
            onClick={() => {
              if (selectedActivity) {
                toggleActivityState(student.id, selectedActivity);
              } else {
                alert('Selecciona una actividad en la parte inferior primero.');
              }
            }}
          >
            <span>{student.name || `Estudiante ${student.id}`}</span>
            {selectedActivity && (
              <span>
                {student[selectedActivity] ? 'Habilitado' : 'Deshabilitado'}
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* Footer con botones */}
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
    </div>
  );
};

export default HomeScreenTeacher;
