import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Restore only a previously authenticated session. New visitors stay signed out.
  useEffect(() => {
    async function loadAuth() {
      try {
        const res = await api.getDemoUsers();
        if (res.success && res.users) {
          setDemoUsers(res.users);
          
          const savedUserId = localStorage.getItem('bridge_user_id');
          const savedToken = localStorage.getItem('bridge_access_token');
          if (savedUserId && savedToken) {
            try {
              const profile = await api.getUser(savedUserId);
              if (profile.success) {
                setUser(profile.user);
                setLoading(false);
                return;
              }
            } catch {
              localStorage.removeItem('bridge_access_token');
              localStorage.removeItem('bridge_user_id');
            }
          }

        }
      } catch (err) {
        console.error('Failed to load demo users', err);
      } finally {
        setLoading(false);
      }
    }
    loadAuth();
  }, []);

  const switchRole = async (newRole) => {
    const targetUser = demoUsers.find(u => u.role === newRole);
    if (targetUser) {
      const res = await api.login({ email: targetUser.email });
      setUser(res.user);
      localStorage.setItem('bridge_user_id', res.user._id);
      localStorage.setItem('bridge_access_token', res.token);
    }
  };

  const loginUser = (userData, token) => {
    setUser(userData);
    localStorage.setItem('bridge_user_id', userData._id);
    if (token) localStorage.setItem('bridge_access_token', token);
  };

  const logout = async () => {
    try { await api.logout(); } catch {}
    setUser(null);
    localStorage.removeItem('bridge_user_id');
    localStorage.removeItem('bridge_access_token');
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
        role: user?.role || null,
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
