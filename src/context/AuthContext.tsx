import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile, FacultyProfile, UserRole } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from './ToastContext.tsx';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | FacultyProfile | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (studentData: any) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | FacultyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const loadCurrentUser = async () => {
    try {
      setIsLoading(true);
      const res = await api.getMe();
      if (res.user) {
        setUser(res.user);
        setProfile(res.profile);
      }
    } catch (err) {
      console.warn('Initial session fetch failed, falling back to default student:', err);
      // Fallback switch to Alex Chen
      try {
        const demo = await api.switchDemo('STUDENT');
        setUser(demo.user);
        setProfile(demo.profile);
      } catch (e) {
        console.error('Fallback demo switch failed:', e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const res = await api.login(credentials);
      setUser(res.user);
      setProfile(res.profile);
      showToast(`Welcome back, ${res.user.name}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (studentData: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(studentData);
      setUser(res.user);
      setProfile(res.profile);
      showToast(`Account created! Welcome to EduPulse, ${res.user.name}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      setProfile(null);
      showToast('Logged out successfully', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const switchDemoRole = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const res = await api.switchDemo(role);
      setUser(res.user);
      setProfile(res.profile);
      showToast(`Switched view to ${res.user.name} (${res.user.role})`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Error switching demo account', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
        refreshUser: loadCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
