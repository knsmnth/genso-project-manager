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

/**
 * Checks if a work order is completed today (highlighted on current day)
 */
export function isOrderCompletedToday(order: WorkOrder): boolean {
  if (order.status !== 'Completed') return false;
  const todayStr = formatLocalDate(new Date());
  return !order.completedDate || order.completedDate === todayStr;
}

/**
 * Checks if a work order was completed on a previous day (expired from active view)
 */
export function isOrderExpiredCompleted(order: WorkOrder): boolean {
  if (order.status !== 'Completed') return false;
  const todayStr = formatLocalDate(new Date());
  return Boolean(order.completedDate && order.completedDate < todayStr);
}

export interface AssignmentStatus {
  isFullyAssigned: boolean;
  missingStartDate: boolean;
  missingPersonnel: boolean;
  missingLead: boolean;
  missingCategory: boolean;
  badgeText: string;
  badgeTooltip: string;
}

/**
 * Evaluates whether an individual daily work log row is fully scheduled and assigned.
 */
export function evaluateLogAssignmentStatus(row: DailyWorkLogEntry): AssignmentStatus {
  const missingStartDate = !hasValidDate(row.startDate);
  const missingPersonnel = !hasPersonnel(row.assignedPersonnel);
  const missingLead = !row.assignedLead || row.assignedLead.trim() === '' || row.assignedLead === '-';
  const missingCategory = !row.category || row.category.trim() === '' || row.category === '-' || row.category === '__ADD_NEW__';

  const isFullyAssigned = !missingStartDate && !missingPersonnel && !missingLead && !missingCategory;

  let badgeText = '';
  let badgeTooltip = '';

  if (missingStartDate && missingPersonnel) {
    badgeText = 'Unassigned';
    badgeTooltip = 'Starting date and personnel have not been assigned yet';
  } else if (missingStartDate) {
    badgeText = 'Unscheduled';
    badgeTooltip = 'Starting date has not been set yet';
  } else if (missingPersonnel) {
    badgeText = 'Needs Staff';
    badgeTooltip = 'No personnel assigned to this scope of work';
  } else if (missingLead) {
    badgeText = 'Needs Lead';
    badgeTooltip = 'No assigned lead/foreman selected';
  } else if (missingCategory) {
    badgeText = 'Needs Group';
    badgeTooltip = 'Work group category is unassigned';
  }

  return {
    isFullyAssigned,
    missingStartDate,
    missingPersonnel,
    missingLead,
    missingCategory,
    badgeText,
    badgeTooltip
  };
}

/**
 * Evaluates whether a group of daily work log rows (a work order card) is fully scheduled and assigned.
 */
export function evaluateGroupAssignmentStatus(items: DailyWorkLogEntry[]): AssignmentStatus {
  if (!items || items.length === 0) {
    return {
      isFullyAssigned: false,
      missingStartDate: true,
      missingPersonnel: true,
      missingLead: true,
      missingCategory: true,
      badgeText: 'Unassigned',
      badgeTooltip: 'No tasks or scopes defined'
    };
  }

  const anyMissingStartDate = items.some((r) => !hasValidDate(r.startDate));
  const anyMissingPersonnel = items.some((r) => !hasPersonnel(r.assignedPersonnel));
  const anyMissingLead = items.some((r) => !r.assignedLead || r.assignedLead.trim() === '' || r.assignedLead === '-');
  const missingCategory = !items[0]?.category || items[0].category.trim() === '' || items[0].category === '-' || items[0].category === '__ADD_NEW__';

  const isFullyAssigned = !anyMissingStartDate && !anyMissingPersonnel && !anyMissingLead && !missingCategory;

  let badgeText = '';
  let badgeTooltip = '';

  if (anyMissingStartDate && anyMissingPersonnel) {
    badgeText = 'Unassigned';
    badgeTooltip = 'Starting date and personnel have not been assigned yet';
  } else if (anyMissingStartDate) {
    badgeText = 'Unscheduled';
    badgeTooltip = 'Starting date has not been set yet on one or more scopes';
  } else if (anyMissingPersonnel) {
    badgeText = 'Needs Staff';
    badgeTooltip = 'Personnel need to be assigned to one or more scopes';
  } else if (missingCategory) {
    badgeText = 'Needs Group';
    badgeTooltip = 'Work group registry has not been assigned to this card';
  } else if (anyMissingLead) {
    badgeText = 'Needs Lead';
    badgeTooltip = 'Lead/foreman has not been designated';
  }

  return {
    isFullyAssigned,
    missingStartDate: anyMissingStartDate,
    missingPersonnel: anyMissingPersonnel,
    missingLead: anyMissingLead,
    missingCategory,
    badgeText,
    badgeTooltip
  };
}
