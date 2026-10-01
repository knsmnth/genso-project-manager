<template>
  <div v-if="isOpen && targetOrder" class="modal-backdrop open" id="details-modal" @click="$emit('close')">
    <div class="modal-card wo-details-modal" @click.stop>
      <!-- MODAL HEADER: Clean, unified identity -->
      <div class="wo-modal-header">
        <div class="wo-header-top-row">
          <div class="wo-header-badges">
            <span class="wo-code-pill">{{ targetOrder.code }}</span>
            <span :class="['badge-status-pill', getStatusClass(targetOrder.status)]">
              {{ displayStatus(targetOrder.status) }}
            </span>
            <button
              type="button"
              class="active-toggle-button"
              :class="{ 'is-active': targetOrder.isActive !== false, 'is-inactive': targetOrder.isActive === false }"
              @click="$emit('toggleActive', targetOrder.code)"
              :title="targetOrder.isActive === false ? 'Currently Inactive. Click to turn Active' : 'Currently Active. Click to turn Inactive'"
              role="switch"
              :aria-checked="targetOrder.isActive !== false"
            >
              <span class="switch-track">
                <span class="switch-thumb"></span>
              </span>
              <span class="toggle-label">{{ targetOrder.isActive !== false ? 'Active' : 'Inactive' }}</span>
            </button>
          </div>

          <button
            id="modal-close"
            class="wo-modal-close-btn"
            @click="$emit('close')"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <!-- Work Title & Location -->
        <div class="wo-header-title-block">
          <h2 class="wo-work-title">
            {{ targetOrder.workTitle || targetOrder.scope || 'Work Order Details' }}
          </h2>
          <div class="wo-facility-location">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span class="wo-asset-name">{{ targetOrder.assetName }}</span>
            <span v-if="targetOrder.space || targetOrder.roomNo" class="wo-space-tag">
              • {{ targetOrder.space || targetOrder.roomNo }}
            </span>
          </div>

          <!-- Item Types Tags -->
          <div v-if="targetOrder.itemTypes && targetOrder.itemTypes.length > 0" class="wo-modal-item-tags" style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px">
            <span
              v-for="tag in targetOrder.itemTypes"
              :key="tag"
              class="item-type-tag-pill-sm"
              :style="{ backgroundColor: getItemTypeColor(tag, catalogs) }"
            >
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
                <circle cx="12" cy="14" r="1.8" />
              </svg>
              <span>{{ tag }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- MODAL BODY -->
      <div class="wo-modal-body">
        <!-- 1. TOP EMPHASIS: SCOPES OF WORK (CLEAN TABLE / LIST) -->
        <div class="wo-section-card">
          <div class="wo-section-header">
            <div class="wo-section-title-wrap">
              <div class="wo-section-icon">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <span class="wo-section-title">Scopes of Work</span>
              <span class="wo-count-badge">{{ computedScopes.length }}</span>
            </div>
            <span class="wo-section-hint">Task deliverables &amp; work classifications</span>
          </div>

          <div class="wo-scopes-table">
            <div
              v-for="(item, idx) in computedScopes"
              :key="idx"
              class="wo-scope-row"
            >
              <div class="wo-scope-index">{{ idx + 1 }}</div>
              <div class="wo-scope-content">
                <span class="wo-scope-desc">{{ item.remarks }}</span>
              </div>
              <div class="wo-scope-tags">
                <span class="wo-worktype-badge">{{ item.type || 'General' }}</span>
                <span v-if="item.degreeOfWork" class="wo-degree-badge">{{ item.degreeOfWork }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. WORK ORDER SPECIFICATIONS GRID (2x2) -->
        <div class="wo-specs-grid">
          <!-- DATE RECEIVED -->
          <div class="wo-spec-item">
            <div class="wo-spec-icon-box">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#006C49" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div class="wo-spec-info">
              <span class="wo-spec-label">DATE RECEIVED</span>
              <span class="wo-spec-val">{{ formatDate(targetOrder.dateReceived || targetOrder.startDate) }}</span>
            </div>
          </div>

          <!-- ASSIGNED WORKGROUP -->
          <div class="wo-spec-item">
            <div class="wo-spec-icon-box">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#006C49" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <div class="wo-spec-info">
              <span class="wo-spec-label">ASSIGNED WORKGROUP</span>
              <span class="wo-spec-val highlight">{{ targetOrder.workgroup || 'Unassigned' }}</span>
            </div>
          </div>

          <!-- REQUESTER -->
          <div class="wo-spec-item">
            <div :class="['initials-avatar', getAvatarColorClass(targetOrder.requesterName || targetOrder.foreman || 'UN')]">
              {{ getInitials(targetOrder.requesterName || targetOrder.foreman || 'UN') }}
            </div>
            <div class="wo-spec-info">
              <span class="wo-spec-label">REQUESTER</span>
              <span class="wo-spec-val">{{ targetOrder.requesterName || targetOrder.foreman || 'Unassigned' }}</span>
              <span v-if="targetOrder.requestingOffice" class="wo-spec-sub">{{ targetOrder.requestingOffice }}</span>
            </div>
          </div>

          <!-- ASSIGNED PERSONNEL -->
          <div class="wo-spec-item">
            <div class="wo-spec-icon-box">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#006C49" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <polyline points="17 11 19 13 23 9" />
              </svg>
            </div>
            <div class="wo-spec-info">
              <span class="wo-spec-label">ASSIGNED PERSONNEL</span>
              <div v-if="targetOrder.assigned && targetOrder.assigned.length > 0" class="wo-personnel-avatars">
                <span
                  v-for="name in targetOrder.assigned"
                  :key="name"
                  class="wo-person-chip"
                  :title="name"
                >
                  {{ name }}
                </span>
              </div>
              <span v-else class="wo-spec-val muted">No personnel assigned</span>
            </div>
          </div>
        </div>

        <!-- 3. DESCRIPTION / DETAILS -->
        <div class="wo-section-card compact" v-if="targetOrder.description && targetOrder.description !== '-'">
          <div class="wo-section-header">
            <span class="wo-spec-label" style="margin: 0">WORK DESCRIPTION &amp; NOTES</span>
          </div>
          <p class="wo-description-text">
            {{ targetOrder.description }}
          </p>
        </div>
      </div>

      <!-- MODAL FOOTER -->
      <div class="wo-modal-footer">
        <button class="btn btn-outline" id="modal-btn-cancel" @click="$emit('close')">
          Close
        </button>
        <button
          class="btn btn-primary"
          id="modal-btn-edit"
          @click="$emit('edit', targetOrder.code)"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit Work Order
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { WorkOrder, MasterCatalogsState } from '../../types';
import { getItemTypeColor } from '../../utils/catalogsData';

const props = defineProps<{
  isOpen: boolean;
  orderCode: string | null;
  workOrders: WorkOrder[];
  catalogs?: MasterCatalogsState;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'edit', code: string): void;
  (e: 'toggleActive', code: string): void;
}>();

const targetOrder = computed(() => {
  if (!props.orderCode) return null;
  return props.workOrders.find((x) => x.code === props.orderCode) || null;
});

const computedScopes = computed(() => {
  if (!targetOrder.value) return [];
  if (targetOrder.value.tasks && targetOrder.value.tasks.length > 0) {
    return targetOrder.value.tasks.map((t) => ({
      type: t.type || targetOrder.value?.worktype || 'General',
      remarks: t.remarks === 'General Maintenance Scope' ? '' : (t.remarks || t.description || ''),
      degreeOfWork: t.degreeOfWork || ''
    }));
  }
  if (targetOrder.value.scope && targetOrder.value.scope !== 'General Maintenance Scope') {
    return [
      {
        type: targetOrder.value.worktype || 'General',
        remarks: targetOrder.value.scope,
        degreeOfWork: ''
      }
    ];
  }
  return [];
});

const displayStatus = (status?: string) => {
  if (!status) return 'Not Scheduled';
  const s = status.toLowerCase();
  if (s === 'not scheduled' || s === 'notscheduled' || s === 'unscheduled') return 'Not Scheduled';
  if (s === 'on hold' || s === 'pending') return 'Not Scheduled';
  if (s === 'scheduled') return 'Scheduled';
  if (s === 'in progress' || s === 'ongoing') return 'On-going';
  if (s === 'completed') return 'Completed';
  return status;
};

const getStatusClass = (status?: string) => {
  if (!status) return 'notscheduled';
  switch (status.toLowerCase()) {
    case 'not scheduled':
    case 'notscheduled':
    case 'unscheduled':
    case 'pending':
    case 'on hold':
      return 'notscheduled';
    case 'scheduled':
      return 'scheduled';
    case 'on-going':
    case 'ongoing':
    case 'in progress':
      return 'inprogress';
    case 'completed':
      return 'completed';
    case 'urgent':
      return 'urgent';
    case 'inactive':
      return 'inactive';
    default:
      return 'notscheduled';
  }
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .filter(Boolean)
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

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
</script>

<style scoped>
.wo-details-modal {
  max-width: 620px;
  width: 95%;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  border: 1px solid #E2E8F0;
}

/* HEADER */
.wo-modal-header {
  padding: 20px 24px 16px 24px;
  background: #FFFFFF;
  border-bottom: 1px solid #F1F5F9;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wo-header-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wo-header-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.wo-code-pill {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-primary, #006C49);
  background: #ECFDF5;
  border: 1px solid #A7F3D0;
  padding: 3px 8px;
  border-radius: 4px;
  font-family: monospace;
  letter-spacing: 0.3px;
}

.wo-modal-close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: #94A3B8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.15s ease;
}

.wo-modal-close-btn:hover {
  color: #1E293B;
}

.wo-header-title-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wo-work-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #0F172A;
  line-height: 1.3;
}

.wo-facility-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #006C49;
  font-weight: 600;
}

.wo-asset-name {
  color: #334155;
  font-weight: 600;
}

.wo-space-tag {
  color: #64748B;
  font-weight: 500;
}

/* BODY */
.wo-modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #F8FAFC;
}

/* CARDS */
.wo-section-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.wo-section-card.compact {
  padding: 12px 16px;
  gap: 6px;
}

.wo-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.wo-section-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wo-section-icon {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  background: #ECFDF5;
  color: #006C49;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wo-section-title {
  font-size: 13px;
  font-weight: 700;
  color: #0F172A;
  letter-spacing: 0.2px;
}

.wo-count-badge {
  background: #006C49;
  color: #FFFFFF;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
}

.wo-section-hint {
  font-size: 11px;
  color: #64748B;
  font-weight: 500;
}

/* SCOPES TABLE */
.wo-scopes-table {
  display: flex;
  flex-direction: column;
  border: 1px solid #F1F5F9;
  border-radius: 6px;
  overflow: hidden;
}

.wo-scope-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #FFFFFF;
  border-bottom: 1px solid #F1F5F9;
  transition: background-color 0.15s ease;
}

.wo-scope-row:last-child {
  border-bottom: none;
}

.wo-scope-row:hover {
  background-color: #F8FAFC;
}

.wo-scope-index {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #F1F5F9;
  color: #64748B;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.wo-scope-content {
  flex: 1;
  min-width: 0;
}

.wo-scope-desc {
  font-size: 13px;
  font-weight: 600;
  color: #1E293B;
  line-height: 1.4;
  word-break: break-word;
}

.wo-scope-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.wo-worktype-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  background: #EFF6FF;
  color: #1D4ED8;
  border: 1px solid #BFDBFE;
  white-space: nowrap;
}

.wo-degree-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 999px;
  background: #F1F5F9;
  color: #475569;
  border: 1px solid #E2E8F0;
  white-space: nowrap;
}

/* SPECS GRID (2x2) */
.wo-specs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (max-width: 540px) {
  .wo-specs-grid {
    grid-template-columns: 1fr;
  }
}

.wo-spec-item {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.wo-spec-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #ECFDF5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.wo-spec-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.wo-spec-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #64748B;
  text-transform: uppercase;
}

.wo-spec-val {
  font-size: 13px;
  font-weight: 600;
  color: #0F172A;
  word-break: break-word;
}

.wo-spec-val.highlight {
  color: var(--color-primary, #006C49);
}

.wo-spec-val.muted {
  color: #94A3B8;
  font-weight: 500;
  font-size: 12px;
}

.wo-spec-sub {
  font-size: 11px;
  color: #64748B;
  margin-top: 1px;
}

.wo-personnel-avatars {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}

.wo-person-chip {
  font-size: 11px;
  font-weight: 600;
  color: #334155;
  background: #F1F5F9;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #E2E8F0;
}

/* DESCRIPTION */
.wo-description-text {
  margin: 0;
  font-size: 13px;
  color: #334155;
  line-height: 1.5;
  font-weight: 500;
}

/* FOOTER */
.wo-modal-footer {
  padding: 14px 24px;
  background: #FFFFFF;
  border-top: 1px solid #E2E8F0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.item-type-tag-pill-sm {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 500;
  color: #FFFFFF;
  background-color: #8BA869;
  border-radius: 9999px;
  padding: 2px 9px;
  line-height: 1.3;
}
</style>
