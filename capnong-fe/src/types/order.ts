export interface CartItem {
  productId: number;
  productName: string;
  productImage: string;
  shopId: number;
  shopName: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPING" | "DELIVERED" | "CANCELLED";
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: "COD" | "BANK_TRANSFER";
  buyerName: string;
  buyerPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  productImage: string;
  shopName: string;
  price: number;
  quantity: number;
  unit: string;
  subtotal: number;
}

export interface CoopPool {
  id: number;
  productName: string;
  productImage: string;
  targetQuantity: number; // kg
  currentQuantity: number; // kg
  pricePerUnit: number;
  region: string;
  deadline: string;
  participantCount: number;
  status: "OPEN" | "FULFILLED" | "CLOSED";
  contributions: CoopContribution[];
}

export interface CoopContribution {
  farmerId: number;
  farmerName: string;
  quantity: number;
  percentage: number;
  estimatedRevenue: number;
}
