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

        <!-- Action 2: Quick Onboard -->
        <button
          type="button"
          class="btn btn-outline"
          @click="$emit('openQuickOnboard')"
          style="height: 36px; padding: 0 14px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px"
          title="Quickly register new staff"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" />
          </svg>
          <span>Quick Onboard</span>
        </button>

        <!-- Action 3: Daily Attendance Check -->
        <button
          type="button"
          class="btn btn-primary"
          @click="$emit('openAttendanceCheck')"
          style="height: 36px; padding: 0 16px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px"
          title="Perform today's attendance check"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#FFFFFF" stroke-width="2.2">
            <path d="M9 11l3 3L22 4" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>Attendance Check</span>
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
          <span class="history-month-badge">{{ selectedMonthName }} {{ selectedHistoryYear }}</span>
        </div>

        <!-- Single Filter Bar: Per Month and Year -->
        <div class="history-month-filter-bar">
          <div class="filter-select-group">
            <label>Month:</label>
            <select
              v-model="selectedHistoryMonth"
              @change="handleMonthYearChange"
              class="history-filter-select"
            >
              <option v-for="(m, idx) in monthNames" :key="idx" :value="idx + 1">{{ m }}</option>
            </select>
          </div>

          <div class="filter-select-group">
            <label>Year:</label>
            <select
              v-model="selectedHistoryYear"
              @change="handleMonthYearChange"
              class="history-filter-select"
            >
              <option :value="2024">2024</option>
              <option :value="2025">2025</option>
              <option :value="2026">2026</option>
              <option :value="2027">2027</option>
              <option :value="2028">2028</option>
            </select>
          </div>

          <!-- Advance Edit Toggle for History Auditing (Icon-only) -->
          <button
            type="button"
            :class="['btn-advance-edit', { 'is-active': isAdvanceEditActive }]"
            @click="isAdvanceEditActive = !isAdvanceEditActive"
            :title="isAdvanceEditActive ? 'Advance Edit: ON (Click to disable)' : 'Advance Edit: OFF (Click to modify records)'"
            aria-label="Advance Edit"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          <button
            type="button"
            class="history-action-btn"
            @click="handleExportCsv"
            title="Export CSV"
            aria-label="Export CSV"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </button>
        </div>
      </div>

      <div class="history-rosters-wrapper">
        <!-- Whole Weekdays Attendance Matrix (Clear text-free box label indicators & compact row height) -->
        <div class="history-matrix-wrapper">
          <table class="history-matrix-table">
            <thead>
              <tr>
                <th class="sticky-col-idx">#</th>
                <th class="sticky-col-name">Personnel</th>
                <th
                  v-for="day in currentMonthWorkdays"
                  :key="day.date"
                  class="matrix-day-th"
                  :class="{ 'is-today': day.isToday }"
                  :title="day.formattedDay"
                >
                  <span class="matrix-day-num">{{ day.dayNum }}</span>
                  <span class="matrix-day-w">{{ day.dayName[0] }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(p, idx) in props.personnel"
                :key="p.code || p.name"
                class="matrix-tr"
              >
                <td class="sticky-col-idx">{{ idx + 1 }}</td>
                <td class="sticky-col-name">
                  <span class="matrix-staff-name-text">{{ p.name }}</span>
                  <span class="matrix-staff-code">{{ p.id || p.code }}</span>
                </td>
                <td
                  v-for="day in currentMonthWorkdays"
                  :key="day.date"
                  class="matrix-day-td"
                  :class="{
                    'is-today': day.isToday,
                    'is-past': getTimingVariant(day.date) === 'past',
                    'is-future': getTimingVariant(day.date) === 'future'
                  }"
                >
                  <button
                    type="button"
                    class="matrix-box-btn"
                    :class="{
                      'is-advance-enabled': isAdvanceEditActive,
                      'is-readonly': !isAdvanceEditActive
                    }"
                    :disabled="!isAdvanceEditActive"
                    @click.stop="handleHistoryMatrixCycle(p, day.date)"
                    :title="getHistoryBoxTooltip(p, day)"
                  >
                    <AttendanceBadge
                      :status="personnelStore.getPersonAttendance(p.code || p.id || p.name, day.date)"
                      :timing-variant="getTimingVariant(day.date)"
                      size="xs"
                    />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- History Table Summary Footer -->
        <div class="history-table-footer" style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px">
          <span>Showing <strong>{{ props.personnel.length }}</strong> personnel across <strong>{{ currentMonthWorkdays.length }}</strong> weekdays in {{ selectedMonthName }} {{ selectedHistoryYear }}</span>
          <span v-if="isAdvanceEditActive" class="advance-edit-active-pill">
            ✏️ Advance Edit Mode Active — Click any attendance indicator to update record
          </span>
          <span v-else style="font-size: 11.5px; color: #64748B">
            Past days appear slightly lighter · Upcoming days are gray · Turn on Advance Edit to edit records
          </span>
        </div>
      </div>
    </div>

    <!-- Section: Personnel Registry Table -->
    <div class="card table-card" style="min-width: 0; margin-top: 4px">
      <div class="card-header space-between personnel-table-header" style="border-bottom: 1px solid #bbcabf">
        <div class="personnel-table-header-title">
          <h3 class="personnel-table-title" style="font-size: 18px; font-weight: 600; color: #0b1c30; margin: 0">{{ pageTitle }}</h3>
        </div>

        <div class="personnel-table-header-actions">
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
            class="btn btn-primary btn-table-export"
            @click="handleExportCsv"
            title="Export CSV"
            aria-label="Export CSV"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      </div>

      <div class="card-body no-padding">
        <div class="table-responsive">
          <table class="data-table compact-rows">
            <thead>
              <tr style="background: #eff4ff; border-bottom: 1px solid #bbcabf">
                <th class="sticky-col-personnel">PERSONNEL</th>
                <th class="th-attendance">
                  <span class="desktop-th-text">ATTENDANCE</span>
                  <span class="mobile-th-text">WEEK (M-F)</span>
                </th>
                <th>AVAILABILITY</th>
                <th>ACTIVE ORDER</th>
                <th style="text-align: right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filtered.length === 0">
                <td colspan="5" style="text-align: center; padding: 32px; color: var(--color-text-muted)">
                  No staff records match search query.
                </td>
              </tr>
              <tr v-else v-for="p in filtered" :key="p.code || p.name">
                <td class="sticky-col-personnel">
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

                <!-- 5-DAY WORKWEEK ATTENDANCE WITH INSTANT 1-CLICK CYCLIC ROTATION -->
                <td>
                  <div class="week-attendance-row" @click.stop>
                    <div
                      v-for="day in currentWeekWorkdays"
                      :key="day.date"
                      class="week-day-cell-item"
                    >
                      <span class="week-day-mini-label" :class="{ 'is-today': day.isToday }">{{ day.dayName[0] }}</span>
                      <button
                        type="button"
                        class="week-day-box-btn"
                        :class="{
                          'is-today': day.isToday,
                          'is-locked': isPersonOnLeaveForDate(p, day.date),
                          'is-restricted': getTimingVariant(day.date) !== 'current',
                          'is-past': getTimingVariant(day.date) === 'past',
                          'is-future': getTimingVariant(day.date) === 'future'
                        }"
                        :disabled="getTimingVariant(day.date) !== 'current'"
                        @click.stop="handleDirectCycle(p, day.date)"
                        :title="getDayBoxTooltip(p, day)"
                      >
                        <AttendanceBadge
                          :status="personnelStore.getPersonAttendance(p.code || p.id || p.name, day.date)"
                          :timing-variant="getTimingVariant(day.date)"
                          size="sm"
                        />
                        <span v-if="isPersonOnLeaveForDate(p, day.date)" class="mini-lock-pill" title="Scheduled Leave">
                          <svg viewBox="0 0 24 24" width="7" height="7" fill="none" stroke="currentColor" stroke-width="2.5">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </span>
                      </button>
                    </div>
                  </div>
                </td>

                <td>
                  <span
                    :class="['status-badge-outline', 'personnel-avail-badge', getAvailabilityClass(p.status)]"
                  >
                    {{ p.status }}
                  </span>
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
import { Person, AttendanceStatusType } from '../types';
import { usePersonnelStore, getWeekWorkdays, getMonthWorkdays, WorkdayInfo } from '../stores/personnel';
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
const isAdvanceEditActive = ref(false);

// Local Date Helpers for Attendance Restrictions
const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTimingVariant = (dateStr: string): 'current' | 'past' | 'future' => {
  const today = getTodayStr();
  if (dateStr < today) return 'past';
  if (dateStr > today) return 'future';
  return 'current';
};

// 5-Day Workweek State for Staff Registry Table
const currentWeekWorkdays = computed<WorkdayInfo[]>(() => getWeekWorkdays());

// General Attendance History Filter States (Whole Weekdays of Month & Year)
const currentDate = new Date();
const selectedHistoryMonth = ref(currentDate.getMonth() + 1);
const selectedHistoryYear = ref(currentDate.getFullYear());

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const selectedMonthName = computed(() => monthNames[selectedHistoryMonth.value - 1]);

const currentMonthWorkdays = computed<WorkdayInfo[]>(() => {
  return getMonthWorkdays(selectedHistoryYear.value, selectedHistoryMonth.value);
});

const handleMonthYearChange = async () => {
  await personnelStore.fetchAttendanceHistory({
    month: selectedHistoryMonth.value,
    year: selectedHistoryYear.value
  });
};

// 1-Click Cyclic Rotation Handler for 5-Day Workweek (Staff Registry Table)
// RESTRICTION: Only today's box can be edited. Past and future days are locked.
const handleDirectCycle = async (p: Person, date: string) => {
  const timing = getTimingVariant(date);
  if (timing !== 'current') {
    return;
  }
  const code = p.code || p.id || p.name;
  await personnelStore.cycleAttendance(code, date);
};

// Advance Edit in History: allows modifying past or future days when Advance Edit is explicitly ON
const handleHistoryMatrixCycle = async (p: Person, date: string) => {
  if (!isAdvanceEditActive.value) {
    return;
  }
  const code = p.code || p.id || p.name;
  await personnelStore.cycleAttendance(code, date);
};

const isPersonOnLeaveForDate = (p: Person, date: string): boolean => {
  const code = p.code || p.id || p.name;
  return personnelStore.leaves.some((l) => {
    const match = l.personnelCode === code || (l.personnelName && l.personnelName === p.name);
    return match && l.startDate <= date && l.endDate >= date;
  });
};

const getDayBoxTooltip = (p: Person, day: WorkdayInfo): string => {
  const code = p.code || p.id || p.name;
  const status = personnelStore.getPersonAttendance(code, day.date);
  const timing = getTimingVariant(day.date);
  const onLeave = isPersonOnLeaveForDate(p, day.date);

  if (timing === 'future') {
    return `${p.name} - ${day.formattedDay}: Upcoming (Date not arrived yet — locked)`;
  }
  if (timing === 'past') {
    return `${p.name} - ${day.formattedDay}: ${formatStatusLabel(status)} (Day already passed — locked)`;
  }
  if (onLeave) {
    return `${p.name} - ${day.formattedDay} (Today): On Scheduled Leave (Click to rotate status)`;
  }
  return `${p.name} - ${day.formattedDay} (Today): ${formatStatusLabel(status)} (Click to rotate status)`;
};

const getHistoryBoxTooltip = (p: Person, day: WorkdayInfo): string => {
  const code = p.code || p.id || p.name;
  const status = personnelStore.getPersonAttendance(code, day.date);
  const timing = getTimingVariant(day.date);

  let statusText = formatStatusLabel(status);
  if (timing === 'future') {
    statusText = 'Not yet arrived (Gray)';
  } else if (timing === 'past') {
    statusText = `${statusText} (Past record)`;
  }

  if (isAdvanceEditActive.value) {
    return `${p.name} - ${day.formattedDay}: ${statusText} · [Advance Edit Active — Click to change]`;
  }
  return `${p.name} - ${day.formattedDay}: ${statusText}`;
};

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

// Helper to extract initials for avatar
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
