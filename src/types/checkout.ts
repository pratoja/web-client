export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH_ON_DELIVERY';

export type DeliveryType = 'DELIVERY' | 'PICKUP';

export interface Address {
  id: string;
  label?: string | null;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean;
  lat?: number | string;
  lng?: number | string;
}

export interface OrderItemOption {
  id?: string;
  name: string;
  price: number | string;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number | string;
  subtotal: number | string;
  notes?: string | null;
  options: OrderItemOption[];
}

export interface OrderDriver {
  name: string;
  phone: string | null;
  profilePhotoUrl: string | null;
  lastLat?: number | string | null;
  lastLng?: number | string | null;
}

export interface Order {
  id: string;
  code: string;
  status: string;
  deliveryType?: DeliveryType;
  subtotal: number | string;
  deliveryFee: number | string;
  discount: number | string;
  total: number | string;
  notes?: string | null;
  createdAt?: string;
  items: OrderItem[];
  driver?: OrderDriver | null;
  address?: Address | null;
  scheduledFor?: string | null;
}

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado pela loja',
  PREPARING: 'Em preparo',
  READY_FOR_PICKUP: 'Pronto para coleta',
  AWAITING_DRIVER: 'Aguardando entregador',
  OUT_FOR_DELIVERY: 'Saiu para entrega',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

export const CUSTOMER_CANCELABLE_STATUSES = ['PENDING', 'CONFIRMED'];
export const FINAL_STATUSES = ['DELIVERED', 'CANCELLED'];
