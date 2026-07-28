import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setAuthToken, getAuthToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      setUser(data);
    } catch {
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (matric_number, password) => {
    const result = await api.login({ matric_number, password });
    if (result.requires_2fa) {
      return { step: '2fa', user_id: result.user_id };
    }
    setAuthToken(result.accessToken);
    setUser(result.user);
    return { step: 'done' };
  };

  const verify2fa = async (user_id, otp) => {
    const result = await api.verifyLoginOtp({ user_id, otp });
    setAuthToken(result.accessToken);
    setUser(result.user);
    return result;
  };

  const register = async (data) => {
    return await api.register(data);
  };

  const verifyOtp = async (data) => {
    const result = await api.verifyOtp(data);
    setAuthToken(result.accessToken);
    setUser(result.user);
    return result;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isAdmin = () => hasRole('super_admin', 'electo');

  return (
    <AuthContext.Provider value={{
      user, loading, login, verify2fa, register, verifyOtp, logout, hasRole, isAdmin, loadUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
