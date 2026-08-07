import { apiClient, isBackendConfigured } from './api';
import { Person } from '../types';

const PERSONNEL_STORAGE_KEY = 'infra_personnel';

export const getPersonnel = async (): Promise<Person[]> => {
  if (isBackendConfigured()) {
    try {
      const response = await apiClient.get('/personnel');
      if (response.data && Array.isArray(response.data)) {
        const mappedData: Person[] = response.data;
        localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(mappedData));
        return mappedData;
      }
    } catch (e) {
      console.warn('Laravel API fetch failed for personnel, using local cache:', e);
    }
  }

  const cached = localStorage.getItem(PERSONNEL_STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error('Failed to parse cached personnel', e);
    }
  }
  return [];
};

export const savePersonToDb = async (person: Person): Promise<boolean> => {
  if (isBackendConfigured()) {
    try {
      await apiClient.post('/personnel', person);
      return true;
    } catch (e) {
      console.error('Laravel API save person error:', e);
      return false;
    }
  }
  return true;
};

