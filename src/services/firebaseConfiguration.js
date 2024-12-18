// Importa Firebase y los servicios que necesitas
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de tu proyecto en Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAUd5h5So9_NAOS7MLcx11jhdVYaV_KfEI",
  authDomain: "instalaciones-62bb8.firebaseapp.com",
  projectId: "instalaciones-62bb8",
  storageBucket: "instalaciones-62bb8.firebasestorage.app",
  messagingSenderId: "817428332814",
  appId: "1:817428332814:android:6f2da5af8d3e12e68b175f",
};

// Inicializa Firebase con la configuración
const app = initializeApp(firebaseConfig);

// Exporta los servicios que vas a usar
const auth = getAuth(app); // Para autenticación
const db = getFirestore(app); // Para la base de datos Firestore

export { auth, db };
