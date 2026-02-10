import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import { clearUserToken, getUserToken, setUserToken } from "../utils/userAuth.js";

const UserContext = createContext(null);

const getAuthHeaders = () => {
  const token = getUserToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    const token = getUserToken();
    if (!token) {
      setUser(null);
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/users/me", { headers: getAuthHeaders() });
      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      clearUserToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    const token = getUserToken();
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

  const register = async ({ name, email, password }) => {
    const res = await api.post("/users/register", { name, email, password });
    if (res.data?.token) {
      setUserToken(res.data.token);
      setUser(res.data.user);
      await fetchSubscription();
    }
    return res.data;
  };

  const login = async ({ email, password }) => {
    const res = await api.post("/users/login", { email, password });
    if (res.data?.token) {
      setUserToken(res.data.token);
      setUser(res.data.user);
      await fetchSubscription();
    }
    return res.data;
  };

  const logout = () => {
    clearUserToken();
    setUser(null);
    setSubscription(null);
  };

  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  const refreshUser = async () => {
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
      user,
      subscription,
      loading,
      register,
      login,
      logout,
      refreshSubscription,
      refreshUser
    }),
    [user, subscription, loading]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within UserProvider");
  }
  return ctx;
};
