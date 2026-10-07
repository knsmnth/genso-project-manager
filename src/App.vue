<template>
  <div :class="['app-container', {
    'sidebar-pinned-open': sidebarMode === 'pinned-open',
    'sidebar-pinned-collapsed': sidebarMode === 'pinned-collapsed',
    'auto-collapse-mode': sidebarMode === 'auto',
    'sidebar-collapsed': sidebarMode !== 'pinned-open'
  }]">
    <!-- Sidebar Navigation -->
    <Sidebar
      :active-view="activeView"
      :sidebar-open="sidebarOpen"
      :is-collapsed="sidebarMode !== 'pinned-open'"
      :sidebar-mode="sidebarMode"
      @view-change="handleViewChange"
      @sidebar-close="sidebarOpen = false"
      @create-order="handleCreateOrder"
    />

    <!-- Main Content Area -->
    <main class="main-content">
      <Header
        v-model:search-query="searchQuery"
        :is-syncing="isSyncing"
        @sync="handleManualSync"
        @menu-toggle="handleMenuToggle"
        @create-order="handleCreateOrder"
      />

      <!-- View Routing Switcher -->
      <div class="main-content-inner">
        <!-- Global Breadcrumb Navigation Bar -->
        <Breadcrumbs
          :active-view="activeView"
          :editing-order-code="editingOrderCode"
          :origin-view="previousViewBeforeOrderForm"
          @navigate="handleViewChange"
        />

        <DashboardView
          v-if="activeView === 'dashboard'"
          :work-orders="workOrders"
          :teams-count="teams.length"
          :teams="teams"
          :personnel="personnel"
          @select-order="handleSelectOrder"
          @view-all="activeView = 'workorders'"
          @create-order="handleCreateOrder"
          @navigate="handleViewChange"
        />

        <WorkOrdersView
          v-if="activeView === 'workorders'"
          :work-orders="workOrders"
          :search-query="searchQuery"
          :catalogs="masterCatalogs"
          @select-order="handleSelectOrder"
          @edit-order="handleEditOrder"
          @delete-order="handleDeleteOrder"
          @update-status="handleUpdateOrderStatus"
          @toggle-active="handleToggleOrderActive"
          @update-inspections="handleUpdateOrderInspections"
          @create-order="handleCreateOrder"
          @navigate-daily-log="activeView = 'dailyworklog'"
          @navigate-history="activeView = 'workloghistory'"
          @toast="addToast"
        />

        <DailyWorkLogView
          v-if="activeView === 'dailyworklog'"
          :personnel="personnel"
          :work-orders="workOrders"
          :teams="teams"
          :equipment-catalog="masterCatalogs.equipment"
          @select-order="handleSelectOrder"
          @edit-order="handleEditOrder"
          @update-workgroup="handleUpdateOrderWorkgroup"
          @navigate-orders="activeView = 'workorders'"
          @navigate-history="activeView = 'workloghistory'"
          @toast="addToast"
        />

        <WorkLogHistoryView
          v-if="activeView === 'workloghistory'"
          :work-orders="workOrders"
          :personnel="personnel"
          :teams="teams"
          :equipment-catalog="masterCatalogs.equipment"
          @select-order="handleSelectOrder"
          @navigate-orders="activeView = 'workorders'"
          @navigate-daily-log="activeView = 'dailyworklog'"
          @toast="addToast"
        />

        <TeamsView
          v-if="activeView === 'teams'"
          :teams="teams"
          :personnel="personnel"
          @new-group="isCreateTeamModalOpen = true"
          @navigate-personnel="activeView = 'personnel'"
          @toast="addToast"
        />

        <PersonnelView
          v-if="activeView === 'personnel'"
          :personnel="personnel"
          :search-query="searchQuery"
          :teams-count="teams.length"
          :breadcrumb-title="'Staff Registry'"
          @navigate-teams="activeView = 'teams'"
          @open-attendance-check="isAttendanceModalOpen = true"
          @open-quick-onboard="activeView = 'quick-onboard'"
        />

        <QuickOnboardView
          v-if="activeView === 'quick-onboard'"
          @complete="handleCompleteOnboarding"
          @cancel="activeView = 'personnel'"
        />

        <CatalogsView
          v-if="activeView === 'catalogs'"
          :catalogs="masterCatalogs"
          @add-item="handleCatalogAddItem"
          @update-item="handleCatalogUpdateItem"
          @delete-item="handleCatalogDeleteItem"
          @toast="addToast"
        />

        <CreateOrderView
          v-if="activeView === 'create-order'"
          :editing-order-code="editingOrderCode"
          :return-view="previousViewBeforeOrderForm"
          :work-orders="workOrders"
          :personnel="personnel"
          :catalogs="masterCatalogs"
          @save-order="handleSaveOrder"
          @cancel="handleCancelForm"
          @manage-catalogs="activeView = 'catalogs'"
          @add-catalog-item="handleCatalogAddItem"
        />
      </div>
    </main>

    <!-- Create Team Modal Overlay -->
    <CreateTeamModal
      :is-open="isCreateTeamModalOpen"
      :personnel="personnel"
      @close="isCreateTeamModalOpen = false"
      @save-team="handleCreateTeam"
    />

    <!-- Global Toast Container -->
    <ToastContainer :toasts="toasts" @dismiss="removeToast" />

    <!-- Details Modal Popup Overlay -->
    <DetailsModal
      :is-open="isDetailsModalOpen"
      :order-code="selectedOrderCode"
      :work-orders="workOrders"
      :catalogs="masterCatalogs"
      @close="handleCloseDetailsModal"
      @edit="handleEditOrder"
      @toggle-active="handleToggleOrderActive"
    />

    <!-- Daily Attendance Modal Overlay -->
    <AttendanceModal
      :is-open="isAttendanceModalOpen"
      :personnel="personnel"
      @close="isAttendanceModalOpen = false"
      @confirm="handleConfirmAttendance"
    />

    <!-- Mobile Bottom Navigation -->
    <!-- Mobile Bottom Navigation (Streamlined 5-Slot Architecture) -->
    <nav class="mobile-bottom-nav">
      <!-- 1. Overview -->
      <button
        :class="['bottom-nav-item', { active: activeView === 'dashboard' }]"
        @click="activeView = 'dashboard'; isMobileMoreOpen = false"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
        <span>Overview</span>
      </button>

      <!-- 2. Orders -->
      <button
        :class="['bottom-nav-item', { active: activeView === 'workorders' }]"
        @click="activeView = 'workorders'; isMobileMoreOpen = false"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        <span>Orders</span>
      </button>

      <!-- 3. Center Elevated Action Button (Create Work Order) -->
      <div class="bottom-nav-center-slot">
        <button
          class="mobile-nav-center-btn"
          @click="handleCreateOrder(); isMobileMoreOpen = false"
          title="Create Work Order"
          aria-label="Create Work Order"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#FFFFFF" stroke-width="2.5">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <!-- 4. Daily Log -->
      <button
        :class="['bottom-nav-item', { active: activeView === 'dailyworklog' }]"
        @click="activeView = 'dailyworklog'; isMobileMoreOpen = false"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <line x1="9" y1="12" x2="15" y2="12" />
          <line x1="9" y1="16" x2="15" y2="16" />
        </svg>
        <span>Daily Log</span>
      </button>

      <!-- 5. More Menu Sheet Toggle -->
      <button
        :class="['bottom-nav-item', { active: isMobileMoreOpen || ['teams', 'personnel', 'quick-onboard', 'catalogs', 'workloghistory'].includes(activeView) }]"
        @click="isMobileMoreOpen = !isMobileMoreOpen"
        aria-label="More Options"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="19" cy="12" r="1.5" />
          <circle cx="5" cy="12" r="1.5" />
        </svg>
        <span>More</span>
      </button>
    </nav>

    <!-- Mobile More Bottom Sheet Modal -->
    <transition name="mobile-fade">
      <div
        v-if="isMobileMoreOpen"
        class="mobile-more-backdrop"
        @click="isMobileMoreOpen = false"
      />
    </transition>

    <transition name="mobile-sheet">
      <div v-if="isMobileMoreOpen" class="mobile-more-sheet">
        <div class="mobile-sheet-drag-handle" @click="isMobileMoreOpen = false"></div>
        <div class="mobile-sheet-header">
          <span class="mobile-sheet-title">More Services</span>
          <button class="mobile-sheet-close-btn" @click="isMobileMoreOpen = false" aria-label="Close menu">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="mobile-sheet-grid">
          <button
            :class="['mobile-sheet-card', { active: activeView === 'workloghistory' }]"
            @click="activeView = 'workloghistory'; isMobileMoreOpen = false"
          >
            <div class="mobile-sheet-icon teal">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div class="mobile-sheet-card-text">
              <span class="mobile-sheet-card-name">Work Log History</span>
              <span class="mobile-sheet-card-sub">Daily Archives & Accomplishments</span>
            </div>
          </button>

          <button
            :class="['mobile-sheet-card', { active: activeView === 'personnel' || activeView === 'teams' || activeView === 'quick-onboard' }]"
            @click="activeView = 'personnel'; isMobileMoreOpen = false"
          >
            <div class="mobile-sheet-icon blue">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="mobile-sheet-card-text">
              <span class="mobile-sheet-card-name">Personnel</span>
              <span class="mobile-sheet-card-sub">{{ personnel.length }} Staff · {{ teams.length }} Teams</span>
            </div>
          </button>

          <button
            :class="['mobile-sheet-card', { active: activeView === 'catalogs' }]"
            @click="activeView = 'catalogs'; isMobileMoreOpen = false"
          >
            <div class="mobile-sheet-icon amber">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke-linecap="round" stroke-linejoin="round" />
                <line x1="12" y1="11" x2="12" y2="17" stroke-linecap="round" />
                <line x1="9" y1="14" x2="15" y2="14" stroke-linecap="round" />
              </svg>
            </div>
            <div class="mobile-sheet-card-text">
              <span class="mobile-sheet-card-name">Registry & Assets</span>
              <span class="mobile-sheet-card-sub">Offices, Equipment & Types</span>
            </div>
          </button>

          <button
            class="mobile-sheet-card"
            @click="alert('Alert notifications are currently empty.'); isMobileMoreOpen = false"
          >
            <div class="mobile-sheet-icon purple">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
            </div>
            <div class="mobile-sheet-card-text">
              <span class="mobile-sheet-card-name">Alerts</span>
              <span class="mobile-sheet-card-sub">System & Workgroup Alerts</span>
            </div>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import Sidebar from './components/layout/Sidebar.vue';
import Header from './components/layout/Header.vue';
import Breadcrumbs from './components/layout/Breadcrumbs.vue';
import DashboardView from './views/DashboardView.vue';
import WorkOrdersView from './views/WorkOrdersView.vue';
import TeamsView from './views/TeamsView.vue';
import CreateOrderView from './views/CreateOrderView.vue';
import DetailsModal from './components/modals/DetailsModal.vue';
import PersonnelView from './views/PersonnelView.vue';
import AttendanceModal from './components/modals/AttendanceModal.vue';
import QuickOnboardView from './views/QuickOnboardView.vue';
import DailyWorkLogView from './views/DailyWorkLogView.vue';
import WorkLogHistoryView from './views/WorkLogHistoryView.vue';
import CatalogsView from './views/CatalogsView.vue';
import ToastContainer from './components/ui/Toast.vue';
import CreateTeamModal from './components/modals/CreateTeamModal.vue';
import { WorkOrder, Person, Team, CatalogItem, CatalogType, InspectionItem } from './types';
import { syncLocalStorageToBackend } from './services/syncService';
import { useUIStore, useWorkOrdersStore, usePersonnelStore, useCatalogsStore } from './stores';

const uiStore = useUIStore();
const workOrdersStore = useWorkOrdersStore();
const personnelStore = usePersonnelStore();
const catalogsStore = useCatalogsStore();

const {
  activeView,
  searchQuery,
  sidebarOpen,
  sidebarMode,
  isMobileMoreOpen,
  selectedOrderCode,
  isDetailsModalOpen,
  isAttendanceModalOpen,
  isCreateTeamModalOpen,
  editingOrderCode,
  previousViewBeforeOrderForm,
  toasts,
  isSyncing
} = storeToRefs(uiStore);

const { workOrders } = storeToRefs(workOrdersStore);
const { personnel, teams } = storeToRefs(personnelStore);
const { masterCatalogs } = storeToRefs(catalogsStore);

const {
  toggleSidebarMode: handleMenuToggle,
  setView: handleViewChange,
  addToast,
  removeToast,
  openCreateOrder: handleCreateOrder,
  openEditOrder: handleEditOrder,
  cancelOrderForm: handleCancelForm,
  openDetailsModal: handleSelectOrder,
  closeDetailsModal: handleCloseDetailsModal
} = uiStore;

const refreshAllData = async () => {
  await Promise.all([
    workOrdersStore.fetchOrders(),
    personnelStore.fetchPersonnelAndTeams(),
    catalogsStore.fetchCatalogs()
  ]);
};

const handleManualSync = async () => {
  if (uiStore.isSyncing) return;
  uiStore.isSyncing = true;
  try {
    const syncRes = await syncLocalStorageToBackend();
    await refreshAllData();
    if (syncRes.totalSynced > 0) {
      uiStore.addToast(`✓ Imported ${syncRes.totalSynced} offline record(s) into database!`, 'success', 4000);
    } else {
      uiStore.addToast('Data is fully synchronized with database.', 'info', 3000);
    }
  } catch (err) {
    console.error('Manual sync failed:', err);
    uiStore.addToast('Sync failed. Please ensure backend is running.', 'error', 4000);
  } finally {
    uiStore.isSyncing = false;
  }
};

onMounted(async () => {
  try {
    const syncRes = await syncLocalStorageToBackend();
    if (syncRes.totalSynced > 0) {
      uiStore.addToast(`✓ Automatically imported ${syncRes.totalSynced} offline record(s) to database!`, 'success', 5000);
    }
  } catch (err) {
    console.warn('Initial sync check:', err);
  }

  await refreshAllData();

  // Automatic day rollover check: resets attendance to present every new day unless on scheduled leave
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      personnelStore.checkDailyReset();
    }
  });

  window.addEventListener('focus', () => {
    personnelStore.checkDailyReset();
  });

  // Check periodically (every 60s) for day rollover
  setInterval(() => {
    personnelStore.checkDailyReset();
  }, 60000);
});

const handleUpdateOrderStatus = async (code: string, newStatus: string) => {
  await workOrdersStore.updateStatus(code, newStatus);
  uiStore.addToast(`Status of ${code} changed to ${newStatus}`);
};

const handleToggleOrderActive = async (code: string) => {
  const isActive = await workOrdersStore.toggleActive(code);
  uiStore.addToast(
    `Work order ${code} marked as ${isActive ? 'Active' : 'Inactive'}`,
    isActive ? 'success' : 'info'
  );
};

const handleUpdateOrderInspections = async (code: string, inspectionList: InspectionItem[]) => {
  await workOrdersStore.updateInspections(code, inspectionList);
};

const handleUpdateOrderWorkgroup = async (code: string, workgroup: string) => {
  await workOrdersStore.updateWorkgroup(code, workgroup);
  uiStore.addToast(`✓ Work Order ${code} assigned to ${workgroup || 'Unassigned'}`);
};

const handleDeleteOrder = async (code: string) => {
  await workOrdersStore.deleteOrder(code);
  uiStore.addToast(`Work order ${code} deleted`, 'warning');
  if (uiStore.selectedOrderCode === code) {
    uiStore.closeDetailsModal();
  }
};

const handleSaveOrder = async (data: WorkOrder) => {
  const isEditing = !!uiStore.editingOrderCode;
  await workOrdersStore.saveOrder(data, isEditing);
  if (isEditing) {
    const lockStatusText = data.isLocked ? '🔒 Locked' : '🔓 Unlocked';
    uiStore.addToast(`✓ Work Order ${data.code} updated & saved successfully (${lockStatusText})`, 'success', 4000);
  } else {
    uiStore.addToast(`✓ Work Order ${data.code} created & saved successfully`, 'success', 4000);
  }
  uiStore.cancelOrderForm();
};

const handleCreateTeam = (newTeam: Team) => {
  personnelStore.createTeam(newTeam);
  uiStore.addToast(`Work Group "${newTeam.name}" created!`);
  uiStore.isCreateTeamModalOpen = false;
};

const handleConfirmAttendance = (records: any) => {
  if (Array.isArray(records) && records.length > 0 && typeof records[0] === 'object') {
    personnelStore.confirmAttendanceBatch(records);
  }
  uiStore.addToast('Daily attendance confirmed successfully!');
  uiStore.isAttendanceModalOpen = false;
};

const handleCompleteOnboarding = async (newPerson: Person) => {
  await personnelStore.completeOnboarding(newPerson);
  uiStore.addToast(`Personnel ${newPerson.name} onboarded successfully!`);
  uiStore.setView('personnel');
};

const handleCatalogAddItem = async (newItem: CatalogItem) => {
  await catalogsStore.addItem(newItem);
};

const handleCatalogUpdateItem = async (updatedItem: CatalogItem) => {
  await catalogsStore.updateItem(updatedItem);
};

const handleCatalogDeleteItem = async (id: string, type: CatalogType) => {
  await catalogsStore.deleteItem(type, id);
};

const alert = (message?: any) => {
  window.alert(message);
};
</script>
