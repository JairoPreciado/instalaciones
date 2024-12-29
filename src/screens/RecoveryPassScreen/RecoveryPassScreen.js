import React, { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConfiguration'; // Asegúrate de tener este archivo configurado
import styles from './RecoveryPassScreen.module.css';
import Notification from '../../components/NotificationsComponent/Notifications'; // Asegúrate de que esta ruta sea correcta

const RecoveryPassword = () => {
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' }); // Estado para la notificación

  // Expresión regular para validar correos electrónicos
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Validar correo electrónico
  const validateEmail = (email) => {
    setIsEmailValid(emailRegex.test(email));
  };

  // Función para verificar si el correo existe en Firebase Firestore
  const checkEmailExists = async (email) => {
    try {
      const usersRef = collection(db, 'DB'); // Cambia 'DB' por el nombre de tu colección en Firestore
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      return !querySnapshot.empty; // Devuelve true si el correo existe
    } catch (error) {
      console.error('Error verificando el correo:', error);
      alert('Hubo un problema verificando el correo. Intenta nuevamente.');
      return false;
    }
  };

  // Función para enviar el correo de recuperación
  const handleSendPasswordReset = async () => {
    setIsButtonDisabled(true);

    try {
      const emailExists = await checkEmailExists(email);
      if (!emailExists) {
        setNotification({
          message: 'El correo ingresado no está registrado.',
          type: 'error',
        });
        setIsButtonDisabled(false);
        return;
      }

      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      setNotification({
        message: 'Correo de recuperación enviado. Revisa tu bandeja de entrada.',
        type: 'success',
      });
    } catch (error) {
      console.error('Error al enviar el correo de recuperación:', error);
      setNotification({
        message: 'No se pudo enviar el correo. Intenta nuevamente.',
        type: 'error',
      });
    }

    setTimeout(() => setIsButtonDisabled(false), 10000);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Recuperación de Contraseña</h1>

      <input
        className={styles.input}
        type="email"
        placeholder="Correo Electrónico"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          validateEmail(e.target.value);
        }}
        maxLength={50}
      />
      {email && !isEmailValid && <p className={styles.errorText}>El correo no es válido.</p>}

      <button
        className={`${styles.secondaryButton} ${isButtonDisabled || !isEmailValid ? styles.disabledButton : ''}`}
        onClick={handleSendPasswordReset}
        disabled={isButtonDisabled || !isEmailValid}
      >
        {isButtonDisabled ? 'Espera 10s...' : 'Enviar Contraseña por Correo'}
      </button>

      <button className={styles.backButton} onClick={() => window.history.back()}>←</button>

      {/* Componente de notificación */}
      <Notification
        message={notification.message}
        type={notification.type}
        onConfirm={() => setNotification({ message: '', type: '' })} // Resetea la notificación al hacer click en "Aceptar"
      />
    </div>
  );
};

export default RecoveryPassword;
