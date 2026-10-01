<template>
  <div v-if="isOpen" class="modal-backdrop open" id="leave-schedule-modal" @click="$emit('close')">
    <div class="modal-card leave-modal-card" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div class="modal-title-wrapper">
          <div style="display: flex; align-items: center; gap: 8px">
            <h2 class="modal-title">Schedule Personnel Leave</h2>
            <span class="leave-header-tag">Pre-Filed</span>
          </div>
          <span class="modal-subtitle">
            Pre-filed dates automatically display as <strong>On-Leave</strong> in daily attendance checks.
          </span>
        </div>
        <button class="modal-close-btn" @click="$emit('close')" aria-label="Close modal">
          &times;
        </button>
      </div>

      <!-- Modal Content: Tabbed View (File New Leave / Scheduled Leaves List) -->
      <div class="leave-tabs-strip">
        <button
          type="button"
          :class="['leave-tab-btn', { active: activeTab === 'file' }]"
          @click="activeTab = 'file'"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>{{ editingLeaveId ? 'Edit Leave' : 'File New Leave' }}</span>
        </button>
        <button
          type="button"
          :class="['leave-tab-btn', { active: activeTab === 'list' }]"
          @click="activeTab = 'list'"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>Scheduled Leaves</span>
          <span class="leave-count-pill">{{ leaves.length }}</span>
        </button>
      </div>

      <!-- TAB 1: File / Edit Leave -->
      <form v-if="activeTab === 'file'" @submit.prevent="handleSubmitLeave" class="modal-body leave-form-body">
        <!-- Editing Banner -->
        <div v-if="editingLeaveId" class="leave-editing-banner">
          <span>Editing scheduled leave record #{{ editingLeaveId }}</span>
          <button type="button" class="leave-cancel-edit-link" @click="handleCancelEdit">
            Cancel Edit & File New
          </button>
        </div>

        <!-- Error Banner -->
        <div v-if="errorMessage" class="leave-error-alert">
          {{ errorMessage }}
        </div>

        <!-- Personnel Picker -->
        <div class="form-group">
          <label class="form-label" for="leavePersonSelect">STAFF MEMBER</label>
          <select
            id="leavePersonSelect"
            class="form-select"
            v-model="form.personnelCode"
            :disabled="!!editingLeaveId"
            required
          >
            <option value="" disabled>Select personnel...</option>
            <option
              v-for="p in personnel"
              :key="p.code || p.id"
              :value="p.code || p.id"
            >
              {{ p.name }} ({{ p.role }}) — {{ p.code || p.id }}
            </option>
          </select>
        </div>

        <!-- Leave Type -->
        <div class="form-group">
          <label class="form-label" for="leaveTypeSelect">LEAVE TYPE</label>
          <select
            id="leaveTypeSelect"
            class="form-select"
            v-model="form.leaveType"
            required
          >
            <option value="Vacation Leave">Vacation Leave</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Emergency Leave">Emergency Leave</option>
            <option value="Official Business">Official Business / Field Assignment</option>
            <option value="Maternity / Paternity">Maternity / Paternity</option>
            <option value="Bereavement">Bereavement Leave</option>
          </select>
        </div>

        <!-- Date Range -->
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label" for="leaveStartDate">START DATE</label>
            <input
              type="date"
              id="leaveStartDate"
              class="form-input"
              v-model="form.startDate"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="leaveEndDate">END DATE</label>
            <input
              type="date"
              id="leaveEndDate"
              class="form-input"
              v-model="form.endDate"
              :min="form.startDate"
              required
            />
          </div>
        </div>

        <!-- Reason -->
        <div class="form-group">
          <label class="form-label" for="leaveReason">REASON / NOTES (OPTIONAL)</label>
          <textarea
            id="leaveReason"
            class="form-textarea"
            placeholder="Provide context or authorization details..."
            v-model="form.reason"
            rows="2"
          ></textarea>
        </div>

        <!-- Footer -->
        <div class="modal-footer" style="padding: 16px 0 0; margin-top: 8px; display: flex; justify-content: flex-end; gap: 8px;">
          <button v-if="editingLeaveId" type="button" class="btn btn-outline" @click="handleCancelEdit">
            Cancel Edit
          </button>
          <button type="button" class="btn btn-outline" @click="$emit('close')">
            Close
          </button>
          <button type="submit" class="btn btn-primary">
            {{ editingLeaveId ? 'Update Leave' : 'Schedule Leave' }}
          </button>
        </div>
      </form>

      <!-- TAB 2: Scheduled Leaves List -->
      <div v-else class="modal-body leave-list-body">
        <div v-if="leaves.length === 0" class="leave-empty-state">
          No scheduled leaves on file.
        </div>

        <div v-else class="scheduled-leaves-container">
          <div
            v-for="l in leaves"
            :key="l.id || `${l.personnelCode}-${l.startDate}`"
            class="scheduled-leave-card"
          >
            <div class="leave-card-top">
              <div>
                <span class="leave-staff-name">{{ l.personnelName || getPersonName(l.personnelCode) }}</span>
                <span class="leave-staff-code">{{ l.personnelCode }}</span>
              </div>
              <span class="leave-type-pill">{{ l.leaveType }}</span>
            </div>

            <div class="leave-dates-row">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{{ l.startDate }} &nbsp;→&nbsp; {{ l.endDate }}</span>
            </div>

            <div v-if="l.reason" class="leave-reason-text">
              "{{ l.reason }}"
            </div>

            <!-- Card Bottom Actions: Edit & Cancel/Delete -->
            <div class="leave-card-bottom">
              <div class="leave-card-actions">
                <button
                  type="button"
                  class="leave-action-btn edit"
                  @click="handleStartEdit(l)"
                  title="Edit scheduled dates or reason"
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  class="leave-action-btn delete"
                  @click="handleDeleteClick(l)"
                  title="Cancel leave and restore attendance status"
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span>Cancel Leave</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { Person, LeaveRecord } from '../../types';

const props = defineProps<{
  isOpen: boolean;
  personnel: Person[];
  leaves: LeaveRecord[];
  initialPersonnelCode?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'schedule', data: {
    id?: number | string;
    personnelCode: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }): void;
  (e: 'deleteLeave', id: number | string): void;
  (e: 'delete-leave', id: number | string): void;
}>();

const activeTab = ref<'file' | 'list'>('file');
const errorMessage = ref('');
const editingLeaveId = ref<number | string | null>(null);

const form = reactive({
  personnelCode: '',
  leaveType: 'Vacation Leave',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  reason: ''
});

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      activeTab.value = 'file';
      errorMessage.value = '';
      editingLeaveId.value = null;
      form.personnelCode = props.initialPersonnelCode || (props.personnel[0]?.code || '');
      form.startDate = new Date().toISOString().split('T')[0];
      form.endDate = new Date().toISOString().split('T')[0];
      form.reason = '';
    }
  },
  { immediate: true }
);

const getPersonName = (code: string) => {
  const p = props.personnel.find((item) => (item.code || item.id) === code);
  return p ? p.name : code;
};

const handleStartEdit = (leave: LeaveRecord) => {
  editingLeaveId.value = leave.id || null;
  form.personnelCode = leave.personnelCode;
  form.leaveType = leave.leaveType;
  form.startDate = leave.startDate;
  form.endDate = leave.endDate;
  form.reason = leave.reason || '';
  errorMessage.value = '';
  activeTab.value = 'file';
};

const handleCancelEdit = () => {
  editingLeaveId.value = null;
  form.personnelCode = props.initialPersonnelCode || (props.personnel[0]?.code || '');
  form.leaveType = 'Vacation Leave';
  form.startDate = new Date().toISOString().split('T')[0];
  form.endDate = new Date().toISOString().split('T')[0];
  form.reason = '';
  errorMessage.value = '';
};

const handleDeleteClick = (leave: LeaveRecord) => {
  const staffName = leave.personnelName || getPersonName(leave.personnelCode);
  if (
    window.confirm(
      `Are you sure you want to cancel the scheduled leave for ${staffName} (${leave.startDate} to ${leave.endDate})?\n\nTheir attendance status will be restored to Present if they are currently on leave.`
    )
  ) {
    if (leave.id) {
      emit('delete-leave', leave.id);
      emit('deleteLeave', leave.id);
    }
  }
};

const handleSubmitLeave = () => {
  if (!form.personnelCode) {
    errorMessage.value = 'Please select a staff member.';
    return;
  }
  if (!form.startDate || !form.endDate) {
    errorMessage.value = 'Please specify start and end dates.';
    return;
  }
  if (form.startDate > form.endDate) {
    errorMessage.value = 'End date cannot be earlier than start date.';
    return;
  }

  emit('schedule', {
    id: editingLeaveId.value || undefined,
    personnelCode: form.personnelCode,
    leaveType: form.leaveType,
    startDate: form.startDate,
    endDate: form.endDate,
    reason: form.reason
  });
  editingLeaveId.value = null;
};
</script>

<style scoped>
.leave-modal-card {
  max-width: 520px;
  width: 95%;
  border-radius: 14px;
}

.leave-header-tag {
  font-size: 11px;
  font-weight: 700;
  color: #0369A1;
  background-color: #E0F2FE;
  border: 1px solid #BAE6FD;
  padding: 2px 8px;
  border-radius: 9999px;
}

.leave-tabs-strip {
  display: flex;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
  padding: 6px 16px 0;
  gap: 8px;
}

.leave-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 8px 12px;
  font-size: 12.5px;
  font-weight: 600;
  color: #64748B;
  cursor: pointer;
  transition: all 0.15s ease;
}

.leave-tab-btn:hover {
  color: #0F172A;
}

.leave-tab-btn.active {
  color: #006C49;
  border-bottom-color: #006C49;
}

.leave-count-pill {
  background: #E2E8F0;
  color: #0F172A;
  font-size: 10.5px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
}

.leave-form-body {
  padding: 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.leave-error-alert {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #B91C1C;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 6px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-label {
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  letter-spacing: 0.2px;
}

.form-select,
.form-input,
.form-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  font-size: 12.5px;
  color: #0F172A;
  background: #FFFFFF;
  outline: none;
  transition: border-color 0.15s ease;
}

.form-select:focus,
.form-input:focus,
.form-textarea:focus {
  border-color: #006C49;
  box-shadow: 0 0 0 2px rgba(0, 108, 73, 0.15);
}

.leave-list-body {
  padding: 16px 20px;
  max-height: 380px;
  overflow-y: auto;
}

.leave-empty-state {
  text-align: center;
  padding: 32px;
  color: #64748B;
  font-size: 13px;
}

.scheduled-leaves-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.scheduled-leave-card {
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 12px 14px;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.leave-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.leave-staff-name {
  font-size: 13px;
  font-weight: 700;
  color: #0F172A;
}

.leave-staff-code {
  font-size: 11px;
  font-family: monospace;
  color: #64748B;
  margin-left: 6px;
}

.leave-type-pill {
  font-size: 11px;
  font-weight: 700;
  color: #0369A1;
  background: #E0F2FE;
  border: 1px solid #BAE6FD;
  padding: 2px 7px;
  border-radius: 9999px;
}

.leave-dates-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.leave-reason-text {
  font-size: 11.5px;
  color: #64748B;
  font-style: italic;
}

.leave-editing-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  color: #1E40AF;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 6px;
}

.leave-cancel-edit-link {
  background: none;
  border: none;
  color: #2563EB;
  font-size: 11.5px;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
}

.leave-cancel-edit-link:hover {
  color: #1D4ED8;
}

.leave-card-bottom {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px dashed #E2E8F0;
}

.leave-card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.leave-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.leave-action-btn.edit {
  background: #F1F5F9;
  color: #334155;
  border-color: #CBD5E1;
}

.leave-action-btn.edit:hover {
  background: #E2E8F0;
  color: #0F172A;
  border-color: #94A3B8;
}

.leave-action-btn.delete {
  background: #FEF2F2;
  color: #DC2626;
  border-color: #FECACA;
}

.leave-action-btn.delete:hover {
  background: #FEE2E2;
  color: #B91C1C;
  border-color: #FCA5A5;
}
</style>
