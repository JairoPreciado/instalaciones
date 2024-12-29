import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfiguration';
import { useAuth } from '../../components/UseAuth'; // Asegúrate de importar el hook useAuth
import Notification from '../../components/NotificationsComponent/Notifications'; // Componente para notificaciones
import styles from './LoginScreen.module.css'; // Archivo de estilos

const LoginScreen = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth(); // Hook para el estado global del usuario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState(null);
  const [nextRoute, setNextRoute] = useState(null);

  // Validación de correo
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const validDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'ucol.mx'];
  const isDomainValid = (email) => {
    const domain = email.split('@')[1];
    return validDomains.includes(domain);
  };
  const isEmailValid = emailRegex.test(email) && isDomainValid(email);
  const isPasswordValid = password.length > 7;
  const isFormValid = email && password && isEmailValid && isPasswordValid;

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'DB', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userName = userData?.name || 'Usuario';
        const userRole = userData?.role;

        setUser(user); // Actualizar el contexto global del usuario

        if (userRole === 'student') {
          setNotification(`¡Bienvenido, estudiante ${userName}!`);
          setNotificationType('success'); // Tipo para estudiante
          setNextRoute('/student/home');
        } else if (userRole === 'teacher') {
          setNotification(`¡Bienvenido, profesor ${userName}!`);
          setNotificationType('success'); // Tipo para profesor
          setNextRoute('/teacher/home');
        } else {
          setNotification('Tu rol no está definido. Contacta al administrador.');
          setNotificationType('warning'); // Tipo para roles indefinidos
        }
      } else {
        setNotification('No se encontró información del usuario en la base de datos.');
        setNotificationType('error'); // Tipo para errores
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setNotification('Correo o contraseña incorrectos.');
      setNotificationType('error'); // Tipo para errores
    }
  };

  const handleNotificationConfirm = () => {
    setNotification(null);
    if (nextRoute) navigate(nextRoute);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Instalaciones Eléctricas</h1>

      <input
        className={styles.input}
        type="email"
        placeholder="Correo Electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        maxLength={50}
      />
      {email && !isEmailValid && <p className={styles.errorText}>El correo no es válido.</p>}

      <input
        className={styles.input}
        type={showPassword ? 'text' : 'password'}
        placeholder="Contraseña"
        value={password}
        maxLength={16}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className={styles.checkboxContainer}>
        <input
          type="checkbox"
          checked={showPassword}
          onChange={() => setShowPassword(!showPassword)}
        />
        <label>Mostrar Contraseña</label>
      </div>

      <button
        className={`${styles.secondaryButton} ${!isFormValid ? styles.disabledButton : ''}`}
        onClick={handleLogin}
        disabled={!isFormValid}
      >
        Iniciar
      </button>

      <button onClick={() => navigate('/register/step1')} className={styles.link}>
        ¿Aún no tienes cuenta? Regístrate
      </button>

      <button className={styles.recovery} onClick={() => navigate('/recoveryPass')}>
        ¿Olvidaste tu contraseña? Recupérala
      </button>

      {notification && (
        <Notification message={notification} type={notificationType} onConfirm={handleNotificationConfirm} />
      )}
    </div>
  );
};

export default LoginScreen;
