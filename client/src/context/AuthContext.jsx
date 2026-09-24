import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on first load
  useEffect(() => {
    const storedToken = localStorage.getItem('cwms_token');
    const storedUser = localStorage.getItem('cwms_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse cached user:', err);
        localStorage.removeItem('cwms_token');
        localStorage.removeItem('cwms_user');
      }
    }
    setLoading(false);
  }, []);

  // Login handler with role support
  const login = async (email, password, role = 'STUDENT', otp = '') => {
    const result = await authService.login(email, password, role, otp);
    if (result.success && result.data) {
      const { user: userData, token: jwtToken } = result.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('cwms_token', jwtToken);
      localStorage.setItem('cwms_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(result.message || 'Login failed');
  };

  // Google Sign-In handler
  const googleLogin = async (credential, role = 'STUDENT') => {
    const result = await authService.googleLogin(credential, role);
    if (result.success && result.data) {
      const { user: userData, token: jwtToken } = result.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('cwms_token', jwtToken);
      localStorage.setItem('cwms_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(result.message || 'Google authentication failed');
  };

  // Register handler
  const register = async (formData) => {
    const result = await authService.register(formData);
    if (result.success && result.data) {
      const { user: userData, token: jwtToken } = result.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('cwms_token', jwtToken);
      localStorage.setItem('cwms_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(result.message || 'Registration failed');
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cwms_token');
    localStorage.removeItem('cwms_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        role: user ? user.role : null,
        login,
        googleLogin,
        register,
        logout
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
