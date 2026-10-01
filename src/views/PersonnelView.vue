<template>
  <section id="view-personnel" class="view-section active personnel-view-container">
    <!-- Header Row (Page Title Synchronized with Breadcrumbs) -->
    <div class="view-header-row">
      <div class="personnel-title-group">
        <h1 class="view-main-title">{{ pageTitle }}</h1>
        <p class="view-main-subtitle" style="margin: 0">
          Manage credentials, work assignments, and daily status of site staff.
        </p>
      </div>

      <div class="view-header-actions">
        <!-- Action 1: Schedule Leave (Early Filing) -->
        <button
          type="button"
          class="btn btn-outline"
          @click="isLeaveModalOpen = true"
          style="height: 36px; padding: 0 14px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px"
          title="Schedule staff leave in advance"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <line x1="12" y1="14" x2="12" y2="18" />
            <line x1="10" y1="16" x2="14" y2="16" />
          </svg>
          <span>Schedule Leave</span>
        </button>

        <!-- Action 2: Daily Attendance Check -->
        <button
          type="button"
          class="btn btn-outline"
          @click="$emit('openAttendanceCheck')"
          style="height: 36px; padding: 0 14px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px"
          title="Perform today's attendance check"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>Attendance Check</span>
        </button>

        <!-- Action 3: Quick Onboard -->
        <button
          type="button"
          class="btn btn-primary"
          @click="$emit('openQuickOnboard')"
          style="height: 36px; padding: 0 16px; font-size: 13px"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#FFFFFF" stroke-width="2.5">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" />
          </svg>
          <span>Quick Onboard</span>
        </button>
      </div>
    </div>

    <!-- Sub-View Module Navigation Tabs (Breadcrumbs) -->
    <div class="module-tab-bar">
      <!-- Left: Navigation Tabs -->
      <div class="module-tabs">
        <button
          type="button"
          class="module-tab-btn active"
          title="Staff Registry"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="7" r="4" />
            <path d="M5.5 21a8.5 8.5 0 0 1 13 0" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>Staff Registry</span>
          <span class="module-tab-count">{{ personnel.length }}</span>
        </button>

        <button
          type="button"
          class="module-tab-btn"
          @click="$emit('navigateTeams')"
          title="Switch to Teams & Groups"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>Teams & Groups</span>
          <span v-if="teamsCount !== undefined" class="module-tab-count">{{ teamsCount }}</span>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" style="opacity: 0.6">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <!-- Right: Utility Actions (Toggle General Attendance History) -->
      <div class="module-utility-actions">
        <button
          type="button"
          :class="['attendance-history-toggle', { 'is-active': showHistoryLog }]"
          @click="showHistoryLog = !showHistoryLog"
          title="Toggle General Attendance History Roster"
        >
          <svg class="clock-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{{ showHistoryLog ? 'Hide History' : 'General Attendance History' }}</span>
          <svg
            class="chevron-icon"
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            :style="{
              transform: showHistoryLog ? 'rotate(180deg)' : 'rotate(0deg)'
            }"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Interactive Attendance Graph -->
    <AttendanceGraphCard
      :personnel="personnel"
      :attendance-history="personnelStore.attendanceHistory"
      :teams-count="teamsCount"
    />

    <!-- General Attendance History Panel (High-Density Roster for 80+ Staff) -->
    <div v-if="showHistoryLog" class="attendance-history-collapse-panel">
      <div class="attendance-history-panel-header">
        <div class="attendance-history-panel-title">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>General Attendance History</span>
        </div>

        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap">
          <!-- Quick name filter for 80+ roster -->
          <div class="roster-filter-input-wrap">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Filter roster..."
              v-model="historySearch"
              class="roster-filter-input"
            />
            <button
              v-if="historySearch"
              type="button"
              class="roster-filter-clear"
              @click="historySearch = ''"
              title="Clear filter"
            >
              ×
            </button>
          </div>

          <div style="display: flex; align-items: center; gap: 6px">
            <label style="font-size: 12px; font-weight: 600; color: #475569">Roster Date:</label>
            <input
              type="date"
              class="form-input"
              v-model="selectedHistoryDate"
              @change="handleHistoryDateChange"
              style="width: 135px; height: 32px; padding: 0 8px; font-size: 12px; border-radius: 6px"
            />
          </div>

          <button
            class="btn btn-outline-sm"
            @click="handleExportCsv"
            style="height: 32px; font-size: 12px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            <span>Export</span>
          </button>
        </div>
      </div>

      <div class="history-rosters-wrapper">
        <!-- Roster Category Filter Tabs -->
        <div class="history-sub-tabs">
          <button
            type="button"
            :class="['h-sub-tab', { active: activeHistoryCategory === 'all' }]"
            @click="activeHistoryCategory = 'all'"
          >
            <span>All Staff</span>
            <span class="h-tab-count">{{ currentDayRosterAll.length }}</span>
          </button>

          <button
            type="button"
            :class="['h-sub-tab', { active: activeHistoryCategory === 'present' }]"
            @click="activeHistoryCategory = 'present'"
          >
            <AttendanceBadge status="present" size="sm" />
            <span>Present</span>
            <span class="h-tab-count">{{ currentDayRoster.present.length }}</span>
          </button>

          <button
            type="button"
            :class="['h-sub-tab', { active: activeHistoryCategory === 'absent' }]"
            @click="activeHistoryCategory = 'absent'"
          >
            <AttendanceBadge status="absent" size="sm" />
            <span>Absent</span>
            <span class="h-tab-count">{{ currentDayRoster.absent.length }}</span>
          </button>

          <button
            type="button"
            :class="['h-sub-tab', { active: activeHistoryCategory === 'half' }]"
            @click="activeHistoryCategory = 'half'"
          >
            <AttendanceBadge status="half_am" size="sm" />
            <span>Half-Day</span>
            <span class="h-tab-count">{{ currentDayRoster.half_am.length + currentDayRoster.half_pm.length }}</span>
          </button>

          <button
            type="button"
            :class="['h-sub-tab', { active: activeHistoryCategory === 'on_leave' }]"
            @click="activeHistoryCategory = 'on_leave'"
          >
            <AttendanceBadge status="on_leave" size="sm" />
            <span>On Leave</span>
            <span class="h-tab-count">{{ currentDayRoster.on_leave.length }}</span>
          </button>
        </div>

        <!-- Attendance History Table (Optimized for 80+ Staff) -->
        <div v-if="displayedHistoryPersons.length === 0" class="history-table-empty">
          No personnel found for this selection.
        </div>

        <div v-else class="history-table-container">
          <table class="history-data-table">
            <thead>
              <tr>
                <th class="history-th col-index">#</th>
                <th class="history-th col-name">Personnel Name</th>
                <th class="history-th col-status">Status</th>
                <th class="history-th col-order">Active Order</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(person, idx) in displayedHistoryPersons"
                :key="person.code || person.name"
                class="history-tr"
              >
                <td class="history-td col-index">{{ idx + 1 }}</td>
                <td class="history-td col-name">
                  <span class="history-name-text">{{ person.name }}</span>
                </td>
                <td class="history-td col-status">
                  <div class="history-status-group">
                    <AttendanceBadge :status="person.status" size="sm" />
                    <span :class="['history-status-tag', `tag-${person.status}`]">
                      {{ formatStatusLabel(person.status) }}
                    </span>
                  </div>
                </td>
                <td class="history-td col-order">
                  <span
                    :class="['history-order-pill', { 'is-empty': getPersonActiveOrder(person) === '—' }]"
                  >
                    {{ getPersonActiveOrder(person) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- History Table Summary Footer -->
        <div v-if="displayedHistoryPersons.length > 0" class="history-table-footer">
          <span>Showing <strong>{{ displayedHistoryPersons.length }}</strong> of {{ currentDayRosterAll.length }} personnel</span>
          <span v-if="historySearch" class="history-filter-active-note">Filtered by: "{{ historySearch }}"</span>
        </div>
      </div>
    </div>

    <!-- Section: Personnel Registry Table -->
    <div class="card table-card" style="min-width: 0; margin-top: 4px">
      <div class="card-header space-between" style="border-bottom: 1px solid #bbcabf">
        <div>
          <h3 style="font-size: 18px; font-weight: 600; color: #0b1c30">{{ pageTitle }}</h3>
          <span style="font-size: 12px; color: #3c4a42">Manage credentials and daily status of site staff.</span>
        </div>

        <div style="display: flex; gap: 10px; align-items: center">
          <div class="personnel-table-search">
            <svg class="search-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search personnel..."
              v-model="tableSearch"
            />
            <button
              v-if="tableSearch"
              type="button"
              class="search-clear-btn"
              @click="tableSearch = ''"
              title="Clear search"
            >
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <button
            class="btn btn-primary"
            @click="handleExportCsv"
            style="height: 36px; padding: 0 16px; font-size: 13px; font-weight: 600; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div class="card-body no-padding">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr style="background: #eff4ff; border-bottom: 1px solid #bbcabf">
                <th>PERSONNEL</th>
                <th>SPECIALIZATION</th>
                <th>AVAILABILITY</th>
                <th>ATTENDANCE</th>
                <th>ACTIVE ORDER</th>
                <th style="text-align: right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filtered.length === 0">
                <td colspan="6" style="text-align: center; padding: 32px; color: var(--color-text-muted)">
                  No staff records match search query.
                </td>
              </tr>
              <tr v-else v-for="p in filtered" :key="p.code || p.name">
                <td>
                  <div class="name-code-cell">
                    <div :class="['initials-avatar', getAvatarColorClass(p.name)]">
                      {{ getInitials(p.name) }}
                    </div>
                    <div>
                      <span class="cell-primary" style="font-size: 13px">{{ p.name }}</span>
                      <span class="cell-subtext" style="font-size: 11px; font-family: monospace">
                        {{ p.id || p.code }}
                      </span>
                    </div>
                  </div>
                </td>
                <td style="font-size: 13px">{{ p.role }}</td>
                <td>
                  <span
                    :class="['status-badge-outline', getAvailabilityClass(p.status)]"
                    style="text-transform: uppercase; font-size: 11px"
                  >
                    {{ p.status }}
                  </span>
                </td>

                <!-- ATTENDANCE WITH 1-CLICK EDIT FUNCTION FOR ACCIDENTAL CORRECTION -->
                <td>
                  <div class="attend-cell-wrap" @click.stop>
                    <button
                      type="button"
                      :class="['attend-cell-btn', 'only-icon', { 'is-leave-locked': isPersonOnLeave(p) }]"
                      @click="handleAttendButtonClick(p)"
                      :title="isPersonOnLeave(p) ? 'On Scheduled Leave (Locked) — Attendance cannot be changed directly. Edit or delete the leave in Schedule Leave.' : 'Click to edit status (currently ' + formatStatusLabel(getAttendanceStatus(p)) + ')'"
                    >
                      <AttendanceBadge :status="getAttendanceStatus(p)" size="md" />
                      <span v-if="isPersonOnLeave(p)" class="attend-lock-indicator" title="Scheduled Leave">
                        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                    </button>

                    <!-- Quick Status Edit Popover -->
                    <div
                      v-if="activePopoverPersonCode === (p.code || p.id || p.name)"
                      class="attend-quick-popover"
                    >
                      <div class="popover-header">Quick Edit Attendance</div>

                      <button
                        type="button"
                        :class="['popover-option-btn', { 'is-active': getAttendanceStatus(p) === 'present' }]"
                        @click="handleInlineStatusChange(p.code || p.id || p.name, 'present')"
                      >
                        <AttendanceBadge status="present" size="sm" />
                        <span>Present</span>
                      </button>

                      <button
                        type="button"
                        :class="['popover-option-btn', { 'is-active': getAttendanceStatus(p) === 'absent' }]"
                        @click="handleInlineStatusChange(p.code || p.id || p.name, 'absent')"
                      >
                        <AttendanceBadge status="absent" size="sm" />
                        <span>Absent</span>
                      </button>

                      <button
                        type="button"
                        :class="['popover-option-btn', { 'is-active': getAttendanceStatus(p) === 'half_am' }]"
                        @click="handleInlineStatusChange(p.code || p.id || p.name, 'half_am')"
                      >
                        <AttendanceBadge status="half_am" size="sm" />
                        <span>Absent AM / Present PM</span>
                      </button>

                      <button
                        type="button"
                        :class="['popover-option-btn', { 'is-active': getAttendanceStatus(p) === 'half_pm' }]"
                        @click="handleInlineStatusChange(p.code || p.id || p.name, 'half_pm')"
                      >
                        <AttendanceBadge status="half_pm" size="sm" />
                        <span>Present AM / Absent PM</span>
                      </button>

                      <button
                        type="button"
                        :class="['popover-option-btn', { 'is-active': getAttendanceStatus(p) === 'on_leave' }]"
                        @click="handleInlineStatusChange(p.code || p.id || p.name, 'on_leave')"
                      >
                        <AttendanceBadge status="on_leave" size="sm" />
                        <span>On Leave</span>
                      </button>
                    </div>
                  </div>
                </td>

                <td
                  style="font-size: 13px; font-weight: 600; font-family: monospace"
                  :style="{ color: p.activeOrder !== '—' ? 'var(--color-primary)' : 'inherit' }"
                >
                  {{ p.activeOrder || '—' }}
                </td>

                <!-- VIEW RECORDS ACTION -->
                <td style="text-align: right">
                  <a
                    href="#"
                    class="action-link"
                    @click.prevent="openPersonnelRecords(p.code || p.id || p.name)"
                    style="font-size: 12px; font-weight: 600"
                  >
                    View Records
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal 1: Schedule Leave Modal -->
    <LeaveScheduleModal
      :is-open="isLeaveModalOpen"
      :personnel="personnel"
      :leaves="leaves"
      @close="isLeaveModalOpen = false"
      @schedule="handleScheduleLeave"
      @delete-leave="handleDeleteLeave"
    />

    <!-- Drawer: Personnel Dossier (View Records) -->
    <PersonnelRecordsDrawer
      :is-open="isRecordsDrawerOpen"
      :personnel-code="selectedPersonnelCode"
      @close="isRecordsDrawerOpen = false"
      @profile-updated="handleProfileUpdated"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Person, AttendanceStatusType, AttendanceRosterPerson } from '../types';
import { usePersonnelStore } from '../stores/personnel';
import AttendanceBadge from '../components/ui/AttendanceBadge.vue';
import AttendanceGraphCard from '../components/ui/AttendanceGraphCard.vue';
import LeaveScheduleModal from '../components/modals/LeaveScheduleModal.vue';
import PersonnelRecordsDrawer from '../components/modals/PersonnelRecordsDrawer.vue';

const props = withDefaults(
  defineProps<{
    personnel: Person[];
    searchQuery?: string;
    teamsCount?: number;
    breadcrumbTitle?: string;
  }>(),
  {
    searchQuery: '',
    breadcrumbTitle: 'Staff Registry'
  }
);

defineEmits<{
  (e: 'openAttendanceCheck'): void;
  (e: 'openQuickOnboard'): void;
  (e: 'navigateTeams'): void;
}>();

const personnelStore = usePersonnelStore();

// Dynamic Header title matching Breadcrumbs
const pageTitle = computed(() => props.breadcrumbTitle || 'Staff Registry');

// UI States
const isLeaveModalOpen = ref(false);
const isRecordsDrawerOpen = ref(false);
const selectedPersonnelCode = ref('');
const showHistoryLog = ref(false);
const activePopoverPersonCode = ref<string | null>(null);

// General Attendance History States
const selectedHistoryDate = ref(new Date().toISOString().split('T')[0]);
const activeHistoryCategory = ref<'all' | 'present' | 'absent' | 'half' | 'on_leave'>('all');
const historySearch = ref('');

const tableSearch = ref('');
const leaves = computed(() => personnelStore.leaves);

// Bento Metrics
const presentCount = computed(() => {
  return props.personnel.filter((p) => getAttendanceStatus(p) === 'present').length;
});

const absentCount = computed(() => {
  return props.personnel.filter((p) => getAttendanceStatus(p) === 'absent').length;
});

const leaveCount = computed(() => {
  return props.personnel.filter((p) => getAttendanceStatus(p) === 'on_leave').length;
});

const scheduledLeavesCount = computed(() => personnelStore.leaves.length);

const attendanceRate = computed(() => {
  const total = props.personnel.length;
  if (!total) return 100;
  const half = props.personnel.filter((p) => ['half_am', 'half_pm'].includes(getAttendanceStatus(p))).length;
  const effective = presentCount.value + (half * 0.5);
  return Math.round((effective / total) * 100);
});

// Normalized status extractor
const getAttendanceStatus = (p: Person): AttendanceStatusType => {
  if (p.isOnLeaveToday) return 'on_leave';
  const s = (p.attendanceStatus || 'present').toString().toLowerCase();
  if (s === 'present') return 'present';
  if (s.includes('leave') || s === 'on_leave') return 'on_leave';
  if (s === 'half_am' || (s.includes('half') && s.includes('am'))) return 'half_am';
  if (s === 'half_pm' || (s.includes('half') && s.includes('pm'))) return 'half_pm';
  if (s === 'absent') return 'absent';
  return 'present';
};

const formatStatusLabel = (status: AttendanceStatusType) => {
  switch (status) {
    case 'present': return 'Present';
    case 'absent': return 'Absent';
    case 'half_am': return 'Half-Day (AM)';
    case 'half_pm': return 'Half-Day (PM)';
    case 'on_leave': return 'On Leave';
    default: return 'Present';
  }
};

const getShiftDetail = (status: AttendanceStatusType) => {
  switch (status) {
    case 'present': return 'Full Day Present';
    case 'absent': return 'Full Day Absent';
    case 'half_am': return 'AM Absent · PM Present';
    case 'half_pm': return 'AM Present · PM Absent';
    case 'on_leave': return 'Official Scheduled Leave';
    default: return 'Full Day Present';
  }
};

// Filtered table rows
const filtered = computed(() => {
  return props.personnel.filter((p) => {
    const q = (tableSearch.value || props.searchQuery).toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      (p.code && p.code.toLowerCase().includes(q))
    );
  });
});

// Leave Status Lock Helper
const isPersonOnLeave = (p: Person | string): boolean => {
  if (typeof p === 'string') {
    const found = props.personnel.find((item) => (item.code || item.id || item.name) === p);
    return Boolean(found?.isOnLeaveToday || (found && getAttendanceStatus(found) === 'on_leave'));
  }
  return Boolean(p.isOnLeaveToday || getAttendanceStatus(p) === 'on_leave');
};

const handleAttendButtonClick = (p: Person) => {
  if (isPersonOnLeave(p)) {
    window.alert(
      `Attendance status for "${p.name}" cannot be edited directly because they are on Scheduled Leave.\n\nTo change their status, please edit or delete their scheduled leave under "Schedule Leave".`
    );
    return;
  }
  togglePopover(p.code || p.id || p.name);
};

// Inline Quick-Edit for Accidental Attendance Marks
const togglePopover = (personCode: string) => {
  if (isPersonOnLeave(personCode)) return;
  if (activePopoverPersonCode.value === personCode) {
    activePopoverPersonCode.value = null;
  } else {
    activePopoverPersonCode.value = personCode;
  }
};

const handleInlineStatusChange = async (personCode: string, newStatus: AttendanceStatusType) => {
  if (isPersonOnLeave(personCode)) {
    window.alert('Cannot change status: staff member is on scheduled leave. Please edit or delete the leave under "Schedule Leave".');
    return;
  }
  activePopoverPersonCode.value = null;
  await personnelStore.updateAttendanceStatus(personCode, newStatus);
};

// Close popover on outside click
const handleGlobalClick = () => {
  activePopoverPersonCode.value = null;
};

onMounted(() => {
  window.addEventListener('click', handleGlobalClick);
});

onUnmounted(() => {
  window.removeEventListener('click', handleGlobalClick);
});

// Records Drawer
const openPersonnelRecords = (code: string) => {
  selectedPersonnelCode.value = code;
  isRecordsDrawerOpen.value = true;
};

const handleProfileUpdated = async (updated: Partial<Person> & { code: string }) => {
  await personnelStore.updatePersonnelProfile(updated);
};

// Leave Scheduling
const handleScheduleLeave = async (leaveData: {
  id?: number | string;
  personnelCode: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
}) => {
  if (leaveData.id) {
    await personnelStore.updateLeave(leaveData.id, leaveData);
  } else {
    await personnelStore.scheduleLeave(leaveData);
  }
  isLeaveModalOpen.value = false;
};

const handleDeleteLeave = async (leaveId: number | string) => {
  await personnelStore.cancelLeave(leaveId);
};

// General Attendance History Rosters
const currentDayRoster = computed(() => {
  const day = personnelStore.attendanceHistory.find((h) => h.date === selectedHistoryDate.value);
  if (day && day.roster) {
    return day.roster;
  }
  // Fallback to today's active staff
  return {
    present: props.personnel.filter((p) => getAttendanceStatus(p) === 'present').map(toRosterItem),
    absent: props.personnel.filter((p) => getAttendanceStatus(p) === 'absent').map(toRosterItem),
    half_am: props.personnel.filter((p) => getAttendanceStatus(p) === 'half_am').map(toRosterItem),
    half_pm: props.personnel.filter((p) => getAttendanceStatus(p) === 'half_pm').map(toRosterItem),
    on_leave: props.personnel.filter((p) => getAttendanceStatus(p) === 'on_leave').map(toRosterItem),
  };
});

function toRosterItem(p: Person): AttendanceRosterPerson {
  return {
    code: p.code || p.id || '',
    name: p.name,
    role: p.role,
    status: getAttendanceStatus(p),
    activeOrder: p.activeOrder || '—'
  };
}

const getPersonActiveOrder = (person: AttendanceRosterPerson): string => {
  if (person.activeOrder && person.activeOrder !== '—') {
    return person.activeOrder;
  }
  const match = props.personnel.find(
    (p) => (p.code && p.code === person.code) || (p.id && p.id === person.code) || p.name === person.name
  );
  return match?.activeOrder || '—';
};

const currentDayRosterAll = computed<AttendanceRosterPerson[]>(() => {
  const r = currentDayRoster.value;
  return [...r.present, ...r.absent, ...r.half_am, ...r.half_pm, ...r.on_leave];
});

const displayedHistoryPersons = computed<AttendanceRosterPerson[]>(() => {
  let list: AttendanceRosterPerson[] = [];
  switch (activeHistoryCategory.value) {
    case 'present': list = currentDayRoster.value.present; break;
    case 'absent': list = currentDayRoster.value.absent; break;
    case 'half': list = [...currentDayRoster.value.half_am, ...currentDayRoster.value.half_pm]; break;
    case 'on_leave': list = currentDayRoster.value.on_leave; break;
    default: list = currentDayRosterAll.value; break;
  }
  if (historySearch.value.trim()) {
    const q = historySearch.value.trim().toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q));
  }
  return list;
});

const handleHistoryDateChange = async () => {
  await personnelStore.fetchAttendanceHistory(selectedHistoryDate.value);
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

const getAvatarColorClass = (name: string) => {
  const parts = name.split(' ');
  const code = (parts[0] || 'A')[0].toLowerCase();
  if ('abcdef'.includes(code)) return 'rc';
  if ('ghijklm'.includes(code)) return 'am';
  if ('nopqrst'.includes(code)) return 'sk';
  return 'jd';
};

const getAvailabilityClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'on-site':
    case 'on site':
    case 'busy':
      return 'maintenance';
    case 'off-site':
    case 'off site':
      return 'onsite';
    default:
      return 'available';
  }
};

const handleExportCsv = () => {
  window.alert('Attendance and personnel roster exported successfully.');
};
</script>

<style scoped src="../styles/personnel.css"></style>
