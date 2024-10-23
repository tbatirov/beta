import React, { createContext, useState, useContext, useEffect } from 'react';
import { logger } from '../utils/logger';
import { LogLevel } from '../types/logging';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simulated user database with secure password storage
const users: { [email: string]: { id: string; name: string; password: string } } = {};

const SESSION_TIMEOUT = 3600000; // 1 hour

// Simple hash function for demo purposes - in production use a proper crypto library
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  const hashedInput = await hashPassword(password);
  return hashedInput === hashedPassword;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionTimer, setSessionTimer] = useState<number>();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
      resetSessionTimer();
    }
    setLoading(false);

    return () => {
      if (sessionTimer) {
        window.clearTimeout(sessionTimer);
      }
    };
  }, []);

  const resetSessionTimer = () => {
    if (sessionTimer) {
      window.clearTimeout(sessionTimer);
    }
    const timer = window.setTimeout(() => {
      logout();
    }, SESSION_TIMEOUT);
    setSessionTimer(timer);
  };

  const login = async (email: string, password: string) => {
    try {
      const userRecord = users[email];
      if (!userRecord) {
        throw new Error('Invalid email or password');
      }

      const isValid = await verifyPassword(password, userRecord.password);
      if (!isValid) {
        throw new Error('Invalid email or password');
      }

      const authenticatedUser = { id: userRecord.id, name: userRecord.name, email };
      setIsAuthenticated(true);
      setUser(authenticatedUser);
      
      // Generate a simple token - in production use JWT
      const token = btoa(JSON.stringify({ userId: userRecord.id, timestamp: Date.now() }));
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
      resetSessionTimer();
      
      logger.log(LogLevel.INFO, 'User logged in successfully', { email });
    } catch (error) {
      logger.log(LogLevel.ERROR, 'Login failed', { error });
      throw error;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (sessionTimer) {
      window.clearTimeout(sessionTimer);
    }
    logger.log(LogLevel.INFO, 'User logged out');
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      if (users[email]) {
        throw new Error('Email already registered');
      }

      const hashedPassword = await hashPassword(password);
      const newUser = { id: Date.now().toString(), name, password: hashedPassword };
      users[email] = newUser;
      await login(email, password);
      logger.log(LogLevel.INFO, 'User registered successfully', { email });
    } catch (error) {
      logger.log(LogLevel.ERROR, 'Registration failed', { error });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};