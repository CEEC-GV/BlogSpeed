import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import { clearToken, getToken, setToken } from "../utils/auth.js";

const AdminContext = createContext(null);

const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    const token = getToken();
    if (!token) {
      setAdmin(null);
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/auth/me", { headers: getAuthHeaders() });
      if (res.data?.admin) {
        setAdmin(res.data.admin);
      }
    } catch (err) {
      clearToken();
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    const token = getToken();
    if (!token) {
      setSubscription(null);
      return;
    }

    try {
      const res = await api.get("/subscriptions/status", { headers: getAuthHeaders() });
      if (res.data?.success) {
        setSubscription(res.data.subscription);
      }
    } catch (err) {
      setSubscription(null);
    }
  };

  const login = async ({ username, password }) => {
    const res = await api.post("/auth/login", { username, password });
    if (res.data?.token) {
      setToken(res.data.token);
      setAdmin(res.data.admin);
      // Immediately fetch fresh admin data to ensure credit balance is current
      await fetchMe();
      await fetchSubscription();
    }
    return res.data;
  };

  const logout = () => {
    clearToken();
    setAdmin(null);
    setSubscription(null);
  };

  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  const refreshAdmin = async () => {
    await fetchMe();
  };

  useEffect(() => {
    const init = async () => {
      await fetchMe();
      await fetchSubscription();
    };
    init();
  }, []);

  const value = useMemo(
    () => ({
      admin,
      subscription,
      loading,
      login,
      logout,
      refreshSubscription,
      refreshAdmin
    }),
    [admin, subscription, loading]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return ctx;
};
