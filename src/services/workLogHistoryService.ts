import { apiClient } from './api';
import { DailyWorkLogEntry } from '../types';

export interface SnapshotSummary {
  id?: number;
  snapshot_date: string;
  total_orders: number;
  total_tasks: number;
  total_personnel: number;
  total_equipment: number;
  total_inspections: number;
  saved_by?: string;
  is_auto_saved?: boolean;
  updated_at?: string;
}

export interface SnapshotDetail extends SnapshotSummary {
  entries: DailyWorkLogEntry[];
}

export interface SaveSnapshotResult {
  success: boolean;
  unchanged: boolean;
  message: string;
  snapshot?: SnapshotDetail;
}

const LOCAL_SNAPSHOTS_PREFIX = 'infra_dwl_snapshot_';
const LOCAL_SNAPSHOT_DATES_KEY = 'infra_dwl_snapshot_dates';

/**
 * Get the list of all available snapshot summaries / dates
 */
export async function getSnapshotDates(): Promise<SnapshotSummary[]> {
  try {
    const res = await apiClient.get('/daily-work-log-snapshots');
    if (Array.isArray(res.data)) {
      // Also cache dates locally
      localStorage.setItem(LOCAL_SNAPSHOT_DATES_KEY, JSON.stringify(res.data));
      return res.data;
    }
  } catch (err) {
    console.warn('Backend unavailable, reading snapshot dates from localStorage:', err);
  }

  // Fallback to localStorage
  try {
    const cached = localStorage.getItem(LOCAL_SNAPSHOT_DATES_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Failed parsing local snapshot dates:', e);
  }

  return [];
}

/**
 * Fetch detailed snapshot entries for a given date (YYYY-MM-DD)
 */
export async function getSnapshotByDate(date: string): Promise<SnapshotDetail | null> {
  try {
    const res = await apiClient.get(`/daily-work-log-snapshots/${date}`);
    if (res.data && res.data.snapshot_date) {
      // Cache locally
      localStorage.setItem(`${LOCAL_SNAPSHOTS_PREFIX}${date}`, JSON.stringify(res.data));
      return res.data;
    }
  } catch (err: any) {
    if (err.response && err.response.status === 404) {
      return null;
    }
    console.warn(`Backend fetch failed for snapshot date ${date}, reading from localStorage:`, err);
  }

  // Fallback to localStorage
  try {
    const cached = localStorage.getItem(`${LOCAL_SNAPSHOTS_PREFIX}${date}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Failed reading local snapshot:', e);
  }

  return null;
}

/**
 * Save snapshot for a date (usually today). Returns whether it was unchanged or updated.
 */
export async function saveSnapshot(
  date: string,
  entries: DailyWorkLogEntry[],
  isAutoSaved = false,
  savedBy = 'Lead Foreman'
): Promise<SaveSnapshotResult> {
  const payload = {
    snapshot_date: date,
    entries,
    is_auto_saved: isAutoSaved,
    saved_by: savedBy
  };

  try {
    const res = await apiClient.post('/daily-work-log-snapshots', payload);
    const data = res.data;

    // Cache locally
    localStorage.setItem(`${LOCAL_SNAPSHOTS_PREFIX}${date}`, JSON.stringify(data.snapshot || payload));
    updateLocalDatesIndex(date, entries, isAutoSaved, savedBy);

    return {
      success: true,
      unchanged: Boolean(data.unchanged),
      message: data.message || 'Work log snapshot processed successfully.',
      snapshot: data.snapshot
    };
  } catch (err) {
    console.warn('Backend snapshot save failed, caching locally only:', err);

    // Compute local hash to detect changes
    const localKey = `${LOCAL_SNAPSHOTS_PREFIX}${date}`;
    const previous = localStorage.getItem(localKey);
    const newJson = JSON.stringify(entries);

    let unchanged = false;
    if (previous) {
      try {
        const parsed = JSON.parse(previous);
        if (JSON.stringify(parsed.entries) === newJson) {
          unchanged = true;
        }
      } catch {}
    }

    const localSnapshot: SnapshotDetail = {
      snapshot_date: date,
      entries,
      total_orders: new Set(entries.map((e) => e.workOrderNumber)).size,
      total_tasks: entries.length,
      total_personnel: new Set(entries.flatMap((e) => e.assignedPersonnel || [])).size,
      total_equipment: entries.reduce((sum, e) => sum + (e.equipmentList?.length || 0), 0),
      total_inspections: entries.reduce((sum, e) => sum + (e.inspectionList?.length || 0), 0),
      saved_by: savedBy,
      is_auto_saved: isAutoSaved,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(localKey, JSON.stringify(localSnapshot));
    updateLocalDatesIndex(date, entries, isAutoSaved, savedBy);

    return {
      success: true,
      unchanged,
      message: unchanged
        ? `Already saved. No new changes detected for ${date}`
        : `Work log snapshot saved locally for ${date}`,
      snapshot: localSnapshot
    };
  }
}

/**
 * Update an existing snapshot for a specific past or current date.
 */
export async function updateSnapshot(
  date: string,
  entries: DailyWorkLogEntry[],
  savedBy = 'Lead Foreman'
): Promise<SaveSnapshotResult> {
  try {
    const res = await apiClient.put(`/daily-work-log-snapshots/${date}`, {
      entries,
      saved_by: savedBy
    });
    const data = res.data;

    localStorage.setItem(`${LOCAL_SNAPSHOTS_PREFIX}${date}`, JSON.stringify(data.snapshot));
    updateLocalDatesIndex(date, entries, false, savedBy);

    return {
      success: true,
      unchanged: Boolean(data.unchanged),
      message: data.message || `Work log updated for ${date}`,
      snapshot: data.snapshot
    };
  } catch (err) {
    console.warn('Backend update failed, updating locally:', err);
    return saveSnapshot(date, entries, false, savedBy);
  }
}

function updateLocalDatesIndex(
  date: string,
  entries: DailyWorkLogEntry[],
  isAutoSaved: boolean,
  savedBy: string
) {
  try {
    let list: SnapshotSummary[] = [];
    const cached = localStorage.getItem(LOCAL_SNAPSHOT_DATES_KEY);
    if (cached) {
      list = JSON.parse(cached);
    }

    const uniqueOrders = new Set(entries.map((e) => e.workOrderNumber)).size;
    const uniquePersonnel = new Set(entries.flatMap((e) => e.assignedPersonnel || [])).size;
    const totalEquipment = entries.reduce((sum, e) => sum + (e.equipmentList?.length || 0), 0);
    const totalInspections = entries.reduce((sum, e) => sum + (e.inspectionList?.length || 0), 0);

    const existingIdx = list.findIndex((i) => i.snapshot_date === date);
    const summaryItem: SnapshotSummary = {
      snapshot_date: date,
      total_orders: uniqueOrders,
      total_tasks: entries.length,
      total_personnel: uniquePersonnel,
      total_equipment: totalEquipment,
      total_inspections: totalInspections,
      saved_by: savedBy,
      is_auto_saved: isAutoSaved,
      updated_at: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      list[existingIdx] = summaryItem;
    } else {
      list.unshift(summaryItem);
      list.sort((a, b) => b.snapshot_date.localeCompare(a.snapshot_date));
    }

    localStorage.setItem(LOCAL_SNAPSHOT_DATES_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed updating local dates index:', e);
  }
}
