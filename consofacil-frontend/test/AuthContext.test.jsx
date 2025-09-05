import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { supabase } from '../src/supabaseClient';

jest.mock('../src/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      refreshSession: jest.fn(),
    },
  },
}));

const TestComponent = () => {
  const { login, logout } = useAuth();
  return (
    <div>
      <button onClick={() => login('test@example.com', 'password123')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  it('debe manejar login', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ data: { session: { access_token: 'token', refresh_token: 'refresh' } }, error: null });
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    fireEvent.click(screen.getByText('Login'));
    expect(localStorage.getItem('token')).toBe('token');
    expect(localStorage.getItem('refresh_token')).toBe('refresh');
  });

  it('debe manejar logout', async () => {
    supabase.auth.signOut.mockResolvedValue();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    fireEvent.click(screen.getByText('Logout'));
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });
});