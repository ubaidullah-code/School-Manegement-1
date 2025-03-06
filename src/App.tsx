import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthForm from './components/auth/AuthForm';
import AdminDashboard from './components/dashboard/AdminDashboard';
import TeacherDashboard from './components/dashboard/TeacherDashboard';
import StudentDashboard from './components/dashboard/StudentDashboard';
import useAuthStore from './store/authStore';

function App() {
  const { user, userRole, loading, init } = useAuthStore();
  
  useEffect(() => {
    // Initialize auth state listener
    const unsubscribe = init();
    
    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [init]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <AuthForm /> : <Navigate to="/dashboard" />} />
        <Route 
          path="/dashboard" 
          element={
            user ? (
              userRole === 'admin' ? (
                <AdminDashboard />
              ) : userRole === 'teacher' ? (
                <TeacherDashboard />
              ) : (
                <StudentDashboard />
              )
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;