import { apiClient } from './api';
import { DailyWorkLogEntry, DateHoldRecord } from '../types';

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
const LOCAL_HELD_DATES_KEY = 'infra_dwl_held_dates';

export const formatLocalDate = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Checks if a given date string or Date object is a weekday (Monday - Friday)
 */
export const isWeekday = (d: Date | string = new Date()): boolean => {
  let dateObj: Date;
  if (typeof d === 'string') {
    const parts = d.split('-');
    if (parts.length === 3) {
      dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else {
      dateObj = new Date(d);
    }
  } else {
    dateObj = d;
  }
  const day = dateObj.getDay();
  // 0 is Sunday, 6 is Saturday
  return day >= 1 && day <= 5;
};

/**
 * Get all held dates dictionary from storage
 */
export const getHeldDates = (): Record<string, DateHoldRecord> => {
  try {
    const raw = localStorage.getItem(LOCAL_HELD_DATES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

/**
 * Check if a date is currently marked on Hold
 */
export const isDateHeld = (date: string): { isHeld: boolean; reason: string; isAttendanceHeld: boolean; record?: DateHoldRecord } => {
  const held = getHeldDates();
  const record = held[date];
  if (record && record.isHeld) {
    const isAttendanceHeld = record.holdAttendance !== false;
    return { isHeld: true, reason: record.reason || 'General Hold', isAttendanceHeld, record };
  }
  return { isHeld: false, reason: '', isAttendanceHeld: false, record };
};

/**
 * Save or toggle Hold state for a specific date
 */
export const saveDateHold = async (record: DateHoldRecord): Promise<void> => {
  const held = getHeldDates();
  held[record.date] = {
    ...record,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(LOCAL_HELD_DATES_KEY, JSON.stringify(held));

  try {
    await apiClient.post('/daily-work-log-snapshots/hold', record);
  } catch {}
};

/**
 * Get the list of all available snapshot summaries / dates
 */
export async function getSnapshotDates(): Promise<SnapshotSummary[]> {
  let backendDates: SnapshotSummary[] = [];
  try {
    const res = await apiClient.get('/daily-work-log-snapshots');
    if (Array.isArray(res.data)) {
      backendDates = res.data;
    }
  } catch (err) {
    console.warn('Backend unavailable, reading snapshot dates from localStorage:', err);
  }

  // Read local cached dates
  let localDates: SnapshotSummary[] = [];
  try {
    const cached = localStorage.getItem(LOCAL_SNAPSHOT_DATES_KEY);
    if (cached) {
      localDates = JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Failed parsing local snapshot dates:', e);
  }

  // Merge unique by snapshot_date (backend takes precedence, but keep local-only dates)
  const map = new Map<string, SnapshotSummary>();
  backendDates.forEach((item) => map.set(item.snapshot_date, item));
  localDates.forEach((item) => {
    if (!map.has(item.snapshot_date)) {
      map.set(item.snapshot_date, item);
    }
  });

  const merged = Array.from(map.values()).sort((a, b) => b.snapshot_date.localeCompare(a.snapshot_date));
  try {
    localStorage.setItem(LOCAL_SNAPSHOT_DATES_KEY, JSON.stringify(merged));
  } catch {}

  return merged;
}

/**
 * Fetch detailed snapshot entries for a given date (YYYY-MM-DD)
 */
export async function getSnapshotByDate(date: string): Promise<SnapshotDetail | null> {
  try {
    const res = await apiClient.get(`/daily-work-log-snapshots/${date}`);
    if (res.data && res.data.snapshot_date && Array.isArray(res.data.entries)) {
      // Cache locally
      localStorage.setItem(`${LOCAL_SNAPSHOTS_PREFIX}${date}`, JSON.stringify(res.data));
      return res.data;
    }
  } catch (err: any) {
    console.warn(`Backend fetch note for snapshot date ${date}:`, err?.message || err);
  }

  // Fallback to localStorage (even if backend returned 404 or failed)
  try {
    const cached = localStorage.getItem(`${LOCAL_SNAPSHOTS_PREFIX}${date}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.entries)) {
        return parsed;
      }
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
  // If auto-saving, strictly enforce Monday to Friday and skip if date is on hold
  if (isAutoSaved) {
    if (!isWeekday(date)) {
      return {
        success: false,
        unchanged: true,
        message: 'Auto-save skipped: weekend date (Monday to Friday only)'
      };
    }
    const holdCheck = isDateHeld(date);
    if (holdCheck.isHeld) {
      return {
        success: false,
        unchanged: true,
        message: `Auto-save skipped: date is on hold (${holdCheck.reason})`
      };
    }
  }

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
