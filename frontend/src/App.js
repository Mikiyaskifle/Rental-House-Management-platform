import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import './i18n';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/HomeEnhanced';
import Dashboard from './pages/Dashboard';
import HouseDetails from './pages/HouseDetails';
import AddHouse from './pages/AddHouse';
import EditHouse from './pages/EditHouse';
import RentalRequests from './pages/RentalRequests';
import RentalHistoryWithTerminate from './pages/RentalHistoryWithTerminate';
import ManageProperties from './pages/ManageProperties';
import UpdateAccount from './pages/UpdateAccount';
import RatingSystem from './pages/RatingSystem';
import AdminPanelSidebar from './pages/AdminPanelSidebar';
import AdminVerification from './pages/AdminVerification';
import Profile from './pages/Profile';

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/house/:id" element={<HouseDetails />} />
          <Route path="/add-house" element={<ProtectedRoute requiredRole="landlord"><AddHouse /></ProtectedRoute>} />
          <Route path="/edit-house/:id" element={<ProtectedRoute requiredRole="landlord"><EditHouse /></ProtectedRoute>} />
          <Route path="/rental-requests" element={<ProtectedRoute><RentalRequests /></ProtectedRoute>} />
          <Route path="/rental-history" element={<ProtectedRoute><RentalHistoryWithTerminate /></ProtectedRoute>} />
          <Route path="/manage-properties" element={<ProtectedRoute requiredRole="landlord"><ManageProperties /></ProtectedRoute>} />
          <Route path="/update-account" element={<ProtectedRoute><UpdateAccount /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/rating-system" element={<ProtectedRoute requiredRole="tenant"><RatingSystem /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPanelSidebar /></ProtectedRoute>} />
          <Route path="/admin/verification" element={<ProtectedRoute requiredRole="admin"><AdminVerification /></ProtectedRoute>} />
        </Routes>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router future={{
          v7_relativeSplatPath: true
        }}>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
