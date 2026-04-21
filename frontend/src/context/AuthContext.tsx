import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { authAPI } from "../api/client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile on mount
  useEffect(() => {
    verifySessionOnMount();
  }, []);

  const verifySessionOnMount = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.getProfile();
      setUser(response.data.user || response.data);
    } catch (error: any) {
      // Silently fail on mount - let user log in fresh if needed
      // Don't set user to null yet, let the page decide
      console.log("No valid session found");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.getProfile();
      setUser(response.data.user || response.data);
    } catch (error: any) {
      console.error("Failed to fetch user profile:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      setUser(response.data.user);
      // Refresh user after login to ensure token is set
      await fetchUser();
    } catch (error: any) {
      console.error("Login error:", error);
      setUser(null);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await authAPI.register(email, password);
      setUser(response.data.user);
      // Refresh user after registration to ensure token is set
      await fetchUser();
    } catch (error: any) {
      console.error("Register error:", error);
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
