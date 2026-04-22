import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';
import { normalizeUser } from '../utils';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('mv_token');
    if (!stored) { setLoading(false); return; }
    api.getMe()
      .then(u => { setToken(stored); setUser(normalizeUser(u)); })
      .catch(() => { localStorage.removeItem('mv_token'); })
      .finally(() => setLoading(false));
  }, []);

  const login = (tok) => {
    localStorage.setItem('mv_token', tok);
    setToken(tok);
    return api.getMe().then(u => {
      const n = normalizeUser(u);
      setUser(n);
      return n;
    });
  };

  const logout = () => {
    localStorage.removeItem('mv_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = () =>
    api.getMe().then(u => { const n = normalizeUser(u); setUser(n); return n; });

  return (
    <AuthCtx.Provider value={{ user, token, login, logout, refreshUser, loading }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
