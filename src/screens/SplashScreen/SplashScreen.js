import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Importar el hook de navegación
import styles from "./SplashScreen.module.css";

const SplashScreen = () => {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate(); // Crear el hook de navegación

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false); // Iniciar la desaparición de la pantalla
    }, 3000); // Espera 3 segundos para que se vea el splash

    const redirectTimer = setTimeout(() => {
      navigate('/login'); // Redirigir a la pantalla de login
    }, 4000); // Redirige después de que termine la animación

    // Limpiar los timers cuando el componente se desmonta
    return () => {
      clearTimeout(timer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div className={`${styles.splashScreen} ${visible ? styles.show : styles.hide}`}>
      <h1>Bienvenido a Instalaciones</h1>
    </div>
  );
};

export default SplashScreen;
