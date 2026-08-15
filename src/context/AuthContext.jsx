import { createContext, useState, useContext, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('adminToken') || null);

  const login = useCallback((t) => {
    sessionStorage.setItem('adminToken', t);
    setToken(t);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('adminToken');
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
