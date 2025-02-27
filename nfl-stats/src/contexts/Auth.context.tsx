'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from '@/axiosConfig';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import User from '@/interfaces/user.interface';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string, firstName: string) => Promise<void>;
  logout: () => void;
  me: () => Promise<User>;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const token = sessionStorage.getItem('token');
      if (token) {
        try {
          const decodedUser = jwtDecode<User>(token);
          setUser(decodedUser);
        } catch (error) {
          console.error('Invalid token:', error);
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const token = response.data.token;
      sessionStorage.setItem('token', token);
      const decodedUser = jwtDecode<User>(token);
      setUser(decodedUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, username: string, firstName: string): Promise<void> => {
    try {
      const response = await axios.post('/auth/register', {
        email,
        password,
        username,
        first_name: firstName,
      });
      const token = response.data.token;
      sessionStorage.setItem('token', token);
      const decodedUser = jwtDecode<User>(token);
      setUser(decodedUser);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
      setUser(null);
      sessionStorage.removeItem('token');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const me = async () => {
    try {
      const response = await axios.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Me error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, me }}>
      {children}
    </AuthContext.Provider>
  );
};