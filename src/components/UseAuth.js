import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfiguration';
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
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true); // Estado de carga
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userDocRef = doc(db, 'DB', authUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRole(userData?.role || null);
        }
        setUser(authUser);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false); // Finaliza la carga después de verificar
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
