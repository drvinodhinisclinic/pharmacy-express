import { Product, Patient } from '@/types/pharmacy';

const API_BASE = 'http://localhost:3000/api/pharma';
const PATIENTS_API_BASE = 'http://localhost:3000/api/patients';
//const API_BASE = 'https://unsimplified-gwendolyn-reasonable.ngrok-free.dev/api/pharma';
//const PATIENTS_API_BASE = 'https://unsimplified-gwendolyn-reasonable.ngrok-free.dev/api/patients';
export async function searchPatients(query: string): Promise<Patient[]> {
  if (query.length < 2) return [];
  
  try {
    const response = await fetch(`${PATIENTS_API_BASE}/search?q=${encodeURIComponent(query)}`,{headers: {'ngrok-skip-browser-warning': 'true'}});
    if (!response.ok) {
      throw new Error('Patient search failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Patient search error:', error);
    throw error;
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (query.length < 2) return [];
  
  try {
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`,{headers: {'ngrok-skip-browser-warning': 'true'}});
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
  patient: {
    patient_id: number;
    name: string;
    mobile: string;
  } | null;
  items: {
    ProductID?: number;
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
        'ngrok-skip-browser-warning': 'true',
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
