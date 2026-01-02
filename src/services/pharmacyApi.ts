import { Product } from '@/types/pharmacy';

const API_BASE = 'http://localhost:3000/api/pharma';

export async function searchProducts(query: string): Promise<Product[]> {
  if (query.length < 2) return [];
  
  try {
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Search failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

export async function processBill(payload: {
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
}): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/billed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error('Billing failed');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Billing error:', error);
    throw error;
  }
}