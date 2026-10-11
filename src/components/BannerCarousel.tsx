import React, { useEffect, useState } from 'react';
import { colors } from '../theme/colors';
import { Banner } from '../types/catalog';

const AUTOPLAY_MS = 4000;

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const activeBanner = banners[activeIndex];

  function handlePress() {
    if (activeBanner.linkUrl) {
      window.open(activeBanner.linkUrl, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>🔥</span>
        <h2
          className="brand"
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 800,
            background: colors.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Top 10 do momento
        </h2>
      </div>

      {/* Um banner inteiro por vez, trocando sozinho — sem cortar a imagem. */}
      <div style={{ padding: '0 20px' }}>
        <div
          onClick={handlePress}
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '2.4 / 1',
            borderRadius: 22,
            overflow: 'hidden',
            cursor: activeBanner.linkUrl ? 'pointer' : 'default',
            boxShadow: '0 14px 32px rgba(0,0,0,0.22)',
            background: `linear-gradient(135deg, ${colors.dark}, ${colors.darkSecondary})`,
            border: '1px solid rgba(255,183,3,0.25)',
          }}
        >
          {banners.map((banner, index) => (
            <img
              key={banner.id}
              src={banner.imageUrl}
              alt=""
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                // "contain" garante que o banner inteiro apareça, sem cortar
                // texto ou parte da imagem nas bordas.
                objectFit: 'contain',
                opacity: index === activeIndex ? 1 : 0,
                transition: 'opacity 0.6s ease',
                pointerEvents: 'none',
              }}
            />
          ))}

        </div>
      </div>

      {banners.length > 1 ? (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver banner ${index + 1}`}
              style={{
                width: index === activeIndex ? 20 : 6,
                height: 6,
                borderRadius: 3,
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                background: index === activeIndex ? colors.gradient : colors.border,
                transition: 'width 0.2s',
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
