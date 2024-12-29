import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConfiguration'; // Ajusta la ruta según tu estructura
import Notification from '../../components/NotificationsComponent/Notifications'; // Componente para notificaciones
import styles from './RegisterStep1Screen.module.css';

const RegisterStep1 = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState(null);
  const [nextRoute, setNextRoute] = useState(null);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const validDomains = ['gmail.com', 'ucol.mx'];

  // Valida si el correo tiene un dominio permitido
  const isDomainValid = (email) => {
    const domain = email.split('@')[1];
    return validDomains.includes(domain);
  };

  // Valida el formato y el dominio del correo
  const isEmailValid = emailRegex.test(email) && isDomainValid(email);

  // Verifica si el correo ya está registrado en la base de datos
  const checkEmailExists = async (email) => {
    try {
      const usersRef = collection(db, 'DB'); // Cambia 'DB' por el nombre real de tu colección
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      return !querySnapshot.empty; // Retorna true si encuentra registros
    } catch (error) {
      console.error('Error verificando el correo:', error);
      throw new Error('Error verificando el correo.');
    }
  };

  // Envía el correo con el código de verificación
  const sendVerificationEmail = async (email, code) => {
    try {
      const response = await fetch('https://server-lightbulb-jairos-projects-d6be4ec1.vercel.app/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        const errorResponse = await response.text();
        console.error('Error en la respuesta del servidor:', errorResponse);
        throw new Error('Error al enviar el correo.');
      }

      setNotification('Código de verificación enviado. Revisa tu bandeja de entrada.');
      setNotificationType('success');
    
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      throw new Error('No se pudo enviar el correo. Intenta nuevamente.');
    }
  };

  // Maneja el envío del código de verificación
  const handleSendCode = async () => {
    if (!isEmailValid) {
      setNotification('Por favor, ingresa un correo válido.');
      setNotificationType('error'); 
      return;
    }

    setIsLoading(true);
    try {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        setNotification('Este correo ya está asociado a una cuenta. Usa otro correo.');
        setNotificationType('warning'); 
        return;
      }

      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(generatedCode);
      setCodeSent(true);

      await sendVerificationEmail(email, generatedCode);
    } catch (error) {

      setNotification(`${error.message}`);
      setNotificationType('error'); 

    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (inputCode === verificationCode) {
      setNotification('Correo verificado correctamente.');
      setNotificationType('success'); 
      
      // Configurar nextRoute con la ruta y el email en el estado
      setNextRoute({ path: '/register/step2', state: { email } });
    } else {
      setNotification('El código ingresado es incorrecto.');
      setNotificationType('error');
    }
  };

  const handleNotificationConfirm = () => {
    setNotification(null);
    if (nextRoute) {
      // Navegar utilizando nextRoute
      navigate(nextRoute.path, { state: nextRoute.state });
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Registro: Paso 1</h1>

      <input
        type="email"
        className={styles.input}
        placeholder="Correo Electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        maxLength={50}
        disabled={isLoading}
      />
      {email && !isEmailValid && (
        <p className={styles.errorText}>Por favor, ingresa un correo válido con un dominio permitido.</p>
      )}

      <button
        className={`${styles.secondaryButton} ${!isEmailValid || isLoading ? styles.disabledButton : ''}`}
        onClick={handleSendCode}
        disabled={!isEmailValid || isLoading}
      >
        {isLoading ? 'Enviando...' : 'Enviar Código'}
      </button>

      <input
        type="text"
        className={styles.input}
        placeholder="Código de Verificación"
        value={inputCode}
        onChange={(e) => setInputCode(e.target.value)}
        maxLength={6}
        disabled={!codeSent || isLoading}
      />

      <button
        className={`${styles.secondaryButton} ${!codeSent || isLoading ? styles.disabledButton : ''}`}
        onClick={handleVerifyCode}
        disabled={!codeSent || isLoading}
      >
        Verificar Código
      </button>

      <button
        className={styles.backButton}
        onClick={() => navigate('/login')}
        disabled={isLoading}
      >
        ← 
      </button>
      {notification && (
        <Notification message={notification} type={notificationType} onConfirm={handleNotificationConfirm} />
      )}
    </div>
  );
};

export default RegisterStep1;
