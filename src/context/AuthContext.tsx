import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/initialData';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (identifier: string, role: UserRole) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  allUsers: User[];
  register: (user: Omit<User, 'user_id' | 'created_at' | 'status_akun'>) => User;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'kd_active_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    // Default to Pak Budi (Guru) for immediate exploration
    return INITIAL_USERS[0];
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const stateRaw = localStorage.getItem('kd_full_state_v1');
      if (stateRaw) {
        const parsed = JSON.parse(stateRaw);
        if (parsed.Users && parsed.Users.length > 0) return parsed.Users;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_USERS;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  const login = (identifier: string, targetRole: UserRole): boolean => {
    const cleanId = identifier.trim().toLowerCase();
    const found = allUsers.find(
      u => (u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId) && u.role === targetRole
    );

    if (found) {
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    const target = allUsers.find(u => u.user_id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  const register = (data: Omit<User, 'user_id' | 'created_at' | 'status_akun'>): User => {
    const newUser: User = {
      ...data,
      user_id: `USR_${data.role}_${Date.now().toString(36).toUpperCase()}`,
      created_at: new Date().toISOString(),
      status_akun: 'aktif'
    };

    const updated = [...allUsers, newUser];
    setAllUsers(updated);
    setCurrentUser(newUser);

    // Also persist into state
    try {
      const stateRaw = localStorage.getItem('kd_full_state_v1');
      if (stateRaw) {
        const state = JSON.parse(stateRaw);
        state.Users = updated;
        localStorage.setItem('kd_full_state_v1', JSON.stringify(state));
      }
    } catch (e) {}

    return newUser;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        role: currentUser ? currentUser.role : null,
        login,
        logout,
        switchUser,
        allUsers,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
