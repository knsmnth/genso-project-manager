<template>
  <div v-if="isOpen && targetOrder" class="modal-backdrop open" id="details-modal" @click="$emit('close')">
    <div class="modal-card" @click.stop>
      <div
        class="modal-header"
        style="display: flex; flex-direction: column; align-items: flex-start; gap: 8px; position: relative; width: 100%"
      >
        <div
          class="modal-title-wrapper"
          style="display: flex; flex-direction: column; align-items: flex-start; gap: 6px; width: 90%"
        >
          <span
            class="modal-subtitle"
            id="modal-code"
            style="
              font-size: 11px;
              font-weight: 700;
              color: var(--color-primary);
              background: var(--color-primary-light);
              padding: 2px 8px;
              border-radius: 4px;
              font-family: monospace;
            "
          >
            {{ targetOrder.code }}
          </span>
          <h2
            class="modal-title"
            id="modal-scope"
            style="
              font-size: 15px;
              font-weight: 700;
              color: var(--color-navy-header);
              line-height: 1.4;
              margin: 0;
            "
          >
            {{ targetOrder.scope }}
          </h2>
        </div>
        <button
          id="modal-close"
          class="modal-close-btn"
          @click="$emit('close')"
          aria-label="Close modal"
          style="position: absolute; right: 16px; top: 16px; font-size: 24px"
        >
          &times;
        </button>
      </div>

      <div class="modal-body">
        <!-- Main Info Row -->
        <div
          class="modal-summary-row"
          style="display: flex; gap: 12px; border-bottom: none; padding-bottom: 0"
        >
          <span
            :class="['badge', 'badge-status-pill', getStatusClass(targetOrder.status)]"
            id="modal-status"
          >
            {{ targetOrder.status.toUpperCase() }}
          </span>
          <span class="modal-work-type-tag" id="modal-worktype">
            {{ targetOrder.worktype || 'Preventative Maintenance' }}
          </span>
        </div>

        <hr style="border: none; border-top: 1px solid var(--color-border); margin: 12px 0" />

        <!-- Grid Layout fields -->
        <div class="modal-attributes-grid">
          <div class="modal-attr-box">
            <span class="attr-lbl">ASSET / FACILITY</span>
            <span class="attr-val font-bold" id="modal-asset">
              {{ targetOrder.assetName }}
            </span>
            <span class="attr-subval" id="modal-asset-sub">
              {{ targetOrder.space }}
            </span>
          </div>

          <div class="modal-attr-box">
            <span class="attr-lbl">SCHEDULED DATES</span>
            <div class="dates-display">
              <div class="date-item">
                <span class="date-label">Start:</span>
                <span class="date-val" id="modal-start-date">
                  {{ formatDate(targetOrder.startDate) }} - {{ targetOrder.startTime || '08:30 AM' }}
                </span>
              </div>
              <div class="date-item">
                <span class="date-label">Est. End:</span>
                <span class="date-val" id="modal-end-date">
                  {{ formatDate(targetOrder.endDate) }} - {{ targetOrder.endTime || '05:00 PM' }}
                </span>
              </div>
            </div>
          </div>

          <div class="modal-attr-box">
            <span class="attr-lbl">ASSIGNED WORKGROUP</span>
            <span
              class="attr-val font-bold"
              id="modal-team"
              style="color: var(--color-primary)"
            >
              {{ targetOrder.workgroup }}
            </span>
          </div>

          <div class="modal-attr-box">
            <span class="attr-lbl">SUPERVISOR</span>
            <div class="attr-avatar-text">
              <div
                :class="['initials-avatar', getAvatarColorClass(targetOrder.foreman || 'UN')]"
                id="modal-foreman-avatar"
              >
                {{ getInitials(targetOrder.foreman || 'UN') }}
              </div>
              <span id="modal-foreman" style="font-weight: 600">
                {{ targetOrder.foreman || 'Unassigned' }}
              </span>
            </div>
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid var(--color-border); margin: 12px 0" />

        <!-- Description -->
        <div class="modal-desc-box">
          <span class="desc-lbl">DESCRIPTION</span>
          <p class="desc-text" id="modal-description">
            {{ targetOrder.description || 'No description provided.' }}
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid var(--color-border); margin: 12px 0" />

        <!-- Assigned Personnel -->
        <div class="modal-assigned-box">
          <span class="attr-lbl">ASSIGNED PERSONNEL</span>
          <div class="assigned-badges" id="modal-assigned-people" style="margin-top: 8px">
            <template v-if="targetOrder.assigned && targetOrder.assigned.length > 0">
              <div v-for="name in targetOrder.assigned" :key="name" class="assigned-member-badge">
                <div :class="['initials-avatar', getAvatarColorClass(name)]">
                  {{ getInitials(name) }}
                </div>
                <span>{{ name }}</span>
              </div>
            </template>
            <span v-else style="font-size: 13px; color: var(--color-text-muted)">
              No personnel assigned.
            </span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn btn-outline" id="modal-btn-cancel" @click="$emit('close')">
          Close
        </button>
        <button
          class="btn btn-primary"
          id="modal-btn-edit"
          @click="$emit('edit', targetOrder.code)"
        >
          Edit Work Order
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { WorkOrder } from '../types';

const props = defineProps<{
  isOpen: boolean;
  orderCode: string | null;
  workOrders: WorkOrder[];
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'edit', code: string): void;
}>();

const targetOrder = computed(() => {
  if (!props.orderCode) return null;
  return props.workOrders.find((x) => x.code === props.orderCode) || null;
});

const getStatusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'in progress':
      return 'green inprogress';
    case 'pending':
      return 'pending';
    case 'completed':
      return 'completed';
    case 'urgent':
      return 'urgent';
    case 'on hold':
      return 'onhold';
    default:
      return 'draft';
  }
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

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
</script>
