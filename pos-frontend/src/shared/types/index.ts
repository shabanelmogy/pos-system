export type UserRole = 'admin' | 'manager' | 'cashier' | 'waiter';

export interface Branch {
  id: string;
  name: string;
  code: string;
  city?: string;
  phone?: string;
  address?: string;
}

export interface POSPoint {
  id: string;
  name: string;
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
  name: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  description?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}
