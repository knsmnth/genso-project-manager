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
        />

        <PersonnelView
          v-if="activeView === 'personnel'"
          :personnel="personnel"
          :search-query="searchQuery"
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
            :class="['mobile-sheet-card', { active: activeView === 'teams' }]"
            @click="activeView = 'teams'; isMobileMoreOpen = false"
          >
            <div class="mobile-sheet-icon emerald">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <div class="mobile-sheet-card-text">
              <span class="mobile-sheet-card-name">Teams</span>
              <span class="mobile-sheet-card-sub">{{ teams.length }} Maintenance Teams</span>
            </div>
          </button>

          <button
            :class="['mobile-sheet-card', { active: activeView === 'personnel' || activeView === 'quick-onboard' }]"
            @click="activeView = 'personnel'; isMobileMoreOpen = false"
          >
            <div class="mobile-sheet-icon blue">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="7" r="4" />
                <path d="M5.5 21a8.5 8.5 0 0 1 13 0" />
              </svg>
            </div>
            <div class="mobile-sheet-card-text">
              <span class="mobile-sheet-card-name">Staff Roster</span>
              <span class="mobile-sheet-card-sub">{{ personnel.length }} Technicians</span>
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
import { ref, onMounted } from 'vue';
import Sidebar from './components/Sidebar.vue';
import Header from './components/Header.vue';
import Breadcrumbs from './components/Breadcrumbs.vue';
import DashboardView from './components/DashboardView.vue';
import WorkOrdersView from './components/WorkOrdersView.vue';
import TeamsView from './components/TeamsView.vue';
import CreateOrderView from './components/CreateOrderView.vue';
import DetailsModal from './components/DetailsModal.vue';
import PersonnelView from './components/PersonnelView.vue';
import AttendanceModal from './components/AttendanceModal.vue';
import QuickOnboardView from './components/QuickOnboardView.vue';
import DailyWorkLogView from './components/DailyWorkLogView.vue';
import WorkLogHistoryView from './components/WorkLogHistoryView.vue';
import CatalogsView from './components/CatalogsView.vue';
import ToastContainer, { ToastMessage } from './components/Toast.vue';
import CreateTeamModal from './components/CreateTeamModal.vue';
import { WorkOrder, Person, Team, MasterCatalogsState, CatalogItem, CatalogType, InspectionItem } from './types';
import { getWorkOrders, saveWorkOrderToDb, deleteWorkOrderFromDb } from './services/workOrderService';
import { getPersonnel, savePersonToDb } from './services/personnelService';
import { loadStoredCatalogs, saveStoredCatalogs } from './utils/catalogsData';
import { syncLocalStorageToBackend } from './services/syncService';

const DEFAULT_WORK_ORDERS: WorkOrder[] = [
  {
    code: 'WO-8492',
    workTitle: 'LED Fixtures & Electrical Inspection',
    assetName: 'Coconut Dorm',
    space: 'Room 21',
    scope: 'Check electrical outlets, install new LED light fixtures, inspect wire insulation.',
    workgroup: 'Building Repair & Maintenance',
    status: 'On-going',
    priority: 'Medium',
    worktype: 'Electrical',
    startDate: '2024-08-24',
    endDate: '2024-08-26',
    startTime: '08:30 AM',
    endTime: '05:00 PM',
    foreman: 'Robert Chen',
    requesterName: 'Robert Chen',
    requestingOffice: 'Office of Student Housing',
    dateReceived: '2024-08-23',
    isActive: true,
    assigned: ['Sarah Jenkins', 'Marcus Thorne', 'Elena Rodriguez'],
    description:
      'Multiple electrical outlets are inactive. Main breaker checked. Technician needs to test lines and replace standard panels with newer LED light fixtures.',
    tasks: [
      {
        type: 'Electrical',
        remarks: 'Check and repair faulty electrical outlets and rewire main panel line',
        degreeOfWork: 'Moderate'
      },
      {
        type: 'Electrical',
        remarks: 'Install 12 energy-efficient LED light fixtures across Room 21',
        degreeOfWork: 'Routine'
      }
    ]
  },
  {
    code: 'WO-9104',
    workTitle: 'Roof Deck Sealing & Leak Repair',
    assetName: 'DMath',
    space: 'Roof Deck B-4',
    scope: 'Waterproofing repair on cracks, replace sealing membranes, check drainage pipes.',
    workgroup: 'Student Housing Repair & Maintenance',
    status: 'Scheduled',
    priority: 'High',
    worktype: 'Plumbing',
    startDate: '2024-08-25',
    endDate: '2024-08-28',
    startTime: '09:00 AM',
    endTime: '04:30 PM',
    foreman: 'Sarah Jenkins',
    requesterName: 'Dean of Sciences',
    requestingOffice: 'College of Mathematics Office',
    dateReceived: '2024-08-24',
    isActive: true,
    assigned: ['John Doe', 'Alice Williams'],
    description:
      'Minor rainwater leaks reported in classroom ceilings directly below Roof Deck B-4. Sealing membranes degraded.',
    tasks: [
      {
        type: 'Plumbing',
        remarks: 'Check drainage pipes and unclog roof gutter outflows',
        degreeOfWork: 'Major'
      },
      {
        type: 'Masonry',
        remarks: 'Apply high-durability waterproof coating over cracks',
        degreeOfWork: 'Moderate'
      }
    ]
  },
  {
    code: 'WO-7731',
    workTitle: 'Climate Control Recalibration',
    assetName: 'CoMed Laboratory',
    space: 'Lab 101',
    scope: 'Re-calibrate HVAC climate controls, replace filters, clean air duct grills.',
    workgroup: 'Fabrication Workshop',
    status: 'Completed',
    priority: 'Low',
    worktype: 'HVAC',
    startDate: '2024-08-22',
    endDate: '2024-08-22',
    startTime: '10:00 AM',
    endTime: '02:00 PM',
    foreman: 'Marcus Thorne',
    requesterName: 'Dr. Aris Thorne',
    requestingOffice: 'Medical Sciences Division',
    dateReceived: '2024-08-20',
    isActive: true,
    assigned: ['Elena Rodriguez', 'David Kim'],
    description:
      'Lab 101 climate sensors fluctuated by 3 degrees. Calibrated HVAC controls and installed clean filter elements.',
    tasks: [
      {
        type: 'HVAC',
        remarks: 'Recalibrate digital thermostat sensors and damper actuators',
        degreeOfWork: 'Routine'
      },
      {
        type: 'Ventilation',
        remarks: 'Replace HEPA filtration units and clean air grilles',
        degreeOfWork: 'Routine'
      }
    ]
  }
];

const DEFAULT_PERSONNEL: Person[] = [
  { name: 'Elena Rodriguez', role: 'Senior Electrician', code: 'EMP-1024', status: 'Available', id: 'EMP-1024', attendanceStatus: 'Present (08:02)', activeOrder: 'WO-9921-A' },
  { name: 'Julian Marcus', role: 'HVAC Specialist', code: 'EMP-1025', status: 'Busy', id: 'EMP-1025', attendanceStatus: 'Present (07:45)', activeOrder: 'WO-9942-B' },
  { name: 'Sarah Jenkins', role: 'Welding Supervisor', code: 'EMP-1026', status: 'Off-Site', id: 'EMP-1026', attendanceStatus: 'Absent (On Leave)', activeOrder: '—' },
  { name: 'David Chen', role: 'Safety Officer', code: 'EMP-1031', status: 'Available', id: 'EMP-1031', attendanceStatus: 'Present (07:12)', activeOrder: 'SI-102-AUDIT' },
  { name: 'Michael Scott', role: 'Site Manager', code: 'EMP-1032', status: 'Available', id: 'EMP-1032', attendanceStatus: 'Absent', activeOrder: '—' },
  { name: 'Pam Beesly', role: 'Office Admin', code: 'EMP-1033', status: 'Available', id: 'EMP-1033', attendanceStatus: 'Present (08:30)', activeOrder: '—' },
  { name: 'Robert Chen', role: 'Senior Electrician', code: 'MP-9102-E', status: 'On-Site', id: 'MP-9102-E', attendanceStatus: 'Present (07:55)', activeOrder: 'WO-8492' },
  { name: 'John Doe', role: 'General Laborer', code: 'MP-1104-G', status: 'Maintenance', id: 'MP-1104-G', attendanceStatus: 'Present (08:15)', activeOrder: 'WO-9104' },
  { name: 'Alice Williams', role: 'Safety Inspector', code: 'MP-3341-S', status: 'Available', id: 'MP-3341-S', attendanceStatus: 'Absent', activeOrder: '—' },
  { name: 'David Kim', role: 'Masonry Artisan', code: 'MP-6821-M', status: 'Available', id: 'MP-6821-M', attendanceStatus: 'Absent', activeOrder: '—' }
];

const DEFAULT_WORK_GROUPS: Team[] = [
  {
    name: 'Building Repair & Maintenance',
    lead: 'Robert Chen',
    size: 4,
    jobs: 3,
    members: ['Robert Chen', 'Sarah Jenkins', 'Marcus Thorne', 'Elena Rodriguez']
  },
  {
    name: 'Student Housing Repair & Maintenance',
    lead: 'Sarah Jenkins',
    size: 3,
    jobs: 1,
    members: ['Sarah Jenkins', 'John Doe', 'Alice Williams']
  },
  {
    name: 'Fabrication Workshop',
    lead: 'Marcus Thorne',
    size: 3,
    jobs: 2,
    members: ['Marcus Thorne', 'Elena Rodriguez', 'David Kim']
  }
];

const STORAGE_KEY = 'infra_work_orders';
const PERSONNEL_STORAGE_KEY = 'infra_personnel';
const TEAMS_STORAGE_KEY = 'infra_teams';

type SidebarMode = 'pinned-open' | 'pinned-collapsed' | 'auto';

const activeView = ref('dashboard');
const workOrders = ref<WorkOrder[]>([]);
const personnel = ref<Person[]>([]);
const teams = ref<Team[]>([]);
const masterCatalogs = ref<MasterCatalogsState>(loadStoredCatalogs());
const searchQuery = ref('');
const sidebarOpen = ref(false);
const isMobileMoreOpen = ref(false);
const sidebarMode = ref<SidebarMode>(
  (localStorage.getItem('sidebar_mode') as SidebarMode) || 'pinned-open'
);

const handleMenuToggle = () => {
  if (sidebarMode.value === 'pinned-open') {
    sidebarMode.value = 'pinned-collapsed';
  } else {
    sidebarMode.value = 'pinned-open';
  }
  localStorage.setItem('sidebar_mode', sidebarMode.value);
};

const selectedOrderCode = ref<string | null>(null);
const isDetailsModalOpen = ref(false);
const isAttendanceModalOpen = ref(false);
const isCreateTeamModalOpen = ref(false);
const editingOrderCode = ref<string | null>(null);
const previousViewBeforeOrderForm = ref<string>('workorders');
const toasts = ref<ToastMessage[]>([]);

const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success', duration?: number) => {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  toasts.value.push({ id, message, type, duration });
};

const removeToast = (id: string) => {
  toasts.value = toasts.value.filter((t) => t.id !== id);
};

const isSyncing = ref(false);

const refreshAllData = async () => {
  const orders = await getWorkOrders();
  const rawList = orders.length === 0 ? DEFAULT_WORK_ORDERS : orders;
  const normalized = rawList.map((o) => {
    let st = o.status || 'Not Scheduled';
    let act = o.isActive;
    const lower = st.toLowerCase().trim();
    if (lower === 'on hold' || lower === 'pending' || lower === 'not scheduled' || lower === 'notscheduled' || lower === 'unscheduled') {
      st = 'Not Scheduled';
      if (lower === 'on hold') act = false;
    } else if (lower === 'in progress' || lower === 'ongoing' || lower === 'on-going') {
      st = 'On-going';
    } else if (lower === 'completed') {
      st = 'Completed';
    } else if (lower === 'scheduled') {
      st = 'Scheduled';
    }
    if (act === undefined) {
      act = true;
    }

    let cleanedTasks = o.tasks;
    if (cleanedTasks && cleanedTasks.length > 0) {
      cleanedTasks = cleanedTasks.map((t) => ({
        ...t,
        remarks: t.remarks === 'General Maintenance Scope' ? '' : (t.remarks || '')
      }));
      const valid = cleanedTasks.filter(
        (t) => (t.type && t.type.trim() !== '' && t.type.trim() !== '-') ||
               (t.remarks && t.remarks.trim() !== '' && t.remarks.trim() !== '-')
      );
      if (valid.length > 0) {
        cleanedTasks = valid;
      }
    }

    const cleanedScope = o.scope === 'General Maintenance Scope' ? '' : (o.scope || '');

    return {
      ...o,
      scope: cleanedScope,
      status: st,
      isActive: act,
      tasks: cleanedTasks
    };
  });

  // Preserve & migrate any inspections previously stored in Daily Work Log into work orders
  try {
    const rawLogs = localStorage.getItem('infra_daily_work_logs');
    if (rawLogs) {
      const parsedLogs = JSON.parse(rawLogs);
      if (Array.isArray(parsedLogs)) {
        parsedLogs.forEach((l: any) => {
          if (l.workOrderNumber && l.inspectionList && l.inspectionList.length > 0) {
            const matchedOrder = normalized.find((o) => o.code === l.workOrderNumber);
            if (matchedOrder && (!matchedOrder.inspectionList || matchedOrder.inspectionList.length === 0)) {
              matchedOrder.inspectionList = [...l.inspectionList];
              matchedOrder.inspectionsCount = l.inspectionList.length;
            }
          }
        });
      }
    }
  } catch {}

  workOrders.value = normalized;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));

  const staff = await getPersonnel();
  if (staff.length === 0) {
    personnel.value = DEFAULT_PERSONNEL;
    localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(DEFAULT_PERSONNEL));
  } else {
    personnel.value = staff;
  }

  const rawTeams = localStorage.getItem(TEAMS_STORAGE_KEY);
  if (rawTeams) {
    try {
      teams.value = JSON.parse(rawTeams);
    } catch {
      teams.value = DEFAULT_WORK_GROUPS;
    }
  } else {
    teams.value = DEFAULT_WORK_GROUPS;
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(DEFAULT_WORK_GROUPS));
  }

  // Load catalogs from Laravel backend if reachable
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
  } catch (e) {
    // Offline mode: already initialized from local storage
  }
};

const handleManualSync = async () => {
  if (isSyncing.value) return;
  isSyncing.value = true;
  try {
    const syncRes = await syncLocalStorageToBackend();
    await refreshAllData();
    if (syncRes.totalSynced > 0) {
      addToast(`✓ Imported ${syncRes.totalSynced} offline record(s) into database!`, 'success', 4000);
    } else {
      addToast('Data is fully synchronized with database.', 'info', 3000);
    }
  } catch (err) {
    console.error('Manual sync failed:', err);
    addToast('Sync failed. Please ensure backend is running.', 'error', 4000);
  } finally {
    isSyncing.value = false;
  }
};

onMounted(async () => {
  try {
    const syncRes = await syncLocalStorageToBackend();
    if (syncRes.totalSynced > 0) {
      addToast(`✓ Automatically imported ${syncRes.totalSynced} offline record(s) to database!`, 'success', 5000);
    }
  } catch (err) {
    console.warn('Initial sync check:', err);
  }

  await refreshAllData();
});

const saveToStorage = (updatedOrders: WorkOrder[]) => {
  workOrders.value = updatedOrders;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
};

const handleViewChange = (view: string) => {
  activeView.value = view;
  sidebarOpen.value = false;
  isMobileMoreOpen.value = false;
};

const handleSelectOrder = (code: string) => {
  selectedOrderCode.value = code;
  isDetailsModalOpen.value = true;
};

const handleCloseDetailsModal = () => {
  isDetailsModalOpen.value = false;
  selectedOrderCode.value = null;
};

const handleEditOrder = (code: string) => {
  previousViewBeforeOrderForm.value = activeView.value;
  editingOrderCode.value = code;
  activeView.value = 'create-order';
  isDetailsModalOpen.value = false;
};

const handleUpdateOrderStatus = async (code: string, newStatus: string) => {
  const target = workOrders.value.find((o) => o.code === code);
  if (target) {
    target.status = newStatus;
    const updated = [...workOrders.value];
    saveToStorage(updated);
    await saveWorkOrderToDb(target);
    addToast(`Status of ${code} changed to ${newStatus}`);
  }
};

const handleToggleOrderActive = async (code: string) => {
  const target = workOrders.value.find((o) => o.code === code);
  if (target) {
    target.isActive = target.isActive === false ? true : false;
    const updated = [...workOrders.value];
    saveToStorage(updated);
    await saveWorkOrderToDb(target);
    addToast(
      `Work order ${code} marked as ${target.isActive ? 'Active' : 'Inactive'}`,
      target.isActive ? 'success' : 'info'
    );
  }
};

const handleUpdateOrderInspections = async (code: string, inspectionList: InspectionItem[]) => {
  const target = workOrders.value.find((o) => o.code === code);
  if (target) {
    target.inspectionList = inspectionList;
    target.inspectionsCount = inspectionList.length;
    const updated = [...workOrders.value];
    saveToStorage(updated);
    await saveWorkOrderToDb(target);
  }
};

const handleUpdateOrderWorkgroup = async (code: string, workgroup: string) => {
  const target = workOrders.value.find((o) => o.code === code);
  if (target) {
    target.workgroup = workgroup;
    const updated = [...workOrders.value];
    saveToStorage(updated);
    await saveWorkOrderToDb(target);
    addToast(`✓ Work Order ${code} assigned to ${workgroup || 'Unassigned'}`);
  }
};

const handleDeleteOrder = async (code: string) => {
  const updated = workOrders.value.filter((o) => o.code !== code);
  saveToStorage(updated);
  await deleteWorkOrderFromDb(code);
  addToast(`Work order ${code} deleted`, 'warning');
  if (selectedOrderCode.value === code) {
    isDetailsModalOpen.value = false;
    selectedOrderCode.value = null;
  }
};

const handleSaveOrder = async (data: WorkOrder) => {
  let updated: WorkOrder[] = [];
  if (editingOrderCode.value) {
    updated = workOrders.value.map((o) => (o.code === editingOrderCode.value ? data : o));
    const lockStatusText = data.isLocked ? '🔒 Locked' : '🔓 Unlocked';
    addToast(`✓ Work Order ${data.code} updated & saved successfully (${lockStatusText})`, 'success', 4000);
  } else {
    updated = [data, ...workOrders.value];
    addToast(`✓ Work Order ${data.code} created & saved successfully`, 'success', 4000);
  }
  saveToStorage(updated);
  await saveWorkOrderToDb(data);
  const returnTo = previousViewBeforeOrderForm.value || 'workorders';
  editingOrderCode.value = null;
  activeView.value = returnTo;
};

const handleCreateOrder = () => {
  previousViewBeforeOrderForm.value = activeView.value;
  editingOrderCode.value = null;
  activeView.value = 'create-order';
};

const handleCancelForm = () => {
  const returnTo = previousViewBeforeOrderForm.value || 'workorders';
  editingOrderCode.value = null;
  activeView.value = returnTo;
};

const handleCreateTeam = (newTeam: Team) => {
  const updatedTeams = [...teams.value, newTeam];
  teams.value = updatedTeams;
  localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(updatedTeams));
  addToast(`Work Group "${newTeam.name}" created!`);
};

const handleConfirmAttendance = (checkedNames: string[]) => {
  const updated = personnel.value.map((p) => {
    if (checkedNames.includes(p.name)) {
      const hasTime = p.attendanceStatus && p.attendanceStatus.startsWith('Present');
      return {
        ...p,
        attendanceStatus: hasTime ? p.attendanceStatus : 'Present (08:00)'
      };
    } else {
      return {
        ...p,
        attendanceStatus: p.attendanceStatus === 'Absent (On Leave)' ? 'Absent (On Leave)' : 'Absent'
      };
    }
  });
  personnel.value = updated;
  localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(updated));
  updated.forEach((person) => savePersonToDb(person));
  addToast('Attendance roster updated!');
  isAttendanceModalOpen.value = false;
};

const handleCompleteOnboarding = async (newPerson: Person) => {
  const updated = [...personnel.value, newPerson];
  personnel.value = updated;
  localStorage.setItem(PERSONNEL_STORAGE_KEY, JSON.stringify(updated));
  await savePersonToDb(newPerson);
  addToast(`Personnel ${newPerson.name} onboarded successfully!`);
  activeView.value = 'personnel';
};

const getTargetCatalogKey = (type: CatalogType): keyof MasterCatalogsState => {
  if (type === 'office') return 'offices';
  if (type === 'work_type') return 'workTypes';
  if (type === 'activity_type') return 'activityTypes';
  if (type === 'item_type') return 'itemTypes';
  if (type === 'equipment') return 'equipment';
  return 'offices';
};

const handleCatalogAddItem = async (newItem: CatalogItem) => {
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
  } catch (err) {
    // Graceful offline fallback
  }
};

const handleCatalogUpdateItem = async (updatedItem: CatalogItem) => {
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
    await fetch(`/api/catalogs/${updatedItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(updatedItem)
    });
  } catch (err) {
    // Graceful offline fallback
  }
};

const handleCatalogDeleteItem = async (id: string, type: CatalogType) => {
  const targetKey = getTargetCatalogKey(type);
  const currentArr = masterCatalogs.value[targetKey] || [];
  const updated = currentArr.filter((item) => item.id !== id);
  masterCatalogs.value = {
    ...masterCatalogs.value,
    [targetKey]: updated
  };
  saveStoredCatalogs(masterCatalogs.value);

  try {
    await fetch(`/api/catalogs/${id}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' }
    });
  } catch (err) {
    // Graceful offline fallback
  }
};

const alert = (message?: any) => {
  window.alert(message);
};
</script>
