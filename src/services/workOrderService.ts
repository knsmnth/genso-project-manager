import { apiClient, isBackendConfigured } from './api';
import { WorkOrder } from '../types';

const STORAGE_KEY = 'infra_work_orders';

export const getWorkOrders = async (): Promise<WorkOrder[]> => {
  if (isBackendConfigured()) {
    try {
      const response = await apiClient.get('/work-orders');
      if (response.data && Array.isArray(response.data)) {
        const mappedData: WorkOrder[] = response.data;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedData));
        return mappedData;
      }
    } catch (e) {
      console.warn('Laravel API fetch failed, using local storage cache:', e);
    }
  }

  // Fallback to local storage
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error('Failed to parse cached work orders', e);
    }
  }
  return [];
};

export const saveWorkOrderToDb = async (order: WorkOrder): Promise<boolean> => {
  if (isBackendConfigured()) {
    try {
      await apiClient.post('/work-orders', order);
      return true;
    } catch (e) {
      console.error('Laravel API save error:', e);
      return false;
    }
  }
  return true;
};

export const deleteWorkOrderFromDb = async (code: string): Promise<boolean> => {
  if (isBackendConfigured()) {
    try {
      await apiClient.delete(`/work-orders/${encodeURIComponent(code)}`);
      return true;
    } catch (e) {
      console.error('Laravel API delete error:', e);
      return false;
    }
  }
  return true;
};

