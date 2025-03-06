import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { School, User, BookOpen } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import LoginScene from '../three/LoginScene';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const formRef = useRef(null);
  const titleRef = useRef(null);
  const navigate = useNavigate();
  
  const { signIn, signUp, loading, error: authError } = useAuthStore();
  
  // GSAP animations
  useEffect(() => {
    if (formRef.current && titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );
      
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.3 }
      );
    }
  }, [isLogin]);
  
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        await signIn(email, password);
        navigate('/dashboard');
      } else {
        if (!name.trim()) {
          setError('Name is required');
          return;
        }
        
        const userData = { name };
        await signUp(email, password, role, userData);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
  };
  
  const toggleForm = () => {
    // Reset form fields
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    
    // Toggle form type with animation
    gsap.to(formRef.current, {
      opacity: 0,
      y: 50,
      duration: 0.5,
      onComplete: () => {
        setIsLogin(!isLogin);
      }
    });
  };
  
  const getRoleIcon = (roleType) => {
    switch (roleType) {
      case 'admin':
        return <School className="h-5 w-5" />;
      case 'teacher':
        return <BookOpen className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900 p-4">
      <LoginScene />
      
      <div className="w-full max-w-md bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden z-10">
        <div className="p-8">
          <h2 ref={titleRef} className="text-3xl font-bold text-center text-gray-800 mb-6">
            {isLogin ? 'Welcome Back' : 'Join Us'}
          </h2>
          
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your full name"
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your password"
                required
              />
            </div>
            
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Role
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['student', 'teacher', 'admin'].map((roleType) => (
                    <button
                      key={roleType}
                      type="button"
                      onClick={() => setRole(roleType)}
                      className={`flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none transition-all ${
                        role === roleType
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {getRoleIcon(roleType)}
                      <span className="ml-2 capitalize">{roleType}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {error && (
              <div className="text-red-500 text-sm font-medium">{error}</div>
            )}
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={toggleForm}
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium focus:outline-none"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;