'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from '@/axiosConfig';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import User from '@/interfaces/user.interface';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, username: string, firstName: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize state with session storage data if available
    const userJson = sessionStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  });

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      if (!user) {
        try {
          axios.get('/auth/me').then((response) => {
            const userData = response.data.user;
            setUser(userData);
            // Store user in session storage
            sessionStorage.setItem('user', JSON.stringify(userData));
          }).catch((error: AxiosError) => {
              // if not 403 error, print
              if (error.response?.status !== 403) {
                console.error('No user logged in:', error);
              }
          });
        } catch (error) {
          console.error('No user logged in:', error);
        }
      }
    };
    checkUser();
  }, [user]);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const userData = response.data.user;
      setUser(userData);

      // Store user in session storage
      sessionStorage.setItem('user', JSON.stringify(userData));

      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, username: string, firstName: string): Promise<User> => {
    try {
      const response = await axios.post('/auth/register', {
        email,
        password,
        username,
        first_name: firstName,
      });
      const userData = response.data.user;
      setUser(userData);

      return userData;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
      setUser(null);
      sessionStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
