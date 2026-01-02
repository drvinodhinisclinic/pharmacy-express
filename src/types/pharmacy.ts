export interface Product {
  ProductID: number;
  HSNCode: string;
  MFR: string;
  ProductName: string;
  PackOf: number;
  MRP: string;
  unitPrice: string;
  Size: string;
  Drug: string;
  IsActive?: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface CartItem extends Product {
  quantity: number;
  batch: string;
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