export type UserRole = 'admin' | 'manager' | 'cashier' | 'waiter';

export interface LocalizedString {
  en: string;
  ar?: string;
}

export interface Branch {
  id: string;
  name: LocalizedString | string; // support legacy for a while if needed, or just LocalizedString
  code: string;
  city?: string;
  phone?: string;
  address?: string;
}

export interface POSPoint {
  id: string;
  name: LocalizedString | string;
  code: string;
  branchId: string;
  settings?: {
    enableTables?: boolean;
    openOnMenu?: boolean;
    directPrint?: boolean;
    requireCustomerOnOrder?: boolean;
    autoPrintReceipt?: boolean;
  };
}

export interface Shift {
  id: string;
  branchId: string;
  posPointId: string;
  cashierId: string;
  status: 'Open' | 'Closed';
  openingBalance: number;
  closingBalance?: number;
  openedAt: string;
  closedAt?: string;
}

export interface User {
  id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole | null;
  branchId: string | null;
  posPermissions: { posPointId: string; posPoint?: POSPoint }[];
}

export interface Category {
  id: string;
  name: LocalizedString;
  parentId?: string | null;
  kitchenStationId?: string | null;
  images?: string[];
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  itemCount?: number;
  items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: LocalizedString;
  price: number;
  categoryId: string;
  description?: LocalizedString;
  images?: string[];
}

// Order Types
export type OrderStatus = 
  | "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "SERVED" 
  | "ON_THE_WAY" | "DELIVERED" | "COMPLETED" | "CANCELLED" | "VOIDED";

export type OrderType = "DINE_IN" | "TAKE_AWAY" | "PICKUP" | "DELIVERY";

export interface OrderModifier {
  modifierId: string;
  name: LocalizedString | string;
  price: number;
  quantity: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  nameSnapshot: LocalizedString | string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  status: string;
  notes?: string;
  modifiers?: OrderModifier[];
}

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  branchId: string;
  customerId?: string;
  tableId?: string;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  orderItems: OrderItem[];
  createdAt: string;
}
