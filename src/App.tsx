import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';

// Layouts & Guards
import { MainLayout } from './layouts/MainLayout';
import { AuthRoute } from './components/AuthRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { Profile } from './pages/Profile';
import { LSBCenter } from './pages/protect/LSBCenter';
import { ProtectedAssetGenerator } from './pages/protect/Generator';
import { VerificationCenter } from './pages/verify/VerificationCenter';
import { PixelDifferenceAnalyzer } from './pages/analyzer/PixelDifferenceAnalyzer';
import { AttackSimulationCenter } from './pages/simulation/AttackSimulationCenter';
import { SecurityLab } from './pages/lab/SecurityLab';

function App() {
  const { initialize, user, isInitialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1a1b26',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
          success: {
            iconTheme: {
              primary: '#00f0ff',
              secondary: '#1a1b26',
            },
          },
        }} 
      />
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            
            {/* Public Auth Routes */}
            <Route path="auth/login" element={isInitialized && user ? <Navigate to="/protect" replace /> : <Login />} />
            <Route path="auth/register" element={isInitialized && user ? <Navigate to="/protect" replace /> : <Register />} />
            <Route path="auth/forgot-password" element={<ForgotPassword />} />
            <Route path="auth/reset-password" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route element={<AuthRoute />}>
              <Route path="profile" element={<Profile />} />
              <Route path="protect" element={<ProtectedAssetGenerator />} />
              <Route path="verify" element={<VerificationCenter />} />
              <Route path="analyzer" element={<PixelDifferenceAnalyzer />} />
              <Route path="simulation" element={<AttackSimulationCenter />} />
              <Route path="visualizer/lsb" element={<LSBCenter />} />
              <Route path="lab" element={<SecurityLab />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
