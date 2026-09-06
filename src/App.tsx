import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Импортируем наши компоненты
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import AIConversations from "./components/AIConversations";
import AIConversation from "./components/AIConversation";

// Импортируем функцию проверки текущего пользователя
import { getCurrentUser } from "./services/auth";

// HOC (компонент-обертка) для защиты приватных роутов
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();
  // Если пользователя нет (нет токена/данных), выкидываем на страницу входа
  if (!user) {
    return <Navigate to="/login" replace />;
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

        {/* Список AI-диалогов */}
        <Route
          path="/ai/conversations"
          element={
            <PrivateRoute>
              <AIConversations />
            </PrivateRoute>
          }
        />

        {/* Конкретный AI-диалог */}
        <Route
          path="/ai/conversations/:id"
          element={
            <PrivateRoute>
              <AIConversation />
            </PrivateRoute>
          }
        />

        {/* Старый путь /assistant теперь ведёт на список диалогов */}
        <Route path="/assistant" element={<Navigate to="/ai/conversations" replace />} />

        {/* Обработка несуществующих страниц (404) -> кидаем на дашборд */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
