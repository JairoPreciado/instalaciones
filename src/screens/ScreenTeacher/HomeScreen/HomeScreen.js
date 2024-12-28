import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../../services/firebaseConfiguration';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import styles from './HomeScreen.module.css';

const HomeScreenTeacher = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Estado para simular loading
  const [selectedActivity, setSelectedActivity] = useState('activity1Enabled'); // Actividad seleccionada

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

  return (
    <div className={styles.container}>
      <button className={styles.logoutButton} onClick={handleLogout} disabled={isLoggingOut}>
      {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
      </button>
          
      <button
        className={styles.egressAllButton}
        onClick={async () => {
          const confirmEgressAll = window.confirm(
            '¿Estás seguro de que deseas egresar a todos los estudiantes? Esta acción no se puede deshacer.'
          );
          if (confirmEgressAll) {
            try {
              const batchPromises = students.map(async (student) => {
                const studentDoc = doc(db, 'DB', student.id);
                await updateDoc(studentDoc, { role: 'studentx' });
              });
              await Promise.all(batchPromises);
              setStudents([]); // Vaciar la lista local de estudiantes
              alert('Todos los estudiantes han sido egresados.');
            } catch (error) {
              console.error('Error al egresar a todos los estudiantes:', error);
            }
          }
        }}
      >
        Egresar todos
      </button>
      <h1 className={styles.title}>Bienvenido, Profesor</h1>
      <p className={styles.description}>Selecciona una actividad de la parte inferior y habilítala/deshabilítala para los estudiantes.</p>

      {/* Encabezados de las columnas */}
      <div className={styles.studentListHeader}>
        <span>ID</span>
        <span>Calificación</span>
        <span>Egresar</span>
        <span>Accion</span>
      </div>

      <ul className={styles.studentList}>
        {students.map((student) => {
          const gradeKey = `${selectedActivity.replace('Enabled', 'Grade')}`;
          return (
          <li key={student.id} className={styles.studentItem}>
            <span>{student.name || `Estudiante ${student.id}`}</span>
            
            {/* Calificación dinámica */}
            <span className={styles.grade}>
                {student[gradeKey] !== "null"
                  ? `${student[gradeKey]}`
                  : '-'}
              </span>
            
           {/* Botón Egresar */}
            <button
              className={styles.egressButton}
              onClick={async () => {
                const confirmEgress = window.confirm(
                  `¿Estás seguro de que deseas egresar al estudiante "${student.name || `Estudiante ${student.id}`}"?`
                );
                if (confirmEgress) {
                  try {
                    const studentDoc = doc(db, 'DB', student.id);
                    await updateDoc(studentDoc, { role: 'studentx' });
                    setStudents((prev) => prev.filter((s) => s.id !== student.id));
                  } catch (error) {
                    console.error('Error al egresar estudiante:', error);
                  }
                }
              }}
            >Egresar</button>
            
            {/* Botón Habilitar/Deshabilitar */}
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
