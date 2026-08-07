<template>
  <section id="view-work-orders" class="view-section active" style="display: flex">
    <!-- Header Info -->
    <div class="view-header-row">
      <div>
        <h1 class="view-main-title">Work Order Management</h1>
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px; flex-wrap: wrap">
          <p class="view-main-subtitle" style="margin: 0">
            Review and track all active maintenance tasks across facilities.
          </p>
          <span style="width: 4px; height: 4px; border-radius: 50%; background-color: var(--color-text-placeholder)"></span>
          <span
            style="
              font-size: 12px;
              font-weight: 700;
              color: var(--color-primary);
              background-color: var(--color-primary-light);
              padding: 2px 8px;
              border-radius: 4px;
            "
          >
            {{ activeFocusText }}
          </span>
        </div>
      </div>

      <div class="view-header-actions">
        <div class="date-badge">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{{ currentDate }}</span>
        </div>

        <button class="btn btn-outline-sm" id="btn-export-csv" @click="handleExportCsv">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          <span>Export CSV</span>
        </button>

        <button
          v-if="onNavigateDailyLog"
          class="btn btn-outline-sm"
          style="background-color: #eff4ff; border-color: #bbcabf; color: #006c49; font-weight: 600"
          @click="$emit('navigateDailyLog')"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#006C49" stroke-width="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <line x1="9" y1="12" x2="15" y2="12" />
          </svg>
          <span>Daily Work Log</span>
        </button>

        <button
          :class="['btn', 'btn-outline-sm', { active: showFilters }]"
          id="btn-advanced-filters"
          @click="showFilters = !showFilters"
          :style="{
            backgroundColor: showFilters ? 'var(--color-primary-light)' : 'transparent',
            borderColor: showFilters ? 'var(--color-primary)' : ''
          }"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            :stroke="showFilters ? 'var(--color-primary)' : 'currentColor'"
            stroke-width="2"
          >
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          <span :style="{ color: showFilters ? 'var(--color-primary)' : 'inherit' }">Advanced Filters</span>
        </button>
      </div>
    </div>

    <!-- Togglable Sub Filter Panel Card -->
    <div v-if="showFilters" class="card sub-filter-card" style="animation: fadeIn 0.2s ease">
      <div class="card-body flex-row-wrap">
        <div class="filter-input-group">
          <label for="filter-date">Date</label>
          <input type="text" id="filter-date" :value="currentDate" class="filter-text-input" readonly />
        </div>

        <div class="filter-input-group">
          <label for="filter-facility">Facility</label>
          <select id="filter-facility" class="filter-select" v-model="facilityFilter">
            <option value="all">All Facilities</option>
            <option value="Coconut Dorm">Coconut Dorm</option>
            <option value="DMath">DMath</option>
            <option value="CoMed Laboratory">CoMed Laboratory</option>
            <option value="3F Academic Building">3F Academic Building</option>
            <option value="PNB">PNB</option>
          </select>
        </div>

        <div class="filter-input-group">
          <label for="filter-space">Space / Room</label>
          <select id="filter-space" class="filter-select" v-model="spaceFilter">
            <option value="all">All Spaces</option>
            <option value="Room 21">Room 21</option>
            <option value="Roof Deck B-4">Roof Deck B-4</option>
            <option value="Lab 101">Lab 101</option>
            <option value="3F AB">3F AB</option>
            <option value="PNB Upper Campus">PNB Upper Campus</option>
          </select>
        </div>

        <div class="filter-input-group">
          <label for="filter-workgroup">Workgroup</label>
          <select id="filter-workgroup" class="filter-select" v-model="workgroupFilter">
            <option value="all">All Groups</option>
            <option value="Building Repair & Maintenance">Building Repair & Maintenance</option>
            <option value="Student Housing Repair & Maintenance">Student Housing Repair & Maintenance</option>
            <option value="Fabrication Workshop">Fabrication Workshop</option>
          </select>
        </div>

        <div class="filter-input-group shrink">
          <label>Priority</label>
          <div class="filter-priority-btns">
            <button
              v-for="prio in ['Low', 'Medium', 'High']"
              :key="prio"
              type="button"
              :class="['prio-btn', { active: priorityFilter === prio }]"
              @click="handlePriorityClick(prio)"
            >
              {{ prio }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="card table-card" style="min-width: 0">
      <div class="card-header space-between" style="padding: 16px 20px; border-bottom: 1px solid var(--color-border)">
        <h3 style="font-size: 15px">Active Orders</h3>
        <div class="personnel-search-box" style="margin: 0; height: 34px; width: 260px">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search code, asset, or scope..."
            v-model="localSearch"
            style="padding: 0 8px 0 32px; font-size: 12px"
          />
        </div>
      </div>

      <div class="card-body no-padding">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>REQ. CODE</th>
                <th>ASSET / FACILITY</th>
                <th>ON-GOING SCOPE</th>
                <th>ASSIGNED WORKGROUP</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filtered.length === 0">
                <td colspan="6" style="text-align: center; padding: 48px; color: var(--color-text-muted)">
                  No work orders match the current criteria.
                </td>
              </tr>
              <tr
                v-else
                v-for="o in filtered"
                :key="o.code"
                @click="$emit('selectOrder', o.code)"
                style="cursor: pointer"
              >
                <td class="cell-primary" style="color: var(--color-primary); font-family: monospace">
                  {{ o.code }}
                </td>
                <td>
                  <span class="cell-primary">{{ o.assetName }}</span>
                  <span class="cell-subtext">{{ o.space }}</span>
                </td>
                <td>{{ o.scope }}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--color-text-muted)" stroke-width="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                    <span>{{ o.workgroup }}</span>
                  </div>
                </td>
                <td>
                  <span :class="['badge-status-pill', getStatusClass(o.status)]">
                    {{ o.status }}
                  </span>
                </td>
                <td
                  class="actions-cell"
                  style="position: relative"
                  @click.stop
                >
                  <button
                    class="icon-btn-action-trigger"
                    @click="openDropdownCode = openDropdownCode === o.code ? null : o.code"
                    style="background: none; border: none; cursor: pointer; color: var(--color-text-muted); font-size: 16px"
                  >
                    &#8942;
                  </button>

                  <div
                    v-if="openDropdownCode === o.code"
                    class="row-dropdown-menu"
                    style="
                      display: block;
                      position: absolute;
                      right: 10px;
                      background: #fff;
                      border: 1px solid var(--color-border);
                      box-shadow: var(--shadow-md);
                      border-radius: 4px;
                      z-index: 10;
                      min-width: 100px;
                    "
                  >
                    <button
                      class="dropdown-item"
                      @click="
                        openDropdownCode = null;
                        $emit('editOrder', o.code);
                      "
                      style="display: block; width: 100%; border: none; background: none; padding: 8px 12px; text-align: left; font-size: 13px; cursor: pointer"
                    >
                      Edit
                    </button>
                    <button
                      class="dropdown-item"
                      @click="
                        openDropdownCode = null;
                        handleDelete(o.code);
                      "
                      style="display: block; width: 100%; border: none; background: none; padding: 8px 12px; text-align: left; font-size: 13px; color: var(--color-error); cursor: pointer"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div class="table-footer">
        <span class="table-counts">Showing 1 to {{ filtered.length }} of {{ filtered.length }} work orders</span>
        <div class="pagination-controls">
          <button class="pag-btn" disabled>&lt;</button>
          <button class="pag-btn active">1</button>
          <button class="pag-btn">2</button>
          <button class="pag-btn">3</button>
          <span class="pag-dots">...</span>
          <button class="pag-btn">25</button>
          <button class="pag-btn">&gt;</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { WorkOrder } from '../types';

const props = defineProps<{
  workOrders: WorkOrder[];
  searchQuery: string;
  onNavigateDailyLog?: () => void;
}>();

const emit = defineEmits<{
  (e: 'selectOrder', code: string): void;
  (e: 'editOrder', code: string): void;
  (e: 'deleteOrder', code: string): void;
  (e: 'createOrder'): void;
  (e: 'navigateDailyLog'): void;
}>();

const showFilters = ref(false);
const facilityFilter = ref('all');
const spaceFilter = ref('all');
const workgroupFilter = ref('all');
const priorityFilter = ref('Medium');
const localSearch = ref('');
const openDropdownCode = ref<string | null>(null);

const getStatusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'in progress':
      return 'inprogress';
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

const handlePriorityClick = (prio: string) => {
  if (priorityFilter.value === prio) {
    priorityFilter.value = 'all';
  } else {
    priorityFilter.value = prio;
  }
};

const filtered = computed(() => {
  return props.workOrders.filter((o) => {
    const q = (localSearch.value || props.searchQuery || '').toLowerCase();
    const matchesSearch =
      o.code.toLowerCase().includes(q) ||
      o.assetName.toLowerCase().includes(q) ||
      o.scope.toLowerCase().includes(q);

    const matchesFacility = facilityFilter.value === 'all' || o.assetName === facilityFilter.value;
    const matchesSpace = spaceFilter.value === 'all' || o.space === spaceFilter.value;
    const matchesWorkgroup = workgroupFilter.value === 'all' || o.workgroup === workgroupFilter.value;
    const matchesPriority = priorityFilter.value === 'all' || o.priority === priorityFilter.value;

    return matchesSearch && matchesFacility && matchesSpace && matchesWorkgroup && matchesPriority;
  });
});

const currentDate = computed(() =>
  new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
);

const activeFocusText = computed(() => {
  const inProgress = props.workOrders.filter((o) => o.status.toLowerCase() === 'in progress');
  return inProgress.length > 0
    ? `Focus: ${inProgress[0].code} at ${inProgress[0].assetName} (${inProgress.length} active)`
    : 'No active projects in progress';
});

const handleExportCsv = () => {
  alert('Export CSV completed.');
};

const handleDelete = (code: string) => {
  if (confirm(`Are you sure you want to delete ${code}?`)) {
    emit('deleteOrder', code);
  }
};
</script>
