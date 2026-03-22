import { Product, Patient } from '@/types/pharmacy';
import config, { getUrl } from '@/config/api';

export async function searchPatients(query: string): Promise<Patient[]> {
  if (query.length < 2) return [];
  
  try {
    const response = await fetch(
      `${getUrl('patientSearch')}?q=${encodeURIComponent(query)}`,
      { headers: config.headers }
    );
    if (!response.ok) {
      throw new Error('Patient search failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Patient search error:', error);
    throw error;
  }
}

export async function searchProducts(query: string, locationId: number): Promise<Product[]> {
  if (query.length < 2) return [];
  
  try {
    const response = await fetch(
      `${getUrl('pharmaSearch')}?q=${encodeURIComponent(query)}&locationId=${locationId}`,
      { headers: config.headers }
    );
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
  locationId: number;
  doctor: {
    name: string;
  } | null;
  patient: {
    patient_id: number;
    name: string;
    mobile: string;
  } | null;
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
  payments?: {
    cash: number;
    upi: number;
    upiDetails?: {
      utr: string;
      payerMobile: string;
      recordedById: string;
      recordedByName: string;
    };
  };
  totalItems: number;
  totalAmount: number;
  billedAt: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(getUrl('pharmaBill'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
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

// Upload prescription images after successful billing
export async function uploadPrescription(
  patientName: string,
  patientId: number,
  mobile: string,
  images: File[]
): Promise<void> {
  const formData = new FormData();
  formData.append('patientName', patientName);
  formData.append('patientId', patientId.toString());
  formData.append('mobile', mobile);
  images.forEach((img) => formData.append('images', img));

  try {
    const response = await fetch(getUrl('prescriptions'), {
      method: 'POST',
      headers: config.headers,
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Prescription upload failed');
    }
  } catch (error) {
    console.error('Prescription upload error:', error);
    throw error; // Caller handles gracefully
  }
}
