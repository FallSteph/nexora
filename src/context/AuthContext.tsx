  import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
  import { toast } from 'sonner'; // make sure you import toast

  export interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'user';
    avatar?: string | File;
    authProvider?: 'local' | 'google';
  }

  interface AuthContextType {
    user: User | null;
    users: User[];
    login: (email: string, password: string, recaptchaToken?: string) => Promise<void>;
    signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
    logout: () => void;
    updateProfile: (updates: FormData | Partial<User>) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    googleLogin: (googleUser: User) => void;
    googleSignup: (googleUser: User) => void;
  }

  const AuthContext = createContext<AuthContextType | undefined>(undefined);

  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
  };

  const createMockUsers = (): User[] => [
    {
      _id: '1',
      email: 'admin@nexora.io',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      authProvider: 'local',
    },
    {
      _id: '2',
      email: 'user@nexora.io',
      firstName: 'Normal',
      lastName: 'User',
      role: 'user',
      authProvider: 'local',
    },
  ];

  export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [mockUsers, setMockUsers] = useState<User[]>(createMockUsers);

    useEffect(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    // Login
    const login = async (email: string, password: string, recaptchaToken?: string) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, recaptchaToken }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid credentials");

      setUser(data.user);
      setUsers(prev => [...prev, data.user]); // ✅ add new user to all users
      localStorage.setItem("user", JSON.stringify(data.user));
    };

    // Signup
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

    // Google login
    const googleLogin = (googleUser: User) => {
      setUser(googleUser);
      localStorage.setItem('user', JSON.stringify(googleUser));
    };

    const googleSignup = (googleUser: User) => {
      const exists = mockUsers.find(u => u.email === googleUser.email);
      if (exists) throw new Error('Account already exists. Please log in.');

      const newUser: User = {
        ...googleUser,
        
        _id: Date.now().toString(),
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

    // ✅ Unified updateProfile (async, saves to backend)
const updateProfile = async (updates: FormData | Partial<User>) => {
  if (!user) return;

  const isFormData = updates instanceof FormData;

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/users/update-profile/${user._id}`,
    {
      method: "PUT",
      body: isFormData ? updates : JSON.stringify(updates),
      headers: isFormData ? undefined : { "Content-Type": "application/json" },
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update profile");

  setUser(data.user);
  localStorage.setItem("user", JSON.stringify(data.user));
  toast.success("Profile updated ✨");
};

const changePassword = async (currentPassword: string, newPassword: string) => {
  if (!user) throw new Error("No user logged in");

  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/change-password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user._id,
      currentPassword,
      newPassword,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to change password");

  return data;
};


    return (
      <AuthContext.Provider
        value={{ user, users, login, signup, logout, updateProfile, changePassword, googleLogin, googleSignup }}
      >
        {children}
      </AuthContext.Provider>
    );
  };
