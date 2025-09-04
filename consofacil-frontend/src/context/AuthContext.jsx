import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refresh_token'));

  const login = (newToken, newRefreshToken) => {
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    localStorage.setItem('token', newToken);
    localStorage.setItem('refresh_token', newRefreshToken);
  };

  const logout = () => {
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  };

  const refresh = async () => {
    if (refreshToken) {
      try {
        const response = await fetch('http://localhost:3000/api/auth/refresh', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${refreshToken}` },
        });
        const data = await response.json();
        if (response.ok) login(data.token, refreshToken);
      } catch (err) {
        logout();
      }
    }
  };

  useEffect(() => {
    if (refreshToken) refresh();
  }, [refreshToken]);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;