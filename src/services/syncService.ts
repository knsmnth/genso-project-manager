import { apiClient, isBackendConfigured } from './api';
import { WorkOrder, Person, Team, MasterCatalogsState, CatalogItem } from '../types';

const WORK_ORDERS_KEY = 'infra_work_orders';
const PERSONNEL_KEY = 'infra_personnel';
const TEAMS_KEY = 'infra_teams';
const CATALOGS_KEY = 'genso_master_catalogs_v2';

export interface SyncResult {
  syncedWorkOrders: number;
  syncedCatalogs: number;
  syncedPersonnel: number;
  syncedTeams: number;
  totalSynced: number;
}

/**
 * Inspects browser localStorage and automatically uploads any locally cached
 * records that do not yet exist in the Laravel backend database.
 */
export const syncLocalStorageToBackend = async (): Promise<SyncResult> => {
  const result: SyncResult = {
    syncedWorkOrders: 0,
    syncedCatalogs: 0,
    syncedPersonnel: 0,
    syncedTeams: 0,
    totalSynced: 0
  };

  if (!isBackendConfigured()) {
    return result;
  }

  // 1. Sync Work Orders
  try {
    const rawLocalOrders = localStorage.getItem(WORK_ORDERS_KEY);
    if (rawLocalOrders) {
      const localOrders: WorkOrder[] = JSON.parse(rawLocalOrders);
      if (Array.isArray(localOrders) && localOrders.length > 0) {
        const backendRes = await apiClient.get('/work-orders');
        const dbOrders: WorkOrder[] = Array.isArray(backendRes.data) ? backendRes.data : [];
        const existingCodes = new Set(dbOrders.map((o) => (o.code || '').trim().toUpperCase()));

        for (const order of localOrders) {
          if (!order.code) continue;
          const codeUpper = order.code.trim().toUpperCase();
          if (!existingCodes.has(codeUpper)) {
            try {
              await apiClient.post('/work-orders', order);
              result.syncedWorkOrders++;
              existingCodes.add(codeUpper);
            } catch (err) {
              console.warn(`Failed to sync order ${order.code} to DB:`, err);
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Error during work orders sync:', err);
  }

  // 2. Sync Master Catalogs (Offices, Assets, Work Types, Equipment)
  try {
    const rawLocalCatalogs = localStorage.getItem(CATALOGS_KEY);
    if (rawLocalCatalogs) {
      const localCatalogs: MasterCatalogsState = JSON.parse(rawLocalCatalogs);
      const catRes = await apiClient.get('/catalogs');
      const dbCatalogs = catRes.data || {};

      const syncCatalogList = async (localList: CatalogItem[] | undefined, dbList: any[] | undefined, defaultType: string) => {
        if (!Array.isArray(localList) || localList.length === 0) return;
        const existingNames = new Set(
          (Array.isArray(dbList) ? dbList : []).map((i) => (i.name || '').trim().toLowerCase())
        );

        for (const item of localList) {
          const nameLower = (item.name || '').trim().toLowerCase();
          if (nameLower && !existingNames.has(nameLower)) {
            try {
              const payload = {
                type: item.type || defaultType,
                name: item.name,
                code: item.code || null,
                acronym: item.acronym || null,
                title: item.title || null,
                color: item.color || null,
                category: item.category || null,
                location: item.location || null,
                owner: item.owner || null,
                purchased: item.purchased || null,
                contactPerson: item.contactPerson || null,
                quantity: item.quantity || 1,
                isActive: item.isActive !== false,
                description: item.description || null
              };
              await apiClient.post('/catalogs', payload);
              result.syncedCatalogs++;
              existingNames.add(nameLower);
            } catch (err) {
              console.warn(`Failed to sync catalog item ${item.name}:`, err);
            }
          }
        }
      };

      await syncCatalogList(localCatalogs.offices, dbCatalogs.offices, 'office');
      await syncCatalogList(localCatalogs.workTypes, dbCatalogs.workTypes, 'work_type');
      await syncCatalogList(localCatalogs.activityTypes, dbCatalogs.activityTypes, 'activity_type');
      await syncCatalogList(localCatalogs.itemTypes, dbCatalogs.itemTypes, 'item_type');
      await syncCatalogList(localCatalogs.equipment, dbCatalogs.equipment, 'equipment');
    }
  } catch (err) {
    console.warn('Error during catalogs sync:', err);
  }

  // 3. Sync Personnel
  try {
    const rawLocalPersonnel = localStorage.getItem(PERSONNEL_KEY);
    if (rawLocalPersonnel) {
      const localPersonnel: Person[] = JSON.parse(rawLocalPersonnel);
      if (Array.isArray(localPersonnel) && localPersonnel.length > 0) {
        const personRes = await apiClient.get('/personnel');
        const dbPersonnel: Person[] = Array.isArray(personRes.data) ? personRes.data : [];
        const existingCodes = new Set(dbPersonnel.map((p) => (p.code || '').trim().toUpperCase()));

        for (const person of localPersonnel) {
          if (!person.code) continue;
          const codeUpper = person.code.trim().toUpperCase();
          if (!existingCodes.has(codeUpper)) {
            try {
              await apiClient.post('/personnel', person);
              result.syncedPersonnel++;
              existingCodes.add(codeUpper);
            } catch (err) {
              console.warn(`Failed to sync person ${person.name}:`, err);
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Error during personnel sync:', err);
  }

  // 4. Sync Teams
  try {
    const rawLocalTeams = localStorage.getItem(TEAMS_KEY);
    if (rawLocalTeams) {
      const localTeams: Team[] = JSON.parse(rawLocalTeams);
      if (Array.isArray(localTeams) && localTeams.length > 0) {
        const teamsRes = await apiClient.get('/teams');
        const dbTeams: Team[] = Array.isArray(teamsRes.data) ? teamsRes.data : [];
        const existingNames = new Set(dbTeams.map((t) => (t.name || '').trim().toLowerCase()));

        for (const team of localTeams) {
          const nameLower = (team.name || '').trim().toLowerCase();
          if (nameLower && !existingNames.has(nameLower)) {
            try {
              await apiClient.post('/teams', team);
              result.syncedTeams++;
              existingNames.add(nameLower);
            } catch (err) {
              console.warn(`Failed to sync team ${team.name}:`, err);
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Error during teams sync:', err);
  }

  result.totalSynced =
    result.syncedWorkOrders +
    result.syncedCatalogs +
    result.syncedPersonnel +
    result.syncedTeams;

  return result;
};
