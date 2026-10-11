import React, { useEffect, useRef, useState } from 'react';
import { colors } from '../theme/colors';
import { Banner } from '../types/catalog';

const AUTOPLAY_MS = 3500;

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % banners.length;
        const el = scrollRef.current;
        if (el) {
          const child = el.children[next] as HTMLElement | undefined;
          child?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
        }
        return next;
      });
    }, AUTOPLAY_MS);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  function handlePress(banner: Banner) {
    if (banner.linkUrl) {
      window.open(banner.linkUrl, '_blank', 'noopener,noreferrer');
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

      <div
        ref={scrollRef}
        className="banner-scroll"
        style={{
          display: 'flex',
          gap: 20,
          overflowX: 'auto',
          padding: '4px 20px 10px',
          scrollSnapType: 'x mandatory',
        }}
      >
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            onClick={() => handlePress(banner)}
            style={{
              position: 'relative',
              width: 560,
              height: 300,
              borderRadius: 22,
              overflow: 'hidden',
              flexShrink: 0,
              cursor: banner.linkUrl ? 'pointer' : 'default',
              scrollSnapAlign: 'start',
              boxShadow: '0 14px 32px rgba(0,0,0,0.22)',
              backgroundColor: colors.border,
              border: '1px solid rgba(255,183,3,0.25)',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <img
              src={banner.imageUrl}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />

            {/* Sombra gradiente embaixo, pra dar profundidade e destacar o número */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Selo numerado estilo "Top 10" */}
            <div
              className="brand"
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                width: 54,
                height: 54,
                borderRadius: '50%',
                background: colors.gradient,
                color: '#1A1A1A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 24,
                boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
                border: '3px solid rgba(255,255,255,0.85)',
              }}
            >
              {index + 1}
            </div>
          </div>
        ))}
      </div>

      {banners.length > 1 ? (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              style={{
                width: index === activeIndex ? 20 : 6,
                height: 6,
                borderRadius: 3,
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
