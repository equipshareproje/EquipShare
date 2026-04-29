import React, { createContext, useState, useEffect, useCallback } from 'react';
import authApi from '../api/auth';
import { setAccessToken, setLogoutHandler } from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch (_) { /* best-effort */ }
    setAccessToken(null);
    setUser(null);
  }, []);

  // Register the logout handler so the Axios interceptor can call it on
  // failed token refresh (avoids a circular import from client.js)
  useEffect(() => {
    setLogoutHandler(logout);
  }, [logout]);

  // ── Session restore on mount ──────────────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      try {
        // The HttpOnly refresh-token cookie is sent automatically
        const refreshRes = await authApi.refresh();
        setAccessToken(refreshRes.data.data.accessToken);

        const meRes = await authApi.me();
        const apiUser = meRes.data.data;
        // Normalize role to lowercase so existing role checks keep working
        setUser({ ...apiUser, role: apiUser.role?.toLowerCase() });
      } catch (_) {
        // No valid session — user stays null
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  // ── Sign up ───────────────────────────────────────────────────────────────
  const signup = useCallback(async (userData) => {
    const res = await authApi.register({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
    });
    // Registration succeeds → backend sends a verification email.
    // The user must verify before they can log in.
    return res.data;
  }, []);

  // ── Sign in ───────────────────────────────────────────────────────────────
  const signin = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    const { accessToken: token } = res.data.data;
    setAccessToken(token);
    // Always fetch /me after login so we get the full, authoritative user object
    // (the login response may not include the user body in all backend versions)
    const meRes = await authApi.me();
    const apiUser = meRes.data.data;
    const normalized = { ...apiUser, role: apiUser.role?.toLowerCase() };
    setUser(normalized);
    return normalized;
  }, []);

  // ── Update local user object (e.g. after profile edit) ───────────────────
  const updateUser = useCallback((updatedData) => {
    setUser((prev) => prev ? { ...prev, ...updatedData } : prev);
  }, []);

  const value = { user, loading, signup, signin, logout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
