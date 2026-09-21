import { createContext, useContext, useEffect, useState } from "react";

import apiRequest from "../api/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "br30_access_token";
const USER_KEY = "br30_user";

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem(USER_KEY);

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Failed to read stored user:", error);

    localStorage.removeItem(USER_KEY);

    return null;
  }
};

const getStoredToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

const saveAuthData = (accessToken, user) => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(token && user);

  const register = async ({ name, email, phone, password }) => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
      }),
    });
  };

  const verifyEmail = async ({ registrationToken, otp }) => {
    const data = await apiRequest("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({
        registrationToken,
        otp,
      }),
    });

    return data;
  };

  const login = async ({ email, password }) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (data.success && data.accessToken && data.user) {
      saveAuthData(data.accessToken, data.user);

      setToken(data.accessToken);
      setUser(data.user);
    }

    return data;
  };

  const forgotPassword = async (email) => {
    return apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({
        email,
      }),
    });
  };

  const verifyResetOtp = async ({ resetToken, otp }) => {
    return apiRequest("/auth/verify-reset-otp", {
      method: "POST",
      body: JSON.stringify({
        resetToken,
        otp,
      }),
    });
  };

  const resetPassword = async ({ resetToken, newPassword }) => {
    return apiRequest("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        resetToken,
        newPassword,
      }),
    });
  };

  const logout = () => {
    clearAuthData();

    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const currentToken = getStoredToken();

    if (!currentToken) {
      setUser(null);
      setToken(null);

      return null;
    }

    try {
      const data = await apiRequest("/auth/me");

      if (data.success && data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));

        setUser(data.user);
        setToken(currentToken);

        return data.user;
      }

      throw new Error("Unable to restore session");
    } catch (error) {
      console.error("Session restore failed:", error.message);

      clearAuthData();

      setToken(null);
      setUser(null);

      return null;
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = getStoredToken();

      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);

      await refreshUser();

      setLoading(false);
    };

    restoreSession();
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,

    register,
    verifyEmail,
    login,

    forgotPassword,
    verifyResetOtp,
    resetPassword,

    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
};

export default AuthContext;
