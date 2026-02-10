const USER_TOKEN_KEY = "user_token";

export const setUserToken = (token) => localStorage.setItem(USER_TOKEN_KEY, token);
export const getUserToken = () => localStorage.getItem(USER_TOKEN_KEY);
export const clearUserToken = () => localStorage.removeItem(USER_TOKEN_KEY);
