// Product types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  images: string[];
  categoryId: string;
  category?: Category;
  basePrice: number;
  isActive: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isPromo: boolean;
  isPizzaOfMonth: boolean;
  allergens: string[];
  dietary: string[];
  sizes: ProductSize[];
  supplements: ProductSupplement[];
}

export interface ProductSize {
  id: string;
  name: string;
  price: number;
}

export interface ProductSupplement {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
  parentId?: string;
  children?: Category[];
}

// Cart types
export interface CartItem {
  id: string;
  product: Product;
  size: ProductSize;
  quantity: number;
  supplements: ProductSupplement[];
  removedIngredients: string[];
  halfHalf?: { product: Product; size: ProductSize; supplements: ProductSupplement[] };
  specialInstructions: string;
  unitPrice: number; // calculated
  totalPrice: number; // calculated
}

// Order types
export type OrderMode = 'DELIVERY' | 'TAKEAWAY' | 'DINE_IN';
export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  mode: OrderMode;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  address?: Address;
  scheduledAt?: string;
  estimatedReadyAt?: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  sizeName: string;
  sizePrice: number;
  quantity: number;
  supplements: { name: string; price: number }[];
  removedIngredients: string[];
  specialInstructions?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  instructions?: string;
  isDefault: boolean;
}

// User
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'CUSTOMER' | 'MANAGER' | 'ADMIN' | 'STAFF';
  loyaltyPoints: number;
  addresses: Address[];
}

// Store info
export interface StoreInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  isOpen: boolean;
  openingHours: OpeningHour[];
}

export interface OpeningHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface DeliveryZone {
  id: string;
  name: string;
  postalCodes: string[];
  deliveryFee: number;
  minOrderAmount: number;
  estimatedMinutes: number;
  freeDeliveryAbove?: number;
}
