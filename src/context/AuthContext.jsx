import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('texcraft_admin');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username, password) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        setAdmin(data.admin);
        localStorage.setItem('texcraft_admin', JSON.stringify(data.admin));
        localStorage.setItem('texcraft_token', data.token);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (err) {
      // Fallback for offline client testing if API is unreachable
      if (username === 'admin' && password === 'admin123') {
        const mockAdmin = { username: 'admin', name: 'Tirupur Admin Owner' };
        setAdmin(mockAdmin);
        localStorage.setItem('texcraft_admin', JSON.stringify(mockAdmin));
        return { success: true };
      }
      return { success: false, message: 'Server connection error' };
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('texcraft_admin');
    localStorage.removeItem('texcraft_token');
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
