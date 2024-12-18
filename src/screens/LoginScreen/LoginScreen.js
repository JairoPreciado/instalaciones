import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfiguration';
import styles from './LoginScreen.module.css'; // Asegúrate de crear un archivo de estilo CSS para este componente

const LoginScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Validación de correo
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Dominios válidos
  const validDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'ucol.mx'];

  // Verifica si el dominio del correo es válido
  const isDomainValid = (email) => {
    const domain = email.split('@')[1];
    return validDomains.includes(domain);
  };

  // Verifica si el correo tiene un formato y dominio válidos
  const isEmailValid = emailRegex.test(email) && isDomainValid(email);
  const isPasswordValid = password.length > 7;
  const isFormValid = email && password && isEmailValid && isPasswordValid;

  // Función para manejar el inicio de sesión
  const handleLogin = async () => {
    try {
      // Autenticación con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Obtén el rol del usuario desde Firestore
      const userDocRef = doc(db, 'DB', user.uid); // Asegúrate de que la colección sea correcta
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userName = userData?.name || 'Usuario';
        const userRole = userData?.role; // Rol del usuario (student o teacher)

        // Redirige según el rol del usuario
        if (userRole === 'student') {
          alert(`¡Bienvenido, ${userName} (Estudiante)!`);
          navigate('/home/student'); // Ruta para estudiantes
        } else if (userRole === 'teacher') {
          alert(`¡Bienvenido, ${userName} (Profesor)!`);
          navigate('/home/teacher'); // Ruta para profesores
        } else {
          alert('Tu rol no está definido. Contacta al administrador.');
        }
      } else {
        alert('No se encontró información del usuario en la base de datos.');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alert('Correo o contraseña incorrectos.');
    }
  };

  return (
    <div className={styles.container}>
      {/* Título de la vista */}
      <h1 className={styles.title}>Instalaciones Eléctricas</h1>

      {/* Input para ingresar el correo */}
      <input
        className={styles.input}
        type="email"
        placeholder="Correo Electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        maxLength={50}
      />
      {email && !isEmailValid && <p className={styles.errorText}>El correo no es válido.</p>}

      {/* Input para ingresar la contraseña */}
      <input
        className={styles.input}
        type={showPassword ? 'text' : 'password'}
        placeholder="Contraseña"
        value={password}
        maxLength={16}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* Checkbox para ver o ocultar la contraseña */}
      <div className={styles.checkboxContainer}>
        <input
          type="checkbox"
          checked={showPassword}
          onChange={() => setShowPassword(!showPassword)}
        />
        <label>Mostrar Contraseña</label>
      </div>

      {/* Botón para iniciar sesión */}
      <button
        className={`${styles.secondaryButton} ${!isFormValid ? styles.disabledButton : ''}`}
        onClick={handleLogin}
        disabled={!isFormValid}
      >
        Iniciar
      </button>

      {/* Botón para registrarse */}
      <button onClick={() => navigate('/register/step1')} className={styles.link}>
        ¿Aún no tienes cuenta? Regístrate
      </button>

      {/* Botón para recuperar contraseña */}
      <button className={styles.recovery} onClick={() => navigate('/recoveryPass')}>
        ¿Olvidaste tu contraseña? Recupérala
      </button>
    </div>
  );
};

export default LoginScreen