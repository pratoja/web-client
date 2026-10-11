import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../config/api';
import { getSocket } from '../config/socket';

export function Header() {
  const { isAuthenticated, user } = useAuth();
  const cart = useCart();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    api
      .get<{ count: number }>('/notifications/unread-count')
      .then(({ data }) => setUnreadCount(data.count))
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    function handleNew() {
      setUnreadCount((current) => current + 1);
    }
    socket.on('notification:new', handleNew);
    return () => {
      socket.off('notification:new', handleNew);
    };
  }, []);

  return (
    <header
      style={{
        background: `linear-gradient(180deg, ${colors.dark} 0%, ${colors.darkSecondary} 100%)`,
        color: colors.onDark,
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Link
        to="/"
        className="brand"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
        }}
      >
        <img
          src="/logo-icon.png"
          alt="Prato Já"
          style={{ width: 34, height: 34, objectFit: 'contain', borderRadius: 8, flexShrink: 0 }}
        />
        <span
          style={{
            fontWeight: 800,
            fontSize: 20,
            background: colors.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Prato Já
        </span>
      </Link>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        {isAuthenticated ? (
          <>
            <Link to="/notificacoes" style={{ color: colors.onDarkMuted, textDecoration: 'none', position: 'relative' }}>
              🔔
              {unreadCount > 0 ? (
                <span
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -10,
                    backgroundColor: colors.danger,
                    color: '#fff',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '1px 5px',
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
            </Link>
            <Link to="/favoritos" style={{ color: colors.onDarkMuted, textDecoration: 'none' }}>
              Favoritos
            </Link>
            <Link to="/pedidos" style={{ color: colors.onDarkMuted, textDecoration: 'none' }}>
              Pedidos
            </Link>
            <Link to="/perfil" style={{ color: colors.onDarkMuted, textDecoration: 'none' }}>
              Olá, {user?.name?.split(' ')[0]}
            </Link>
          </>
        ) : (
          <>
            <Link to="/entrar" style={{ color: colors.onDarkMuted, textDecoration: 'none' }}>
              Entrar
            </Link>
            <Link
              to="/cadastro"
              style={{
                color: '#1A1A1A',
                background: colors.gradient,
                textDecoration: 'none',
                padding: '7px 16px',
                borderRadius: 20,
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Criar conta
            </Link>
          </>
        )}

        <button
          type="button"
          onClick={() => navigate('/sacola')}
          style={{
            background: 'none',
            border: `1px solid ${colors.onDarkMuted}`,
            borderRadius: 8,
            color: colors.onDark,
            padding: '7px 12px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          🛒 {cart.totalItems > 0 ? cart.totalItems : ''}
        </button>
      </nav>
    </header>
  );
}
