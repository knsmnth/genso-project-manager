<template>
  <div
    :class="[
      'attend-indicator-wrapper',
      `size-${size}`,
      { 'is-interactive': interactive }
    ]"
    :title="labelTooltip"
    @click="handleClick"
  >
    <!-- 0. FUTURE / NOT YET ARRIVED (Turn it gray unless it is an official holiday/hold) -->
    <div
      v-if="timingVariant === 'future' && normalizedStatus !== 'holiday'"
      class="attend-box attend-future"
    >
      <span class="future-dash">—</span>
    </div>

    <!-- 1. PRESENT (Soft Green Rounded Square) -->
    <div
      v-else-if="normalizedStatus === 'present'"
      :class="['attend-box', 'attend-present', { 'is-past': timingVariant === 'past' }]"
    >
      <svg viewBox="0 0 24 24" class="attend-icon" fill="none" stroke="currentColor" stroke-width="2.5">
        <!-- Minimalist dot or subtle check if desired, clean green fill matching sample -->
      </svg>
    </div>

    <!-- 2. ABSENT (Soft Red Rounded Square with Centered X) -->
    <div
      v-else-if="normalizedStatus === 'absent'"
      :class="['attend-box', 'attend-absent', { 'is-past': timingVariant === 'past' }]"
    >
      <svg viewBox="0 0 24 24" class="attend-icon" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="6" y1="18" x2="18" y2="6" />
      </svg>
    </div>

    <!-- 3. ABSENT MORNING - PRESENT AFTERNOON (Half Day: Top-Left Pink, Bottom-Right Light) -->
    <div
      v-else-if="normalizedStatus === 'half_am'"
      :class="['attend-box', 'attend-half-am', { 'is-past': timingVariant === 'past' }]"
    >
      <svg viewBox="0 0 24 24" class="attend-svg-fill">
        <!-- Top-left polygon is absent (pink) with red edge -->
        <polygon points="0,0 24,0 0,24" fill="#FECACA" stroke="#DC2626" stroke-width="1.2" stroke-linejoin="round" />
        <!-- Bottom-right polygon is present (green) with green edge -->
        <polygon points="24,0 24,24 0,24" fill="#BBF7D0" stroke="#15803D" stroke-width="1.2" stroke-linejoin="round" />
      </svg>
    </div>

    <!-- 4. PRESENT MORNING - ABSENT AFTERNOON (Half Day: Top-Left Light, Bottom-Right Pink) -->
    <div
      v-else-if="normalizedStatus === 'half_pm'"
      :class="['attend-box', 'attend-half-pm', { 'is-past': timingVariant === 'past' }]"
    >
      <svg viewBox="0 0 24 24" class="attend-svg-fill">
        <!-- Top-left polygon is present (green) with green edge -->
        <polygon points="0,0 24,0 0,24" fill="#BBF7D0" stroke="#15803D" stroke-width="1.2" stroke-linejoin="round" />
        <!-- Bottom-right polygon is absent (pink) with red edge -->
        <polygon points="24,0 24,24 0,24" fill="#FECACA" stroke="#DC2626" stroke-width="1.2" stroke-linejoin="round" />
      </svg>
    </div>

    <!-- 5. ON-LEAVE (Soft Blue Rounded Square with Lock) -->
    <div
      v-else-if="normalizedStatus === 'on_leave'"
      :class="['attend-box', 'attend-leave', { 'is-past': timingVariant === 'past' }]"
    >
      <svg viewBox="0 0 24 24" class="attend-icon" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="11" width="16" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    </div>

    <!-- 6. HOLIDAY / DATE HOLD (Soft Amber Rounded Square with Pause Indicator) -->
    <div
      v-else-if="normalizedStatus === 'holiday'"
      :class="['attend-box', 'attend-holiday', { 'is-past': timingVariant === 'past' }]"
    >
      <svg viewBox="0 0 24 24" class="attend-icon" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="10" y1="15" x2="10" y2="9" />
        <line x1="14" y1="15" x2="14" y2="9" />
      </svg>
    </div>

    <!-- Optional Label Tag -->
    <span v-if="showLabel" class="attend-label-text">
      {{ labelText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AttendanceStatusType } from '../../types';

const props = withDefaults(
  defineProps<{
    status?: AttendanceStatusType | string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    timingVariant?: 'current' | 'past' | 'future';
    showLabel?: boolean;
    interactive?: boolean;
  }>(),
  {
    status: 'present',
    size: 'md',
    timingVariant: 'current',
    showLabel: false,
    interactive: false
  }
);

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const normalizedStatus = computed<AttendanceStatusType>(() => {
  if (!props.status) return 'present';
  const s = props.status.toLowerCase().trim();
  if (s === 'holiday' || s.includes('hold') || s.includes('holiday')) return 'holiday';
  if (s === 'present' || s.startsWith('present')) return 'present';
  if (s.includes('leave') || s === 'on_leave') return 'on_leave';
  if (s.includes('half') && s.includes('am')) return 'half_am';
  if (s.includes('half') && s.includes('pm')) return 'half_pm';
  if (s === 'half_am' || s === 'half_pm') return s;
  if (s === 'absent' || s.startsWith('absent')) return 'absent';
  return 'present';
});

const labelText = computed(() => {
  if (props.timingVariant === 'future' && normalizedStatus.value !== 'holiday') return 'Pending (Upcoming)';
  switch (normalizedStatus.value) {
    case 'holiday':
      return 'On Hold / Holiday';
    case 'present':
      return 'Present';
    case 'absent':
      return 'Absent';
    case 'half_am':
      return 'Absent AM / Present PM';
    case 'half_pm':
      return 'Present AM / Absent PM';
    case 'on_leave':
      return 'On Leave';
    default:
      return 'Present';
  }
});

const labelTooltip = computed(() => {
  if (props.timingVariant === 'future' && normalizedStatus.value !== 'holiday') {
    return 'Not yet arrived (Pending / Upcoming)';
  }
  const suffix = props.timingVariant === 'past' ? ' (Past Record)' : '';
  switch (normalizedStatus.value) {
    case 'holiday':
      return `Date Hold / Holiday (Attendance Suspended)${suffix}`;
    case 'present':
      return `Present (Full Day)${suffix}`;
    case 'absent':
      return `Absent${suffix}`;
    case 'half_am':
      return `Absent morning - Present afternoon (Half day)${suffix}`;
    case 'half_pm':
      return `Present morning - Absent afternoon (Half day)${suffix}`;
    case 'on_leave':
      return `On Leave${suffix}`;
    default:
      return `Present${suffix}`;
  }
});

const handleClick = () => {
  if (props.interactive) {
    emit('click');
  }
};
</script>

<style scoped>
.attend-indicator-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  user-select: none;
}

.attend-indicator-wrapper.is-interactive {
  cursor: pointer;
  transition: transform 0.15s ease;
}

.attend-indicator-wrapper.is-interactive:hover {
  transform: scale(1.06);
}

.attend-box {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1.5px solid #0F172A;
  box-sizing: border-box;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
  transition: all 0.18s ease;
}

/* Sizing Tokens */
.size-xs .attend-box {
  width: 17px;
  height: 17px;
  border-radius: 4px;
  border-width: 1.2px;
}

.size-sm .attend-box {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border-width: 1.2px;
}

.size-md .attend-box {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border-width: 1.5px;
}

.size-lg .attend-box {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  border-width: 1.8px;
}

.attend-icon {
  width: 100%;
  height: 100%;
}

.attend-svg-fill {
  width: 100%;
  height: 100%;
  display: block;
}

/* 1. Present - Soft Green Fill */
.attend-present {
  background-color: #BBF7D0;
  border-color: #15803D;
  color: #15803D;
}

/* 2. Absent - Soft Red / Pink Fill with X */
.attend-absent {
  background-color: #FECACA;
  border-color: #DC2626;
  color: #DC2626;
  padding: 3px;
}

/* 3 & 4. Half-Day AM / PM */
.attend-half-am,
.attend-half-pm {
  background-color: transparent;
  padding: 0;
  overflow: hidden;
}

.attend-half-am {
  border-top-color: #DC2626;
  border-left-color: #DC2626;
  border-right-color: #15803D;
  border-bottom-color: #15803D;
}

.attend-half-pm {
  border-top-color: #15803D;
  border-left-color: #15803D;
  border-right-color: #DC2626;
  border-bottom-color: #DC2626;
}

/* 5. On-Leave - Soft Blue Fill with Lock */
.attend-leave {
  background-color: #BAE6FD;
  border-color: #0284C7;
  color: #0369A1;
  padding: 3px;
}

.attend-leave .attend-icon {
  stroke: #0369A1;
}

.size-xs .attend-leave,
.size-xs .attend-absent {
  padding: 1.5px;
}

.size-sm .attend-leave,
.size-sm .attend-absent {
  padding: 2.5px;
}

/* 6. Holiday / Date Hold - Soft Amber Fill with Pause Icon */
.attend-holiday {
  background-color: #FEF3C7;
  border-color: #D97706;
  color: #B45309;
  padding: 3px;
}

.attend-holiday .attend-icon {
  stroke: #B45309;
}

.size-xs .attend-holiday {
  padding: 1.5px;
}

.size-sm .attend-holiday {
  padding: 2.5px;
}

/* 7. Future Day - Gray for the meantime */
.attend-future {
  background-color: #E2E8F0;
  border-color: #94A3B8;
  color: #64748B;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.future-dash {
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  color: #94A3B8;
  user-select: none;
}

/* Past Day - Slightly lighter colors */
.attend-box.is-past {
  opacity: 0.62;
  filter: saturate(0.85) brightness(1.08);
}

/* Label text beside badge */
.attend-label-text {
  font-size: 12.5px;
  font-weight: 600;
  color: #1E293B;
  letter-spacing: -0.2px;
}
</style>
