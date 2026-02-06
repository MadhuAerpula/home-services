import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Services from '@/pages/Services';
import ServiceDetail from '@/pages/ServiceDetail';
import BookingForm from '@/pages/BookingForm';
import CustomerDashboard from '@/pages/CustomerDashboard';
import ProfessionalDashboard from '@/pages/ProfessionalDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import Profile from '@/pages/Profile';
import AuthCallback from '@/pages/AuthCallback';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/sonner';
import '@/App.css';

function AppRouter() {
  const location = useLocation();
  
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/services" element={<Services />} />
      <Route path="/services/:categoryId" element={<ServiceDetail />} />
      <Route path="/book/:categoryId" element={<ProtectedRoute><BookingForm /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/dashboard/customer" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/professional" element={<ProtectedRoute><ProfessionalDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
        <Toaster position="top-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;