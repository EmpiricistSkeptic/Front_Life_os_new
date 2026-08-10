import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Импортируем наши компоненты
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import AIAssistant from "./components/AIAssistant";

// Импортируем функцию проверки текущего пользователя
import { getCurrentUser } from "./services/auth";

// HOC (компонент-обертка) для защиты приватных роутов
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();
  // Если пользователя нет (нет токена/данных), выкидываем на страницу входа
  if (!user) {
    return <Navigate to="/register" replace />;
  }
  // Иначе рендерим защищенный компонент
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* При заходе на главную страницу (/) — редирект на дашборд */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Публичные роуты */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Приватные роуты (защищенные PrivateRoute) */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/assistant" 
          element={
            <PrivateRoute>
              <AIAssistant />
            </PrivateRoute>
          } 
        />
        
        {/* Обработка несуществующих страниц (404) -> кидаем на дашборд */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
