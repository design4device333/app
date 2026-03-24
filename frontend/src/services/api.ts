import axios from 'axios';
import { Store, Order, Driver, PaymentInfo, Stats, OrderItem, PaymentMethod, OrderStatus } from '../types';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Stores
export const getStores = async (): Promise<Store[]> => {
  const response = await api.get('/stores');
  return response.data;
};

export const getStore = async (storeId: string): Promise<Store> => {
  const response = await api.get(`/stores/${storeId}`);
  return response.data;
};

export const createStore = async (store: Omit<Store, 'id' | 'is_active' | 'created_at'>): Promise<Store> => {
  const response = await api.post('/stores', store);
  return response.data;
};

export const updateStore = async (storeId: string, store: Omit<Store, 'id' | 'is_active' | 'created_at'>): Promise<Store> => {
  const response = await api.put(`/stores/${storeId}`, store);
  return response.data;
};

export const deleteStore = async (storeId: string): Promise<void> => {
  await api.delete(`/stores/${storeId}`);
};

// Orders
export const getOrders = async (status?: string, driverId?: string): Promise<Order[]> => {
  const params: any = {};
  if (status) params.status = status;
  if (driverId) params.driver_id = driverId;
  const response = await api.get('/orders', { params });
  return response.data;
};

export const getPendingOrders = async (): Promise<Order[]> => {
  const response = await api.get('/orders/pending');
  return response.data;
};

export const getActiveOrders = async (): Promise<Order[]> => {
  const response = await api.get('/orders/active');
  return response.data;
};

export const getOrder = async (orderId: string): Promise<Order> => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

export const trackOrder = async (orderId: string): Promise<Order> => {
  const response = await api.get(`/orders/track/${orderId}`);
  return response.data;
};

export interface CreateOrderData {
  store_id: string;
  store_name: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: OrderItem[];
  notes?: string;
  payment_method: PaymentMethod;
  total_amount?: number;
}

export const createOrder = async (order: CreateOrderData): Promise<Order> => {
  const response = await api.post('/orders', order);
  return response.data;
};

export const acceptOrder = async (orderId: string, driverId: string, driverName: string): Promise<Order> => {
  const response = await api.post(`/orders/${orderId}/accept?driver_id=${driverId}&driver_name=${encodeURIComponent(driverName)}`);
  return response.data;
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order> => {
  const response = await api.post(`/orders/${orderId}/status?status=${status}`);
  return response.data;
};

// Drivers
export const getDrivers = async (): Promise<Driver[]> => {
  const response = await api.get('/drivers');
  return response.data;
};

export const getAvailableDrivers = async (): Promise<Driver[]> => {
  const response = await api.get('/drivers/available');
  return response.data;
};

export const getDriver = async (driverId: string): Promise<Driver> => {
  const response = await api.get(`/drivers/${driverId}`);
  return response.data;
};

export const getDriverOrders = async (driverId: string): Promise<Order[]> => {
  const response = await api.get(`/drivers/${driverId}/orders`);
  return response.data;
};

export const createDriver = async (driver: { name: string; phone: string }): Promise<Driver> => {
  const response = await api.post('/drivers', driver);
  return response.data;
};

export const updateDriver = async (driverId: string, driver: Partial<Driver>): Promise<Driver> => {
  const response = await api.put(`/drivers/${driverId}`, driver);
  return response.data;
};

export const deleteDriver = async (driverId: string): Promise<void> => {
  await api.delete(`/drivers/${driverId}`);
};

// Payment Info
export const getPaymentInfo = async (): Promise<PaymentInfo> => {
  const response = await api.get('/payment-info');
  return response.data;
};

// Stats
export const getStats = async (): Promise<Stats> => {
  const response = await api.get('/stats');
  return response.data;
};
