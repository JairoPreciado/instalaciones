import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/UseAuth'; // Importa el proveedor de autenticación
import SplashScreen from './screens/SplashScreen/SplashScreen';
import LoginScreen from './screens/LoginScreen/LoginScreen';
import Register1Screen from './screens/RegisterScreen/RegisterStep1Screen';
import Register2Screen from './screens/RegisterScreen/RegisterStep2Screen';
import RecoveryPassScreen from './screens/RecoveryPassScreen/RecoveryPassScreen';
import ScreenStudent from './screens/ScreenStudent/HomeScreen';
import ScreenTeacher from './screens/ScreenTeacher/HomeScreen';
import ProtectedRoute from './components/ProtectedRoute'; // Importa la ruta protegida

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register/step1" element={<Register1Screen />} />
          <Route path="/register/step2" element={<Register2Screen />} />
          <Route path="/recoveryPass" element={<RecoveryPassScreen />} />
          
          {/* Rutas protegidas */}
          <Route
            path="/student/home"
            element={<ProtectedRoute element={<ScreenStudent />} role="student" />}
          />
          <Route
            path="/teacher/home"
            element={<ProtectedRoute element={<ScreenTeacher />} role="teacher" />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
