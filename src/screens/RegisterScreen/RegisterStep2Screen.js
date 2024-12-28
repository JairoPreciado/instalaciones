import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfiguration'; // Ajusta la ruta según tu estructura
import styles from './RegisterStep2Screen.module.css'; // Archivo CSS para estilos

const RegisterStep2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; // Obtener el correo desde el estado
  
  // Si el correo no existe, redirigir al usuario al paso 1
  useEffect(() => {
    // Redirige al paso 1 si no hay correo en el estado
    if (!email) {
      navigate('/register/step1');
    }
  }, [email, navigate]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordValid = password.length >= 8 && password.length <= 16;
  const isConfirmPasswordValid = confirmPassword === password && password.length > 0;
  const isNameValid = name.trim().length > 0;
  const isFormValid = isPasswordValid && isConfirmPasswordValid && isNameValid;

  const handleCreateAccount = async () => {
    try {
      if (!email || typeof email !== 'string') {
        alert('Correo inválido');
        return;
      }
  
      if (!isConfirmPasswordValid) {
        alert('Las contraseñas no coinciden.');
        return;
      }
  
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Agregando el rol de 'student' al documento en Firestore
      await setDoc(doc(db, 'DB', user.uid), {
        email,
        name,
        role: 'student', // Aquí se añade el rol
        //buttonEnabled: false, // Campo implícito que siempre será `true` al inicio
        activity1Enabled: false,
        activity1Grade: "null",
        activity2Enabled: false,
        activity2Grade: "null",
        activity3Enabled: false,
        activity3Grade: "null",
        activity4Enabled: false,
        activity4Grade: "null",
        activity5Enabled: false,
        activity5Grade: "null",
        activity6Enabled: false,
        activity6Grade: "null",
        activity7Enabled: false,
        activity7Grade: "null"
      });
  
      alert('Cuenta creada exitosamente.');
      navigate('/login');
    } catch (error) {
      console.error('Error creando la cuenta:', error);
      alert('No se pudo crear la cuenta. Inténtalo de nuevo.');
    }
  };  

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Crear Cuenta</h1>

      {/* Input Deshabilitado con valor 'student' */}
      <input
        className={styles.input} // Nuevo estilo para input deshabilitado
        type="text"
        value="Student"
        disabled
      />

      {/* Input para el nombre */}
      <input
        className={styles.input}
        type="text"
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={16}
      />
      {!isNameValid && name.length > 0 && (
        <p className={styles.errorText}>El nombre no puede estar vacío.</p>
      )}

      {/* Input para la contraseña */}
      <input
        className={styles.input}
        type={showPassword ? 'text' : 'password'}
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        maxLength={16}
      />
      {!isPasswordValid && password.length > 0 && (
        <p className={styles.errorText}>
          La contraseña debe tener entre 8 y 16 caracteres.
        </p>
      )}

      {/* Input para confirmar contraseña */}
      <input
        className={styles.input}
        type={showPassword ? 'text' : 'password'}
        placeholder="Confirmar Contraseña"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        maxLength={16}
      />
      {!isConfirmPasswordValid && confirmPassword.length > 0 && (
        <p className={styles.errorText}>Las contraseñas no coinciden.</p>
      )}

      {/* Checkbox para mostrar u ocultar contraseña */}
      <div className={styles.checkboxContainer}>
        <input
          type="checkbox"
          checked={showPassword}
          onChange={() => setShowPassword(!showPassword)}
        />
        <label>Mostrar Contraseña</label>
      </div>

      {/* Botón para crear la cuenta */}
      <button
        className={`${styles.secondaryButton} ${
          !isFormValid ? styles.disabledButton : ''
        }`}
        onClick={handleCreateAccount}
        disabled={!isFormValid}
      >
        Crear Cuenta
      </button>
    </div>
  );
};

export default RegisterStep2;
