import React from 'react';
import { colors } from '../theme/colors';

interface ChipItem {
  id: string;
  name: string;
  imageUrl?: string | null;
}

export function CategoryChips({
  items,
  selectedId,
  onSelect,
}: {
  items: ChipItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 20px 4px' }}>
      {items.map((item) => {
        const isSelected = item.id === selectedId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0,
              padding: '9px 16px',
              borderRadius: 20,
              border: `1px solid ${isSelected ? colors.primary : colors.border}`,
              backgroundColor: isSelected ? colors.primary : colors.surface,
              color: isSelected ? '#1A1A1A' : colors.text,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {item.imageUrl ? (
              <img src={item.imageUrl} alt="" style={{ width: 22, height: 22, borderRadius: 11, objectFit: 'cover' }} />
            ) : null}
            {item.name}
          </button>
        );
      })}
    </div>
  );
}
