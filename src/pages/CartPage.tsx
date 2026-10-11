import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/format';
import { CartItem, useCart } from '../context/CartContext';
import { PrimaryButton } from '../components/PrimaryButton';

export function CartPage() {
  const navigate = useNavigate();
  const cart = useCart();
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  async function handleDecrement(item: CartItem) {
    setBusyItemId(item.id);
    try {
      await cart.decrementItem(item);
    } catch {
      window.alert('Não foi possível atualizar a quantidade.');
    } finally {
      setBusyItemId(null);
    }
  }

  async function handleIncrement(item: CartItem) {
    setBusyItemId(item.id);
    try {
      await cart.incrementItem(item);
    } catch {
      window.alert('Não foi possível atualizar a quantidade.');
    } finally {
      setBusyItemId(null);
    }
  }

  async function handleRemove(item: CartItem) {
    setBusyItemId(item.id);
    try {
      await cart.removeItem(item.id);
    } catch {
      window.alert('Não foi possível remover o item.');
    } finally {
      setBusyItemId(null);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px 60px' }}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', color: colors.primaryDark, fontWeight: 700, cursor: 'pointer', fontSize: 14, marginBottom: 12 }}
      >
        ‹ Voltar
      </button>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.text }}>Sua sacola</h1>

      {cart.items.length === 0 ? (
        <p style={{ color: colors.textMuted, textAlign: 'center', marginTop: 40 }}>Sua sacola está vazia.</p>
      ) : (
        <>
          {cart.items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.surface,
                borderRadius: 14,
                border: `1px solid ${colors.border}`,
                padding: 14,
                marginBottom: 12,
              }}
            >
              <div style={{ flex: 1, paddingRight: 12 }}>
                <div style={{ fontWeight: 700, color: colors.text }}>{item.productName}</div>
                <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>{formatCurrency(item.unitPrice)} cada</div>
                <button
                  type="button"
                  onClick={() => handleRemove(item)}
                  style={{ border: 'none', background: 'none', color: colors.danger, fontWeight: 600, fontSize: 13, marginTop: 6, cursor: 'pointer', padding: 0 }}
                >
                  Remover
                </button>
              </div>

              {busyItemId === item.id ? (
                <span style={{ color: colors.textMuted, fontSize: 13 }}>...</span>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => handleDecrement(item)}
                    style={{ width: 30, height: 30, borderRadius: 15, border: `1px solid ${colors.border}`, background: colors.background, cursor: 'pointer', fontWeight: 700 }}
                  >
                    −
                  </button>
                  <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700 }}>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleIncrement(item)}
                    style={{ width: 30, height: 30, borderRadius: 15, border: `1px solid ${colors.border}`, background: colors.background, cursor: 'pointer', fontWeight: 700 }}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          ))}

          <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 16, marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: colors.textMuted, fontWeight: 600 }}>Subtotal</span>
              <span style={{ fontWeight: 800, fontSize: 18 }}>{formatCurrency(cart.subtotal)}</span>
            </div>
            <p style={{ fontSize: 12, color: colors.textMuted, marginBottom: 14 }}>A taxa de entrega é calculada no próximo passo.</p>
            <PrimaryButton onClick={() => navigate('/finalizar')}>Escolher endereço e pagamento</PrimaryButton>
          </div>
        </>
      )}
    </div>
  );
}
