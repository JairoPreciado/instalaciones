import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfiguration'; // Asegúrate de tener la configuración de Firebase
import { doc, getDoc } from 'firebase/firestore';

// Contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para usar la autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // Agregar estado para el rol

  useEffect(() => {
    // Establece el estado del usuario cuando cambie
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // Obtén el rol del usuario desde Firestore cuando el usuario esté autenticado
        const userDocRef = doc(db, 'DB', authUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRole(userData?.role); // Establece el rol
        }
        setUser(authUser); // Establece el usuario en el estado
      } else {
        setUser(null);
        setRole(null); // Si no hay usuario, limpia el rol
      }
    });

    // Cleanup cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, setUser, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};
