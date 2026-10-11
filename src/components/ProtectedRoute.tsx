import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Usado nas páginas que exigem login (sacola/checkout, pedidos, perfil,
// favoritos, notificações) — a navegação (ver cardápio) continua pública.
// Guarda para onde a pessoa queria ir, para voltar pra lá depois do login.
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/entrar" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
