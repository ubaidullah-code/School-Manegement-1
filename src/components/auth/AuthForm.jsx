import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { School, User, BookOpen } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { InputLabel, MenuItem, Select } from '@mui/material';

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
  const [selectedValue, setSelectedValue] = useState("");

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const { signIn, signUp, loading, error: authError } = useAuthStore();

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

        const userData = { name, class: role === "student" ? selectedValue : null };
        await signUp(email, password, role, userData);

        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-indigo-900 p-4">
      <div className="w-full max-w-md bg-gray-900 border border-indigo-500 shadow-md bg-opacity-90 backdrop-blur-sm rounded-xl overflow-hidden">
        <div className="p-8">
          <h2 ref={titleRef} className="text-3xl font-bold text-center text-gray-100 mb-6">
            {isLogin ? 'Welcome Back' : 'Join Us'}
          </h2>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-transparent border border-gray-500 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Full Name"
                />
              </div>
            )}
            <div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-transparent border border-gray-500 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Email Address"
                required
              />
            </div>
            <div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-transparent border border-gray-500 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Password"
                required
              />
            </div>
            {!isLogin && (
              <div className="p-4 bg-gray-800 rounded-lg">
                <label className="block text-lg font-semibold text-gray-300 text-center mb-4">Select Your Role</label>
                <div className="grid grid-cols-3 gap-3">
                  {['student', 'teacher', 'admin'].map((roleType) => (
                    <button
                      key={roleType}
                      type="button"
                      onClick={() => setRole(roleType)}
                      className={`flex flex-col items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-all ${
                        role === roleType
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600'
                      }`}
                    >
                      {getRoleIcon(roleType)}
                      <span className="mt-1 capitalize">{roleType}</span>
                    </button>
                  ))}
                </div>
                {role === "student" && (
                  <div className="mt-4">
                    <InputLabel className="text-gray-300">Select the Class</InputLabel>
                    <Select
                      value={selectedValue}
                      onChange={handleChange}
                      className="w-full bg-gray-700 text-white border-gray-600"
                    >
                      {Array.from({ length: 10 }, (_, i) => (
                        <MenuItem key={i + 1} value={`Class ${i + 1}`}>
                          Class {i + 1}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                )}
              </div>
            )}
            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium focus:outline-none w-full text-center"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
