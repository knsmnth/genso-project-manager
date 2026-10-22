import { WorkOrder, DailyWorkLogEntry } from '../types';
import { saveSnapshot, formatLocalDate } from './workLogHistoryService';

export type AutoOrderStatus = 'Not Scheduled' | 'Scheduled' | 'On-going' | 'Completed';

export interface ScopeEvaluationItem {
  startDate?: string;
  endDate?: string;
  completionDate?: string;
  assignedPersonnel?: string[];
}

const LOGS_STORAGE_KEY_V3 = 'infra_daily_work_logs_v3';

/**
 * Validates whether a date string is non-empty and not a placeholder
 */
export function hasValidDate(val?: string | null): boolean {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  return trimmed !== '' && trimmed !== '-' && trimmed !== '—' && trimmed !== 'N/A';
}

/**
 * Validates whether assigned personnel exist
 */
export function hasPersonnel(personnel?: string[] | null): boolean {
  return Boolean(personnel && Array.isArray(personnel) && personnel.length > 0);
}

/**
 * Retrieves all scopes for a given work order.
 * Scopes are prioritized from active Daily Work Log entries, then order tasks, then order itself.
 */
export function getScopesForOrder(
  order: WorkOrder,
  cachedLogs?: DailyWorkLogEntry[]
): ScopeEvaluationItem[] {
  let logs = cachedLogs;
  if (!logs || logs.length === 0) {
    try {
      const stored = localStorage.getItem(LOGS_STORAGE_KEY_V3);
      if (stored) {
        logs = JSON.parse(stored);
      }
    } catch {}
  }

  // Check matching Daily Work Log entries
  if (logs && logs.length > 0) {
    const matching = logs.filter((l) => l.workOrderNumber === order.code);
    if (matching.length > 0) {
      return matching.map((m) => ({
        startDate: m.startDate,
        endDate: m.completionDate,
        completionDate: m.completionDate,
        assignedPersonnel: m.assignedPersonnel
      }));
    }
  }

  // Fallback to order tasks
  if (order.tasks && order.tasks.length > 0) {
    const validTasks = order.tasks.filter(
      (t) => (t.type && t.type.trim() !== '' && t.type !== '-') ||
             (t.remarks && t.remarks.trim() !== '' && t.remarks !== '-')
    );
    if (validTasks.length > 0) {
      return validTasks.map((t) => ({
        startDate: t.startDate || order.startDate,
        endDate: t.endDate || order.endDate,
        completionDate: t.endDate || order.endDate,
        assignedPersonnel: order.assigned
      }));
    }
  }

  // Single fallback scope from order
  return [
    {
      startDate: order.startDate,
      endDate: order.endDate,
      completionDate: order.endDate,
      assignedPersonnel: order.assigned
    }
  ];
}

/**
 * Evaluates the 4 automatic status states based on scope items:
 * 1. Completed: ALL scopes have end dates recorded
 * 2. On-going: Not completed, but at least 1 scope has start date AND assigned personnel
 * 3. Scheduled: Not completed/ongoing, but at least 1 scope has start date (no end date)
 * 4. Not Scheduled: No starting date for all scopes
 */
export function evaluateScopesStatus(scopes: ScopeEvaluationItem[]): AutoOrderStatus {
  if (!scopes || scopes.length === 0) {
    return 'Not Scheduled';
  }

  // State 4: Completed - If all scope has already have end dates
  const allCompleted = scopes.every((s) => hasValidDate(s.endDate || s.completionDate));
  if (allCompleted) {
    return 'Completed';
  }

  // State 3: On-going - If already have starting date, and personnels assigned at least 1 scope
  const anyOngoing = scopes.some((s) => hasValidDate(s.startDate) && hasPersonnel(s.assignedPersonnel));
  if (anyOngoing) {
    return 'On-going';
  }

  // State 2: Scheduled - If starting date exists on at least 1 scope (no end date)
  const anyScheduled = scopes.some((s) => hasValidDate(s.startDate));
  if (anyScheduled) {
    return 'Scheduled';
  }

  // State 1: Not Scheduled - If no starting date for all scope
  return 'Not Scheduled';
}

/**
 * Evaluates the automatic status for a work order
 */
export function evaluateOrderStatus(
  order: WorkOrder,
  cachedLogs?: DailyWorkLogEntry[]
): AutoOrderStatus {
  const scopes = getScopesForOrder(order, cachedLogs);
  return evaluateScopesStatus(scopes);
}

/**
 * When an order transitions to Completed:
 * 1. Automatically saves snapshot to Daily Work Log so history reflects it
 * 2. Sets isActive = false
 */
export async function archiveCompletedOrderSnapshot(
  order: WorkOrder,
  allLogs?: DailyWorkLogEntry[]
): Promise<boolean> {
  try {
    const todayStr = formatLocalDate(new Date());

    let entries = allLogs;
    if (!entries || entries.length === 0) {
      try {
        const stored = localStorage.getItem(LOGS_STORAGE_KEY_V3);
        if (stored) {
          entries = JSON.parse(stored);
        }
      } catch {}
    }

    if (entries && entries.length > 0) {
      const eligibleEntries = entries.filter((l) => !l.isOnHold);
      if (eligibleEntries.length > 0) {
        await saveSnapshot(todayStr, eligibleEntries, false, 'Auto-Complete System');
        return true;
      }
    }
  } catch (err) {
    console.warn('Failed archiving completed order snapshot:', err);
  }
  return false;
}
