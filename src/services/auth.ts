import api from "./api";
import type { AuthResponseLogin, AuthResponseRegister, User } from "../types";

// ── Helpers ───────────────────────────────────────────────────────────────────

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

const setSession = (access: string, refresh: string, user: User) => {
  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
};

// ── API Calls ─────────────────────────────────────────────────────────────────

export const login = async (credentials: Record<string, string>): Promise<AuthResponseLogin> => {
  const res = await api.post<AuthResponseLogin>("login/", credentials);
  const { access, refresh, user_id } = res.data;
  
  // В Login API backend возвращает только user_id, 
  // поэтому мы "собираем" минимального пользователя, чтобы UI не падал
  const user: User = { 
    id: user_id, 
    username: credentials.username, 
    email: "" 
  };
  
  setSession(access, refresh, user);
  return res.data;
};

export const register = async (data: Record<string, string>): Promise<AuthResponseRegister> => {
  const res = await api.post<AuthResponseRegister>("register/", data);
  const { access, refresh, user } = res.data;
  
  setSession(access, refresh, user);
  return res.data;
};

export const logout = async (): Promise<void> => {
  try {
    const refresh = localStorage.getItem("refresh");
    if (refresh) {
      // Backend (LogoutAPIView) ждет payload с ключом "refresh_token"
      await api.post("logout/", { refresh_token: refresh });
    }
  } catch (error) {
    console.error("Ошибка при разлогинивании на бэкенде:", error);
  } finally {
    // В любом случае очищаем локальные данные и редиректим
    clearSession();
  }
};