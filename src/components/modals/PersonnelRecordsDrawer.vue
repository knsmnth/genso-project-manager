<template>
  <div v-if="isOpen" class="drawer-backdrop" @click="$emit('close')">
    <aside class="records-drawer" @click.stop>
      <!-- Loading State -->
      <div v-if="isLoading" class="drawer-loading">
        <div class="drawer-spinner"></div>
        <span>Loading personnel dossier...</span>
      </div>

      <template v-else-if="dossier">
        <!-- Drawer Header -->
        <div class="drawer-header">
          <div class="drawer-header-left">
            <div :class="['initials-avatar large', getAvatarColorClass(dossier.profile.name)]">
              {{ getInitials(dossier.profile.name) }}
            </div>
            <div class="drawer-profile-summary">
              <div style="display: flex; align-items: center; gap: 8px">
                <h3 class="drawer-name">{{ dossier.profile.name }}</h3>
                <span class="drawer-code-badge">{{ dossier.profile.code || dossier.profile.id }}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-top: 3px">
                <span class="drawer-role">{{ dossier.profile.role }}</span>
                <span class="drawer-sep">•</span>
                <span :class="['drawer-status-pill', dossier.profile.status.toLowerCase()]">
                  {{ dossier.profile.status }}
                </span>
              </div>
            </div>
          </div>

          <button class="drawer-close-btn" @click="$emit('close')" aria-label="Close drawer">
            &times;
          </button>
        </div>

        <!-- Navigation Tabs -->
        <div class="drawer-nav-tabs">
          <button
            type="button"
            :class="['d-tab-btn', { active: activeTab === 'profile' }]"
            @click="activeTab = 'profile'"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Profile & Credentials</span>
          </button>

          <button
            type="button"
            :class="['d-tab-btn', { active: activeTab === 'attendance' }]"
            @click="activeTab = 'attendance'"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Attendance History</span>
            <span class="d-tab-count">{{ dossier.attendanceHistory.length }}</span>
          </button>

          <button
            type="button"
            :class="['d-tab-btn', { active: activeTab === 'workorders' }]"
            @click="activeTab = 'workorders'"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Work Orders</span>
            <span class="d-tab-count">{{ dossier.workOrders.length }}</span>
          </button>
        </div>

        <!-- TAB 1: Profile & Edit -->
        <div v-if="activeTab === 'profile'" class="drawer-content-pane">
          <div class="pane-action-bar">
            <span class="pane-section-title">Personnel Master Record</span>
            <button
              v-if="!isEditingProfile"
              class="btn btn-outline-sm btn-edit-profile"
              @click="handleStartEdit"
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Edit Profile</span>
            </button>
            <div v-else style="display: flex; gap: 6px">
              <button class="btn btn-outline-sm" @click="isEditingProfile = false">
                Cancel
              </button>
              <button class="btn btn-primary-sm" @click="handleSaveProfile">
                Save Changes
              </button>
            </div>
          </div>

          <!-- View Mode -->
          <div v-if="!isEditingProfile" class="profile-details-grid">
            <div class="profile-detail-item">
              <span class="detail-label">FULL NAME</span>
              <span class="detail-value">{{ dossier.profile.name }}</span>
            </div>

            <div class="profile-detail-item">
              <span class="detail-label">EMPLOYEE CODE</span>
              <span class="detail-value code-font">{{ dossier.profile.code || dossier.profile.id }}</span>
            </div>

            <div class="profile-detail-item">
              <span class="detail-label">SPECIALIZATION / ROLE</span>
              <span class="detail-value">{{ dossier.profile.role }}</span>
            </div>

            <div class="profile-detail-item">
              <span class="detail-label">OPERATIONAL STATUS</span>
              <span class="detail-value">{{ dossier.profile.status }}</span>
            </div>

            <div class="profile-detail-item">
              <span class="detail-label">DEPARTMENT</span>
              <span class="detail-value">{{ dossier.profile.department || 'General Services' }}</span>
            </div>

            <div class="profile-detail-item">
              <span class="detail-label">ASSIGNED TEAM</span>
              <span class="detail-value">{{ dossier.profile.team || 'None Assigned' }}</span>
            </div>

            <div class="profile-detail-item">
              <span class="detail-label">CONTACT EMAIL</span>
              <span class="detail-value">{{ dossier.profile.email || '—' }}</span>
            </div>

            <div class="profile-detail-item">
              <span class="detail-label">CONTACT PHONE</span>
              <span class="detail-value">{{ dossier.profile.phone || '—' }}</span>
            </div>

            <div class="profile-detail-item">
              <span class="detail-label">DATE HIRED / JOINED</span>
              <span class="detail-value">{{ dossier.profile.dateHired || '—' }}</span>
            </div>

            <div class="profile-detail-item">
              <span class="detail-label">EMERGENCY CONTACT</span>
              <span class="detail-value">{{ dossier.profile.emergencyContact || '—' }}</span>
            </div>
          </div>

          <!-- Edit Mode Form -->
          <div v-else class="profile-edit-form">
            <div class="edit-form-group">
              <label class="edit-form-label">Full Name</label>
              <input type="text" class="edit-form-input" v-model="editForm.name" required />
            </div>

            <div class="edit-form-row">
              <div class="edit-form-group">
                <label class="edit-form-label">Role / Specialization</label>
                <input type="text" class="edit-form-input" v-model="editForm.role" required />
              </div>

              <div class="edit-form-group">
                <label class="edit-form-label">Operational Status</label>
                <select class="edit-form-select" v-model="editForm.status">
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="On-Site">On-Site</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Off-Site">Off-Site</option>
                </select>
              </div>
            </div>

            <div class="edit-form-row">
              <div class="edit-form-group">
                <label class="edit-form-label">Department</label>
                <input type="text" class="edit-form-input" v-model="editForm.department" />
              </div>

              <div class="edit-form-group">
                <label class="edit-form-label">Assigned Team</label>
                <input type="text" class="edit-form-input" v-model="editForm.team" />
              </div>
            </div>

            <div class="edit-form-row">
              <div class="edit-form-group">
                <label class="edit-form-label">Email</label>
                <input type="email" class="edit-form-input" v-model="editForm.email" />
              </div>

              <div class="edit-form-group">
                <label class="edit-form-label">Phone</label>
                <input type="text" class="edit-form-input" v-model="editForm.phone" />
              </div>
            </div>

            <div class="edit-form-row">
              <div class="edit-form-group">
                <label class="edit-form-label">Date Hired</label>
                <input type="date" class="edit-form-input" v-model="editForm.dateHired" />
              </div>

              <div class="edit-form-group">
                <label class="edit-form-label">Emergency Contact</label>
                <input type="text" class="edit-form-input" v-model="editForm.emergencyContact" />
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: Attendance History Log (Pure Dates, No Time Needed) -->
        <div v-else-if="activeTab === 'attendance'" class="drawer-content-pane">
          <div class="pane-action-bar">
            <span class="pane-section-title">Attendance History Log</span>
            <span class="pane-note">Dates are recorded (timestamps omitted)</span>
          </div>

          <div v-if="dossier.attendanceHistory.length === 0" class="drawer-empty-msg">
            No historical attendance entries on record.
          </div>

          <div v-else class="attendance-history-table-wrap">
            <table class="history-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>DAY</th>
                  <th>INDICATOR</th>
                  <th>STATUS</th>
                  <th>NOTES</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in dossier.attendanceHistory" :key="log.date">
                  <td class="history-date-cell">{{ log.formattedDate || log.date }}</td>
                  <td class="history-day-cell">{{ log.dayOfWeek || '—' }}</td>
                  <td style="width: 50px">
                    <AttendanceBadge :status="log.status" size="sm" />
                  </td>
                  <td>
                    <span :class="['history-status-tag', log.status]">
                      {{ formatStatusLabel(log.status) }}
                    </span>
                  </td>
                  <td class="history-notes-cell">{{ log.notes || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 3: Work Order History -->
        <div v-else-if="activeTab === 'workorders'" class="drawer-content-pane">
          <div class="pane-action-bar">
            <span class="pane-section-title">Assigned Work Orders</span>
            <span class="pane-note">{{ dossier.workOrders.length }} Total Dispatches</span>
          </div>

          <div v-if="dossier.workOrders.length === 0" class="drawer-empty-msg">
            No work order assignments found for this personnel.
          </div>

          <div v-else class="wo-history-list">
            <div
              v-for="wo in dossier.workOrders"
              :key="wo.code"
              class="wo-history-card"
            >
              <div class="wo-card-top">
                <div>
                  <span class="wo-card-code">{{ wo.code }}</span>
                  <h4 class="wo-card-title">{{ wo.workTitle || wo.assetName }}</h4>
                </div>
                <span :class="['wo-status-badge', wo.status.toLowerCase().replace(/\s+/g, '-')]">
                  {{ wo.status }}
                </span>
              </div>

              <div class="wo-card-details">
                <div class="wo-detail-item">
                  <span>Facility:</span>
                  <strong>{{ wo.assetName }}</strong>
                </div>
                <div class="wo-detail-item">
                  <span>Timeline:</span>
                  <strong>{{ wo.startDate }} → {{ wo.endDate }}</strong>
                </div>
                <div class="wo-detail-item">
                  <span>Lead:</span>
                  <strong>{{ wo.foreman }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { getPersonnelRecords, PersonnelDossier } from '../../services/personnelService';
import { Person } from '../../types';
import AttendanceBadge from '../ui/AttendanceBadge.vue';

const props = defineProps<{
  isOpen: boolean;
  personnelCode: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'profileUpdated', updated: Partial<Person> & { code: string }): void;
}>();

const activeTab = ref<'profile' | 'attendance' | 'workorders'>('profile');
const isLoading = ref(false);
const dossier = ref<PersonnelDossier | null>(null);
const isEditingProfile = ref(false);

const editForm = reactive({
  name: '',
  role: '',
  status: 'Available',
  department: '',
  team: '',
  email: '',
  phone: '',
  dateHired: '',
  emergencyContact: ''
});

watch(
  () => [props.isOpen, props.personnelCode],
  async () => {
    if (props.isOpen && props.personnelCode) {
      isLoading.value = true;
      isEditingProfile.value = false;
      activeTab.value = 'profile';
      try {
        const data = await getPersonnelRecords(props.personnelCode);
        dossier.value = data;
      } finally {
        isLoading.value = false;
      }
    }
  },
  { immediate: true }
);

const handleStartEdit = () => {
  if (!dossier.value) return;
  const p = dossier.value.profile;
  editForm.name = p.name;
  editForm.role = p.role;
  editForm.status = p.status;
  editForm.department = p.department || '';
  editForm.team = p.team || '';
  editForm.email = p.email || '';
  editForm.phone = p.phone || '';
  editForm.dateHired = p.dateHired || '';
  editForm.emergencyContact = p.emergencyContact || '';
  isEditingProfile.value = true;
};

const handleSaveProfile = () => {
  if (!dossier.value) return;
  const code = dossier.value.profile.code || dossier.value.profile.id || '';
  const updatedData: Partial<Person> & { code: string } = {
    code,
    name: editForm.name,
    role: editForm.role,
    status: editForm.status,
    department: editForm.department,
    team: editForm.team,
    email: editForm.email,
    phone: editForm.phone,
    dateHired: editForm.dateHired,
    emergencyContact: editForm.emergencyContact
  };

  // Update local view
  dossier.value.profile = {
    ...dossier.value.profile,
    ...updatedData
  };
  isEditingProfile.value = false;
  emit('profileUpdated', updatedData);
};

const formatStatusLabel = (status: string) => {
  switch (status) {
    case 'present': return 'Present';
    case 'absent': return 'Absent';
    case 'half_am': return 'Absent AM / Present PM';
    case 'half_pm': return 'Present AM / Absent PM';
    case 'on_leave': return 'On Leave';
    default: return status;
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
</script>

<style scoped>
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(2px);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  animation: fadeIn 0.2s ease;
}

.records-drawer {
  width: 580px;
  max-width: 90vw;
  height: 100%;
  background: #FFFFFF;
  box-shadow: -4px 0 24px rgba(15, 23, 42, 0.15);
  display: flex;
  flex-direction: column;
  animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.drawer-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: #64748B;
  font-size: 13px;
}

.drawer-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E2E8F0;
  border-top-color: #006C49;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #E2E8F0;
  background: #F8FAFC;
}

.drawer-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.initials-avatar.large {
  width: 48px;
  height: 48px;
  font-size: 16px;
  font-weight: 700;
}

.drawer-name {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #0F172A;
}

.drawer-code-badge {
  font-family: monospace;
  font-size: 11px;
  background: #E2E8F0;
  color: #334155;
  padding: 2px 6px;
  border-radius: 4px;
}

.drawer-role {
  font-size: 12.5px;
  color: #475569;
}

.drawer-sep {
  color: #CBD5E1;
}

.drawer-status-pill {
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  text-transform: uppercase;
}

.drawer-status-pill.available { background: #ECFDF5; color: #047857; }
.drawer-status-pill.busy, .drawer-status-pill.maintenance { background: #FFFBEB; color: #B45309; }
.drawer-status-pill.off-site { background: #F1F5F9; color: #475569; }

.drawer-close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  color: #64748B;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
  border-radius: 6px;
}

.drawer-close-btn:hover {
  background: #E2E8F0;
  color: #0F172A;
}

/* Tabs */
.drawer-nav-tabs {
  display: flex;
  border-bottom: 1px solid #E2E8F0;
  background: #FFFFFF;
  padding: 0 16px;
  gap: 8px;
}

.d-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 14px;
  font-size: 12.5px;
  font-weight: 600;
  color: #64748B;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.d-tab-btn:hover { color: #0F172A; }
.d-tab-btn.active {
  color: #006C49;
  border-bottom-color: #006C49;
}

.d-tab-count {
  background: #F1F5F9;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
}

/* Content Pane */
.drawer-content-pane {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.pane-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.pane-section-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #0F172A;
}

.pane-note {
  font-size: 11px;
  color: #64748B;
}

.btn-edit-profile {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  height: 30px;
  padding: 0 12px;
}

.btn-primary-sm {
  background: #006C49;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-outline-sm {
  background: transparent;
  border: 1px solid #CBD5E1;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

/* Profile Details Grid */
.profile-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  background: #F8FAFC;
  padding: 18px 20px;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
}

.profile-detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 10px;
  font-weight: 700;
  color: #64748B;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 13px;
  font-weight: 600;
  color: #0F172A;
}

.detail-value.code-font {
  font-family: monospace;
}

/* Profile Edit Form */
.profile-edit-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.edit-form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.edit-form-row {
  display: flex;
  gap: 12px;
}

.edit-form-label {
  font-size: 11px;
  font-weight: 700;
  color: #475569;
}

.edit-form-input, .edit-form-select {
  padding: 8px 10px;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  font-size: 12.5px;
  color: #0F172A;
  outline: none;
}

.edit-form-input:focus, .edit-form-select:focus {
  border-color: #006C49;
}

/* Attendance Table */
.attendance-history-table-wrap {
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  overflow: hidden;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.history-table th {
  background: #F8FAFC;
  padding: 10px 12px;
  text-align: left;
  font-size: 10.5px;
  font-weight: 700;
  color: #475569;
  border-bottom: 1px solid #E2E8F0;
}

.history-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #F1F5F9;
}

.history-date-cell {
  font-weight: 600;
  color: #0F172A;
}

.history-day-cell {
  color: #64748B;
}

.history-status-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 9999px;
}

.history-status-tag.present { background: #ECFDF5; color: #047857; }
.history-status-tag.absent { background: #FEF2F2; color: #B91C1C; }
.history-status-tag.half_am, .history-status-tag.half_pm { background: #FFFBEB; color: #B45309; }
.history-status-tag.on_leave { background: #E0F2FE; color: #0369A1; }

.history-notes-cell {
  color: #64748B;
  font-size: 11px;
}

/* Work Orders List */
.wo-history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wo-history-card {
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 14px 16px;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.15s ease;
}

.wo-history-card:hover {
  border-color: #CBD5E1;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
}

.wo-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.wo-card-code {
  font-family: monospace;
  font-size: 11px;
  font-weight: 700;
  color: #006C49;
}

.wo-card-title {
  margin: 3px 0 0;
  font-size: 13.5px;
  font-weight: 700;
  color: #0F172A;
}

.wo-status-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 9999px;
}

.wo-status-badge.completed { background: #ECFDF5; color: #047857; }
.wo-status-badge.in-progress { background: #EFF6FF; color: #1D4ED8; }
.wo-status-badge.pending { background: #FFFBEB; color: #B45309; }

.wo-card-details {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 11.5px;
  color: #475569;
}

.wo-detail-item span {
  color: #64748B;
  margin-right: 4px;
}

.drawer-empty-msg {
  text-align: center;
  padding: 32px;
  color: #64748B;
  font-size: 13px;
}
</style>
