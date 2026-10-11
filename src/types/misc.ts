// Favoritos, notificações — tipos menores, usados em telas específicas.

export interface FavoriteProductImage {
  id: string;
  url: string;
  sortOrder: number;
}

export interface FavoriteProduct {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  isAvailable: boolean;
  images: FavoriteProductImage[];
  company: {
    id: string;
    tradeName: string;
  };
}

export interface FavoriteItem {
  id: string;
  productId: string;
  createdAt: string;
  product: FavoriteProduct;
}

export interface AppNotification {
  id: string;
  type: 'ORDER_UPDATE' | 'DRIVER_REQUEST' | 'PROMOTION' | 'SYSTEM' | 'CHAT_MESSAGE';
  title: string;
  body: string;
  dataJson: { orderId?: string; status?: string } | null;
  readAt: string | null;
  createdAt: string;
}

export const NOTIFICATION_ICON: Record<AppNotification['type'], string> = {
  ORDER_UPDATE: '🧾',
  DRIVER_REQUEST: '🛵',
  PROMOTION: '🎉',
  SYSTEM: '📣',
  CHAT_MESSAGE: '💬',
};
