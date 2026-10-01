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
    </div>

    <!-- Module Navigation Bar & Utility Actions -->
    <div class="module-tab-bar">
      <!-- Left: Segmented Sub-View Navigation Tabs -->
      <div class="module-tabs">
        <button
          type="button"
          class="module-tab-btn active"
          title="All Work Orders"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-linecap="round" stroke-linejoin="round" />
            <polyline points="14 2 14 8 20 8" stroke-linecap="round" stroke-linejoin="round" />
            <line x1="16" y1="13" x2="8" y2="13" stroke-linecap="round" />
            <line x1="16" y1="17" x2="8" y2="17" stroke-linecap="round" />
          </svg>
          <span>All Orders</span>
          <span class="module-tab-count">{{ workOrders.length }}</span>
        </button>

        <button
          type="button"
          class="module-tab-btn"
          @click="$emit('navigateDailyLog')"
          title="Switch to Daily Work Log"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke-linecap="round" stroke-linejoin="round" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke-linecap="round" stroke-linejoin="round" />
            <line x1="9" y1="12" x2="15" y2="12" stroke-linecap="round" />
            <line x1="9" y1="16" x2="15" y2="16" stroke-linecap="round" />
          </svg>
          <span>Daily Work Log</span>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" style="opacity: 0.6">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <button
          type="button"
          class="module-tab-btn"
          @click="$emit('navigateHistory')"
          title="Switch to Work Log History"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Work Log History</span>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" style="opacity: 0.6">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <!-- Right: Data Utilities (Sort, Export CSV, Advanced Filters) -->
      <div class="module-utility-actions">

        <button class="btn btn-outline-sm" id="btn-export-csv" @click="handleExportCsv">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          <span>Export CSV</span>
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
      <!-- Filter Tab Header Banner -->
      <div class="filter-tab-banner">
        <div class="filter-tab-pill-badge">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span>FILTER TAB</span>
        </div>
        <div class="filter-tab-summary">
          <span v-if="hasActiveFilterCount" class="filter-applied-tag">
            ● {{ hasActiveFilterCount }} filter{{ hasActiveFilterCount > 1 ? 's' : '' }} applied
          </span>
          <span v-else>Refine work orders by date, location, workgroup, or active state</span>
        </div>
      </div>

      <div class="card-body flex-row-wrap" style="gap: 16px; align-items: flex-end; padding-top: 14px">
        <!-- Flexible Date Filter Group -->
        <div class="filter-input-group" style="min-width: 260px; flex: 1">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px">
            <label style="margin: 0">Date Filter</label>
            <select
              v-model="dateFilterType"
              style="font-size: 11px; padding: 2px 8px; border-radius: 4px; border: 1px solid var(--color-border); background: #FFFFFF; font-weight: 600; color: var(--color-primary); cursor: pointer"
            >
              <option value="all">All Dates</option>
              <option value="specific">Choose Date</option>
              <option value="range">Date Range</option>
              <option value="month">Choose Month</option>
              <option value="year">Choose Year</option>
            </select>
          </div>

          <!-- Specific Date -->
          <div v-if="dateFilterType === 'specific'">
            <input
              type="date"
              class="filter-text-input"
              v-model="specificDate"
              style="width: 100%; height: 36px; padding: 0 10px; font-size: 13px"
            />
          </div>

          <!-- Date Range -->
          <div v-else-if="dateFilterType === 'range'" style="display: flex; gap: 8px; align-items: center">
            <input
              type="date"
              class="filter-text-input"
              v-model="rangeStartDate"
              style="flex: 1; height: 36px; padding: 0 8px; font-size: 12px"
              aria-label="Start Date"
            />
            <span style="font-size: 12px; color: var(--color-text-muted); font-weight: 600">to</span>
            <input
              type="date"
              class="filter-text-input"
              v-model="rangeEndDate"
              style="flex: 1; height: 36px; padding: 0 8px; font-size: 12px"
              aria-label="End Date"
            />
          </div>

          <!-- Month Selector -->
          <div v-else-if="dateFilterType === 'month'" style="display: flex; gap: 8px; align-items: center">
            <select
              v-model="selectedMonth"
              class="filter-select"
              style="flex: 1; height: 36px; font-size: 13px"
            >
              <option value="all">All Months</option>
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
            <select
              v-model="selectedMonthYear"
              class="filter-select"
              style="width: 95px; height: 36px; font-size: 13px"
            >
              <option v-for="yr in availableYears" :key="yr" :value="yr">{{ yr }}</option>
            </select>
          </div>

          <!-- Year Alone Selector -->
          <div v-else-if="dateFilterType === 'year'">
            <select
              v-model="selectedYear"
              class="filter-select"
              style="width: 100%; height: 36px; font-size: 13px"
            >
              <option value="all">All Years</option>
              <option v-for="yr in availableYears" :key="yr" :value="yr">{{ yr }}</option>
            </select>
          </div>

          <!-- All Dates placeholder -->
          <div v-else>
            <input
              type="text"
              class="filter-text-input"
              value="Showing all dates"
              readonly
              style="width: 100%; height: 36px; font-size: 13px; background: #F8FAFC; color: var(--color-text-muted)"
            />
          </div>
        </div>

        <div class="filter-input-group" style="flex: 1; min-width: 160px">
          <label for="filter-facility">Facility</label>
          <select id="filter-facility" class="filter-select" v-model="facilityFilter" style="height: 36px">
            <option value="all">All Facilities</option>
            <option value="Coconut Dorm">Coconut Dorm</option>
            <option value="DMath">DMath</option>
            <option value="CoMed Laboratory">CoMed Laboratory</option>
            <option value="3F Academic Building">3F Academic Building</option>
            <option value="PNB">PNB</option>
          </select>
        </div>

        <div class="filter-input-group" style="flex: 1; min-width: 140px">
          <label for="filter-space">Space / Room</label>
          <select id="filter-space" class="filter-select" v-model="spaceFilter" style="height: 36px">
            <option value="all">All Spaces</option>
            <option value="Room 21">Room 21</option>
            <option value="Roof Deck B-4">Roof Deck B-4</option>
            <option value="Lab 101">Lab 101</option>
            <option value="3F AB">3F AB</option>
            <option value="PNB Upper Campus">PNB Upper Campus</option>
          </select>
        </div>

        <div class="filter-input-group" style="flex: 1; min-width: 180px">
          <label for="filter-workgroup">Workgroup</label>
          <select id="filter-workgroup" class="filter-select" v-model="workgroupFilter" style="height: 36px">
            <option value="all">All Groups</option>
            <option value="Building Repair & Maintenance">Building Repair & Maintenance</option>
            <option value="Student Housing Repair & Maintenance">Student Housing Repair & Maintenance</option>
            <option value="Fabrication Workshop">Fabrication Workshop</option>
          </select>
        </div>

        <div class="filter-input-group shrink">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <label style="margin: 0">Active State</label>
            <span v-if="activeFilter !== 'all'" class="filter-active-indicator">
              ● {{ activeFilter }}
            </span>
          </div>
          <div class="filter-tab-segmented" role="tablist" aria-label="Filter by active state">
            <button
              type="button"
              role="tab"
              :aria-selected="activeFilter === 'Active'"
              :class="['filter-tab-btn', 'tab-btn-active', { 'is-selected': activeFilter === 'Active' }]"
              @click="handleActiveFilterClick('Active')"
              title="Click to filter by Active work orders"
            >
              <span class="tab-dot active-dot"></span>
              <span>Active</span>
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="activeFilter === 'Inactive'"
              :class="['filter-tab-btn', 'tab-btn-inactive', { 'is-selected': activeFilter === 'Inactive' }]"
              @click="handleActiveFilterClick('Inactive')"
              title="Click to filter by Inactive work orders"
            >
              <span class="tab-dot inactive-dot"></span>
              <span>Inactive</span>
            </button>
          </div>
        </div>

        <div class="filter-input-group shrink" style="align-self: flex-end">
          <button
            type="button"
            class="filter-reset-btn"
            @click="resetFilters"
            title="Reset all filters"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="card table-card" style="min-width: 0">
      <div class="card-header space-between" style="padding: 14px 20px; border-bottom: 1px solid var(--color-border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px">
        <div style="display: flex; align-items: center; gap: 8px">
          <h3 style="font-size: 15px; margin: 0">Active Orders</h3>
          <span class="active-orders-count">{{ filtered.length }}</span>
        </div>

        <!-- Sorting Controls on the End Right -->
        <div class="wo-table-sort-row">
          <label class="wo-sort-label" for="wo-sort-select">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M6 12h12M10 18h4" />
            </svg>
            <span>Sort by:</span>
          </label>
          <select id="wo-sort-select" v-model="sortBy" class="wo-sort-select">
            <option value="alpha-asc">Alphabetical (A - Z)</option>
            <option value="alpha-desc">Alphabetical (Z - A)</option>
            <option value="date-desc">Date Inputted (Newest first)</option>
            <option value="date-asc">Date Inputted (Oldest first)</option>
          </select>
        </div>
      </div>

      <div class="card-body no-padding">
        <!-- Desktop Table View -->
        <div class="table-responsive wo-desktop-table">
          <table class="data-table">
            <thead>
              <tr>
                <th
                  style="width: 28%; min-width: 210px; cursor: pointer; user-select: none;"
                  class="sortable-th"
                  :class="{ active: sortBy === 'alpha-asc' || sortBy === 'alpha-desc' }"
                  @click="toggleSort('alpha')"
                  title="Sort Alphabetically by Work Title (Click to toggle)"
                >
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span>WORK TITLE</span>
                    <span class="sort-indicator">
                      <template v-if="sortBy === 'alpha-asc'">▲</template>
                      <template v-else-if="sortBy === 'alpha-desc'">▼</template>
                      <template v-else>↕</template>
                    </span>
                  </div>
                </th>
                <th style="width: 14%; min-width: 110px">WORK TYPE</th>
                <th style="width: 15%; min-width: 120px">ITEM TYPE</th>
                <th style="width: 14%; min-width: 130px">STATUS</th>
                <th style="width: 11%; min-width: 100px">ACTIVE</th>
                <th style="width: 11%; min-width: 100px; text-align: center">INSPECTION</th>
                <th style="width: 7%; min-width: 75px; text-align: right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filtered.length === 0">
                <td colspan="7" style="text-align: center; padding: 48px; color: var(--color-text-muted)">
                  No work orders match the current criteria.
                </td>
              </tr>
              <tr
                v-else
                v-for="o in filtered"
                :key="o.code"
                :class="['table-row-item', { 'row-inactive': o.isActive === false }]"
                @click="$emit('selectOrder', o.code)"
                style="cursor: pointer"
              >
                <td>
                  <div style="display: flex; flex-direction: column; gap: 4px">
                    <span class="cell-primary" style="font-size: 14px; font-weight: 600; color: var(--color-navy-header, #0f172a)">
                      {{ o.workTitle || o.scope || 'Untitled Work Order' }}
                    </span>
                    <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--color-text-muted); flex-wrap: wrap">
                      <span style="font-family: monospace; font-weight: 700; color: var(--color-primary); white-space: nowrap">{{ o.code }}</span>
                      <template v-if="o.assetName && o.assetName !== '-'">
                        <span>•</span>
                        <span>{{ o.assetName }}<template v-if="o.space && o.space !== '-'"> • {{ o.space }}</template></span>
                      </template>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge-worktype-tag">
                    {{ o.worktype || (o.tasks && o.tasks[0]?.type) || 'General' }}
                  </span>
                </td>
                <td>
                  <div v-if="o.itemTypes && o.itemTypes.length > 0" class="wo-table-tags-cell">
                    <span
                      v-for="tag in o.itemTypes.slice(0, 2)"
                      :key="tag"
                      class="wo-table-tag-pill"
                      :style="{ backgroundColor: getItemTypeColor(tag, catalogs) }"
                    >
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 3px;">
                        <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
                        <circle cx="12" cy="14" r="1.5" />
                      </svg>
                      {{ tag }}
                    </span>
                    <span v-if="o.itemTypes.length > 2" class="wo-table-tag-more" :title="o.itemTypes.slice(2).join(', ')">+{{ o.itemTypes.length - 2 }}</span>
                  </div>
                  <span v-else style="color: var(--color-text-placeholder, #94a3b8); font-size: 13px">-</span>
                </td>
                <td style="white-space: nowrap">
                  <button
                    type="button"
                    :class="['badge-status-pill', 'status-clickable-pill', getStatusClass(o.status), { 'is-open': statusDropdownCode === o.code }]"
                    @click.stop="toggleStatusDropdown($event, o.code)"
                    title="Click to change status"
                  >
                    <span>{{ displayStatus(o.status) }}</span>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" class="status-caret-icon">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </td>
                <td style="white-space: nowrap">
                  <button
                    type="button"
                    class="active-toggle-button"
                    :class="{ 'is-active': o.isActive !== false, 'is-inactive': o.isActive === false }"
                    @click.stop="$emit('toggleActive', o.code)"
                    :title="o.isActive === false ? 'Currently Inactive. Click to turn Active' : 'Currently Active. Click to turn Inactive'"
                    role="switch"
                    :aria-checked="o.isActive !== false"
                  >
                    <span class="switch-track">
                      <span class="switch-thumb"></span>
                    </span>
                    <span class="toggle-label">{{ o.isActive !== false ? 'Active' : 'Inactive' }}</span>
                  </button>
                </td>
                <td style="text-align: center; white-space: nowrap" @click.stop>
                  <button
                    type="button"
                    class="wo-inspection-badge-btn"
                    :class="{ 'has-inspections': (o.inspectionList && o.inspectionList.length > 0) || (o.inspectionsCount && o.inspectionsCount > 0) }"
                    @click.stop="handleOpenInspectionDrawer(o.code)"
                    :title="`Click to view & add inspections (${(o.inspectionList || []).length} logged)`"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <span class="wo-inspection-count">{{ (o.inspectionList || []).length }}</span>
                  </button>
                </td>
                <td
                  class="actions-cell"
                  style="text-align: right; white-space: nowrap"
                  @click.stop
                >
                  <div class="wo-inline-actions">
                    <button
                      type="button"
                      class="wo-action-icon-btn edit-action"
                      @click.stop="$emit('editOrder', o.code)"
                      title="Edit Work Order"
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="wo-action-icon-btn delete-action"
                      @click.stop="handleDelete(o.code)"
                      title="Delete Work Order"
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card List View -->
        <div class="wo-mobile-card-list">
          <div v-if="filtered.length === 0" class="wo-mobile-empty">
            No work orders match the current criteria.
          </div>
          <div
            v-else
            v-for="o in filtered"
            :key="'mob-' + o.code"
            :class="['wo-mobile-card', { 'card-inactive': o.isActive === false }]"
            @click="$emit('selectOrder', o.code)"
          >
            <!-- Card Header: Code & Worktype on left, Status dropdown pill on right -->
            <div class="wo-mc-header">
              <div class="wo-mc-badges">
                <span class="wo-mc-code">{{ o.code }}</span>
                <span class="badge-worktype-tag">
                  {{ o.worktype || (o.tasks && o.tasks[0]?.type) || 'General' }}
                </span>
              </div>
              <div class="wo-mc-status">
                <button
                  type="button"
                  :class="['badge-status-pill', 'status-clickable-pill', getStatusClass(o.status), { 'is-open': statusDropdownCode === o.code }]"
                  @click.stop="toggleStatusDropdown($event, o.code)"
                  title="Click to change status"
                >
                  <span>{{ displayStatus(o.status) }}</span>
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" class="status-caret-icon">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Card Body: Work Title -->
            <div class="wo-mc-title">
              {{ o.workTitle || o.scope || 'Untitled Work Order' }}
            </div>

            <!-- Card Meta: Location & Item Types -->
            <div v-if="(o.assetName && o.assetName !== '-') || (o.itemTypes && o.itemTypes.length > 0)" class="wo-mc-meta">
              <div v-if="o.assetName && o.assetName !== '-'" class="wo-mc-location">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" class="wo-mc-loc-icon">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{{ o.assetName }}<template v-if="o.space && o.space !== '-'"> • {{ o.space }}</template></span>
              </div>

              <!-- Item Types Tags -->
              <div v-if="o.itemTypes && o.itemTypes.length > 0" class="wo-mc-tags">
                <span
                  v-for="tag in o.itemTypes.slice(0, 3)"
                  :key="tag"
                  class="wo-table-tag-pill"
                  :style="{ backgroundColor: getItemTypeColor(tag, catalogs) }"
                >
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 3px;">
                    <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
                    <circle cx="12" cy="14" r="1.5" />
                  </svg>
                  {{ tag }}
                </span>
                <span v-if="o.itemTypes.length > 3" class="wo-table-tag-more">+{{ o.itemTypes.length - 3 }}</span>
              </div>
            </div>

            <!-- Card Footer: Active toggle, Inspection badge & Action buttons -->
            <div class="wo-mc-footer" @click.stop>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap">
                <button
                  type="button"
                  class="active-toggle-button"
                  :class="{ 'is-active': o.isActive !== false, 'is-inactive': o.isActive === false }"
                  @click.stop="$emit('toggleActive', o.code)"
                  :title="o.isActive === false ? 'Currently Inactive. Click to turn Active' : 'Currently Active. Click to turn Inactive'"
                  role="switch"
                  :aria-checked="o.isActive !== false"
                >
                  <span class="switch-track">
                    <span class="switch-thumb"></span>
                  </span>
                  <span class="toggle-label">{{ o.isActive !== false ? 'Active' : 'Inactive' }}</span>
                </button>

                <button
                  type="button"
                  class="wo-inspection-badge-btn"
                  :class="{ 'has-inspections': (o.inspectionList && o.inspectionList.length > 0) || (o.inspectionsCount && o.inspectionsCount > 0) }"
                  @click.stop="handleOpenInspectionDrawer(o.code)"
                  :title="`Click to view & add inspections (${(o.inspectionList || []).length} logged)`"
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  <span class="wo-inspection-count">{{ (o.inspectionList || []).length }}</span>
                </button>
              </div>

              <div class="wo-inline-actions">
                <button
                  type="button"
                  class="wo-action-icon-btn edit-action"
                  @click.stop="$emit('editOrder', o.code)"
                  title="Edit Work Order"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="wo-action-icon-btn delete-action"
                  @click.stop="handleDelete(o.code)"
                  title="Delete Work Order"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
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

    <!-- Dedicated Status Picker Popover (Teleported to Body) -->
    <Teleport to="body">
      <div
        v-if="statusDropdownCode && activeStatusOrder"
        class="floating-actions-popover status-picker-popover"
        :style="{
          top: `${statusDropdownPosition.top}px`,
          left: `${statusDropdownPosition.left}px`
        }"
        @click.stop
      >
        <div class="status-picker-header">Change Status</div>
        <div class="fap-status-group" style="padding: 4px">
          <button
            v-for="st in ['Not Scheduled', 'Scheduled', 'On-going', 'Completed']"
            :key="st"
            type="button"
            class="fap-item fap-status-item"
            :class="{ 'is-active-status': displayStatus(activeStatusOrder.status).toLowerCase() === st.toLowerCase() }"
            @click.stop="handleSelectStatusFromPill(st)"
          >
            <div class="fap-status-label-group">
              <span
                class="fap-status-dot"
                :style="{ backgroundColor: getStatusDotColor(st) }"
              ></span>
              <span style="font-weight: 600">{{ st }}</span>
            </div>
            <span v-if="displayStatus(activeStatusOrder.status).toLowerCase() === st.toLowerCase()" class="fap-check-icon">✓</span>
          </button>
        </div>
      </div>

      <!-- Slide-Over Inspection Drawer & Backdrop -->
      <div
        v-if="isInspectionDrawerOpen && activeInspectionOrder"
        class="dwl-drawer-overlay"
        @click="handleCloseInspectionDrawer"
      >
        <aside
          class="dwl-drawer dwl-inspection-drawer"
          @click.stop
        >
          <div class="dwl-drawer-header green-bg">
            <div class="dwl-dh-title-col">
              <div style="display: flex; align-items: center; gap: 8px">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#006C49" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <h3>Inspection Details</h3>
              </div>
              <span class="dwl-dh-sub">
                {{ activeInspectionOrder.code }} • {{ activeInspectionOrder.workTitle || activeInspectionOrder.scope }}
              </span>
            </div>
            <button type="button" class="dwl-drawer-close" @click="handleCloseInspectionDrawer">&times;</button>
          </div>

          <div class="dwl-drawer-body">
            <!-- In-Drawer Form for Logging New Inspection -->
            <div class="dwl-drawer-form-card">
              <h4 class="dwl-df-title">Log New Inspection</h4>
              <div class="dwl-df-grid">
                <div class="dwl-df-field full">
                  <label>Headline / Inspection Scope</label>
                  <input
                    type="text"
                    class="dwl-df-input"
                    v-model="newInspectionNotes"
                    placeholder="e.g. Electrical wiring inspected, circuit tested"
                  />
                </div>

                <div class="dwl-df-field half">
                  <label>Inspector Name</label>
                  <input
                    type="text"
                    class="dwl-df-input"
                    v-model="newInspectionInspector"
                    placeholder="e.g. Inspector Santos"
                  />
                </div>

                <div class="dwl-df-field half">
                  <label>Inspection Date</label>
                  <input
                    type="date"
                    class="dwl-df-input"
                    v-model="newInspectionDate"
                  />
                </div>

                <div class="dwl-df-field full">
                  <label>Inspection Status</label>
                  <select class="dwl-df-input" v-model="newInspectionStatus">
                    <option value="Passed">Passed (Completed)</option>
                    <option value="Needs Attention">Needs Attention (Issues Found)</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Failed">Failed (Requires Rework)</option>
                  </select>
                </div>

                <div class="dwl-df-field full">
                  <label>Detailed Observations / Findings</label>
                  <textarea
                    class="dwl-df-input"
                    rows="3"
                    v-model="newInspectionDetailedNotes"
                    placeholder="Enter observations, safety notes, defect details, or measurements..."
                  ></textarea>
                </div>

                <!-- Photos Section -->
                <div class="dwl-df-field full">
                  <label>Attach Inspection Photos</label>
                  <div class="dwl-photo-actions">
                    <input
                      ref="cameraInputRef"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      @change="handlePhotoFilesSelected"
                      style="display: none"
                    />
                    <input
                      ref="galleryInputRef"
                      type="file"
                      accept="image/*"
                      multiple
                      @change="handlePhotoFilesSelected"
                      style="display: none"
                    />
                    <button
                      type="button"
                      class="dwl-photo-btn camera-btn"
                      @click="triggerCameraInput"
                      :disabled="isCompressingPhoto"
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      <span>Take Photo</span>
                    </button>
                    <button
                      type="button"
                      class="dwl-photo-btn"
                      @click="triggerGalleryInput"
                      :disabled="isCompressingPhoto"
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span>Upload Files</span>
                    </button>
                    <span v-if="isCompressingPhoto" style="font-size: 11px; color: #006C49; align-self: center">
                      Compressing photos...
                    </span>
                  </div>

                  <!-- Staged Photos Strip -->
                  <div v-if="newInspectionPhotos.length > 0" class="dwl-photo-strip">
                    <div
                      v-for="photo in newInspectionPhotos"
                      :key="photo.id"
                      class="dwl-photo-thumb-wrapper"
                      @click="openLightbox(photo, 'Staged Inspection Photo')"
                    >
                      <img :src="photo.url" class="dwl-photo-thumb" :alt="photo.name || 'Photo'" />
                      <button
                        type="button"
                        class="dwl-photo-thumb-remove"
                        @click.stop="handleRemoveStagedPhoto(photo.id)"
                        title="Remove photo"
                      >
                        ✕
                      </button>
                      <span class="dwl-photo-zoom-icon">🔍</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                class="dwl-btn-add-more"
                @click="handleConfirmAddInspection"
                :disabled="!newInspectionNotes.trim() && !newInspectionInspector.trim()"
                style="margin-top: 10px"
              >
                + Add Inspection Detail
              </button>
            </div>

            <!-- List of Logged Inspections -->
            <div class="dwl-eq-list-header" style="margin-top: 16px">
              <span>Logged Inspections ({{ (activeInspectionOrder.inspectionList || []).length }})</span>
            </div>

            <div v-if="!activeInspectionOrder.inspectionList || activeInspectionOrder.inspectionList.length === 0" style="padding: 24px; text-align: center; color: var(--color-text-muted); font-size: 13px">
              No inspections recorded for this work order yet. Use the form above to log one.
            </div>

            <div
              v-else
              v-for="insp in activeInspectionOrder.inspectionList"
              :key="insp.id"
              class="dwl-eq-card"
              style="margin-top: 10px; cursor: default; display: block"
            >
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap">
                    <span class="dwl-eq-val bold">{{ insp.inspector || 'Inspector' }}</span>
                    <span
                      class="badge-status-pill"
                      :style="{
                        fontSize: '11px',
                        padding: '2px 8px',
                        backgroundColor: insp.status === 'Passed' ? '#E8F5E9' : (insp.status === 'Needs Attention' ? '#FEF3C7' : '#EFF6FF'),
                        color: insp.status === 'Passed' ? '#006C49' : (insp.status === 'Needs Attention' ? '#D97706' : '#2563EB')
                      }"
                    >
                      {{ insp.status }}
                    </span>
                  </div>
                  <span class="dwl-eq-label" style="margin-top: 2px">{{ insp.date }}</span>
                </div>

                <button
                  type="button"
                  class="wo-action-icon-btn delete-action"
                  @click.stop="handleDeleteInspection(insp.id)"
                  title="Delete Inspection"
                  style="width: 28px; height: 28px"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>

              <div v-if="insp.notes" style="margin-top: 8px; font-size: 13.5px; font-weight: 500; color: #0B1C30">
                {{ insp.notes }}
              </div>

              <div v-if="insp.detailedNotes" style="margin-top: 6px; font-size: 12.5px; color: #4B5563; background: #FFFFFF; padding: 8px 10px; border-radius: 6px; border: 1px solid #E2E8F0; white-space: pre-wrap">
                {{ insp.detailedNotes }}
              </div>

              <!-- Photo Previews inside Card -->
              <div v-if="insp.photos && insp.photos.length > 0" class="dwl-insp-photos-preview">
                <div
                  v-for="(p, pIdx) in insp.photos"
                  :key="p.id"
                  class="dwl-insp-photo-chip"
                  @click="openLightbox(p, `Inspection Photo ${pIdx + 1} - ${insp.inspector}`)"
                >
                  <img :src="p.url" class="dwl-insp-chip-img" :alt="p.name || 'Photo'" />
                  <span>Photo {{ pIdx + 1 }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="dwl-drawer-footer">
            <button type="button" class="dwl-btn-drawer-confirm" @click="handleCloseInspectionDrawer">
              ✓ Done & Close Inspections
            </button>
          </div>
        </aside>
      </div>

      <!-- Lightbox Modal -->
      <div
        v-if="lightboxPhoto"
        class="dwl-lightbox-overlay"
        @click="closeLightbox"
      >
        <div class="dwl-lightbox-container" @click.stop>
          <button type="button" class="dwl-lightbox-close" @click="closeLightbox" aria-label="Close Lightbox">
            &times;
          </button>
          <img :src="lightboxPhoto.url" class="dwl-lightbox-img" :alt="lightboxTitle" />
          <div style="color: #FFFFFF; font-size: 13px; text-align: center">
            <strong>{{ lightboxTitle }}</strong>
            <span v-if="lightboxPhoto.timestamp" style="margin-left: 8px; opacity: 0.8">({{ lightboxPhoto.timestamp }})</span>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { WorkOrder, MasterCatalogsState, InspectionItem, InspectionPhoto } from '../types';
import { getItemTypeColor } from '../utils/catalogsData';
import { compressImageFile } from '../utils/imageCompressor';

const props = defineProps<{
  workOrders: WorkOrder[];
  searchQuery: string;
  catalogs?: MasterCatalogsState;
  onNavigateDailyLog?: () => void;
}>();

const emit = defineEmits<{
  (e: 'selectOrder', code: string): void;
  (e: 'editOrder', code: string): void;
  (e: 'deleteOrder', code: string): void;
  (e: 'updateStatus', code: string, status: string): void;
  (e: 'toggleActive', code: string): void;
  (e: 'updateInspections', code: string, inspections: InspectionItem[]): void;
  (e: 'createOrder'): void;
  (e: 'navigateDailyLog'): void;
  (e: 'navigateHistory'): void;
  (e: 'toast', message: string, type?: 'info' | 'success' | 'warning'): void;
}>();

const showFilters = ref(false);
const facilityFilter = ref('all');
const spaceFilter = ref('all');
const workgroupFilter = ref('all');
const activeFilter = ref<'all' | 'Active' | 'Inactive'>('all');
const localSearch = ref('');
type WorkOrderSort = 'alpha-asc' | 'alpha-desc' | 'date-desc' | 'date-asc' | 'code-asc' | 'code-desc';
const sortBy = ref<WorkOrderSort>('date-desc');

const toggleSort = (field: 'alpha' | 'code') => {
  if (field === 'alpha') {
    sortBy.value = sortBy.value === 'alpha-asc' ? 'alpha-desc' : 'alpha-asc';
  } else if (field === 'code') {
    sortBy.value = sortBy.value === 'code-asc' ? 'code-desc' : 'code-asc';
  }
};
const openDropdownCode = ref<string | null>(null);

// Flexible Date Filter State
const dateFilterType = ref<'all' | 'specific' | 'range' | 'month' | 'year'>('all');
const specificDate = ref('');
const rangeStartDate = ref('');
const rangeEndDate = ref('');
const selectedMonth = ref('all');
const currentYearStr = String(new Date().getFullYear());
const selectedMonthYear = ref(currentYearStr);
const selectedYear = ref('all');

const availableYears = computed(() => {
  const years = new Set<string>();
  const currentYear = new Date().getFullYear();
  years.add(String(currentYear));
  years.add(String(currentYear - 2));
  years.add(String(currentYear - 1));
  years.add(String(currentYear + 1));
  years.add(String(currentYear + 2));
  props.workOrders.forEach((o) => {
    if (o.startDate) {
      const y = o.startDate.split('-')[0];
      if (y) years.add(y);
    }
    if (o.endDate) {
      const y = o.endDate.split('-')[0];
      if (y) years.add(y);
    }
  });
  return Array.from(years).sort();
});

const hasActiveFilterCount = computed(() => {
  let count = 0;
  if (dateFilterType.value !== 'all') count++;
  if (facilityFilter.value !== 'all') count++;
  if (spaceFilter.value !== 'all') count++;
  if (workgroupFilter.value !== 'all') count++;
  if (activeFilter.value !== 'all') count++;
  return count;
});

const resetFilters = () => {
  dateFilterType.value = 'all';
  specificDate.value = '';
  rangeStartDate.value = '';
  rangeEndDate.value = '';
  selectedMonth.value = 'all';
  selectedYear.value = 'all';
  facilityFilter.value = 'all';
  spaceFilter.value = 'all';
  workgroupFilter.value = 'all';
  activeFilter.value = 'all';
};

const statusDropdownCode = ref<string | null>(null);
const statusDropdownPosition = ref<{ top: number; left: number }>({
  top: 0,
  left: 0
});

const activeStatusOrder = computed(() => {
  if (!statusDropdownCode.value) return null;
  return props.workOrders.find((o) => o.code === statusDropdownCode.value) || null;
});

let lastStatusDropdownOpenTime = 0;

const toggleStatusDropdown = (e: MouseEvent, code: string) => {
  e.stopPropagation();

  if (statusDropdownCode.value === code) {
    statusDropdownCode.value = null;
    return;
  }

  const target = (e.currentTarget as HTMLElement) || (e.target as HTMLElement);
  const rect = target.getBoundingClientRect();
  const menuWidth = 185;
  const menuHeight = 175;

  const spaceBelow = window.innerHeight - rect.bottom;
  let top = rect.bottom + 6;

  if (spaceBelow < menuHeight && rect.top > menuHeight) {
    top = rect.top - menuHeight - 6;
  }

  let left = Math.max(10, rect.left);
  if (left + menuWidth > window.innerWidth - 10) {
    left = window.innerWidth - menuWidth - 10;
  }

  statusDropdownPosition.value = { top, left };
  statusDropdownCode.value = code;
  lastStatusDropdownOpenTime = Date.now();
};

const handleSelectStatusFromPill = (st: string) => {
  if (statusDropdownCode.value) {
    emit('updateStatus', statusDropdownCode.value, st);
    statusDropdownCode.value = null;
  }
};

const closeAllPopovers = () => {
  if (Date.now() - lastStatusDropdownOpenTime < 150) return;
  statusDropdownCode.value = null;
};

onMounted(() => {
  window.addEventListener('click', closeAllPopovers);
  window.addEventListener('scroll', closeAllPopovers, true);
  window.addEventListener('resize', closeAllPopovers);
  window.addEventListener('keydown', handleLightboxKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('click', closeAllPopovers);
  window.removeEventListener('scroll', closeAllPopovers, true);
  window.removeEventListener('resize', closeAllPopovers);
  window.removeEventListener('keydown', handleLightboxKeyDown);
});

const displayStatus = (status: string) => {
  if (!status) return 'Not Scheduled';
  const s = status.toLowerCase();
  if (s === 'not scheduled' || s === 'notscheduled' || s === 'unscheduled') return 'Not Scheduled';
  if (s === 'on hold' || s === 'pending') return 'Not Scheduled';
  if (s === 'scheduled') return 'Scheduled';
  if (s === 'in progress' || s === 'ongoing') return 'On-going';
  if (s === 'completed') return 'Completed';
  return status;
};

const getStatusClass = (status: string) => {
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

const getStatusDotColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'not scheduled':
    case 'notscheduled':
    case 'unscheduled':
    case 'pending':
      return '#D97706';
    case 'scheduled':
      return '#0284C7';
    case 'on-going':
    case 'ongoing':
    case 'in progress':
      return '#16A34A';
    case 'completed':
      return '#475569';
    default:
      return '#94A3B8';
  }
};

const handleActiveFilterClick = (statusOpt: string) => {
  if (activeFilter.value === statusOpt) {
    activeFilter.value = 'all';
  } else {
    activeFilter.value = statusOpt as 'Active' | 'Inactive';
  }
};

const filtered = computed(() => {
  const list = props.workOrders.filter((o) => {
    const q = (localSearch.value || props.searchQuery || '').toLowerCase();
    const matchesSearch =
      o.code.toLowerCase().includes(q) ||
      o.assetName.toLowerCase().includes(q) ||
      o.scope.toLowerCase().includes(q) ||
      (o.worktype && o.worktype.toLowerCase().includes(q)) ||
      (o.workTitle && o.workTitle.toLowerCase().includes(q));

    const matchesFacility = facilityFilter.value === 'all' || o.assetName === facilityFilter.value;
    const matchesSpace = spaceFilter.value === 'all' || o.space === spaceFilter.value;
    const matchesWorkgroup = workgroupFilter.value === 'all' || o.workgroup === workgroupFilter.value;
    const matchesActive =
      activeFilter.value === 'all' ||
      (activeFilter.value === 'Active' ? o.isActive !== false : o.isActive === false);

    let matchesDate = true;
    const orderStartDate = o.startDate || '';
    const orderEndDate = o.endDate || o.startDate || '';

    if (dateFilterType.value === 'specific' && specificDate.value) {
      matchesDate = Boolean(
        orderStartDate === specificDate.value ||
        orderEndDate === specificDate.value ||
        (orderStartDate && orderEndDate && specificDate.value >= orderStartDate && specificDate.value <= orderEndDate)
      );
    } else if (dateFilterType.value === 'range') {
      if (rangeStartDate.value && rangeEndDate.value) {
        matchesDate = Boolean(
          (orderStartDate && orderStartDate >= rangeStartDate.value && orderStartDate <= rangeEndDate.value) ||
          (orderEndDate && orderEndDate >= rangeStartDate.value && orderEndDate <= rangeEndDate.value) ||
          (orderStartDate && orderEndDate && orderStartDate <= rangeStartDate.value && orderEndDate >= rangeEndDate.value)
        );
      } else if (rangeStartDate.value) {
        matchesDate = Boolean(
          (orderStartDate && orderStartDate >= rangeStartDate.value) ||
          (orderEndDate && orderEndDate >= rangeStartDate.value)
        );
      } else if (rangeEndDate.value) {
        matchesDate = Boolean(
          (orderStartDate && orderStartDate <= rangeEndDate.value) ||
          (orderEndDate && orderEndDate <= rangeEndDate.value)
        );
      }
    } else if (dateFilterType.value === 'month') {
      if (selectedMonth.value !== 'all') {
        const targetPrefix = `${selectedMonthYear.value}-${selectedMonth.value}`;
        matchesDate = Boolean(
          (orderStartDate && orderStartDate.startsWith(targetPrefix)) ||
          (orderEndDate && orderEndDate.startsWith(targetPrefix))
        );
      } else {
        const targetYear = `${selectedMonthYear.value}-`;
        matchesDate = Boolean(
          (orderStartDate && orderStartDate.startsWith(targetYear)) ||
          (orderEndDate && orderEndDate.startsWith(targetYear))
        );
      }
    } else if (dateFilterType.value === 'year' && selectedYear.value !== 'all') {
      const targetYear = `${selectedYear.value}-`;
      matchesDate = Boolean(
        (orderStartDate && orderStartDate.startsWith(targetYear)) ||
        (orderEndDate && orderEndDate.startsWith(targetYear))
      );
    }

    return matchesSearch && matchesFacility && matchesSpace && matchesWorkgroup && matchesActive && matchesDate;
  });

  const getTitle = (order: WorkOrder) => (order.workTitle || order.scope || order.assetName || '').trim().toLowerCase();
  const getDateVal = (order: WorkOrder) => {
    const raw = order.dateReceived || order.startDate;
    if (!raw) return 0;
    const time = new Date(raw).getTime();
    return isNaN(time) ? 0 : time;
  };

  return [...list].sort((a, b) => {
    if (sortBy.value === 'code-asc') {
      return (a.code || '').localeCompare(b.code || '', undefined, { numeric: true, sensitivity: 'base' });
    }
    if (sortBy.value === 'code-desc') {
      return (b.code || '').localeCompare(a.code || '', undefined, { numeric: true, sensitivity: 'base' });
    }
    if (sortBy.value === 'alpha-asc') {
      return getTitle(a).localeCompare(getTitle(b));
    }
    if (sortBy.value === 'alpha-desc') {
      return getTitle(b).localeCompare(getTitle(a));
    }
    if (sortBy.value === 'date-asc') {
      return getDateVal(a) - getDateVal(b);
    }
    // Default: 'date-desc' (newest inputted first)
    return getDateVal(b) - getDateVal(a);
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
  const onGoing = props.workOrders.filter(
    (o) => o.status.toLowerCase() === 'on-going' || o.status.toLowerCase() === 'ongoing' || o.status.toLowerCase() === 'in progress'
  );
  return onGoing.length > 0
    ? `Focus: ${onGoing[0].code} - ${onGoing[0].workTitle || onGoing[0].assetName} (${onGoing.length} on-going)`
    : 'No active projects on-going';
});

const handleExportCsv = () => {
  alert('Export CSV completed.');
};

const handleDelete = (code: string) => {
  if (confirm(`Are you sure you want to delete ${code}?`)) {
    emit('deleteOrder', code);
  }
};

// ==========================================
// Inspection Slide-Over Drawer & Lightbox
// ==========================================
const isInspectionDrawerOpen = ref(false);
const activeInspectionCode = ref<string | null>(null);

const activeInspectionOrder = computed(() => {
  if (!activeInspectionCode.value) return null;
  return props.workOrders.find((o) => o.code === activeInspectionCode.value) || null;
});

const newInspectionInspector = ref('');
const newInspectionDate = ref('');
const newInspectionStatus = ref('Passed');
const newInspectionNotes = ref('');
const newInspectionDetailedNotes = ref('');
const newInspectionPhotos = ref<InspectionPhoto[]>([]);
const isCompressingPhoto = ref(false);
const cameraInputRef = ref<HTMLInputElement | null>(null);
const galleryInputRef = ref<HTMLInputElement | null>(null);

// Inspection Photo Lightbox Modal State
const lightboxPhoto = ref<InspectionPhoto | null>(null);
const lightboxTitle = ref('');

const handleOpenInspectionDrawer = (code: string) => {
  activeInspectionCode.value = code;
  isInspectionDrawerOpen.value = true;
  newInspectionInspector.value = '';
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  newInspectionDate.value = `${y}-${m}-${d}`;
  newInspectionStatus.value = 'Passed';
  newInspectionNotes.value = '';
  newInspectionDetailedNotes.value = '';
  newInspectionPhotos.value = [];
  isCompressingPhoto.value = false;
};

const handleCloseInspectionDrawer = () => {
  isInspectionDrawerOpen.value = false;
  activeInspectionCode.value = null;
  lightboxPhoto.value = null;
};

const triggerCameraInput = () => {
  if (cameraInputRef.value) cameraInputRef.value.click();
};

const triggerGalleryInput = () => {
  if (galleryInputRef.value) galleryInputRef.value.click();
};

const handlePhotoFilesSelected = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;

  isCompressingPhoto.value = true;
  try {
    const newPhotos: InspectionPhoto[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const compressed = await compressImageFile(file, 1280, 1280, 0.75);
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      newPhotos.push({
        id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        url: compressed.dataUrl,
        name: file.name,
        timestamp: timeStr
      });
    }

    newInspectionPhotos.value.push(...newPhotos);
    emit('toast', `✓ Added and optimized ${newPhotos.length} photo(s)`, 'success');
  } catch (err) {
    console.error('Failed to compress inspection photo:', err);
    emit('toast', '⚠️ Failed to process selected image file', 'warning');
  } finally {
    isCompressingPhoto.value = false;
    target.value = '';
  }
};

const handleRemoveStagedPhoto = (photoId: string) => {
  newInspectionPhotos.value = newInspectionPhotos.value.filter((p) => p.id !== photoId);
};

const openLightbox = (photo: InspectionPhoto, title?: string) => {
  lightboxPhoto.value = photo;
  lightboxTitle.value = title || 'Inspection Photo';
};

const closeLightbox = () => {
  lightboxPhoto.value = null;
  lightboxTitle.value = '';
};

const handleLightboxKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (lightboxPhoto.value) {
      closeLightbox();
    } else if (isInspectionDrawerOpen.value) {
      handleCloseInspectionDrawer();
    }
  }
};

const handleConfirmAddInspection = () => {
  if (!activeInspectionOrder.value) return;

  const newItem: InspectionItem = {
    id: `insp-${Date.now()}`,
    inspector: newInspectionInspector.value.trim() || 'Inspector',
    date: newInspectionDate.value || new Date().toISOString().split('T')[0],
    status: newInspectionStatus.value || 'Passed',
    notes: newInspectionNotes.value.trim(),
    detailedNotes: newInspectionDetailedNotes.value.trim() || undefined,
    photos: newInspectionPhotos.value.length > 0 ? [...newInspectionPhotos.value] : undefined
  };

  const currentList = activeInspectionOrder.value.inspectionList || [];
  const updatedList = [...currentList, newItem];
  activeInspectionOrder.value.inspectionList = updatedList;
  activeInspectionOrder.value.inspectionsCount = updatedList.length;

  emit('updateInspections', activeInspectionOrder.value.code, updatedList);

  const photoCount = newItem.photos?.length || 0;
  newInspectionInspector.value = '';
  newInspectionNotes.value = '';
  newInspectionDetailedNotes.value = '';
  newInspectionPhotos.value = [];
  emit('toast', `✓ Inspection logged${photoCount > 0 ? ` with ${photoCount} photo(s)` : ''}`, 'success');
};

const handleDeleteInspection = (inspId: string) => {
  if (!activeInspectionOrder.value) return;
  const currentList = activeInspectionOrder.value.inspectionList || [];
  const updatedList = currentList.filter((i) => i.id !== inspId);
  activeInspectionOrder.value.inspectionList = updatedList;
  activeInspectionOrder.value.inspectionsCount = updatedList.length;

  emit('updateInspections', activeInspectionOrder.value.code, updatedList);
  emit('toast', 'Inspection record removed', 'info');
};
</script>

<style scoped>

.sortable-th {
  transition: background-color 0.15s ease, color 0.15s ease;
}

.sortable-th:hover {
  background-color: rgba(0, 108, 73, 0.06);
  color: var(--color-primary, #006C49);
}

.sortable-th.active {
  color: var(--color-primary, #006C49);
  font-weight: 700;
}

.sort-indicator {
  display: inline-flex;
  font-size: 11px;
  margin-left: 4px;
  opacity: 0.5;
  color: var(--color-text-muted, #6C7A71);
}

.sortable-th.active .sort-indicator {
  opacity: 1;
  color: var(--color-primary, #006C49);
  font-weight: 800;
}

.wo-table-tag-pill {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 500;
  color: #FFFFFF;
  background-color: #8BA869;
  border-radius: 9999px;
  padding: 1px 8px;
  line-height: 1.4;
  white-space: nowrap;
}

.wo-table-tag-more {
  font-size: 11px;
  font-weight: 700;
  color: #8BA869;
}

/* Responsive Work Orders List */
.wo-mobile-card-list {
  display: none;
}

.wo-desktop-table {
  display: block;
}

@media (max-width: 1024px) {
  .wo-desktop-table {
    display: none !important;
  }

  .wo-mobile-card-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px 16px;
    background-color: #F8FAFC;
  }

  .wo-mobile-empty {
    text-align: center;
    padding: 40px 16px;
    color: var(--color-text-muted, #64748B);
    font-size: 14px;
    background: #FFFFFF;
    border-radius: 12px;
    border: 1px dashed var(--color-border, #E2E8F0);
  }

  .wo-mobile-card {
    background: #FFFFFF;
    border: 1px solid var(--color-border, #E2E8F0);
    border-radius: 12px;
    padding: 16px 16px 14px;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02);
    display: flex;
    flex-direction: column;
    gap: 12px;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
  }

  .wo-mobile-card:hover {
    border-color: #CBD5E1;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
  }

  .wo-mobile-card:active {
    transform: scale(0.995);
    box-shadow: 0 0 0 1px rgba(0, 108, 73, 0.15);
  }

  .wo-mobile-card.card-inactive {
    opacity: 0.72;
    background: #F8FAFC;
    border-left: 3.5px solid #94A3B8;
  }

  .wo-mc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .wo-mc-badges {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    min-width: 0;
  }

  .wo-mc-code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 12px;
    font-weight: 700;
    color: var(--color-primary, #006C49);
    background: #ECFDF5;
    border: 1px solid #A7F3D0;
    padding: 3px 8px;
    border-radius: 6px;
    white-space: nowrap;
    letter-spacing: -0.2px;
  }

  .wo-mc-status {
    flex-shrink: 0;
  }

  .wo-mc-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-navy-header, #0F172A);
    line-height: 1.4;
    word-break: break-word;
  }

  .wo-mc-meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 2px;
  }

  .wo-mc-location {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    color: #64748B;
  }

  .wo-mc-loc-icon {
    color: #94A3B8;
    flex-shrink: 0;
  }

  .wo-mc-tags {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .wo-mc-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding-top: 12px;
    border-top: 1px solid #F1F5F9;
    margin-top: 2px;
  }
}

.wo-inspection-badge-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 4px 10px;
  font-family: 'Inter', sans-serif;
  font-size: 12.5px;
  font-weight: 700;
  border-radius: 8px;
  border: 1.5px solid #CBD5E1;
  background: #FFFFFF;
  color: #334155;
  cursor: pointer;
  transition: all 0.18s ease;
  line-height: 1;
}

.wo-inspection-badge-btn:hover {
  border-color: #006C49;
  background: #F0FDF4;
  color: #006C49;
  transform: translateY(-1px);
}

.wo-inspection-badge-btn.has-inspections {
  background: #E8F5E9;
  border-color: #006C49;
  color: #006C49;
}

.wo-inspection-badge-btn.has-inspections:hover {
  background: #D4EDDA;
}

.wo-inspection-badge-btn svg {
  flex-shrink: 0;
}

.wo-inspection-count {
  font-family: 'Inter', sans-serif;
  font-weight: 800;
  font-size: 13px;
}

.wo-table-tags-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.dwl-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(2px);
  z-index: 249;
  animation: fadeIn 0.2s ease;
}

.dwl-drawer-header.green-bg {
  background: #EFF7F2;
  border-bottom: 1.5px solid #A7F3D0;
}

.dwl-dh-title-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>

<style>
/* Global styles for Teleported Status Picker Popover */
.floating-actions-popover.status-picker-popover {
  position: fixed !important;
  width: 185px !important;
  background: #FFFFFF !important;
  border: 1px solid rgba(226, 232, 240, 0.95) !important;
  box-shadow: 0 16px 36px -4px rgba(15, 23, 42, 0.2), 0 6px 14px -2px rgba(15, 23, 42, 0.08) !important;
  border-radius: 12px !important;
  z-index: 999999 !important;
  padding: 6px !important;
  display: flex !important;
  flex-direction: column !important;
  animation: fapPopoverIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
  transform-origin: top left !important;
}

@keyframes fapPopoverIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.status-picker-header {
  font-size: 10px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  color: #64748B !important;
  padding: 4px 8px 6px 8px !important;
  letter-spacing: 0.5px !important;
  border-bottom: 1px solid #F1F5F9 !important;
  margin-bottom: 3px !important;
}

.fap-status-group {
  display: flex !important;
  flex-direction: column !important;
  gap: 2px !important;
}

.fap-item.fap-status-item {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  width: 100% !important;
  border: none !important;
  background: transparent !important;
  padding: 7px 10px !important;
  border-radius: 7px !important;
  font-family: inherit !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  color: #334155 !important;
  cursor: pointer !important;
  transition: all 0.15s ease !important;
  text-align: left !important;
}

.fap-item.fap-status-item:hover {
  background: #F8FAFC !important;
  color: #0F172A !important;
}

.fap-item.fap-status-item.is-active-status {
  background: #F0FDF4 !important;
  color: #006C49 !important;
  font-weight: 600 !important;
}

.fap-status-label-group {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.fap-status-dot {
  width: 7px !important;
  height: 7px !important;
  border-radius: 50% !important;
  flex-shrink: 0 !important;
}

.fap-check-icon {
  font-size: 12px !important;
  font-weight: 800 !important;
  color: #006C49 !important;
}
</style>
