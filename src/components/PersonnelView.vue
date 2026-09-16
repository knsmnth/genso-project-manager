<template>
  <section id="view-personnel" class="view-section active" style="display: flex">
    <!-- Breadcrumbs & Header -->
    <div class="view-header-row">
      <div>
        <nav class="breadcrumbs" aria-label="Breadcrumbs" style="margin-bottom: 4px">
          <span class="breadcrumb-link">Personnel</span>
          <svg class="breadcrumb-arrow" viewBox="0 0 24 24" width="12" height="12">
            <polyline points="9 18 15 12 9 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
          </svg>
          <span class="breadcrumb-current">Registry</span>
        </nav>
        <h1 class="view-main-title">Personnel Management</h1>
      </div>
      <div class="view-header-actions">
        <button
          class="btn btn-outline"
          @click="$emit('openAttendanceCheck')"
          style="height: 36px; padding: 0 20px; font-size: 12px"
        >
          Attendance Check
        </button>
        <button
          class="btn btn-primary"
          @click="$emit('openQuickOnboard')"
          style="height: 36px; padding: 0 20px; font-size: 12px"
        >
          <svg viewBox="0 0 24 24" width="14" height="10" fill="none" stroke="#FFFFFF" stroke-width="2.5">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" />
          </svg>
          <span>Quick Onboard</span>
        </button>
      </div>
    </div>

    <!-- Section: Personnel Registry Table -->
    <div class="card table-card" style="min-width: 0; margin-top: 8px">
      <div class="card-header space-between" style="border-bottom: 1px solid #bbcabf">
        <div>
          <h3 style="font-size: 18px; font-weight: 600; color: #0b1c30">Personnel Registry</h3>
          <span style="font-size: 12px; color: #3c4a42">Manage credentials and daily status of site staff.</span>
        </div>

        <div style="display: flex; gap: 8px; align-items: center">
          <div class="personnel-search-box" style="margin: 0; height: 34px; width: 200px">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              v-model="tableSearch"
              style="padding: 0 8px 0 32px; font-size: 12px"
            />
          </div>

          <button class="icon-btn-border" aria-label="Filter" style="height: 34px; width: 34px">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>

          <button
            class="btn btn-primary"
            @click="handleExportCsv"
            style="height: 34px; padding: 0 16px; font-size: 12px"
          >
            Export CSV
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
              <tr v-else v-for="p in filtered" :key="p.name">
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
                <td>
                  <span
                    style="font-size: 13px; font-weight: 600"
                    :style="{ color: p.attendanceStatus && p.attendanceStatus.toLowerCase().startsWith('absent') ? '#A43A3A' : '#006C49' }"
                  >
                    {{ p.attendanceStatus || 'Absent' }}
                  </span>
                </td>
                <td
                  style="font-size: 13px; font-weight: 600; font-family: monospace"
                  :style="{ color: p.activeOrder !== '—' ? 'var(--color-primary)' : 'inherit' }"
                >
                  {{ p.activeOrder || '—' }}
                </td>
                <td style="text-align: right">
                  <a
                    href="#"
                    class="action-link"
                    @click.prevent="alert(`Showing records for ${p.name}`)"
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

    <!-- Historical Attendance Log Cards -->
    <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 16px">
      <div style="display: flex; justify-content: space-between; align-items: center">
        <h2 style="font-size: 20px; font-weight: 700; color: #0b1c30">Historical Attendance Log</h2>
        <div style="display: flex; gap: 8px">
          <input type="date" class="filter-text-input" style="width: 160px; height: 36px; padding: 0 12px" />
          <button
            class="btn btn-outline-sm"
            style="display: flex; align-items: center; gap: 8px; height: 36px"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            <span>Download Log</span>
          </button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; flex-wrap: wrap">
        <div
          v-for="log in HISTORICAL_LOGS"
          :key="log.date"
          class="card"
          style="padding: 20px; display: flex; flex-direction: column; gap: 16px"
        >
          <div style="display: flex; justify-content: space-between; align-items: flex-start">
            <div>
              <span style="font-size: 11px; color: var(--color-text-muted); font-weight: 600">{{ log.date }}</span>
              <h4 style="font-size: 16px; font-weight: 700; color: var(--color-navy-header)">{{ log.dayOfWeek }}</h4>
            </div>
            <span
              class="badge-status-dot green"
              style="background: #e6f4ea; color: #137333; font-size: 11px; font-weight: 700"
            >
              {{ log.compliance }}% Compliance
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: var(--color-text-dark)">
            <div style="display: flex; justify-content: space-between">
              <span>Checked In</span>
              <span style="font-weight: 700">
                {{ log.checkedIn }} / {{ log.totalStaff }}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between">
              <span>Late Arrivals</span>
              <span style="font-weight: 700" :style="{ color: log.lateArrivals > 5 ? '#B06000' : 'inherit' }">
                {{ log.lateArrivals }}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between">
              <span>Unexcused</span>
              <span style="font-weight: 700" :style="{ color: log.unexcused > 2 ? '#A43A3A' : 'inherit' }">
                {{ log.unexcused }}
              </span>
            </div>
          </div>

          <button
            class="btn btn-outline"
            @click="alert(`Details for ${log.date}`)"
            style="
              width: 100%;
              padding: 8px 0;
              font-size: 13px;
              background-color: #eff4ff;
              border: none;
              color: #1a73e8;
              font-weight: 600;
            "
          >
            Full Detail
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Person, AttendanceLog } from '../types';

const props = defineProps<{
  personnel: Person[];
  searchQuery: string;
}>();

defineEmits<{
  (e: 'openAttendanceCheck'): void;
  (e: 'openQuickOnboard'): void;
}>();

const HISTORICAL_LOGS: AttendanceLog[] = [
  {
    date: 'Oct 24, 2023',
    dayOfWeek: 'Tuesday',
    compliance: 92,
    checkedIn: 131,
    totalStaff: 142,
    lateArrivals: 4,
    unexcused: 2
  },
  {
    date: 'Oct 23, 2023',
    dayOfWeek: 'Monday',
    compliance: 88,
    checkedIn: 125,
    totalStaff: 142,
    lateArrivals: 11,
    unexcused: 6
  },
  {
    date: 'Oct 20, 2023',
    dayOfWeek: 'Friday',
    compliance: 95,
    checkedIn: 135,
    totalStaff: 142,
    lateArrivals: 2,
    unexcused: 1
  }
];

const tableSearch = ref('');

const filtered = computed(() => {
  return props.personnel.filter((p) => {
    const q = (tableSearch.value || props.searchQuery).toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      (p.code && p.code.toLowerCase().includes(q))
    );
  });
});

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

const alert = (message?: any) => {
  window.alert(message);
};

const handleExportCsv = () => {
  alert('CSV Export completed.');
};
</script>
