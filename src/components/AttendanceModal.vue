<template>
  <div v-if="isOpen" class="modal-backdrop open" id="attendance-modal" @click="$emit('close')">
    <div class="modal-card" @click.stop style="max-width: 500px">
      <div class="modal-header">
        <div class="modal-title-wrapper">
          <h2 class="modal-title">Daily Attendance Check</h2>
          <span class="modal-subtitle" style="color: var(--color-primary); font-weight: 600">
            {{ formattedDate }}
          </span>
        </div>
        <button class="modal-close-btn" @click="$emit('close')" aria-label="Close modal">
          &times;
        </button>
      </div>

      <div class="modal-body" style="max-height: 400px; overflow-y: auto; padding: 16px 24px">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #f1f5f9;
            padding: 12px 16px;
            border-radius: 6px;
            margin-bottom: 16px;
            font-weight: 600;
            font-size: 13px;
          "
        >
          <span>STAFF ROSTER</span>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer">
            <span>Mark All Present</span>
            <input type="checkbox" :checked="isAllChecked" @change="handleMarkAllToggle" />
          </label>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px">
          <div
            v-for="p in personnel"
            :key="p.name"
            :class="['personnel-row', { checked: checkedNames.includes(p.name) }]"
            @click="handleToggleName(p.name)"
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 10px 14px;
              border: 1px solid var(--color-border);
              border-radius: 8px;
              cursor: pointer;
              transition: all var(--transition-fast);
            "
          >
            <div class="personnel-row-left" style="display: flex; align-items: center; gap: 12px">
              <div :class="['initials-avatar', getAvatarColorClass(p.name)]">
                {{ getInitials(p.name) }}
              </div>
              <div class="personnel-meta" style="display: flex; flex-direction: column">
                <span class="personnel-name" style="font-weight: 600; font-size: 14px; color: var(--color-navy-header)">
                  {{ p.name }}
                </span>
                <span class="personnel-role" style="font-size: 11px; color: var(--color-text-muted)">
                  {{ p.role }}
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              :checked="checkedNames.includes(p.name)"
              style="pointer-events: none"
            />
          </div>
        </div>
      </div>

      <div class="modal-footer" style="border-top: 1px solid var(--color-border); padding: 16px 24px">
        <button class="btn btn-outline" @click="$emit('close')" style="flex: 1">
          Cancel
        </button>
        <button class="btn btn-primary" @click="handleConfirmClick" style="flex: 1">
          Confirm Attendance
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Person } from '../types';

const props = defineProps<{
  isOpen: boolean;
  personnel: Person[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm', checkedNames: string[]): void;
}>();

const checkedNames = ref<string[]>([]);

watch(
  () => [props.isOpen, props.personnel],
  () => {
    if (props.isOpen) {
      const alreadyPresent = props.personnel
        .filter((p) => p.attendanceStatus && p.attendanceStatus.toLowerCase().startsWith('present'))
        .map((p) => p.name);
      checkedNames.value = alreadyPresent;
    }
  },
  { immediate: true, deep: true }
);

const formattedDate = computed(() =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
);

const isAllChecked = computed(
  () => checkedNames.value.length === props.personnel.length && props.personnel.length > 0
);

const handleToggleName = (name: string) => {
  if (checkedNames.value.includes(name)) {
    checkedNames.value = checkedNames.value.filter((n) => n !== name);
  } else {
    checkedNames.value.push(name);
  }
};

const handleMarkAllToggle = (e: Event) => {
  const isChecked = (e.target as HTMLInputElement).checked;
  if (isChecked) {
    checkedNames.value = props.personnel.map((p) => p.name);
  } else {
    checkedNames.value = [];
  }
};

const handleConfirmClick = () => {
  emit('confirm', checkedNames.value);
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
