import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthContextType } from '../types';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('docspot_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call
      const users = JSON.parse(localStorage.getItem('docspot_users') || '[]');
      const foundUser = users.find((u: User) => u.email === email);
      
      if (foundUser) {
        // In a real app, you'd verify the password hash
        setUser(foundUser);
        localStorage.setItem('docspot_user', JSON.stringify(foundUser));
        toast.success(`Welcome back, ${foundUser.name}!`);
        return true;
      } else {
        toast.error('Invalid email or password');
        return false;
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const users = JSON.parse(localStorage.getItem('docspot_users') || '[]');
      
      // Check if user already exists
      if (users.find((u: User) => u.email === userData.email)) {
        toast.error('User with this email already exists');
        return false;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || 'patient',
        phone: userData.phone,
        specialization: userData.specialization,
        experience: userData.experience,
        education: userData.education,
        isApproved: userData.role === 'doctor' ? false : true,
        createdAt: new Date(),
        ...userData
      };

      users.push(newUser);
      localStorage.setItem('docspot_users', JSON.stringify(users));
      
      if (userData.role === 'doctor') {
        toast.success('Registration successful! Please wait for admin approval.');
      } else {
        setUser(newUser);
        localStorage.setItem('docspot_user', JSON.stringify(newUser));
        toast.success('Registration successful!');
      }
      
      return true;
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('docspot_user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};