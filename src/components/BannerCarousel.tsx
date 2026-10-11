import React, { useEffect, useRef, useState } from 'react';
import { colors } from '../theme/colors';
import { Banner } from '../types/catalog';

const AUTOPLAY_MS = 4000;

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
    <div style={{ marginBottom: 16 }}>
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          padding: '0 20px',
          scrollSnapType: 'x mandatory',
        }}
      >
        {banners.map((banner) => (
          <img
            key={banner.id}
            src={banner.imageUrl}
            alt=""
            onClick={() => handlePress(banner)}
            style={{
              width: 320,
              height: 140,
              borderRadius: 14,
              objectFit: 'cover',
              backgroundColor: colors.border,
              flexShrink: 0,
              cursor: banner.linkUrl ? 'pointer' : 'default',
              scrollSnapAlign: 'start',
            }}
          />
        ))}
      </div>
      {banners.length > 1 ? (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              style={{
                width: index === activeIndex ? 18 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: index === activeIndex ? colors.primary : colors.border,
                transition: 'width 0.2s',
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
