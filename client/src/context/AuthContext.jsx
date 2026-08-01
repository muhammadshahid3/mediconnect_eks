import { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'doctor' | 'patient'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('mc_user');
    const token = localStorage.getItem('mc_token');
    if (storedUser && token) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setRole(parsed.role);
    }
    setLoading(false);
  }, []);

  const login = useCallback((token, userData) => {
    localStorage.setItem('mc_token', token);
    localStorage.setItem('mc_user', JSON.stringify(userData));
    setUser(userData);
    setRole(userData.role);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('mc_token');
    localStorage.removeItem('mc_user');
    setUser(null);
    setRole(null);
  }, []);

  const updateUser = useCallback((partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem('mc_user', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
