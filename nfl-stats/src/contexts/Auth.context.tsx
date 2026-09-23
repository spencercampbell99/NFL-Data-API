'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import axios from '@/axiosConfig';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import User from '@/interfaces/user.interface';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: ({ email, password, username, firstName }: { email: string; password: string; username: string; firstName: string }) => Promise<void>;
  logout: () => void;
  me: () => Promise<User>;
  checkUser: (reload?: boolean) => Promise<void>;
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
  const authRequestRef = useRef(0);

  const router = useRouter();

  const checkUser = async (_reload = true) => {
    const requestId = ++authRequestRef.current;

    try {
      const response = await axios.get('/auth/me');
      const token = response.data.token;

      if (requestId !== authRequestRef.current) {
        return;
      }

      sessionStorage.setItem('token', token);
      setUser(jwtDecode<User>(token));
    } catch (error) {
      if (requestId !== authRequestRef.current) {
        return;
      }

      sessionStorage.removeItem('token');
      setUser(null);
      console.error('Check user error:', error);
    } finally {
      if (requestId === authRequestRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    checkUser(true);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    ++authRequestRef.current;

    try {
      const response = await axios.post('/auth/login', { email, password });
      const token = response.data.token;
      sessionStorage.setItem('token', token);
      const decodedUser = jwtDecode<User>(token);
      setUser(decodedUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ email, password, username, firstName }: { email: string; password: string; username: string; firstName: string }): Promise<void> => {
    ++authRequestRef.current;

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
    } finally {
      setLoading(false);
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
    <AuthContext.Provider value={{ user, loading, login, register, logout, me, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};