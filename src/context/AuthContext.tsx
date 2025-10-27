import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  avatar?: string;
  authProvider?: 'local' | 'google';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  googleLogin: (googleUser: User) => void;
  googleSignup: (googleUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Mock users
const createMockUsers = (): User[] => [
  {
    id: '1',
    email: 'admin@nexora.io',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    authProvider: 'local',
  },
  {
    id: '2',
    email: 'user@nexora.io',
    firstName: 'Normal',
    lastName: 'User',
    role: 'user',
    authProvider: 'local',
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mockUsers, setMockUsers] = useState<User[]>(createMockUsers);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const login = async (email: string, password: string) => {
    const foundUser = mockUsers.find(u => u.email === email && u.authProvider === 'local');
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Signup failed");

    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  // ✅ Google login (checks existing accounts)
  const googleLogin = (googleUser: User) => {
    const existingUser = mockUsers.find(u => u.email === googleUser.email && u.authProvider === 'google');
    if (!existingUser) {
      throw new Error('No account found. Please sign up first.');
    }
    setUser(existingUser);
    localStorage.setItem('user', JSON.stringify(existingUser));
  };

  // ✅ Google signup (creates new account if not exists)
  const googleSignup = (googleUser: User) => {
    const exists = mockUsers.find(u => u.email === googleUser.email);
    if (exists) throw new Error('Account already exists. Please log in.');

    const newUser: User = {
      ...googleUser,
      id: Date.now().toString(),
      role: 'user',
      authProvider: 'google',
    };

    setMockUsers(prev => [...prev, newUser]);
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);

    setMockUsers(prev => prev.map(u => (u.id === user.id ? updatedUser : u)));
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, updateProfile, googleLogin, googleSignup }}
    >
      {children}
    </AuthContext.Provider>
  );
};
