import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SplashScreen from './screens/SplashScreen/SplashScreen';
import LoginScreen from './screens/LoginScreen/LoginScreen';
import Register1Screen from './screens/RegisterScreen/RegisterStep1Screen';
import Register2Screen from './screens/RegisterScreen/RegisterStep2Screen';
import RecoveryPassScreen from './screens/RecoveryPassScreen/RecoveryPassScreen';
import HomeScreen from './screens/HomeScreen/HomeScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register/step1" element={<Register1Screen />} />
        <Route path="/register/step2" element={<Register2Screen />} />
        <Route path="/recoveryPass" element={<RecoveryPassScreen />} />
        <Route path="/home" element={<HomeScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
