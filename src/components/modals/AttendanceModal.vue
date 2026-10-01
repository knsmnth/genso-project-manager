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
            :title="isLockedLeave(p.code || p.id || p.name) ? 'On Scheduled Leave (Locked) — Cannot change status directly. Edit or delete the leave in Schedule Leave.' : 'Click to toggle Present / Absent'"
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
              <!-- Primary Visual Badge (Disabled/locked if on leave) -->
              <AttendanceBadge
                :status="getStatus(p.code || p.id || p.name)"
                size="md"
                :interactive="!isLockedLeave(p.code || p.id || p.name)"
                @click="handleCardClick(p.code || p.id || p.name)"
              />

              <!-- Half-Day Selector (Hidden unless needed and not on leave) -->
              <div
                v-if="!isLockedLeave(p.code || p.id || p.name)"
                class="half-day-wrapper"
              >
                <button
                  type="button"
                  :class="['btn-half-trigger', { 'is-active': isHalfDay(p.code || p.id || p.name) }]"
                  @click.stop="toggleHalfDayPopover(p.code || p.id || p.name)"
                  :title="isHalfDay(p.code || p.id || p.name) ? 'Change or reset half-day' : 'Mark as half-day'"
                >
                  ½
                </button>

                <!-- On-Demand Floating Popover -->
                <div
                  v-if="activeHalfDayCode === (p.code || p.id || p.name)"
                  class="half-day-popover"
                  @click.stop
                >
                  <button
                    type="button"
                    :class="['half-popover-item', { 'is-selected': getStatus(p.code || p.id || p.name) === 'half_am' }]"
                    @click="handleSetStatus(p.code || p.id || p.name, 'half_am')"
                  >
                    <AttendanceBadge status="half_am" size="sm" />
                    <span>Half-Day AM (Absent AM)</span>
                  </button>
                  <button
                    type="button"
                    :class="['half-popover-item', { 'is-selected': getStatus(p.code || p.id || p.name) === 'half_pm' }]"
                    @click="handleSetStatus(p.code || p.id || p.name, 'half_pm')"
                  >
                    <AttendanceBadge status="half_pm" size="sm" />
                    <span>Half-Day PM (Absent PM)</span>
                  </button>
                  <button
                    v-if="isHalfDay(p.code || p.id || p.name)"
                    type="button"
                    class="half-popover-item clear-item"
                    @click="handleSetStatus(p.code || p.id || p.name, 'present')"
                  >
                    Reset to Present
                  </button>
                </div>
              </div>

              <!-- Scheduled Leave Locked Tag -->
              <span
                v-else
                class="leave-auto-tag is-locked"
                title="On Scheduled Leave (Locked) — Edit or cancel in Schedule Leave"
              >
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>On Leave (Locked)</span>
              </span>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Person, AttendanceStatusType } from '../../types';
import AttendanceBadge from '../ui/AttendanceBadge.vue';

const props = defineProps<{
  isOpen: boolean;
  personnel: Person[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm', records: Array<{ personnel_code: string; status: AttendanceStatusType; notes?: string }>): void;
}>();

// Map of personnelCode -> AttendanceStatusType
const attendanceMap = ref<Record<string, AttendanceStatusType>>({});
const searchQuery = ref('');
const activeHalfDayCode = ref<string | null>(null);

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
});

// Initialize roster: Default everyone to 'present', unless they have pre-scheduled leave or existing state
watch(
  () => [props.isOpen, props.personnel],
  () => {
    if (props.isOpen) {
      const map: Record<string, AttendanceStatusType> = {};
      props.personnel.forEach((p) => {
        const key = p.code || p.id || p.name;
        // Check if pre-flagged as on_leave
        if (p.isOnLeaveToday || (p.attendanceStatus && p.attendanceStatus.toString().includes('leave'))) {
          map[key] = 'on_leave';
        } else if (p.attendanceStatus) {
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
      activeHalfDayCode.value = null;
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

const isHalfDay = (code: string) => {
  const s = getStatus(code);
  return s === 'half_am' || s === 'half_pm';
};

const toggleHalfDayPopover = (code: string) => {
  if (activeHalfDayCode.value === code) {
    activeHalfDayCode.value = null;
  } else {
    activeHalfDayCode.value = code;
  }
};

const handleWindowClick = () => {
  activeHalfDayCode.value = null;
};

onMounted(() => {
  window.addEventListener('click', handleWindowClick);
});

onUnmounted(() => {
  window.removeEventListener('click', handleWindowClick);
});

// Fast click toggle: if present -> absent; if absent -> present
const handleCardClick = (code: string) => {
  if (isLockedLeave(code)) return;
  activeHalfDayCode.value = null;
  const current = getStatus(code);
  if (current === 'present') {
    attendanceMap.value[code] = 'absent';
  } else {
    attendanceMap.value[code] = 'present';
  }
};

const handleSetStatus = (code: string, status: AttendanceStatusType) => {
  if (isLockedLeave(code)) return;
  activeHalfDayCode.value = null;
  const current = getStatus(code);
  // Clicking the same half-day again toggles back to present
  if (current === status) {
    attendanceMap.value[code] = 'present';
  } else {
    attendanceMap.value[code] = status;
  }
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

/* Half-Day On-Demand Trigger & Popover */
.half-day-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.btn-half-trigger {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid #CBD5E1;
  background: #FFFFFF;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.btn-half-trigger:hover {
  background: #FEF3C7;
  border-color: #FCD34D;
  color: #92400E;
}

.btn-half-trigger.is-active {
  background: #FEF3C7;
  border-color: #F59E0B;
  color: #B45309;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.15);
}

.half-day-popover {
  position: absolute;
  right: 0;
  top: calc(100% + 5px);
  z-index: 100;
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 190px;
}

.half-popover-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  border: none;
  background: transparent;
  font-size: 11.5px;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: background-color 0.12s ease;
}

.half-popover-item:hover {
  background-color: #F1F5F9;
  color: #0F172A;
}

.half-popover-item.is-selected {
  background-color: #FEF3C7;
  color: #92400E;
  font-weight: 600;
}

.half-popover-item.clear-item {
  color: #64748B;
  border-top: 1px solid #F1F5F9;
  margin-top: 2px;
  padding-top: 6px;
  font-size: 11px;
}

.half-popover-item.clear-item:hover {
  background-color: #FEF2F2;
  color: #DC2626;
}

.leave-auto-tag {
  font-size: 11px;
  font-weight: 700;
  color: #0284C7;
  background: #E0F2FE;
  padding: 3px 8px;
  border-radius: 9999px;
  border: 1px solid #BAE6FD;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  user-select: none;
}

.leave-auto-tag.is-locked {
  background: #F0F9FF;
  color: #0369A1;
  border-color: #BAE6FD;
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
