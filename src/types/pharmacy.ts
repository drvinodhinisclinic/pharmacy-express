export interface Patient {
  Patient_id: number;
  Name: string;
  Age: number;
  Gender: string;
  Mobile: string;
}

export interface Product {
  ProductID?: number;
  HSNCode?: string;
  MFR?: string;
  ProductName: string;
  PackOf?: number;
  MRP: string;
  unitPrice: string;
  Size?: string;
  Drug: string;
  Batch: string;
  Exp: string;
  QtyInStock?: number;
  IsActive?: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface CartItem extends Product {
  cartId: string; // Unique identifier for cart row (ProductName + Batch)
  quantity: number;
  expiryDate: string;
  salePrice: number;
}

export interface BillPayload {
  items: {
    ProductID: number;
    ProductName: string;
    Drug: string;
    Quantity: number;
    MRP: number;
    SalePrice: number;
    Batch: string;
    ExpiryDate: string;
  }[];
  totalItems: number;
  totalAmount: number;
  billedAt: string;
}