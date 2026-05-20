export interface Item {
  id: string;
  name: Record<string, string>;
  description?: Record<string, string>;
  price: string;
  images: string[];
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: Record<string, string>;
  images: string[];
  parentId: string | null;
  kitchenStationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  item: Item;
  quantity: number;
  modifiers?: { id: string; name: Record<string, string>; price: string }[];
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}
