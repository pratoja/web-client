import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme/colors';
import { formatDateTime } from '../utils/format';
import { api, extractApiErrorMessage } from '../config/api';
import { AppNotification, NOTIFICATION_ICON } from '../types/misc';

export function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadNotifications = useCallback(async () => {
    try {
      const { data } = await api.get<AppNotification[]>('/notifications');
      setNotifications(data);
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error, 'Não foi possível carregar suas notificações.'));
    }
  }, []);

  useEffect(() => {
    loadNotifications().finally(() => setIsLoading(false));
  }, [loadNotifications]);

  async function handleMarkAllRead() {
    setNotifications((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
    try {
      await api.patch('/notifications/read-all');
    } catch {
      // Se falhar, a próxima vez que a página recarregar mostra o estado real.
    }
  }

  async function handlePress(notification: AppNotification) {
    if (!notification.readAt) {
      setNotifications((current) => current.map((item) => (item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item)));
      try {
        await api.patch(`/notifications/${notification.id}/read`);
      } catch {
        // Não é uma ação crítica.
      }
    }
    if (notification.dataJson?.orderId) {
      navigate('/pedidos');
    }
  }

  const hasUnread = notifications.some((item) => !item.readAt);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 20px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.text }}>Notificações</h1>
        {hasUnread ? (
          <button type="button" onClick={handleMarkAllRead} style={{ border: 'none', background: 'none', color: colors.primaryDark, fontWeight: 700, cursor: 'pointer' }}>
            Marcar lidas
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <p style={{ color: colors.textMuted, textAlign: 'center', marginTop: 40 }}>Carregando notificações...</p>
      ) : errorMessage ? (
        <p style={{ color: colors.danger, textAlign: 'center', marginTop: 40 }}>{errorMessage}</p>
      ) : notifications.length === 0 ? (
        <p style={{ color: colors.textMuted, textAlign: 'center', marginTop: 40 }}>Você ainda não tem nenhuma notificação.</p>
      ) : (
        notifications.map((item) => {
          const isUnread = !item.readAt;
          return (
            <div
              key={item.id}
              onClick={() => handlePress(item)}
              style={{
                display: 'flex',
                gap: 12,
                backgroundColor: isUnread ? '#FFFBF2' : colors.surface,
                border: `1px solid ${isUnread ? colors.primary : colors.border}`,
                borderRadius: 14,
                padding: 14,
                marginBottom: 10,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 22 }}>{NOTIFICATION_ICON[item.type] ?? '📣'}</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: isUnread ? 800 : 600 }}>{item.title}</span>
                  {isUnread ? <span style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, display: 'inline-block' }} /> : null}
                </div>
                <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>{item.body}</div>
                <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 6 }}>{formatDateTime(item.createdAt)}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
