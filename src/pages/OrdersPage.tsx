import React, { useCallback, useEffect, useRef, useState } from 'react';
import { colors } from '../theme/colors';
import { formatCurrency, toNumberCoord } from '../utils/format';
import { CUSTOMER_CANCELABLE_STATUSES, FINAL_STATUSES, Order, OrderDriver, STATUS_LABELS } from '../types/checkout';
import { api, extractApiErrorMessage } from '../config/api';
import { getSocket, joinOrderRoom, leaveOrderRoom } from '../config/socket';
import { LiveTrackingMap } from '../components/LiveTrackingMap';

const STATUS_COLORS: Record<string, string> = {
  PENDING: colors.warning,
  CONFIRMED: colors.primary,
  PREPARING: colors.primary,
  READY_FOR_PICKUP: colors.primary,
  AWAITING_DRIVER: colors.primary,
  OUT_FOR_DELIVERY: colors.primary,
  DELIVERED: colors.success,
  CANCELLED: colors.danger,
};

function formatScheduledDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [driverPositions, setDriverPositions] = useState<Record<string, { lat: number; lng: number }>>({});
  const joinedOrderIds = useRef<Set<string>>(new Set());

  const loadOrders = useCallback(async () => {
    try {
      const { data } = await api.get<Order[]>('/orders/me');
      setOrders(data);
      setDriverPositions((current) => {
        const next = { ...current };
        for (const order of data) {
          if (next[order.id]) continue;
          const lat = toNumberCoord(order.driver?.lastLat);
          const lng = toNumberCoord(order.driver?.lastLng);
          if (lat !== null && lng !== null) next[order.id] = { lat, lng };
        }
        return next;
      });
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error, 'Não foi possível carregar seus pedidos.'));
    }
  }, []);

  useEffect(() => {
    loadOrders().finally(() => setIsLoading(false));
  }, [loadOrders]);

  useEffect(() => {
    const socket = getSocket();

    function handleStatusChanged(payload: { orderId: string; status: string }) {
      setOrders((current) => current.map((order) => (order.id === payload.orderId ? { ...order, status: payload.status } : order)));
    }
    function handleDriverAssigned(payload: { orderId: string; driver: OrderDriver }) {
      setOrders((current) => current.map((order) => (order.id === payload.orderId ? { ...order, driver: payload.driver } : order)));
    }
    function handleDriverLocation(payload: { orderId: string; lat: number; lng: number }) {
      setDriverPositions((current) => ({ ...current, [payload.orderId]: { lat: payload.lat, lng: payload.lng } }));
    }

    socket?.on('order:status_changed', handleStatusChanged);
    socket?.on('driver:assigned', handleDriverAssigned);
    socket?.on('driver:location', handleDriverLocation);

    for (const order of orders) {
      if (!FINAL_STATUSES.includes(order.status) && !joinedOrderIds.current.has(order.id)) {
        joinOrderRoom(order.id);
        joinedOrderIds.current.add(order.id);
      }
    }

    return () => {
      socket?.off('order:status_changed', handleStatusChanged);
      socket?.off('driver:assigned', handleDriverAssigned);
      socket?.off('driver:location', handleDriverLocation);
    };
  }, [orders]);

  useEffect(() => {
    return () => {
      joinedOrderIds.current.forEach((orderId) => leaveOrderRoom(orderId));
      joinedOrderIds.current.clear();
    };
  }, []);

  async function handleCancel(order: Order) {
    const reason = window.prompt('Por que você está cancelando este pedido? (opcional)', '') ?? '';
    setCancellingOrderId(order.id);
    try {
      await api.patch(`/orders/${order.id}/cancel`, { reason: reason || undefined });
      setOrders((current) => current.map((item) => (item.id === order.id ? { ...item, status: 'CANCELLED' } : item)));
    } catch (error) {
      window.alert(extractApiErrorMessage(error, 'Não foi possível cancelar o pedido.'));
    } finally {
      setCancellingOrderId(null);
    }
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 20px 60px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.text }}>Seus pedidos</h1>

      {isLoading ? (
        <p style={{ color: colors.textMuted, textAlign: 'center', marginTop: 40 }}>Carregando pedidos...</p>
      ) : errorMessage ? (
        <p style={{ color: colors.danger, textAlign: 'center', marginTop: 40 }}>{errorMessage}</p>
      ) : orders.length === 0 ? (
        <p style={{ color: colors.textMuted, textAlign: 'center', marginTop: 40 }}>Você ainda não fez nenhum pedido.</p>
      ) : (
        orders.map((order) => {
          const position = driverPositions[order.id];
          const showLiveMap = order.status === 'OUT_FOR_DELIVERY' && order.deliveryType !== 'PICKUP' && !!position;
          return (
            <div key={order.id} style={{ backgroundColor: colors.surface, borderRadius: 14, border: `1px solid ${colors.border}`, padding: 16, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Pedido #{order.code}</strong>
                <span style={{ fontWeight: 700, color: STATUS_COLORS[order.status] ?? colors.text }}>{STATUS_LABELS[order.status] ?? order.status}</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 16, marginTop: 8 }}>{formatCurrency(order.total)}</div>

              {order.scheduledFor ? <Badge>📅 Agendado para {formatScheduledDate(order.scheduledFor)}</Badge> : null}
              {order.deliveryType === 'PICKUP' ? <Badge>🏬 Retirada no balcão</Badge> : null}

              {order.driver ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                  {order.driver.profilePhotoUrl ? (
                    <img src={order.driver.profilePhotoUrl} alt="" style={{ width: 24, height: 24, borderRadius: 12, objectFit: 'cover' }} />
                  ) : (
                    <span>🛵</span>
                  )}
                  <span style={{ fontSize: 13, color: colors.textMuted }}>{order.driver.name}</span>
                </div>
              ) : null}

              {showLiveMap ? <LiveTrackingMap lat={position!.lat} lng={position!.lng} /> : null}

              {CUSTOMER_CANCELABLE_STATUSES.includes(order.status) ? (
                <button
                  type="button"
                  onClick={() => handleCancel(order)}
                  disabled={cancellingOrderId === order.id}
                  style={{ marginTop: 10, border: 'none', background: 'none', color: colors.danger, fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  {cancellingOrderId === order.id ? 'Cancelando...' : 'Cancelar pedido'}
                </button>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'inline-block', backgroundColor: '#FFF3D9', color: colors.primaryDark, fontWeight: 700, fontSize: 12, padding: '3px 8px', borderRadius: 6, marginTop: 6 }}>
      {children}
    </div>
  );
}
