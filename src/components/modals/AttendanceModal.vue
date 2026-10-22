<template>
  <div
    v-if="isOpen"
    class="attendance-drawer-backdrop"
    id="attendance-side-panel"
    @click="$emit('close')"
  >
    <aside
      class="attendance-side-panel"
      @click.stop
      aria-label="Daily Attendance Side Panel"
    >
      <!-- Header (Focused & Minimal Text) -->
      <div class="panel-header">
        <div class="panel-title-wrapper">
          <div class="panel-title-group">
            <h2 class="panel-title">Daily Attendance</h2>
            <span class="live-date-pill">{{ formattedDate }}</span>
          </div>
        </div>
        <button
          class="panel-close-btn"
          @click="$emit('close')"
          aria-label="Close attendance panel"
        >
          &times;
        </button>
      </div>

      <!-- Filter & Quick Action Strip -->
      <div class="attend-panel-toolbar">
        <div class="attend-search-wrap">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search roster..."
            v-model="searchQuery"
          />
        </div>

        <div class="attend-summary-bar">
          <div class="attend-summary-chips">
            <span class="attend-chip chip-absent">
              {{ absentCount }} Absent
            </span>
            <span v-if="halfDayCount > 0" class="attend-chip chip-half">
              {{ halfDayCount }} Half-Day
            </span>
            <span v-if="leaveCount > 0" class="attend-chip chip-leave">
              {{ leaveCount }} On-Leave
            </span>
          </div>
          <button
            type="button"
            class="btn-reset-roster"
            @click="handleResetAllPresent"
            title="Reset everyone to Present (leaves are preserved)"
          >
            All Present
          </button>
        </div>
      </div>

      <!-- Staff Roster Body -->
      <div class="panel-body attend-roster-body">
        <div v-if="filteredPersonnel.length === 0" class="attend-empty-state">
          No personnel match search query.
        </div>

        <div v-else class="attend-roster-grid">
          <div
            v-for="p in filteredPersonnel"
            :key="p.code || p.name"
            :class="[
              'attend-staff-card',
              `status-${getStatus(p.code || p.id || p.name)}`,
              { 'is-leave-locked': isLockedLeave(p.code || p.id || p.name) }
            ]"
            @click="handleCardClick(p.code || p.id || p.name)"
            :title="isLockedLeave(p.code || p.id || p.name) ? 'On Scheduled Leave (Locked)' : 'Click to cycle status'"
          >
            <!-- Left: Avatar, Name & Role -->
            <div class="staff-card-left">
              <div :class="['initials-avatar', getAvatarColorClass(p.name)]">
                {{ getInitials(p.name) }}
              </div>
              <div class="staff-card-info">
                <span class="staff-card-name">{{ p.name }}</span>
                <span v-if="p.role" class="staff-card-role">{{ p.role }}</span>
              </div>
            </div>

            <!-- Right: Status Indicator & Cyclic Action -->
            <div class="staff-card-right" @click.stop>
              <button
                type="button"
                class="modal-attend-btn"
                :class="{ 'is-locked': isLockedLeave(p.code || p.id || p.name) }"
                :disabled="isLockedLeave(p.code || p.id || p.name)"
                @click.stop="handleCardClick(p.code || p.id || p.name)"
                :title="isLockedLeave(p.code || p.id || p.name) ? 'On Scheduled Leave (Locked)' : 'Click to cycle status'"
              >
                <AttendanceBadge
                  :status="getStatus(p.code || p.id || p.name)"
                  size="md"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sticky Footer -->
      <div class="panel-footer">
        <button class="btn btn-outline" @click="$emit('close')">
          Cancel
        </button>
        <button class="btn btn-primary btn-confirm-attend" @click="handleConfirm">
          <span>Confirm Attendance</span>
          <span v-if="absentCount > 0" class="btn-counter-badge">{{ absentCount }} Absent</span>
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Person, AttendanceStatusType } from '../../types';
import AttendanceBadge from '../ui/AttendanceBadge.vue';
import { usePersonnelStore, getNextAttendanceStatus } from '../../stores/personnel';

const props = defineProps<{
  isOpen: boolean;
  personnel: Person[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm', records: Array<{ personnel_code: string; status: AttendanceStatusType; notes?: string }>): void;
}>();

const personnelStore = usePersonnelStore();

// Map of personnelCode -> AttendanceStatusType
const attendanceMap = ref<Record<string, AttendanceStatusType>>({});
const searchQuery = ref('');

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
});

// Escape key listener for side drawer
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    emit('close');
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

// Initialize roster: Default everyone to 'present', unless they have pre-scheduled leave or existing state for today
watch(
  () => [props.isOpen, props.personnel],
  () => {
    if (props.isOpen) {
      // Ensure daily reset is applied if date rolled over
      personnelStore.checkDailyReset();

      const map: Record<string, AttendanceStatusType> = {};
      const today = new Date().toISOString().split('T')[0];
      const todayRecorded = personnelStore.attendanceByDate[today] || {};

      props.personnel.forEach((p) => {
        const key = p.code || p.id || p.name;
        // Check if pre-flagged as on_leave (official scheduled leave)
        if (p.isOnLeaveToday || (p.attendanceStatus && p.attendanceStatus.toString().includes('leave'))) {
          map[key] = 'on_leave';
        } else if (todayRecorded[key] || todayRecorded[p.name || ''] || (p.code && todayRecorded[p.code])) {
          // If explicitly changed/confirmed earlier today, preserve that change throughout the day
          const s = (todayRecorded[key] || todayRecorded[p.name || ''] || (p.code && todayRecorded[p.code]) || '').toString().toLowerCase();
          if (s === 'absent') map[key] = 'absent';
          else if (s === 'half_am') map[key] = 'half_am';
          else if (s === 'half_pm') map[key] = 'half_pm';
          else map[key] = 'present';
        } else if (p.attendanceStatus && p.attendanceStatus !== 'on_leave') {
          const s = p.attendanceStatus.toString().toLowerCase();
          if (s === 'absent') map[key] = 'absent';
          else if (s === 'half_am') map[key] = 'half_am';
          else if (s === 'half_pm') map[key] = 'half_pm';
          else map[key] = 'present';
        } else {
          map[key] = 'present'; // Default present green
        }
      });
      attendanceMap.value = map;
      searchQuery.value = '';
    }
  },
  { immediate: true, deep: true }
);

const filteredPersonnel = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return props.personnel;
  return props.personnel.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      (p.code && p.code.toLowerCase().includes(q))
  );
});

const getStatus = (code: string): AttendanceStatusType => {
  return attendanceMap.value[code] || 'present';
};

const isLockedLeave = (code: string): boolean => {
  const person = props.personnel.find((p) => (p.code || p.id || p.name) === code);
  return Boolean(
    person?.isOnLeaveToday ||
    person?.attendanceStatus === 'on_leave' ||
    attendanceMap.value[code] === 'on_leave'
  );
};

// 1-Click rotation cycle matching table behavior:
// Present -> Absent -> Morning Present / Afternoon Absent (half_pm) -> Morning Absent / Afternoon Present (half_am) -> Present
const handleCardClick = (code: string) => {
  if (isLockedLeave(code)) return;
  const current = getStatus(code);
  attendanceMap.value[code] = getNextAttendanceStatus(current);
};

const handleResetAllPresent = () => {
  const updated = { ...attendanceMap.value };
  props.personnel.forEach((p) => {
    const key = p.code || p.id || p.name;
    if (!isLockedLeave(key)) {
      updated[key] = 'present';
    }
  });
  attendanceMap.value = updated;
};

const absentCount = computed(() => {
  return Object.values(attendanceMap.value).filter((s) => s === 'absent').length;
});

const halfDayCount = computed(() => {
  return Object.values(attendanceMap.value).filter((s) => s === 'half_am' || s === 'half_pm').length;
});

const leaveCount = computed(() => {
  return Object.values(attendanceMap.value).filter((s) => s === 'on_leave').length;
});

const handleConfirm = () => {
  const records = props.personnel.map((p) => {
    const code = p.code || p.id || p.name;
    return {
      personnel_code: code,
      status: attendanceMap.value[code] || 'present'
    };
  });
  emit('confirm', records);
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
</script>

<style scoped src="../../styles/attendance-panel.css"></style>
