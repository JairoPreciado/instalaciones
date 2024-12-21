import React, { useEffect, useState } from 'react';
import { db } from '../../../services/firebaseConfiguration'; // Importa tu configuración de Firestore
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import styles from './HomeScreen.module.css'; // Archivo CSS para estilos

const HomeScreenTeacher = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener la lista de estudiantes desde Firestore
    const fetchStudents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'DB'));
        const studentsData = querySnapshot.docs
          .filter((doc) => doc.data().role === 'student') // Filtrar solo estudiantes
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

  const toggleButtonState = async (studentId, currentState) => {
    try {
      const studentDoc = doc(db, 'DB', studentId);
      await updateDoc(studentDoc, { buttonEnabled: !currentState });
      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId ? { ...student, buttonEnabled: !currentState } : student
        )
      );
    } catch (error) {
      console.error('Error al actualizar estado del botón:', error);
    }
  };

  if (loading) {
    return <p>Cargando estudiantes...</p>;
  }

  return (
    <div className={styles.container}>
      <h1>Bienvenido, Profesor</h1>
      <p>Esta es tu área de profesor. Gestiona estudiantes y actividades.</p>

      <h2>Gestión de Estudiantes</h2>
      <ul className={styles.studentList}>
        {students.map((student) => (
          <li key={student.id} className={styles.studentItem}>
            <span>{student.name || `Estudiante ${student.id}`}</span>
            <span>
              Botón habilitado: {student.buttonEnabled ? 'Sí' : 'No'}
            </span>
            <button
              onClick={() => toggleButtonState(student.id, student.buttonEnabled)}
              className={styles.toggleButton}
            >
              {student.buttonEnabled ? 'Deshabilitar' : 'Habilitar'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HomeScreenTeacher;
