import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

/**
 * AuthProvider
 * Handles login, signup, logout & user persistence
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // { id, email }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** Restore user from localStorage on mount */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const id = localStorage.getItem("user");
    const email = localStorage.getItem("email");

    if (token && id && email) {
      setUser({ id, email });
    }

    setLoading(false);
  }, []);

  /** Login Function */
  const login = async (emailInput, password) => {
    try {
      setError(null);

      const res = await api.post("/auth/login", { email: emailInput, password });
      const { token, userId, email } = res.data;

      // Save to storage
      localStorage.setItem("token", token);
      localStorage.setItem("user", userId);
      localStorage.setItem("email", email);

      setUser({ id: userId, email });
      return res.data;

    } catch (err) {
      const message = err.response?.data?.error || "Login failed";
      setError(message);
      throw new Error(message);
    }
  };

  /** Signup Function */
  const signup = async (name, emailInput, password) => {
    try {
      setError(null);

      const res = await api.post("/auth/register", { name, email: emailInput, password });
      const { token, userId, email } = res.data;

      // Save to storage
      localStorage.setItem("token", token);
      localStorage.setItem("user", userId);
      localStorage.setItem("email", email);

      setUser({ id: userId, email });
      return res.data;

    } catch (err) {
      const message = err.response?.data?.error || "Signup failed";
      setError(message);
      throw new Error(message);
    }
  };

  /** Logout Function */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("email");

    setUser(null);
  };

  /** Optional: Call this if you ever add "Get Profile" API */
  const refreshUser = (email, id) => {
    setUser({ id, email });
  };

  return (
      <AuthContext.Provider
          value={{
            user,
            loading,
            error,
            login,
            signup,
            logout,
            refreshUser,
          }}
      >
        {children}
      </AuthContext.Provider>
  );
}

/** Custom Hook for consuming Auth Context */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
