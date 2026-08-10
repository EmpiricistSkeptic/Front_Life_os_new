import axios from "axios";

// Укажи здесь базовый URL твоего API.
// Если Django крутится на другом порту, просто поменяй 8000 на нужный.
const API_URL = "https://life-os-257m.onrender.com/api/";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Добавляем токен авторизации ко всем запросам
api.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem("access");
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Обработка просроченного токена (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Если токен протух и бэкенд вернул 401 — чистим хранилище и выкидываем на логин
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      
      // Чтобы избежать бесконечного редиректа, проверяем, не находимся ли мы уже на логине
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;