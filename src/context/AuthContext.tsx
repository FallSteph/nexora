import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  googleLogin: (googleUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Mock users - moved inside component to make it reactive
const createMockUsers = (): User[] => [
  {
    id: '1',
    email: 'admin@nexora.io',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
  },
  {
    id: '2',
    email: 'user@nexora.io',
    firstName: 'Normal',
    lastName: 'User',
    role: 'user',
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mockUsers, setMockUsers] = useState<User[]>(createMockUsers);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);


  const login = async (email: string, password: string) => {
    // Find user in the reactive mockUsers array
    const foundUser = mockUsers.find((u) => u.email === email);
    if (foundUser) {
      setUser(foundUser);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  // ✅ Google Login Handler
  const googleLogin = (googleUser: User) => {
    setUser(googleUser);
    localStorage.setItem("user", JSON.stringify(googleUser));
  };


  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      email,
      firstName,
      lastName,
      role: 'user',
    };
    // Update the reactive mockUsers array
    setMockUsers(prev => [...prev, newUser]);
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      // Also update the user in mockUsers array to persist changes
      setMockUsers(prev => 
        prev.map(u => u.id === user.id ? updatedUser : u)
      );
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};