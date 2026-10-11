import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { colors } from '../theme/colors';
import { formatCurrency, toNumberCoord } from '../utils/format';
import { CUSTOMER_CANCELABLE_STATUSES, Order, OrderDriver, STATUS_LABELS } from '../types/checkout';
import { getSocket, joinOrderRoom, leaveOrderRoom } from '../config/socket';
import { api, extractApiErrorMessage } from '../config/api';
import { LiveTrackingMap } from '../components/LiveTrackingMap';

function formatScheduledDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function OrderConfirmationPage() {
  const { orderId = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialOrder = (location.state as { order?: Order } | null)?.order ?? null;

  const [order, setOrder] = useState<Order | null>(initialOrder);
  const [status, setStatus] = useState(initialOrder?.status ?? '');
  const [driver, setDriver] = useState<OrderDriver | null | undefined>(initialOrder?.driver);
  const [isCancelling, setIsCancelling] = useState(false);
  const [driverPosition, setDriverPosition] = useState<{ lat: number; lng: number } | null>(() => {
    const lat = toNumberCoord(initialOrder?.driver?.lastLat);
    const lng = toNumberCoord(initialOrder?.driver?.lastLng);
    return lat !== null && lng !== null ? { lat, lng } : null;
  });

  useEffect(() => {
    if (order) return;
    api
      .get<Order>(`/orders/${orderId}`)
      .then(({ data }) => {
        setOrder(data);
        setStatus(data.status);
        setDriver(data.driver);
      })
      .catch(() => {});
  }, [order, orderId]);

  useEffect(() => {
    joinOrderRoom(orderId);
    const socket = getSocket();

    function handleStatusChanged(payload: { orderId: string; status: string }) {
      if (payload.orderId === orderId) setStatus(payload.status);
    }
    function handleDriverAssigned(payload: { orderId: string; driver: OrderDriver }) {
      if (payload.orderId === orderId) setDriver(payload.driver);
    }
    function handleDriverLocation(payload: { orderId: string; lat: number; lng: number }) {
      if (payload.orderId === orderId) setDriverPosition({ lat: payload.lat, lng: payload.lng });
    }

    socket?.on('order:status_changed', handleStatusChanged);
    socket?.on('driver:assigned', handleDriverAssigned);
    socket?.on('driver:location', handleDriverLocation);

    return () => {
      socket?.off('order:status_changed', handleStatusChanged);
      socket?.off('driver:assigned', handleDriverAssigned);
      socket?.off('driver:location', handleDriverLocation);
      leaveOrderRoom(orderId);
    };
  }, [orderId]);

  async function handleCancel() {
    if (!window.confirm('Tem certeza que quer cancelar este pedido?')) return;
    setIsCancelling(true);
    try {
      await api.patch(`/orders/${orderId}/cancel`, {});
      setStatus('CANCELLED');
    } catch (error) {
      window.alert(extractApiErrorMessage(error, 'Não foi possível cancelar o pedido.'));
    } finally {
      setIsCancelling(false);
    }
  }

  if (!order) {
    return <p style={{ textAlign: 'center', marginTop: 60, color: colors.textMuted }}>Carregando pedido...</p>;
  }

  const showLiveMap = status === 'OUT_FOR_DELIVERY' && order.deliveryType !== 'PICKUP' && driverPosition !== null;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px 60px', textAlign: 'center' }}>
      <div style={{ fontSize: 48 }}>🎉</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.text }}>Pedido enviado!</h1>
      <p style={{ color: colors.textMuted }}>Pedido #{order.code}</p>
      <p style={{ color: colors.primary, fontWeight: 700 }}>{STATUS_LABELS[status] ?? status}</p>

      {order.scheduledFor ? (
        <Badge>📅 Agendado para {formatScheduledDate(order.scheduledFor)}</Badge>
      ) : null}
      {order.deliveryType === 'PICKUP' ? <Badge>🏬 Retirada no balcão</Badge> : null}

      {driver ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 14, marginTop: 16, textAlign: 'left' }}>
          {driver.profilePhotoUrl ? (
            <img src={driver.profilePhotoUrl} alt="" style={{ width: 52, height: 52, borderRadius: 26, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🛵</div>
          )}
          <div>
            <div style={{ fontSize: 11, color: colors.textMuted, fontWeight: 600 }}>Seu entregador</div>
            <div style={{ fontWeight: 800 }}>{driver.name}</div>
            {driver.phone ? <div style={{ fontSize: 13, color: colors.textMuted }}>{driver.phone}</div> : null}
          </div>
        </div>
      ) : null}

      {showLiveMap ? <LiveTrackingMap lat={driverPosition!.lat} lng={driverPosition!.lng} /> : null}

      <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 16, marginTop: 16, textAlign: 'left' }}>
        <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
        {order.deliveryType !== 'PICKUP' ? <Row label="Taxa de entrega" value={formatCurrency(order.deliveryFee)} /> : null}
        {Number(order.discount) > 0 ? <Row label="Desconto" value={`- ${formatCurrency(order.discount)}`} /> : null}
        <div style={{ borderTop: `1px solid ${colors.border}`, marginTop: 8, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800 }}>Total</span>
          <span style={{ fontWeight: 800, fontSize: 18 }}>{formatCurrency(order.total)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/pedidos')}
        style={{ width: '100%', marginTop: 20, backgroundColor: colors.primary, border: 'none', borderRadius: 12, padding: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
      >
        Ver meus pedidos
      </button>

      {CUSTOMER_CANCELABLE_STATUSES.includes(status) ? (
        <button
          type="button"
          onClick={handleCancel}
          disabled={isCancelling}
          style={{ marginTop: 14, border: 'none', background: 'none', color: colors.danger, fontWeight: 700, cursor: 'pointer' }}
        >
          {isCancelling ? 'Cancelando...' : 'Cancelar pedido'}
        </button>
      ) : null}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'inline-block', backgroundColor: '#FFF3D9', color: colors.primaryDark, fontWeight: 700, fontSize: 13, padding: '4px 10px', borderRadius: 8, marginTop: 8 }}>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ color: colors.textMuted }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}
