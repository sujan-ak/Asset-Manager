import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  grade: string;
  school: string;
  joinedDate: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "@edodwaja_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setUser(JSON.parse(data));
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, _password: string): Promise<boolean> {
    if (!email || !_password) return false;
    const newUser: User = {
      id: "u1",
      name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      grade: "Class 10",
      school: "Delhi Public School",
      joinedDate: "Jan 2025",
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return true;
  }

  async function register(name: string, email: string, _password: string): Promise<boolean> {
    if (!name || !email || !_password) return false;
    const newUser: User = {
      id: "u" + Date.now(),
      name,
      email,
      grade: "Class 10",
      school: "",
      joinedDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return true;
  }

  async function logout() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  async function updateUser(updates: Partial<User>) {
    if (!user) return;
    const updated = { ...user, ...updates };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
