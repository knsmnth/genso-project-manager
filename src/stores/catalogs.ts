import { defineStore } from 'pinia';
import { ref } from 'vue';
import { CatalogItem, CatalogType, MasterCatalogsState } from '../types';
import { loadStoredCatalogs, saveStoredCatalogs } from '../utils/catalogsData';

export const useCatalogsStore = defineStore('catalogs', () => {
  const masterCatalogs = ref<MasterCatalogsState>(loadStoredCatalogs());

  const getTargetCatalogKey = (type: CatalogType): keyof MasterCatalogsState => {
    if (type === 'office') return 'offices';
    if (type === 'work_type') return 'workTypes';
    if (type === 'activity_type') return 'activityTypes';
    if (type === 'item_type') return 'itemTypes';
    if (type === 'equipment') return 'equipment';
    return 'offices';
  };

  const fetchCatalogs = async () => {
    try {
      const catRes = await fetch('/api/catalogs', { headers: { Accept: 'application/json' } });
      if (catRes.ok) {
        const catData = await catRes.json();
        if (catData && catData.offices && catData.offices.length > 0) {
          masterCatalogs.value = {
            offices: catData.offices || [],
            workTypes: catData.workTypes || [],
            activityTypes: catData.activityTypes || [],
            itemTypes: catData.itemTypes || [],
            equipment: catData.equipment || [],
            assets: catData.assets || []
          };
          saveStoredCatalogs(masterCatalogs.value);
        }
      }
    } catch {
      // Offline mode fallback already in memory from loadStoredCatalogs()
    }
  };

  const addItem = async (newItem: CatalogItem) => {
    const targetKey = getTargetCatalogKey(newItem.type);
    const currentArr = masterCatalogs.value[targetKey] || [];
    const updated = [...currentArr, newItem];
    masterCatalogs.value = {
      ...masterCatalogs.value,
      [targetKey]: updated
    };
    saveStoredCatalogs(masterCatalogs.value);

    try {
      await fetch('/api/catalogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(newItem)
      });
    } catch {
      // Graceful offline fallback
    }
  };

  const updateItem = async (updatedItem: CatalogItem) => {
    const targetKey = getTargetCatalogKey(updatedItem.type);
    const currentArr = masterCatalogs.value[targetKey] || [];
    const updated = currentArr.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    masterCatalogs.value = {
      ...masterCatalogs.value,
      [targetKey]: updated
    };
    saveStoredCatalogs(masterCatalogs.value);

    try {
      await fetch(`/api/catalogs/${encodeURIComponent(updatedItem.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(updatedItem)
      });
    } catch {
      // Graceful offline fallback
    }
  };

  const deleteItem = async (type: CatalogType, id: string) => {
    const targetKey = getTargetCatalogKey(type);
    const currentArr = masterCatalogs.value[targetKey] || [];
    const updated = currentArr.filter((item) => item.id !== id);
    masterCatalogs.value = {
      ...masterCatalogs.value,
      [targetKey]: updated
    };
    saveStoredCatalogs(masterCatalogs.value);

    try {
      await fetch(`/api/catalogs/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' }
      });
    } catch {
      // Graceful offline fallback
    }
  };

  return {
    masterCatalogs,
    fetchCatalogs,
    addItem,
    updateItem,
    deleteItem,
    getTargetCatalogKey
  };
});
