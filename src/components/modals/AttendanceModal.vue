<template>
  <div v-if="isOpen" class="modal-backdrop open" id="attendance-modal" @click="$emit('close')">
    <div class="modal-card attendance-check-modal" @click.stop>
      <!-- Header (Focused & Minimal Text) -->
      <div class="modal-header">
        <div class="modal-title-wrapper">
          <div style="display: flex; align-items: center; gap: 8px">
            <h2 class="modal-title">Daily Attendance</h2>
            <span class="live-date-pill">{{ formattedDate }}</span>
          </div>
        </div>
        <button class="modal-close-btn" @click="$emit('close')" aria-label="Close modal">
          &times;
        </button>
      </div>

      <!-- Filter & Quick Action Strip -->
      <div class="attend-modal-toolbar">
        <div class="attend-search-wrap">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search roster..."
            v-model="searchQuery"
          />
        </div>

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
      <div class="modal-body attend-roster-body">
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
            <!-- Left: Avatar & Name (Specialization removed for minimal cleanliness) -->
            <div class="staff-card-left">
              <div :class="['initials-avatar', getAvatarColorClass(p.name)]">
                {{ getInitials(p.name) }}
              </div>
              <span class="staff-card-name">{{ p.name }}</span>
            </div>

            <!-- Right: Status Indicator & On-Demand Half-Day Action -->
            <div class="staff-card-right" @click.stop>
              <!-- Cyclic attendance box button matching the table -->
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

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn btn-outline" @click="$emit('close')">
          Cancel
        </button>
        <button class="btn btn-primary btn-confirm-attend" @click="handleConfirm">
          <span>Confirm Attendance</span>
          <span v-if="absentCount > 0" class="btn-counter-badge">{{ absentCount }} Absent</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
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

<style scoped>
.attendance-check-modal {
  max-width: 600px;
  width: 95%;
  border-radius: 14px;
}

.live-date-pill {
  font-size: 11px;
  font-weight: 700;
  color: #006C49;
  background-color: #ECFDF5;
  border: 1px solid #A7F3D0;
  padding: 3px 9px;
  border-radius: 9999px;
}

/* Toolbar */
.attend-modal-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px 8px;
  border-bottom: 1px solid #F1F5F9;
  flex-wrap: wrap;
}

.attend-search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  padding: 0 10px;
  height: 34px;
  flex: 1;
  min-width: 180px;
}

.attend-search-wrap input {
  border: none;
  outline: none;
  font-size: 12px;
  width: 100%;
  background: transparent;
  color: #0F172A;
}

.attend-summary-chips {
  display: flex;
  align-items: center;
  gap: 6px;
}

.attend-chip {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 9999px;
}

.chip-absent {
  background: #FEE2E2;
  color: #B91C1C;
  border: 1px solid #FECACA;
}

.chip-half {
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FDE68A;
}

.chip-leave {
  background: #E0F2FE;
  color: #0369A1;
  border: 1px solid #BAE6FD;
}

.btn-reset-roster {
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  color: #0F172A;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-reset-roster:hover {
  background: #EFF6FF;
  border-color: #93C5FD;
  color: #1D4ED8;
}

/* Roster body */
.attend-roster-body {
  max-height: 420px;
  overflow-y: auto;
  padding: 10px 20px 16px;
}

.attend-empty-state {
  text-align: center;
  padding: 32px;
  color: #64748B;
  font-size: 13px;
}

.attend-roster-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.attend-staff-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border: 1.5px solid #E2E8F0;
  border-radius: 8px;
  background: #FFFFFF;
  cursor: pointer;
  transition: all 0.12s ease;
  min-height: 42px;
}

.attend-staff-card:hover {
  border-color: #94A3B8;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.05);
}

.attend-staff-card.status-present {
  border-color: #BBF7D0;
  background-color: #F0FDF4;
}

.attend-staff-card.status-absent {
  border-color: #FECACA;
  background-color: #FEF2F2;
}

.attend-staff-card.status-half_am,
.attend-staff-card.status-half_pm {
  border-color: #FED7AA;
  background-color: #FFFBEB;
}

.attend-staff-card.status-on_leave {
  border-color: #BAE6FD;
  background-color: #F0F9FF;
  cursor: default;
}

.staff-card-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.staff-card-name {
  font-size: 13px;
  font-weight: 600;
  color: #0F172A;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.staff-card-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* Cyclic Attendance Button & Locked Leave Indicator */
.modal-attend-btn {
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  outline: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  position: relative;
  transition: transform 0.12s ease;
}

.modal-attend-btn:hover:not(:disabled) {
  transform: scale(1.12);
}

.modal-attend-btn:disabled,
.modal-attend-btn.is-locked {
  cursor: not-allowed;
}


.attend-staff-card.is-leave-locked {
  cursor: not-allowed;
  opacity: 0.92;
}

.btn-confirm-attend {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-counter-badge {
  background: rgba(255, 255, 255, 0.25);
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
}
</style>
