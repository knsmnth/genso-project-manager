import { apiClient, isBackendConfigured } from './api';
import { Person, AttendanceRosterDay, LeaveRecord, AttendanceStatusType } from '../types';

const PERSONNEL_STORAGE_KEY = 'infra_personnel';
const LEAVES_STORAGE_KEY = 'infra_personnel_leaves';
const ATTENDANCE_HISTORY_STORAGE_KEY = 'infra_attendance_history';

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

export interface PersonnelDossier {
  profile: Person;
  attendanceHistory: Array<{
    id?: number;
    date: string;
    formattedDate: string;
    dayOfWeek: string;
    status: AttendanceStatusType;
    notes?: string;
  }>;
  workOrders: Array<{
    code: string;
    workTitle: string;
    assetName: string;
    status: string;
    priority: string;
    startDate: string;
    endDate: string;
    foreman: string;
  }>;
  leaves: LeaveRecord[];
}

export const getPersonnelRecords = async (code: string): Promise<PersonnelDossier | null> => {
  if (isBackendConfigured()) {
    try {
      const response = await apiClient.get(`/personnel/${code}/records`);
      if (response.data && response.data.profile) {
        return response.data;
      }
    } catch (e) {
      console.warn('API error fetching personnel dossier:', e);
    }
  }

  // Fallback to local data
  const staff = await getPersonnel();
  const found = staff.find((p) => p.code === code || p.id === code);
  if (!found) return null;

  return {
    profile: found,
    attendanceHistory: [
      {
        date: new Date().toISOString().split('T')[0],
        formattedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        status: (found.attendanceStatus as AttendanceStatusType) || 'present',
        notes: ''
      }
    ],
    workOrders: found.activeOrder && found.activeOrder !== '—'
      ? [{
          code: found.activeOrder,
          workTitle: 'Active Maintenance Dispatch',
          assetName: 'Main Facility',
          status: 'In Progress',
          priority: 'High',
          startDate: '2026-09-01',
          endDate: '2026-09-30',
          foreman: found.name
        }]
      : [],
    leaves: []
  };
};

export const saveDailyAttendance = async (
  date: string,
  records: Array<{ personnel_code: string; status: AttendanceStatusType; notes?: string }>
): Promise<boolean> => {
  if (isBackendConfigured()) {
    try {
      await apiClient.post('/personnel/attendance', { date, records });
      return true;
    } catch (e) {
      console.error('API save daily attendance error:', e);
    }
  }
  return true;
};

export const getAttendanceHistory = async (
  query?: string | { date?: string; month?: number; year?: number }
): Promise<AttendanceRosterDay[]> => {
  if (isBackendConfigured()) {
    try {
      let url = '/personnel/attendance/history';
      if (typeof query === 'string' && query) {
        url += `?date=${encodeURIComponent(query)}`;
      } else if (query && typeof query === 'object') {
        const params = new URLSearchParams();
        if (query.date) params.append('date', query.date);
        if (query.month) params.append('month', String(query.month));
        if (query.year) params.append('year', String(query.year));
        const qs = params.toString();
        if (qs) url += `?${qs}`;
      }
      const response = await apiClient.get(url);
      if (response.data && Array.isArray(response.data)) {
        localStorage.setItem(ATTENDANCE_HISTORY_STORAGE_KEY, JSON.stringify(response.data));
        return response.data;
      }
    } catch (e) {
      console.warn('API error fetching attendance history:', e);
    }
  }

  const cached = localStorage.getItem(ATTENDANCE_HISTORY_STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error('Failed to parse cached history', e);
    }
  }

  return [];
};

export const getScheduledLeaves = async (): Promise<LeaveRecord[]> => {
  if (isBackendConfigured()) {
    try {
      const response = await apiClient.get('/personnel/leaves');
      if (response.data && Array.isArray(response.data)) {
        localStorage.setItem(LEAVES_STORAGE_KEY, JSON.stringify(response.data));
        return response.data;
      }
    } catch (e) {
      console.warn('API error fetching leaves:', e);
    }
  }

  const cached = localStorage.getItem(LEAVES_STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error('Failed to parse cached leaves', e);
    }
  }
  return [];
};

export const saveScheduledLeave = async (leaveData: {
  personnelCode: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
}): Promise<boolean> => {
  if (isBackendConfigured()) {
    try {
      await apiClient.post('/personnel/leaves', leaveData);
      return true;
    } catch (e) {
      console.error('API save leave error:', e);
      return false;
    }
  }

  // Fallback: save to localStorage
  const existing = await getScheduledLeaves();
  const newLeave: LeaveRecord = {
    id: Date.now(),
    ...leaveData,
    status: 'Approved',
    createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };
  localStorage.setItem(LEAVES_STORAGE_KEY, JSON.stringify([newLeave, ...existing]));
  return true;
};

export const updateScheduledLeave = async (
  leaveId: number | string,
  leaveData: {
    personnelCode: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }
): Promise<boolean> => {
  if (isBackendConfigured()) {
    try {
      await apiClient.put(`/personnel/leaves/${leaveId}`, leaveData);
      return true;
    } catch (e) {
      console.error('API update leave error:', e);
    }
  }

  const existing = await getScheduledLeaves();
  const updated = existing.map((l) => (l.id == leaveId ? { ...l, ...leaveData } : l));
  localStorage.setItem(LEAVES_STORAGE_KEY, JSON.stringify(updated));
  return true;
};

export const deleteScheduledLeave = async (leaveId: number | string): Promise<boolean> => {
  if (isBackendConfigured()) {
    try {
      await apiClient.delete(`/personnel/leaves/${leaveId}`);
      return true;
    } catch (e) {
      console.error('API delete leave error:', e);
    }
  }

  const existing = await getScheduledLeaves();
  const filtered = existing.filter((l) => l.id != leaveId);
  localStorage.setItem(LEAVES_STORAGE_KEY, JSON.stringify(filtered));
  return true;
};
