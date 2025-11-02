import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const checkAuth = async () => {
    const authenticated = await AuthService.isAuthenticated();
    const userData = await AuthService.getCurrentUser();
    setIsAuthenticated(authenticated && userData !== null);
    setUser(userData);
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username, password) => {
    const response = await AuthService.login(username, password);
    setIsAuthenticated(true);
    setUser(response.user);
    return response;
  };

  const logout = async () => {
    await AuthService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
