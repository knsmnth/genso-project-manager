<template>
  <div v-if="isOpen" class="hdm-overlay" @click.self="handleClose">
    <div class="hdm-modal" role="dialog" aria-modal="true" aria-labelledby="hdm-modal-title">
      <!-- Header -->
      <div class="hdm-header">
        <div class="hdm-header-left">
          <div class="hdm-header-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="10" y1="15" x2="10" y2="9" />
              <line x1="14" y1="15" x2="14" y2="9" />
            </svg>
          </div>
          <div>
            <h3 id="hdm-modal-title" class="hdm-title">General Date Hold</h3>
            <p class="hdm-subtitle">Suspend work log recording for holidays or declared no-work memos</p>
          </div>
        </div>

        <button
          type="button"
          class="hdm-close-btn"
          @click="handleClose"
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="hdm-body">
        <!-- Date Selector -->
        <div class="hdm-field">
          <label class="hdm-label" for="hdm-date-input">Target Date</label>
          <div class="hdm-date-row">
            <input
              id="hdm-date-input"
              type="date"
              class="hdm-input-date"
              v-model="selectedDate"
              @change="handleDateChanged"
            />
            <button
              type="button"
              class="hdm-quick-btn"
              @click="setQuickDate('today')"
            >
              Today
            </button>
            <button
              type="button"
              class="hdm-quick-btn"
              @click="setQuickDate('tomorrow')"
            >
              Tomorrow
            </button>
          </div>
        </div>

        <!-- Hold Toggle -->
        <div
          class="hdm-toggle-card"
          :class="{ 'is-held': isHeld }"
          @click="isHeld = !isHeld"
          role="switch"
          :aria-checked="isHeld"
        >
          <div class="hdm-toggle-info">
            <span class="hdm-toggle-title">
              {{ isHeld ? 'Hold Active (No Work Logged)' : 'Normal Operations (Logs Allowed)' }}
            </span>
            <span class="hdm-toggle-desc">
              {{ isHeld ? 'Work log recording suspended for this date' : 'Work logs will be recorded normally on weekdays' }}
            </span>
          </div>
          <div class="hdm-switch" :class="{ 'is-on': isHeld }">
            <div class="hdm-switch-slider"></div>
          </div>
        </div>

        <!-- Attendance Also On Hold Toggle -->
        <div
          v-if="isHeld"
          class="hdm-toggle-card hdm-sub-toggle-card"
          :class="{ 'is-attendance-held': holdAttendance }"
          @click="holdAttendance = !holdAttendance"
          role="switch"
          :aria-checked="holdAttendance"
        >
          <div class="hdm-toggle-info">
            <span class="hdm-toggle-title hdm-sub-title">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" class="hdm-sub-icon">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {{ holdAttendance ? 'Attendance Also On Hold' : 'Attendance Kept Normal' }}
            </span>
            <span class="hdm-toggle-desc">
              {{ holdAttendance ? 'Exempts staff from absence & marks holiday on roster' : 'Staff attendance recorded normally' }}
            </span>
          </div>
          <div class="hdm-switch hdm-sub-switch" :class="{ 'is-on': holdAttendance }">
            <div class="hdm-switch-slider"></div>
          </div>
        </div>

        <!-- Quick Reason Presets -->
        <div class="hdm-field" v-if="isHeld">
          <label class="hdm-label">Quick Reason Presets</label>
          <div class="hdm-presets">
            <button
              v-for="preset in PRESETS"
              :key="preset"
              type="button"
              class="hdm-preset-chip"
              :class="{ 'is-active': reason === preset }"
              @click="reason = preset"
            >
              {{ preset }}
            </button>
          </div>
        </div>

        <!-- Reason / Memo Notes -->
        <div class="hdm-field" v-if="isHeld">
          <label class="hdm-label" for="hdm-reason-textarea">Memo / Reason Notes</label>
          <textarea
            id="hdm-reason-textarea"
            class="hdm-textarea"
            placeholder="Type reason or official memo (e.g., Declared non-working holiday by HR memo #24, Typhoon suspension)..."
            v-model="reason"
          ></textarea>
        </div>

        <!-- Scheduled Holds Directory List -->
        <div class="hdm-list-section">
          <div class="hdm-list-header">
            <span class="hdm-list-title">Active & Scheduled Holds</span>
            <span class="hdm-list-count">{{ activeHeldList.length }}</span>
          </div>

          <div class="hdm-list-container">
            <div v-if="activeHeldList.length === 0" class="hdm-list-empty">
              No dates currently set on hold.
            </div>

            <div
              v-for="item in activeHeldList"
              :key="item.date"
              class="hdm-list-item"
              :class="{ 'is-selected': item.date === selectedDate }"
              @click="selectHeldItem(item)"
            >
              <div class="hdm-item-info">
                <div class="hdm-item-header-row">
                  <span class="hdm-item-date">{{ item.date }}</span>
                  <span
                    class="hdm-item-badge"
                    :class="{
                      'hdm-badge-advance': item.date > todayDateStr,
                      'hdm-badge-today': item.date === todayDateStr,
                      'hdm-badge-past': item.date < todayDateStr
                    }"
                  >
                    {{ item.date > todayDateStr ? 'Advance' : (item.date === todayDateStr ? 'Today' : 'Past') }}
                  </span>
                  <span
                    class="hdm-item-badge hdm-item-attendance-badge"
                    :class="item.holdAttendance !== false ? 'hdm-badge-attend-held' : 'hdm-badge-attend-normal'"
                  >
                    {{ item.holdAttendance !== false ? 'Attendance Held' : 'Logs Only' }}
                  </span>
                </div>
                <div class="hdm-item-reason">
                  {{ item.reason || 'General Hold' }}
                </div>
              </div>

              <div class="hdm-item-actions">
                <button
                  type="button"
                  class="hdm-item-remove-btn"
                  @click.stop="handleDirectRemoveHold(item.date)"
                  aria-label="Remove hold"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="hdm-footer">
        <button type="button" class="hdm-btn-cancel" @click="handleClose">
          Cancel
        </button>
        <button
          type="button"
          class="hdm-btn-save"
          :class="{ 'is-saving-hold': isHeld }"
          @click="handleSave"
        >
          <svg v-if="isHeld" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="10" y1="15" x2="10" y2="9" />
            <line x1="14" y1="15" x2="14" y2="9" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{{ isHeld ? 'Apply Date Hold' : 'Remove Hold' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { DateHoldRecord } from '../../types';
import { formatLocalDate, isDateHeld, getHeldDates, saveDateHold } from '../../services/workLogHistoryService';

const props = defineProps<{
  isOpen: boolean;
  targetDate?: string;
  initialReason?: string;
  initialIsHeld?: boolean;
  initialHoldAttendance?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', record: DateHoldRecord): void;
}>();

const PRESETS = [
  'Public / National Holiday',
  'Declared Non-Working Day',
  'Typhoon / Weather Suspension Memo',
  'Administrative Maintenance Day',
  'Special Campus Event / No Regular Field Work'
];

const todayDateStr = formatLocalDate(new Date());
const selectedDate = ref<string>(props.targetDate || todayDateStr);
const isHeld = ref<boolean>(props.initialIsHeld ?? true);
const holdAttendance = ref<boolean>(props.initialHoldAttendance ?? true);
const reason = ref<string>(props.initialReason || '');
const heldMapVersion = ref<number>(0);

// Compute active / scheduled held dates
const activeHeldList = computed<DateHoldRecord[]>(() => {
  heldMapVersion.value; // reactive dependency
  const map = getHeldDates();
  return Object.values(map)
    .filter((r) => r && r.isHeld)
    .sort((a, b) => a.date.localeCompare(b.date));
});

watch(
  () => [props.isOpen, props.targetDate],
  () => {
    if (props.isOpen) {
      heldMapVersion.value++;
      const target = props.targetDate || formatLocalDate(new Date());
      selectedDate.value = target;
      const status = isDateHeld(target);
      isHeld.value = status.isHeld;
      holdAttendance.value = status.record ? (status.record.holdAttendance !== false) : true;
      reason.value = status.reason || '';
    }
  },
  { immediate: true }
);

const handleDateChanged = () => {
  const status = isDateHeld(selectedDate.value);
  isHeld.value = status.isHeld;
  holdAttendance.value = status.record ? (status.record.holdAttendance !== false) : true;
  reason.value = status.reason || '';
};

const setQuickDate = (type: 'today' | 'tomorrow') => {
  const d = new Date();
  if (type === 'tomorrow') {
    d.setDate(d.getDate() + 1);
  }
  selectedDate.value = formatLocalDate(d);
  handleDateChanged();
};

const selectHeldItem = (item: DateHoldRecord) => {
  selectedDate.value = item.date;
  isHeld.value = true;
  holdAttendance.value = item.holdAttendance !== false;
  reason.value = item.reason || '';
};

const handleDirectRemoveHold = async (date: string) => {
  const record: DateHoldRecord = {
    date,
    isHeld: false,
    reason: '',
    updatedAt: new Date().toISOString(),
    holdAttendance: false
  };
  await saveDateHold(record);
  heldMapVersion.value++;
  if (selectedDate.value === date) {
    isHeld.value = false;
    reason.value = '';
    holdAttendance.value = true;
  }
  emit('save', record);
};

const handleClose = () => {
  emit('close');
};

const handleSave = () => {
  emit('save', {
    date: selectedDate.value,
    isHeld: isHeld.value,
    reason: isHeld.value ? (reason.value.trim() || 'General Date Hold') : '',
    updatedAt: new Date().toISOString(),
    holdAttendance: isHeld.value ? holdAttendance.value : false
  });
  emit('close');
};
</script>

<style scoped src="../../styles/hold-date-modal.css"></style>
