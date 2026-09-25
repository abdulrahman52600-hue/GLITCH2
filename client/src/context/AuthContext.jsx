import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize and load default demo user
  useEffect(() => {
    async function loadAuth() {
      try {
        const res = await api.getDemoUsers();
        if (res.success && res.users) {
          setDemoUsers(res.users);
          
          const savedUserId = localStorage.getItem('bridge_user_id');
          if (savedUserId) {
            const found = res.users.find(u => u._id === savedUserId);
            if (found) {
              setUser(found);
              setLoading(false);
              return;
            }
          }

          // Default to Zubair Khan (Student)
          const defaultStudent = res.users.find(u => u.role === 'student') || res.users[0];
          setUser(defaultStudent);
        }
      } catch (err) {
        console.error('Failed to load demo users', err);
      } finally {
        setLoading(false);
      }
    }
    loadAuth();
  }, []);

  const switchRole = (newRole) => {
    const targetUser = demoUsers.find(u => u.role === newRole);
    if (targetUser) {
      setUser(targetUser);
      localStorage.setItem('bridge_user_id', targetUser._id);
    }
  };

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem('bridge_user_id', userData._id);
  };

  const logout = () => {
    // Reset to student Zubair Khan for smooth demo experience
    const defaultStudent = demoUsers.find(u => u.role === 'student');
    if (defaultStudent) {
      setUser(defaultStudent);
      localStorage.setItem('bridge_user_id', defaultStudent._id);
    } else {
      setUser(null);
      localStorage.removeItem('bridge_user_id');
    }
  };

  const updateUserProfile = async (updatedData) => {
    if (!user) return;
    try {
      const res = await api.updateProfile(user._id, updatedData);
      if (res.success && res.user) {
        setUser(res.user);
        // also update in demoUsers cache
        setDemoUsers(prev => prev.map(u => u._id === res.user._id ? res.user : u));
        return res.user;
      }
    } catch (err) {
      console.error('Failed to update profile', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'student',
        demoUsers,
        loading,
        switchRole,
        loginUser,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
