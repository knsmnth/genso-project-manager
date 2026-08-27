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
      :is-pinned="sidebarMode === 'pinned-open'"
      :sidebar-mode="sidebarMode"
      @toggle-pin="handleTogglePin"
      @view-change="handleViewChange"
      @sidebar-close="sidebarOpen = false"
      @create-order="handleCreateOrder"
    />

    <!-- Main Content Area -->
    <main class="main-content">
      <Header
        v-model:search-query="searchQuery"
        @menu-toggle="handleMenuToggle"
        @create-order="handleCreateOrder"
      />

      <!-- View Routing Switcher -->
      <div class="main-content-inner">
        <!-- Global Breadcrumb Navigation Bar -->
        <Breadcrumbs
          :active-view="activeView"
          :editing-order-code="editingOrderCode"
          @navigate="handleViewChange"
        />

        <DashboardView
          v-if="activeView === 'dashboard'"
          :work-orders="workOrders"
          :teams-count="teams.length"
          :personnel="personnel"
          @select-order="handleSelectOrder"
          @view-all="activeView = 'workorders'"
        />

        <WorkOrdersView
          v-if="activeView === 'workorders'"
          :work-orders="workOrders"
          :search-query="searchQuery"
          @select-order="handleSelectOrder"
          @edit-order="handleEditOrder"
          @delete-order="handleDeleteOrder"
          @create-order="handleCreateOrder"
          @navigate-daily-log="activeView = 'dailyworklog'"
        />

        <DailyWorkLogView
          v-if="activeView === 'dailyworklog'"
          :personnel="personnel"
          :work-orders="workOrders"
          @select-order="handleSelectOrder"
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

        <CreateOrderView
          v-if="activeView === 'create-order'"
          :editing-order-code="editingOrderCode"
          :work-orders="workOrders"
          :personnel="personnel"
          @save-order="handleSaveOrder"
          @cancel="handleCancelForm"
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
      @close="handleCloseDetailsModal"
      @edit="handleEditOrder"
    />

    <!-- Daily Attendance Modal Overlay -->
    <AttendanceModal
      :is-open="isAttendanceModalOpen"
      :personnel="personnel"
      @close="isAttendanceModalOpen = false"
      @confirm="handleConfirmAttendance"
    />

    <!-- Mobile Bottom Navigation -->
    <nav class="mobile-bottom-nav" style="padding: 0 8px">
      <button
        :class="['bottom-nav-item', { active: activeView === 'dashboard' }]"
        @click="activeView = 'dashboard'"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
        <span style="font-size: 10px">Overview</span>
      </button>

      <button
        :class="['bottom-nav-item', { active: activeView === 'workorders' }]"
        @click="activeView = 'workorders'"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        <span style="font-size: 10px">Orders</span>
      </button>

      <button
        :class="['bottom-nav-item', { active: activeView === 'teams' }]"
        @click="activeView = 'teams'"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
        <span style="font-size: 10px">Teams</span>
      </button>

      <button
        :class="['bottom-nav-item', { active: activeView === 'personnel' || activeView === 'quick-onboard' }]"
        @click="activeView = 'personnel'"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 21a8.5 8.5 0 0 1 13 0" />
        </svg>
        <span style="font-size: 10px">Staff</span>
      </button>

      <button
        :class="['bottom-nav-item', { active: activeView === 'alerts' }]"
        @click="alert('Alert notifications are currently empty.')"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        </svg>
        <span style="font-size: 10px">Alerts</span>
      </button>
    </nav>

    <!-- Pinned Mobile Floating Action Button (FAB) -->
    <button class="mobile-fab-create" @click="handleCreateOrder" aria-label="Create Work Order">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#FFFFFF" stroke-width="2.5">
        <path d="M12 5v14M5 12h14" stroke-linecap="round" />
      </svg>
    </button>
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
import ToastContainer, { ToastMessage } from './components/Toast.vue';
import CreateTeamModal from './components/CreateTeamModal.vue';
import { WorkOrder, Person, Team } from './types';
import { getWorkOrders, saveWorkOrderToDb, deleteWorkOrderFromDb } from './services/workOrderService';
import { getPersonnel, savePersonToDb } from './services/personnelService';

const DEFAULT_WORK_ORDERS: WorkOrder[] = [
  {
    code: 'WO-8492',
    assetName: 'Coconut Dorm',
    space: 'Room 21',
    scope: 'Check electrical outlets, install new LED light fixtures, inspect wire insulation.',
    workgroup: 'Building Repair & Maintenance',
    status: 'In Progress',
    priority: 'Medium',
    worktype: 'Electrical',
    startDate: '2024-08-24',
    endDate: '2024-08-26',
    startTime: '08:30 AM',
    endTime: '05:00 PM',
    foreman: 'Robert Chen',
    assigned: ['Sarah Jenkins', 'Marcus Thorne', 'Elena Rodriguez'],
    description:
      'Multiple electrical outlets are inactive. Main breaker checked. Technician needs to test lines and replace standard panels with newer LED light fixtures.'
  },
  {
    code: 'WO-9104',
    assetName: 'DMath',
    space: 'Roof Deck B-4',
    scope: 'Waterproofing repair on cracks, replace sealing membranes, check drainage pipes.',
    workgroup: 'Student Housing Repair & Maintenance',
    status: 'Pending',
    priority: 'High',
    worktype: 'Plumbing',
    startDate: '2024-08-25',
    endDate: '2024-08-28',
    startTime: '09:00 AM',
    endTime: '04:30 PM',
    foreman: 'Sarah Jenkins',
    assigned: ['John Doe', 'Alice Williams'],
    description:
      'Minor rainwater leaks reported in classroom ceilings directly below Roof Deck B-4. Sealing membranes degraded.'
  },
  {
    code: 'WO-7731',
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
    assigned: ['Elena Rodriguez', 'David Kim'],
    description:
      'Lab 101 climate sensors fluctuated by 3 degrees. Calibrated HVAC controls and installed clean filter elements.'
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
const searchQuery = ref('');
const sidebarOpen = ref(false);
const sidebarMode = ref<SidebarMode>(
  (localStorage.getItem('sidebar_mode') as SidebarMode) || 'pinned-open'
);

const handleTogglePin = () => {
  if (sidebarMode.value === 'pinned-open') {
    sidebarMode.value = 'auto'; // unpinned (hover to auto-expand)
    addToast('Navigation unpinned: Auto-collapse on mouse leave enabled.', 'info');
  } else {
    sidebarMode.value = 'pinned-open'; // pinned open permanently
    addToast('Navigation pinned: Staying open permanently.', 'info');
  }
  localStorage.setItem('sidebar_mode', sidebarMode.value);
};

const selectedOrderCode = ref<string | null>(null);
const isDetailsModalOpen = ref(false);
const isAttendanceModalOpen = ref(false);
const isCreateTeamModalOpen = ref(false);
const editingOrderCode = ref<string | null>(null);
const toasts = ref<ToastMessage[]>([]);

const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success', duration?: number) => {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  toasts.value.push({ id, message, type, duration });
};

const removeToast = (id: string) => {
  toasts.value = toasts.value.filter((t) => t.id !== id);
};

onMounted(async () => {
  const orders = await getWorkOrders();
  if (orders.length === 0) {
    workOrders.value = DEFAULT_WORK_ORDERS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WORK_ORDERS));
  } else {
    workOrders.value = orders;
  }

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
});

const saveToStorage = (updatedOrders: WorkOrder[]) => {
  workOrders.value = updatedOrders;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
};

const handleViewChange = (view: string) => {
  activeView.value = view;
  sidebarOpen.value = false;
};

const handleMenuToggle = () => {
  if (window.innerWidth > 1024) {
    if (sidebarMode.value === 'pinned-open') {
      sidebarMode.value = 'pinned-collapsed';
      addToast('Navigation pinned in collapsed mode.', 'info');
    } else if (sidebarMode.value === 'pinned-collapsed') {
      sidebarMode.value = 'pinned-open';
      addToast('Navigation pinned open.', 'info');
    } else {
      sidebarMode.value = 'pinned-collapsed';
      addToast('Navigation pinned in collapsed mode.', 'info');
    }
    localStorage.setItem('sidebar_mode', sidebarMode.value);
  } else {
    sidebarOpen.value = !sidebarOpen.value;
  }
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
  editingOrderCode.value = code;
  activeView.value = 'create-order';
  isDetailsModalOpen.value = false;
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
    addToast(`Work order ${data.code} updated successfully`);
  } else {
    updated = [data, ...workOrders.value];
    addToast(`Work order ${data.code} created successfully`);
  }
  saveToStorage(updated);
  await saveWorkOrderToDb(data);
  editingOrderCode.value = null;
  activeView.value = 'workorders';
};

const handleCreateOrder = () => {
  editingOrderCode.value = null;
  activeView.value = 'create-order';
};

const handleCancelForm = () => {
  editingOrderCode.value = null;
  activeView.value = 'workorders';
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
</script>
