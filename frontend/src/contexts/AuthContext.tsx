import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../types";
import { authService } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (full_name: string, email: string, phone: string, password: string) => Promise<User>;
  logout: () => void;
  demoLogin: (role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("smart_city_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("smart_city_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const freshUser = await authService.getMe();
          setUser(freshUser);
          localStorage.setItem("smart_city_user", JSON.stringify(freshUser));
        } catch {
          // Token might be expired
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const data = await authService.login(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("smart_city_token", data.token);
    localStorage.setItem("smart_city_user", JSON.stringify(data.user));
    return data.user;
  };

  const register = async (full_name: string, email: string, phone: string, password: string): Promise<User> => {
    const data = await authService.register(full_name, email, phone, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("smart_city_token", data.token);
    localStorage.setItem("smart_city_user", JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("smart_city_token");
    localStorage.removeItem("smart_city_user");
  };

  const demoLogin = async (role: UserRole) => {
    let email = "citizen@smartcity.gov.in";
    if (role === "official") email = "official@smartcity.gov.in";
    if (role === "admin") email = "admin@smartcity.gov.in";

    await login(email, "password123");
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const freshUser = await authService.getMe();
      setUser(freshUser);
      localStorage.setItem("smart_city_user", JSON.stringify(freshUser));
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        demoLogin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};