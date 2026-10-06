import { createContext, useState, useEffect, type ReactNode } from 'react';
import { ApiError, getCurrentUser, loginUser, logoutUser, registerUser, type ApiUser } from '../services/api';

export type User = ApiUser;

interface AuthResult {
  success: boolean;
  message: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  authError: string;
  login: (identifier: string, password: string) => Promise<AuthResult>;
  signup: (name: string, email: string, password: string, username?: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'The authentication request failed.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (!(error instanceof ApiError) || error.status !== 401) {
          setAuthError(errorMessage(error));
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (identifier: string, password: string): Promise<AuthResult> => {
    try {
      const result = await loginUser({ identifier, password });
      setUser(result.user);
      setAuthError('');
      return { success: true, message: 'Welcome back!' };
    } catch (error) {
      return { success: false, message: errorMessage(error) };
    }
  };

  const signup = async (name: string, email: string, password: string, username?: string): Promise<AuthResult> => {
    try {
      const result = await registerUser({ name, email, password, ...(username ? { username } : {}) });
      setUser(result.user);
      setAuthError('');
      return { success: true, message: 'Account created successfully!' };
    } catch (error) {
      return { success: false, message: errorMessage(error) };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setAuthError('');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        authError,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
