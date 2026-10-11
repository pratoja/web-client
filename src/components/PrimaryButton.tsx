import React from 'react';
import { colors } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  loading?: boolean;
  disabled?: boolean;
  variant?: 'solid' | 'outline';
  style?: React.CSSProperties;
}

export function PrimaryButton({
  children,
  onClick,
  type = 'button',
  loading = false,
  disabled = false,
  variant = 'solid',
  style,
}: Props) {
  const isOutline = variant === 'outline';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        height: 46,
        borderRadius: 10,
        border: isOutline ? `1.5px solid ${colors.border}` : 'none',
        backgroundColor: isOutline ? 'transparent' : colors.primary,
        color: isOutline ? colors.text : '#1A1A1A',
        fontWeight: 700,
        fontSize: 15,
        cursor: disabled || loading ? 'default' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        width: '100%',
        ...style,
      }}
    >
      {loading ? 'Aguarde...' : children}
    </button>
  );
}
