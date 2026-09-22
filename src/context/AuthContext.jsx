import { createContext, useContext, useEffect, useState } from "react";

import apiRequest from "../api/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "br30_access_token";
const USER_KEY = "br30_user";
const LOGIN_SESSION_KEY = "br30_login_session";

const createLoginSessionId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
};

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

const getStoredLoginSession = () => {
  return localStorage.getItem(LOGIN_SESSION_KEY);
};

const saveAuthData = (accessToken, user) => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LOGIN_SESSION_KEY);
};

const ensureLoginSession = () => {
  let sessionId = getStoredLoginSession();

  if (!sessionId) {
    sessionId = createLoginSessionId();
    localStorage.setItem(LOGIN_SESSION_KEY, sessionId);
  }

  return sessionId;
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
      /*
       * Every successful login gets a NEW session ID.
       *
       * Refresh ke time ye same ID localStorage me rahegi.
       * Logout ke time ye remove ho jayegi.
       */
      const newLoginSessionId = createLoginSessionId();

      saveAuthData(data.accessToken, data.user);

      localStorage.setItem(LOGIN_SESSION_KEY, newLoginSessionId);

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

    window.dispatchEvent(new Event("br30-auth-changed"));
  };

  const refreshUser = async () => {
    const currentToken = getStoredToken();

    if (!currentToken) {
      setUser(null);
      setToken(null);

      return null;
    }

    try {
      /*
       * Existing login session ko preserve karo.
       * Refresh par new session create nahi hogi.
       */
      ensureLoginSession();

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

      /*
       * Agar old login ka token already saved hai aur session ID missing hai,
       * to ek session ID create kar do.
       */
      ensureLoginSession();

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
