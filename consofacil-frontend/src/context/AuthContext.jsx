import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refresh_token'));

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setToken(data.session.access_token);
    setRefreshToken(data.session.refresh_token);
    localStorage.setItem('token', data.session.access_token);
    localStorage.setItem('refresh_token', data.session.refresh_token);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  };

  const refresh = async () => {
    if (refreshToken) {
      const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
      if (error) {
        logout();
      } else {
        setToken(data.session.access_token);
        setRefreshToken(data.session.refresh_token);
        localStorage.setItem('token', data.session.access_token);
        localStorage.setItem('refresh_token', data.session.refresh_token);
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