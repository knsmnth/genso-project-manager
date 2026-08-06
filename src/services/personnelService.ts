import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Person } from '../types';

const PERSONNEL_STORAGE_KEY = 'infra_personnel';

export const getPersonnel = async (): Promise<Person[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('personnel')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        const mappedData: Person[] = data.map((item) => ({
          id: item.code,
          code: item.code,
          name: item.name,
          role: item.role,
          status: item.status || 'Available',
          attendanceStatus: item.attendance_status || 'Absent',
          activeOrder: item.active_order || '—'
        }));
        localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(mappedData));
        return mappedData;
      }
    } catch (e) {
      console.warn('Supabase fetch failed for personnel, using local cache:', e);
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
  if (isSupabaseConfigured()) {
    try {
      const dbPayload = {
        code: person.code,
        name: person.name,
        role: person.role,
        status: person.status,
        attendance_status: person.attendanceStatus,
        active_order: person.activeOrder
      };

      const { error } = await supabase
        .from('personnel')
        .upsert(dbPayload, { onConflict: 'code' });

      if (error) {
        console.error('Failed to save person to Supabase:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Supabase save person error:', e);
      return false;
    }
  }
  return true;
};
