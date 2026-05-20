"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  apiFetch: (path: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Universal fetch wrapper that appends standard API paths, handles JWT auth headers,
  // and includes secure cookies for httpOnly refresh-token exchanges
  const apiFetch = async (path: string, options: RequestInit = {}): Promise<Response> => {
    const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
    const headers = new Headers(options.headers || {});

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return fetch(url, {
      ...options,
      headers,
      credentials: "include", // Essential for cross-origin cookie exchange (refreshToken)
    });
  };

  // Sync current user profiles using the active access token
  const fetchUserProfile = async (accessToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/user/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setUser(json.data);
        }
      } else {
        // If profile fetch fails, credentials might be stale/invalid
        handleSignOutCleanup();
      }
    } catch (err) {
      console.error("Failed to load user profile", err);
    }
  };

  // Automated background boot sequence: Attempt to refresh JWT immediately on load
  const triggerBootRefresh = async () => {
    try {
      const res = await fetch(`${API_BASE}/user/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.token) {
          setToken(json.token);
          await fetchUserProfile(json.token);
        }
      }
    } catch (err) {
      console.warn("Session refresh handshake failed on start (unauthenticated)", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    triggerBootRefresh();
  }, []);

  // Periodic silent refresh timer
  useEffect(() => {
    if (!token) return;

    // Refresh access token every 15 minutes
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/user/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.token) {
            setToken(json.token);
          }
        }
      } catch (err) {
        console.error("Silent JWT token refresh failed", err);
      }
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token]);

  const handleSignOutCleanup = () => {
    setUser(null);
    setToken(null);
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await apiFetch("/user/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setToken(json.token);
        setUser(json.data);
        return { success: true };
      } else {
        return { success: false, error: json.message || "Failed to authenticate" };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "An unexpected network error occurred" };
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const res = await apiFetch("/user/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          phone: phone || undefined,
          role: "User", // default ecommerce user role
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        // Automatic login on registration
        return login(email, password);
      } else {
        return { success: false, error: json.message || "Failed to register" };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "An unexpected network error occurred" };
    }
  };

  const logout = async () => {
    try {
      await apiFetch("/user/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout network notification error", err);
    } finally {
      handleSignOutCleanup();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
