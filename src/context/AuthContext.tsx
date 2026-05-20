import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: string;
  bio?: string;
  location?: string;
  profileColor?: string;
}

interface AuthContextType {
  user: User | null;
  login: (provider: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('polyglot_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (provider: string) => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Guest User',
      email: 'guest@example.com',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
      provider: provider
    };
    
    setUser(mockUser);
    localStorage.setItem('polyglot_user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('polyglot_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('polyglot_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, isLoading }}>
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
