const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data.message || 'Request failed.', response.status);
  }

  return data as T;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: number;
  nights: number;
  travelers: number;
  budget: number;
  status: 'planned' | 'confirmed' | 'draft';
  image: string;
  weather: { temp: number; condition: string; icon: string };
  activities: string[];
  travelStyle: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type NewTrip = Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>;

export async function registerUser(payload: { name: string; email: string; password: string; username?: string }) {
  return apiRequest<{ success: boolean; user: ApiUser }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: { identifier: string; password: string }) {
  return apiRequest<{ success: boolean; user: ApiUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser() {
  return apiRequest<{ success: boolean; user: ApiUser }>('/api/auth/me');
}

export async function logoutUser() {
  return apiRequest<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
}

export async function getTrips() {
  return apiRequest<{ success: boolean; trips: Trip[] }>('/api/trips');
}

export async function getTrip(id: string) {
  return apiRequest<{ success: boolean; trip: Trip }>(`/api/trips/${encodeURIComponent(id)}`);
}

export async function createTrip(payload: NewTrip) {
  return apiRequest<{ success: boolean; trip: Trip }>('/api/trips', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTrip(id: string, payload: Partial<NewTrip>) {
  return apiRequest<{ success: boolean; trip: Trip }>(`/api/trips/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteTrip(id: string) {
  return apiRequest<{ success: boolean; id: string }>(`/api/trips/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export interface PublicConfig {
  razorpayKeyId: string;
  googleMapsApiKey: string;
}

export interface PaymentOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  pricing: {
    baseAmount: number;
    gst: number;
    convenienceFee: number;
    totalAmount: number;
    amountInPaise: number;
  };
}

export async function getPublicConfig() {
  return apiRequest<PublicConfig>('/api/payments/config');
}

export async function createPaymentOrder(payload: { tripId: string }) {
  return apiRequest<PaymentOrderResponse>('/api/payments/create-order', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  return apiRequest<{ success: boolean; paymentId: string; orderId: string }>('/api/payments/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
