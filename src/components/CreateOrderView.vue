<template>
  <section id="view-create-order" class="view-section active create-order-container">
    <!-- Breadcrumbs & Header Row -->
    <div class="create-order-header-row">
      <div class="create-order-title-group">
        <nav class="create-order-nav" aria-label="Breadcrumbs">
          <span class="create-order-nav-link" @click="$emit('cancel')">
            Work Orders
          </span>
          <span class="create-order-nav-sep">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="create-order-nav-current">
            {{ editingOrderCode ? 'Edit Work Order' : 'New Work Order' }}
          </span>
        </nav>
        <h2 class="create-order-heading">
          {{ editingOrderCode ? 'Edit Work Order' : 'Create Work Order' }}
        </h2>
      </div>

      <div class="create-order-actions">
        <button class="btn-modern-cancel" type="button" @click="$emit('cancel')">
          Cancel
        </button>
        <button class="btn-modern-save" type="button" @click="handleSubmit">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#FFFFFF" stroke-width="2.5">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>{{ editingOrderCode ? 'Update Order' : 'Save Work Order' }}</span>
        </button>
      </div>
    </div>

    <!-- Main Form Content Container -->
    <form @submit.prevent="handleSubmit" style="display: flex; flex-direction: column; gap: 24px; width: 100%">
      
      <!-- CARD 1: Work Order General Information -->
      <div class="modern-section-card">
        <div class="modern-card-header">
          <div class="modern-heading-group">
            <span class="modern-heading-bar"></span>
            <h3 class="modern-heading-text">Work Order General Information</h3>
          </div>
          <label class="modern-lock-badge">
            <span class="modern-lock-text">LOCK/UNLOCK</span>
            <input
              type="checkbox"
              v-model="isLocked"
            />
          </label>
        </div>

        <div class="modern-general-info-grid">
          <!-- Left Column -->
          <div class="modern-left-col">
            
            <!-- Row 1: Work Order Number & Date Received -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px">
              <div :class="['modern-field-group', { 'has-error': errors.code }]">
                <label class="modern-field-label">WORK ORDER NUMBER</label>
                <input
                  type="text"
                  id="code"
                  class="modern-input-code"
                  placeholder="e.g. JR - BHM - 26 - 101"
                  v-model="code"
                />
                <span v-if="errors.code" class="error-msg">Work order number is required.</span>
              </div>

              <div class="modern-field-group">
                <label class="modern-field-label">DATE RECEIVED</label>
                <input
                  type="text"
                  class="modern-input"
                  placeholder="MMM DD, YYYY"
                  v-model="dateReceived"
                />
              </div>
            </div>

            <!-- Row 2: Name of Requester -->
            <div :class="['modern-field-group', { 'has-error': errors.requesterName }]">
              <label class="modern-field-label">NAME OF REQUESTER</label>
              <input
                type="text"
                id="requesterName"
                class="modern-input"
                placeholder="Type in Name of Requester"
                v-model="requesterName"
              />
              <span v-if="errors.requesterName" class="error-msg">Requester name is required.</span>
            </div>

            <!-- Row 3: Requesting Office (Dynamic Dropdown) -->
            <div :class="['modern-field-group', { 'has-error': errors.requestingOffice }]">
              <label class="modern-field-label">REQUESTING OFFICE</label>
              <select
                id="requestingOffice"
                class="modern-select"
                :value="requestingOffice"
                @change="handleOfficeChange(($event.target as HTMLSelectElement).value)"
              >
                <option value="" disabled>Type/Choose Requesting Office</option>
                <option v-for="opt in officeOptions" :key="opt" :value="opt">{{ opt }}</option>
                <option value="__ADD_NEW__" style="font-weight: 600; color: #006c49">+ Add New...</option>
              </select>
              <span v-if="errors.requestingOffice" class="error-msg">Please select a requesting office.</span>
            </div>

            <!-- Row 4: Facility/Asset (Dynamic Dropdown) -->
            <div :class="['modern-field-group', { 'has-error': errors.assetName }]">
              <label class="modern-field-label">FACILITY/ASSET</label>
              <select
                id="assetName"
                class="modern-select"
                :value="assetName"
                @change="handleAssetChange(($event.target as HTMLSelectElement).value)"
              >
                <option value="" disabled>Type/Choose Building Name</option>
                <option v-for="opt in assetOptions" :key="opt" :value="opt">{{ opt }}</option>
                <option value="__ADD_NEW__" style="font-weight: 600; color: #006c49">+ Add New...</option>
              </select>
              <span v-if="errors.assetName" class="error-msg">Please select a facility/building.</span>
            </div>

            <!-- Row 5: Room No./Name -->
            <div class="modern-field-group">
              <label class="modern-field-label">ROOM NO./NAME</label>
              <input
                type="text"
                class="modern-input"
                placeholder="Room No./Name"
                v-model="roomNo"
              />
            </div>

          </div>

          <!-- Right Column -->
          <div class="modern-right-col">
            
            <!-- Row 1: Work Title -->
            <div class="modern-field-group">
              <label class="modern-field-label">WORK TITLE</label>
              <input
                type="text"
                class="modern-input"
                placeholder="Type in Work Title"
                v-model="workTitle"
              />
            </div>

            <!-- Row 2: Work Details and Description -->
            <div class="modern-field-group" style="flex: 1; display: flex; flex-direction: column">
              <label class="modern-field-label">WORK DETAILS AND DESCRIPTION</label>
              <textarea
                class="modern-textarea"
                placeholder="Type in Work order request details and information"
                v-model="description"
                style="flex: 1"
              />
            </div>

          </div>
        </div>
      </div>

      <!-- CARD 2: Scope of Works -->
      <div class="modern-section-card">
        <div class="modern-card-header">
          <div class="modern-heading-group">
            <span class="modern-heading-bar"></span>
            <h3 class="modern-heading-text">Scope of Works</h3>
          </div>
        </div>

        <div class="modern-scope-table-container">
          <table class="modern-scope-table">
            <thead>
              <tr>
                <th style="width: 36px; text-align: center"></th>
                <th style="width: 170px">WORK TYPE</th>
                <th>WORK DESCRIPTION</th>
                <th style="width: 70px; text-align: center">REMARKS</th>
                <th style="width: 150px">DEGREE OF WORK</th>
                <th style="width: 210px">START & COMPLETION DATES</th>
                <th style="width: 40px; text-align: center"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(task, index) in tasks"
                :key="index"
                draggable="true"
                @dragstart="handleDragStart($event, index)"
                @dragover="handleDragOver($event, index)"
                @drop="handleDrop($event, index)"
                @dragend="handleDragEnd"
                :class="[{ dragging: draggedIndex === index, 'drag-over': dragOverIndex === index }]"
              >
                <!-- Drag Handle Icon -->
                <td style="text-align: center">
                  <div className="drag-handle-btn" title="Click & drag to reorder scope">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <circle cx="8" cy="6" r="2" />
                      <circle cx="16" cy="6" r="2" />
                      <circle cx="8" cy="12" r="2" />
                      <circle cx="16" cy="12" r="2" />
                      <circle cx="8" cy="18" r="2" />
                      <circle cx="16" cy="18" r="2" />
                    </svg>
                  </div>
                </td>

                <!-- Work Type Select -->
                <td>
                  <select
                    :class="['modern-table-select', { 'has-error': errors[`taskType-${index}`] }]"
                    :value="task.type"
                    @change="handleWorkTypeChange(index, ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="" disabled>Select Type...</option>
                    <option v-for="opt in workTypeOptions" :key="opt" :value="opt">{{ opt }}</option>
                    <option value="__ADD_NEW__" style="font-weight: 600; color: #006c49">+ Add New...</option>
                  </select>
                </td>

                <!-- Work Description Textarea -->
                <td>
                  <textarea
                    :class="['modern-table-textarea', { 'has-error': errors[`taskRemarks-${index}`] }]"
                    placeholder="Type in Scope of Work Description..."
                    v-model="task.remarks"
                    rows="2"
                  />
                </td>

                <!-- Remarks Comment Bubble Button (Disabled) -->
                <td style="text-align: center">
                  <button
                    type="button"
                    class="remarks-btn disabled"
                    disabled
                    title="Remarks are disabled during order creation"
                    aria-label="Remarks disabled"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </td>

                <!-- Degree of Work Select -->
                <td>
                  <select
                    class="modern-table-select"
                    :value="task.degreeOfWork === 'Major' ? 'Major' : 'Minor'"
                    @change="task.degreeOfWork = ($event.target as HTMLSelectElement).value"
                  >
                    <option value="Minor">Minor</option>
                    <option value="Major">Major</option>
                  </select>
                </td>

                <!-- Start and Completion Dates Inputs (Disabled & Empty) -->
                <td>
                  <div class="modern-date-input-group">
                    <div
                      class="modern-date-field disabled"
                      title="Start date is disabled"
                    >
                      <span class="modern-date-label">START DATE</span>
                      <input
                        type="date"
                        class="modern-date-input"
                        :value="task.startDate || ''"
                        disabled
                      />
                    </div>
                    <div
                      class="modern-date-field disabled"
                      title="End date is disabled"
                    >
                      <span class="modern-date-label">END DATE</span>
                      <input
                        type="date"
                        class="modern-date-input"
                        :value="task.endDate || ''"
                        disabled
                      />
                    </div>
                  </div>
                </td>

                <!-- Delete Task Row Button -->
                <td style="text-align: center">
                  <button
                    v-if="tasks.length > 1"
                    type="button"
                    class="btn-task-delete"
                    title="Remove Task"
                    @click="handleDeleteTask(index)"
                    aria-label="Remove Task"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Add More Scope Button -->
          <div class="modern-add-scope-wrapper">
            <button type="button" class="btn-modern-add-scope" @click="handleAddTask">
              <span class="btn-add-scope-icon">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span>Add more Scope of Work</span>
            </button>
          </div>
        </div>
      </div>

    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { WorkOrder, Task, Person } from '../types';

const props = defineProps<{
  editingOrderCode: string | null;
  workOrders: WorkOrder[];
  personnel: Person[];
}>();

const emit = defineEmits<{
  (e: 'saveOrder', data: WorkOrder): void;
  (e: 'cancel'): void;
}>();

const DEFAULT_OFFICES = [
  'Building Repair & Maintenance',
  'Student Housing Repair & Maintenance',
  'Fabrication Workshop',
  'Administrative Office',
  'IT Infrastructure Department'
];

const DEFAULT_ASSETS = [
  'Coconut Dorm',
  'DMath Building',
  'CoMed Laboratory',
  'Engineering Hall',
  'Central Administration'
];

const DEFAULT_WORK_TYPES = [
  'Electrical',
  'Plumbing',
  'HVAC',
  'Mechanical',
  'Carpentry',
  'Masonry',
  'General Maintenance'
];

const loadSavedList = (key: string, defaults: string[]) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaults;
  } catch {
    return defaults;
  }
};

const officeOptions = ref<string[]>(loadSavedList('genso_custom_offices', DEFAULT_OFFICES));
const assetOptions = ref<string[]>(loadSavedList('genso_custom_assets', DEFAULT_ASSETS));
const workTypeOptions = ref<string[]>(loadSavedList('genso_custom_worktypes', DEFAULT_WORK_TYPES));

const code = ref('');
const dateReceived = ref('');
const requesterName = ref('');
const requestingOffice = ref('');
const assetName = ref('');
const roomNo = ref('');
const workTitle = ref('');
const description = ref('');
const isLocked = ref(false);

const getTodayString = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dd}`;
};

const getFormattedTodayDate = () => {
  const d = new Date();
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
};

const generateRequestCode = () => {
  const randNum = Math.floor(100 + Math.random() * 900);
  return `JR - BHM - 26 - ${randNum}`;
};

const tasks = ref<Task[]>([
  {
    type: '',
    remarks: '',
    degreeOfWork: 'Minor',
    startDate: '',
    endDate: ''
  }
]);

const draggedIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);
const errors = ref<Record<string, boolean>>({});

const isEditing = computed(() => Boolean(props.editingOrderCode));

watch(
  () => [props.editingOrderCode, props.workOrders],
  () => {
    if (props.editingOrderCode) {
      const order = props.workOrders.find((o) => o.code === props.editingOrderCode);
      if (order) {
        code.value = order.code;
        dateReceived.value = order.dateReceived || getFormattedTodayDate();
        requesterName.value = order.requesterName || '';
        requestingOffice.value = order.requestingOffice || '';
        assetName.value = order.assetName || '';
        roomNo.value = order.roomNo || order.space || '';
        workTitle.value = order.workTitle || '';
        description.value = order.description || '';
        isLocked.value = order.isLocked || false;

        if (order.requestingOffice && !officeOptions.value.includes(order.requestingOffice)) {
          officeOptions.value.push(order.requestingOffice);
        }
        if (order.assetName && !assetOptions.value.includes(order.assetName)) {
          assetOptions.value.push(order.assetName);
        }

        if (order.tasks && order.tasks.length > 0) {
          tasks.value = order.tasks.map((t) => ({
            ...t,
            degreeOfWork: t.degreeOfWork === 'Major' ? 'Major' : 'Minor'
          }));
          order.tasks.forEach((t) => {
            if (t.type && !workTypeOptions.value.includes(t.type)) {
              workTypeOptions.value.push(t.type);
            }
          });
        } else {
          tasks.value = [
            {
              type: order.worktype || '',
              remarks: order.scope || '',
              degreeOfWork: 'Minor',
              startDate: order.startDate || '',
              endDate: order.endDate || ''
            }
          ];
        }
      }
    } else {
      code.value = generateRequestCode();
      dateReceived.value = getFormattedTodayDate();
      requesterName.value = '';
      requestingOffice.value = '';
      assetName.value = '';
      roomNo.value = '';
      workTitle.value = '';
      description.value = '';
      isLocked.value = false;
      tasks.value = [
        {
          type: '',
          remarks: '',
          degreeOfWork: 'Minor',
          startDate: '',
          endDate: ''
        }
      ];
    }
    errors.value = {};
  },
  { immediate: true, deep: true }
);

const handleOfficeChange = (val: string) => {
  if (val === '__ADD_NEW__') {
    const newName = window.prompt('Enter new Requesting Office name:');
    if (newName && newName.trim()) {
      const trimmed = newName.trim();
      if (!officeOptions.value.includes(trimmed)) {
        officeOptions.value.push(trimmed);
        try { localStorage.setItem('genso_custom_offices', JSON.stringify(officeOptions.value)); } catch {}
      }
      requestingOffice.value = trimmed;
    }
  } else {
    requestingOffice.value = val;
  }
};

const handleAssetChange = (val: string) => {
  if (val === '__ADD_NEW__') {
    const newName = window.prompt('Enter new Facility / Building name:');
    if (newName && newName.trim()) {
      const trimmed = newName.trim();
      if (!assetOptions.value.includes(trimmed)) {
        assetOptions.value.push(trimmed);
        try { localStorage.setItem('genso_custom_assets', JSON.stringify(assetOptions.value)); } catch {}
      }
      assetName.value = trimmed;
    }
  } else {
    assetName.value = val;
  }
};

const handleWorkTypeChange = (index: number, val: string) => {
  if (val === '__ADD_NEW__') {
    const newName = window.prompt('Enter new Work Type:');
    if (newName && newName.trim()) {
      const trimmed = newName.trim();
      if (!workTypeOptions.value.includes(trimmed)) {
        workTypeOptions.value.push(trimmed);
        try { localStorage.setItem('genso_custom_worktypes', JSON.stringify(workTypeOptions.value)); } catch {}
      }
      tasks.value[index].type = trimmed;
    }
  } else {
    tasks.value[index].type = val;
  }
};

const handleAddTask = () => {
  tasks.value.push({
    type: '',
    remarks: '',
    degreeOfWork: 'Minor',
    startDate: '',
    endDate: ''
  });
};

const handleDeleteTask = (index: number) => {
  if (tasks.value.length <= 1) return;
  tasks.value.splice(index, 1);
};

const handleDragStart = (e: DragEvent, index: number) => {
  draggedIndex.value = index;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }
};

const handleDragOver = (e: DragEvent, index: number) => {
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  if (dragOverIndex.value !== index) {
    dragOverIndex.value = index;
  }
};

const handleDrop = (e: DragEvent, dropIndex: number) => {
  e.preventDefault();
  if (draggedIndex.value !== null && draggedIndex.value !== dropIndex) {
    const moved = tasks.value.splice(draggedIndex.value, 1)[0];
    tasks.value.splice(dropIndex, 0, moved);
  }
  draggedIndex.value = null;
  dragOverIndex.value = null;
};

const handleDragEnd = () => {
  draggedIndex.value = null;
  dragOverIndex.value = null;
};

const handleSubmit = () => {
  const newErrors: Record<string, boolean> = {};
  let isValid = true;

  if (!code.value.trim()) { newErrors.code = true; isValid = false; }
  if (!requesterName.value.trim()) { newErrors.requesterName = true; isValid = false; }
  if (!requestingOffice.value) { newErrors.requestingOffice = true; isValid = false; }
  if (!assetName.value) { newErrors.assetName = true; isValid = false; }

  tasks.value.forEach((t, i) => {
    if (!t.type) { newErrors[`taskType-${i}`] = true; isValid = false; }
    if (!t.remarks.trim()) { newErrors[`taskRemarks-${i}`] = true; isValid = false; }
  });

  errors.value = newErrors;

  if (!isValid) {
    const errKeys = Object.keys(newErrors);
    if (errKeys.length > 0) {
      const el = document.getElementById(errKeys[0]) || document.querySelector('.has-error');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  const primaryTask = tasks.value[0] || { type: 'General', remarks: 'General Maintenance', startDate: getTodayString(), endDate: getTodayString() };

  const payload: WorkOrder = {
    code: code.value,
    assetName: assetName.value || 'Default Facility',
    space: roomNo.value || 'Main Facility',
    scope: primaryTask.remarks,
    workgroup: requestingOffice.value || 'General Maintenance',
    status: 'Pending',
    priority: 'Medium',
    worktype: primaryTask.type || 'General',
    startDate: primaryTask.startDate,
    endDate: primaryTask.endDate,
    startTime: '08:00 AM',
    endTime: '05:00 PM',
    foreman: requesterName.value || 'System Admin',
    assigned: [],
    description: description.value,
    tasks: tasks.value,
    workTitle: workTitle.value,
    dateReceived: dateReceived.value,
    requesterName: requesterName.value,
    requestingOffice: requestingOffice.value,
    roomNo: roomNo.value,
    isLocked: isLocked.value
  };

  emit('saveOrder', payload);
};
</script>
