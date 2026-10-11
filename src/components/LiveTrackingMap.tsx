import React from 'react';
import { colors } from '../theme/colors';

// Mapa simples via iframe do OpenStreetMap (sem precisar de API key nem
// biblioteca extra) — mostra a posição atual do entregador, atualizada em
// tempo real pelos eventos de socket (ver OrdersPage/OrderConfirmationPage).
export function LiveTrackingMap({ lat, lng }: { lat: number; lng: number }) {
  const delta = 0.01;
  const bbox = `${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${colors.border}`, marginTop: 10 }}>
      <iframe title="Localização do entregador" src={src} style={{ width: '100%', height: 220, border: 0 }} />
    </div>
  );
}
