import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore'; // Firebase Firestore
import { db } from '../../services/firebaseConfiguration'; // Ajusta la ruta según tu estructura
import styles from './RegisterStep1Screen.module.css'; // Asegúrate de crear un archivo de estilo CSS para este componente

const RegisterStep1 = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const validDomains = ['gmail.com', 'ucol.mx'];

  const isDomainValid = (email) => {
    const domain = email.split('@')[1];
    return validDomains.includes(domain);
  };

  const isEmailValid = emailRegex.test(email) && isDomainValid(email);

  const checkEmailExists = async (email) => {
    try {
      const usersRef = collection(db, 'DB'); // Colección donde guardas usuarios
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error verificando el correo:', error);
      alert('Ocurrió un problema verificando el correo.');
      return false;
    }
  };

  const sendVerificationEmail = async (email, code) => {
    try {
      const response = await fetch('https://server-lightbulb.vercel.app/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      if (response.ok) {
        alert('Código de verificación enviado. Revisa tu bandeja de entrada.');
      } else {
        const errorResponse = await response.text();
        console.error('Error en la respuesta:', errorResponse);
        throw new Error('Error al enviar el correo');
      }
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      alert('No se pudo enviar el correo. Intenta nuevamente.');
    }
  };

  const handleSendCode = async () => {
    try {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        alert('Este correo ya está asociado a una cuenta. Usa otro correo.');
        return;
      }

      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(generatedCode);
      setCodeSent(true);

      await sendVerificationEmail(email, generatedCode);
    } catch (error) {
      console.error('Error al enviar el código:', error);
      alert('No se pudo enviar el código. Intenta nuevamente.');
    }
  };

  const handleVerifyCode = () => {
    if (inputCode === verificationCode) {
      localStorage.setItem('userEmail', email);
      alert('Correo verificado!');
      navigate('/step2', { state: { email } }); // Navegación con parámetros
    } else {
      alert('El código ingresado es incorrecto.');
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
      />
      {email && !isEmailValid && <p className={styles.errorText}>El correo no es válido.</p>}

      <button
        className={`${styles.secondaryButton} ${!isEmailValid ? styles.disabledButton : ''}`}
        onClick={handleSendCode}
        disabled={!isEmailValid}
      >
        Enviar Código
      </button>

      <input
        type="text"
        className={styles.input}
        placeholder="Código de Verificación"
        value={inputCode}
        onChange={(e) => setInputCode(e.target.value)}
        maxLength={6}
        disabled={!codeSent}
      />

      <button
        className={`${styles.secondaryButton} ${!codeSent ? styles.disabledButton : ''}`}
        onClick={handleVerifyCode}
        disabled={!codeSent}
      >
        Verificar Código
      </button>

      <button className={styles.backButton} onClick={() => navigate('/login')}>←</button>
    </div>
  );
};

export default RegisterStep1;
