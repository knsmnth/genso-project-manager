<template>
  <section id="view-work-log-history" class="view-section active wlh-history-canvas" style="display: flex">
    <!-- View Header Row -->
    <div class="view-header-row">
      <div>
        <h1 class="view-main-title">Work Log History</h1>
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px; flex-wrap: wrap">
          <p class="view-main-subtitle" style="margin: 0">
            Historical compilation of daily accomplishment logs, task execution records, personnel assignments, and inspection logs.
          </p>
        </div>
      </div>
    </div>

    <!-- Sub-View Navigation Tabs & Date / Action Bar -->
    <div class="module-tab-bar">
      <!-- Left: Segmented Sub-View Navigation Tabs -->
      <div class="module-tabs">
        <button
          type="button"
          class="module-tab-btn"
          @click="$emit('navigateOrders')"
          title="Switch to All Work Orders"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-linecap="round" stroke-linejoin="round" />
            <polyline points="14 2 14 8 20 8" stroke-linecap="round" stroke-linejoin="round" />
            <line x1="16" y1="13" x2="8" y2="13" stroke-linecap="round" />
            <line x1="16" y1="17" x2="8" y2="17" stroke-linecap="round" />
          </svg>
          <span>All Orders</span>
          <span class="module-tab-count">{{ (workOrders || []).length }}</span>
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
        </button>

        <button
          type="button"
          class="module-tab-btn active"
          title="Work Log History"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Work Log History</span>
        </button>
      </div>

      <!-- Right: Modernized Calendar Selector & Action Controls -->
      <div class="module-utility-actions">
        <!-- Date Navigator Bar with Modern Calendar Dropdown -->
        <div class="wlh-date-nav">
          <button
            type="button"
            class="wlh-nav-arrow"
            @click="navigateDay(-1)"
            title="Previous Day"
          >
            ‹
          </button>

          <div class="wlh-calendar-picker-wrap">
            <button
              type="button"
              class="wlh-calendar-trigger-btn"
              @click="toggleCalendarModal"
              title="Select Date from Calendar"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span class="wlh-current-date-text">{{ formattedSelectedDate }}</span>
              <span v-if="isToday" class="wlh-today-tag">Today</span>
              <span v-else-if="isYesterday" class="wlh-yesterday-tag">Yesterday</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            class="wlh-nav-arrow"
            @click="navigateDay(1)"
            :disabled="isToday"
            title="Next Day"
          >
            ›
          </button>
        </div>

        <!-- Action Buttons Group (Edit, Save, Export) -->
        <div class="wlh-action-btns">
          <!-- Edit Past Log Toggle Button -->
          <button
            v-if="hasEntries"
            type="button"
            :class="['btn', isEditMode ? 'btn-warning-sm' : 'btn-outline-sm', 'wlh-btn-action']"
            @click="toggleEditMode"
            :title="isEditMode ? 'Cancel editing mode' : 'Edit past records for this date'"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>{{ isEditMode ? 'Exit Edit' : 'Edit Record' }}</span>
          </button>

          <!-- Save History Changes Button (when editing) -->
          <button
            v-if="isEditMode"
            type="button"
            class="btn btn-primary-sm wlh-btn-action"
            @click="handleSaveHistoricalChanges"
            style="background: #006C49"
            title="Save modifications to this date"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span>Save Changes</span>
          </button>

          <!-- Export PDF Accomplishment Report -->
          <button
            class="btn btn-outline-sm wlh-btn-action"
            @click="handleExportPDF"
            title="Export accomplishment report as PDF"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            <span>Export Report</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Mode Active Notification Banner -->
    <div v-if="isEditMode" class="wlh-edit-banner">
      <div class="wlh-edit-banner-content">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>
          <strong>Editing History for {{ formattedSelectedDate }}</strong>: You can modify task remarks, assigned personnel, equipment, and completion details that were missed or need correction. Click <strong>Save Changes</strong> when finished.
        </span>
      </div>
      <button class="wlh-edit-cancel-btn" @click="cancelEditMode">Cancel</button>
    </div>

    <!-- Summary KPI Cards Strip -->
    <div class="wlh-kpi-grid">
      <div class="wlh-kpi-card">
        <div class="wlh-kpi-icon-wrap icon-orders">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <div class="wlh-kpi-info">
          <span class="wlh-kpi-label">Active Work Orders</span>
          <span class="wlh-kpi-val">{{ metrics.ordersCount }}</span>
        </div>
      </div>

      <div class="wlh-kpi-card">
        <div class="wlh-kpi-icon-wrap icon-tasks">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
        <div class="wlh-kpi-info">
          <span class="wlh-kpi-label">Tasks Executed</span>
          <span class="wlh-kpi-val">{{ metrics.tasksCount }}</span>
        </div>
      </div>

      <div class="wlh-kpi-card">
        <div class="wlh-kpi-icon-wrap icon-personnel">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div class="wlh-kpi-info">
          <span class="wlh-kpi-label">Personnel Deployed</span>
          <span class="wlh-kpi-val">{{ metrics.personnelCount }}</span>
        </div>
      </div>

      <div class="wlh-kpi-card">
        <div class="wlh-kpi-icon-wrap icon-equipment">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        <div class="wlh-kpi-info">
          <span class="wlh-kpi-label">Equipment Used</span>
          <span class="wlh-kpi-val">{{ metrics.equipmentCount }}</span>
        </div>
      </div>

      <div class="wlh-kpi-card">
        <div class="wlh-kpi-icon-wrap icon-inspections">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M9 15l2 2 4-4" />
          </svg>
        </div>
        <div class="wlh-kpi-info">
          <span class="wlh-kpi-label">Inspections Recorded</span>
          <span class="wlh-kpi-val">{{ metrics.inspectionsCount }}</span>
        </div>
      </div>
    </div>

    <!-- Search & Department Quick Filter -->
    <div class="wlh-filter-row">
      <div class="wlh-search-box">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search accomplishments by department, work order code, lead, or activity..."
          class="wlh-search-input"
        />
        <button v-if="searchQuery" @click="searchQuery = ''" class="wlh-search-clear">×</button>
      </div>

      <div class="wlh-dept-select-wrap">
        <select v-model="selectedDepartmentFilter" class="wlh-dept-select">
          <option value="">All Departments & Offices</option>
          <option v-for="dept in availableDepartments" :key="dept" :value="dept">
            {{ dept }}
          </option>
        </select>
      </div>
    </div>

    <!-- Empty State: When No Snapshot Found For Date -->
    <div v-if="!hasEntries" class="wlh-empty-state">
      <div class="wlh-empty-icon">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <circle cx="12" cy="15" r="2" />
        </svg>
      </div>
      <h3 class="wlh-empty-title">No Work Log Recorded for {{ formattedSelectedDate }}</h3>
      <p class="wlh-empty-desc">
        There are no saved daily accomplishment logs or task progress snapshots archived for this date.
      </p>
      <div class="wlh-empty-actions">
        <button
          v-if="latestAvailableDate && latestAvailableDate !== selectedDate"
          type="button"
          class="btn btn-outline-sm"
          @click="selectDate(latestAvailableDate)"
        >
          📅 Jump to Latest Log ({{ formatDateLabel(latestAvailableDate) }})
        </button>

        <button
          v-if="!isToday"
          type="button"
          class="btn btn-primary-sm"
          @click="selectDate(todayDateString)"
        >
          Jump to Today
        </button>

        <button
          v-if="isToday"
          type="button"
          class="btn btn-primary-sm"
          @click="$emit('navigateDailyLog')"
        >
          Go to Daily Work Log
        </button>
      </div>
    </div>

    <!-- Loaded Group Section Cards -->
    <div v-else class="wlh-groups-container">
      <div
        v-for="(items, groupKey) in filteredGroups"
        :key="groupKey"
        class="wlh-group-card"
      >
        <!-- Department Header Strip -->
        <div class="wlh-group-header">
          <div class="wlh-group-header-left">
            <span class="wlh-group-badge">Office / Facility</span>
            <h2 class="wlh-group-title">{{ items[0]?.groupTitle || groupKey }}</h2>
            <span class="wlh-group-count">{{ items.length }} {{ items.length === 1 ? 'task' : 'tasks' }}</span>
          </div>

          <div class="wlh-group-header-right">
            <span class="wlh-group-order-no">
              Work Order #<strong>{{ items[0]?.workOrderNumber }}</strong>
            </span>
          </div>
        </div>

        <div class="wlh-group-subbar">
          <div class="wlh-group-subbar-title">
            <span class="wlh-group-subtitle">{{ items[0]?.groupSubTitle }}</span>
          </div>
          <div v-if="items[0]?.assignedLead" class="wlh-group-lead">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Lead: <strong>{{ items[0].assignedLead }}</strong></span>
          </div>
        </div>

        <!-- Task Accomplishment Items Table/List -->
        <div class="wlh-task-list">
          <div
            v-for="(task, taskIdx) in items"
            :key="task.id || taskIdx"
            class="wlh-task-row"
          >
            <!-- Header Section: Work Type Badge, Description, and Status Badge -->
            <div class="wlh-task-main">
              <div class="wlh-task-main-header">
                <div class="wlh-task-type-badge" :style="getActivityTypeStyle(task.workType)">
                  {{ task.workType || 'Maintenance' }}
                </div>
                <div class="wlh-task-status-wrap">
                  <span
                    :class="['wlh-status-pill', isTaskCompleted(task) ? 'status-completed' : 'status-inprogress']"
                  >
                    <svg v-if="isTaskCompleted(task)" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span v-else class="wlh-status-pulse"></span>
                    <span>{{ isTaskCompleted(task) ? 'Completed' : 'In Progress' }}</span>
                  </span>
                </div>
              </div>

              <div class="wlh-task-description">
                <input
                  v-if="isEditMode"
                  v-model="task.description"
                  class="wlh-edit-input"
                  placeholder="Task accomplishment description..."
                />
                <span v-else>{{ task.description || 'General maintenance task' }}</span>
              </div>
            </div>

            <!-- Execution Dates / Timeline -->
            <div class="wlh-task-dates">
              <div v-if="!isEditMode" class="wlh-timeline-pill">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{{ formatTaskTimeline(task) }}</span>
              </div>
              <div v-else class="wlh-edit-dates-block">
                <div class="wlh-date-pill">
                  <span class="wlh-date-pill-label">Start:</span>
                  <input
                    type="date"
                    v-model="task.startDate"
                    class="wlh-edit-date-input"
                  />
                </div>
                <div class="wlh-date-pill">
                  <span class="wlh-date-pill-label">End:</span>
                  <input
                    type="date"
                    v-model="task.completionDate"
                    class="wlh-edit-date-input"
                  />
                </div>
              </div>
            </div>

            <!-- Personnel Assigned -->
            <div class="wlh-task-meta-cell">
              <span class="wlh-meta-tag-label">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                Personnel
                <span v-if="task.assignedPersonnel?.length" class="wlh-meta-count">({{ task.assignedPersonnel.length }})</span>
              </span>
              <div v-if="task.assignedPersonnel?.length" class="wlh-meta-avatars">
                <span
                  v-for="(person, pIdx) in task.assignedPersonnel"
                  :key="pIdx"
                  class="wlh-person-chip"
                  :title="person"
                >
                  <span class="wlh-avatar-mini">{{ getInitials(person) }}</span>
                  <span class="wlh-chip-text">{{ person }}</span>
                </span>
              </div>
              <span v-else class="wlh-none-muted">None assigned</span>
            </div>

            <!-- Equipment Used -->
            <div class="wlh-task-meta-cell">
              <span class="wlh-meta-tag-label">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
                Equipment
                <span v-if="task.equipmentList?.length" class="wlh-meta-count">({{ task.equipmentList.length }})</span>
              </span>
              <div v-if="task.equipmentList?.length" class="wlh-equipment-list-preview">
                <span
                  v-for="(eq, eqIdx) in task.equipmentList"
                  :key="eqIdx"
                  class="wlh-eq-chip"
                >
                  <span class="wlh-chip-text">{{ eq.name }}</span>
                  <span class="wlh-qty-badge">×{{ eq.quantity }}</span>
                </span>
              </div>
              <span v-else class="wlh-none-muted">None logged</span>
            </div>

            <!-- Remarks & Inspections Action Badges -->
            <div class="wlh-task-actions">
              <button
                type="button"
                class="wlh-log-badge-btn"
                :class="[
                  (task.remarksList || []).length > 0 ? 'has-data' : 'is-ghost'
                ]"
                @click="openRemarksModal(task)"
                :title="isEditMode ? 'Add or view remarks' : 'View Accomplishment Remarks'"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>{{ (task.remarksList || []).length }} Remarks</span>
              </button>

              <button
                type="button"
                class="wlh-log-badge-btn"
                :class="[
                  (task.inspectionList || []).length > 0 ? 'has-data' : 'is-ghost'
                ]"
                @click="openInspectionsModal(task)"
                title="View Inspection Records & Photos"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M9 15l2 2 4-4" />
                </svg>
                <span>{{ (task.inspectionList || []).length }} Inspections</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CALENDAR PICKER MODAL -->
    <Teleport to="body">
      <div v-if="showCalendarModal" class="wlh-modal-backdrop" @click="showCalendarModal = false">
        <div class="wlh-calendar-modal-box" @click.stop>
          <div class="wlh-cal-modal-header">
            <div class="wlh-cal-title-row">
              <h3 class="wlh-cal-title">Select History Date</h3>
              <button class="wlh-modal-close-btn" @click="showCalendarModal = false">&times;</button>
            </div>
            <p class="wlh-cal-subtitle">Browse through previous daily accomplishment log dates</p>
          </div>

          <!-- Month Selector Navigation -->
          <div class="wlh-cal-month-nav">
            <button class="wlh-cal-month-btn" @click="changeCalendarMonth(-1)">‹</button>
            <span class="wlh-cal-month-label">{{ currentCalendarMonthLabel }}</span>
            <button class="wlh-cal-month-btn" @click="changeCalendarMonth(1)" :disabled="isCalendarNextMonthDisabled">›</button>
          </div>

          <!-- Calendar Days Grid -->
          <div class="wlh-cal-grid">
            <div v-for="day in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" :key="day" class="wlh-cal-weekday">
              {{ day }}
            </div>

            <button
              v-for="(cell, cIdx) in calendarDays"
              :key="cIdx"
              :disabled="cell.isFuture || !cell.isCurrentMonth"
              :class="[
                'wlh-cal-day-cell',
                {
                  'is-selected': cell.dateString === selectedDate,
                  'is-today': cell.dateString === todayDateString,
                  'has-snapshot': cell.hasSnapshot,
                  'other-month': !cell.isCurrentMonth,
                  'is-future': cell.isFuture
                }
              ]"
              @click="handleSelectCalendarDay(cell.dateString)"
            >
              <span>{{ cell.dayNumber }}</span>
              <span v-if="cell.hasSnapshot" class="wlh-cal-dot" title="Has saved log"></span>
            </button>
          </div>

          <!-- Quick Selector Links -->
          <div class="wlh-cal-quick-links">
            <button type="button" class="wlh-quick-link-btn" @click="handleSelectCalendarDay(todayDateString)">
              Today
            </button>
            <button type="button" class="wlh-quick-link-btn" @click="handleSelectCalendarDay(yesterdayDateString)">
              Yesterday
            </button>
            <button
              v-if="latestAvailableDate && latestAvailableDate !== todayDateString"
              type="button"
              class="wlh-quick-link-btn"
              @click="handleSelectCalendarDay(latestAvailableDate)"
            >
              Latest Saved ({{ latestAvailableDate }})
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- REMARKS MODAL -->
    <Teleport to="body">
      <div v-if="activeRemarksTask" class="wlh-modal-backdrop" @click="activeRemarksTask = null">
        <div class="wlh-detail-modal-box" @click.stop>
          <div class="wlh-modal-header">
            <div>
              <h3>Accomplishment Remarks Log</h3>
              <p class="wlh-modal-sub">
                {{ activeRemarksTask.groupTitle }} • {{ activeRemarksTask.workOrderNumber }}
              </p>
            </div>
            <button class="wlh-modal-close-btn" @click="activeRemarksTask = null">&times;</button>
          </div>

          <div class="wlh-remarks-body">
            <div v-if="(!activeRemarksTask.remarksList || activeRemarksTask.remarksList.length === 0) && !isEditMode" class="wlh-none-muted">
              No remarks logged for this task on this date.
            </div>

            <div
              v-for="(rem, rIdx) in (activeRemarksTask.remarksList || [])"
              :key="rIdx"
              class="wlh-remark-item"
            >
              <div class="wlh-remark-meta">
                <span class="wlh-remark-time">{{ rem.timestamp || 'Recorded' }}</span>
                <button
                  v-if="isEditMode"
                  class="wlh-item-del-btn"
                  @click="deleteRemark(activeRemarksTask, rIdx)"
                  title="Remove note"
                >
                  🗑️
                </button>
              </div>
              <div class="wlh-remark-text">{{ rem.text }}</div>
            </div>

            <!-- Add Remark Input (In Edit Mode) -->
            <div v-if="isEditMode" class="wlh-add-remark-section">
              <textarea
                v-model="newRemarkInput"
                placeholder="Add a missed remark note..."
                class="wlh-add-remark-textarea"
                rows="2"
              ></textarea>
              <button
                type="button"
                class="btn btn-outline-sm"
                @click="addRemarkToTask(activeRemarksTask)"
                :disabled="!newRemarkInput.trim()"
              >
                + Add Note
              </button>
            </div>
          </div>

          <div class="wlh-modal-footer">
            <button class="btn btn-outline-sm" @click="activeRemarksTask = null">Close</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- INSPECTIONS MODAL -->
    <Teleport to="body">
      <div v-if="activeInspectionsTask" class="wlh-modal-backdrop" @click="activeInspectionsTask = null">
        <div class="wlh-detail-modal-box" style="max-width: 650px" @click.stop>
          <div class="wlh-modal-header">
            <div>
              <h3>Inspections & Quality Verification</h3>
              <p class="wlh-modal-sub">
                {{ activeInspectionsTask.groupTitle }} • {{ activeInspectionsTask.workOrderNumber }}
              </p>
            </div>
            <button class="wlh-modal-close-btn" @click="activeInspectionsTask = null">&times;</button>
          </div>

          <div class="wlh-inspections-body">
            <div v-if="!activeInspectionsTask.inspectionList || activeInspectionsTask.inspectionList.length === 0" class="wlh-none-muted">
              No inspections recorded for this task on this date.
            </div>

            <div
              v-for="(insp, iIdx) in (activeInspectionsTask.inspectionList || [])"
              :key="iIdx"
              class="wlh-insp-card"
            >
              <div class="wlh-insp-head">
                <div>
                  <strong>Inspector: {{ insp.inspector || 'Designated Lead' }}</strong>
                  <div class="wlh-insp-date">{{ insp.date || selectedDate }}</div>
                </div>
                <span :class="['wlh-insp-status-tag', insp.status === 'Passed' ? 'status-passed' : 'status-pending']">
                  {{ insp.status || 'Verified' }}
                </span>
              </div>
              <p class="wlh-insp-notes">{{ insp.notes || insp.detailedNotes || 'Inspection checked.' }}</p>

              <!-- Inspection Photos -->
              <div v-if="insp.photos && insp.photos.length > 0" class="wlh-insp-photos">
                <img
                  v-for="(photo, pIdx) in insp.photos"
                  :key="pIdx"
                  :src="photo.url"
                  :alt="photo.name || 'Inspection Photo'"
                  class="wlh-insp-thumb"
                  @click="openLightbox(photo)"
                />
              </div>
            </div>
          </div>

          <div class="wlh-modal-footer">
            <button class="btn btn-outline-sm" @click="activeInspectionsTask = null">Close</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- LIGHTBOX MODAL FOR INSPECTION PHOTO -->
    <Teleport to="body">
      <div v-if="activeLightboxPhoto" class="wlh-modal-backdrop" @click="activeLightboxPhoto = null">
        <div class="wlh-lightbox-box" @click.stop>
          <button class="wlh-modal-close-btn" style="position: absolute; right: 12px; top: 12px" @click="activeLightboxPhoto = null">&times;</button>
          <img :src="activeLightboxPhoto.url" :alt="activeLightboxPhoto.name || 'Inspection Photo'" class="wlh-lightbox-img" />
          <div class="wlh-lightbox-caption">{{ activeLightboxPhoto.name || 'Inspection Documented Photo' }}</div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { WorkOrder, Person, Team, CatalogItem, DailyWorkLogEntry, InspectionPhoto } from '../types';
import {
  getSnapshotDates,
  getSnapshotByDate,
  updateSnapshot,
  SnapshotSummary
} from '../services/workLogHistoryService';

const props = withDefaults(
  defineProps<{
    workOrders?: WorkOrder[];
    personnel?: Person[];
    teams?: Team[];
    equipmentCatalog?: CatalogItem[];
  }>(),
  {
    workOrders: () => [],
    personnel: () => [],
    teams: () => [],
    equipmentCatalog: () => []
  }
);

const emit = defineEmits<{
  (e: 'selectOrder', code: string): void;
  (e: 'navigateOrders'): void;
  (e: 'navigateDailyLog'): void;
  (e: 'toast', message: string, type?: 'info' | 'success' | 'warning'): void;
}>();

// Dates setup
const todayDateString = new Date().toISOString().split('T')[0];
const yesterdayDateString = new Date(Date.now() - 86400000).toISOString().split('T')[0];

const selectedDate = ref<string>(todayDateString);
const availableSnapshots = ref<SnapshotSummary[]>([]);
const currentEntries = ref<DailyWorkLogEntry[]>([]);
const isEditMode = ref<boolean>(false);
const searchQuery = ref<string>('');
const selectedDepartmentFilter = ref<string>('');
const originalEntriesBackup = ref<string>('');

// Modals
const showCalendarModal = ref<boolean>(false);
const calendarViewDate = ref<Date>(new Date());
const activeRemarksTask = ref<DailyWorkLogEntry | null>(null);
const activeInspectionsTask = ref<DailyWorkLogEntry | null>(null);
const activeLightboxPhoto = ref<InspectionPhoto | null>(null);
const newRemarkInput = ref<string>('');

// Date computations
const isToday = computed(() => selectedDate.value === todayDateString);
const isYesterday = computed(() => selectedDate.value === yesterdayDateString);

const formattedSelectedDate = computed(() => {
  if (!selectedDate.value) return '';
  const [y, m, d] = selectedDate.value.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
});

const latestAvailableDate = computed(() => {
  if (availableSnapshots.value.length === 0) return null;
  return availableSnapshots.value[0].snapshot_date;
});

const hasEntries = computed(() => currentEntries.value.length > 0);

// Load snapshot data for date
const loadSnapshotForDate = async (date: string) => {
  try {
    const detail = await getSnapshotByDate(date);
    if (detail && Array.isArray(detail.entries) && detail.entries.length > 0) {
      const activeOnly = detail.entries.filter((e) => !e.isOnHold);
      currentEntries.value = JSON.parse(JSON.stringify(activeOnly));
      originalEntriesBackup.value = JSON.stringify(activeOnly);
    } else {
      currentEntries.value = [];
      originalEntriesBackup.value = '';
    }
  } catch (err) {
    currentEntries.value = [];
  }
};

const selectDate = async (date: string) => {
  if (isEditMode.value) {
    if (!confirm('You have unsaved changes in Edit Mode. Switch date anyway?')) {
      return;
    }
    isEditMode.value = false;
  }
  selectedDate.value = date;
  await loadSnapshotForDate(date);
};

const navigateDay = (delta: number) => {
  const [y, m, d] = selectedDate.value.split('-').map(Number);
  const cur = new Date(y, m - 1, d);
  cur.setDate(cur.getDate() + delta);
  const nextDateStr = cur.toISOString().split('T')[0];
  if (nextDateStr > todayDateString) return;
  selectDate(nextDateStr);
};

// Available departments for filter
const availableDepartments = computed(() => {
  const set = new Set<string>();
  currentEntries.value.forEach((e) => {
    if (!e.isOnHold && e.groupTitle) set.add(e.groupTitle);
  });
  return Array.from(set).sort();
});

// Grouped entries map
const filteredGroups = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  const deptFilter = selectedDepartmentFilter.value;

  const result: Record<string, DailyWorkLogEntry[]> = {};

  currentEntries.value.forEach((entry) => {
    if (entry.isOnHold) return;
    if (deptFilter && entry.groupTitle !== deptFilter) return;

    if (q) {
      const matchTitle = (entry.groupTitle || '').toLowerCase().includes(q);
      const matchSubtitle = (entry.groupSubTitle || '').toLowerCase().includes(q);
      const matchCode = (entry.workOrderNumber || '').toLowerCase().includes(q);
      const matchDesc = (entry.description || '').toLowerCase().includes(q);
      const matchLead = (entry.assignedLead || '').toLowerCase().includes(q);
      const matchType = (entry.workType || '').toLowerCase().includes(q);
      const matchStaff = (entry.assignedPersonnel || []).some((p) => p.toLowerCase().includes(q));

      if (!matchTitle && !matchSubtitle && !matchCode && !matchDesc && !matchLead && !matchType && !matchStaff) {
        return;
      }
    }

    const key = `${entry.groupTitle || 'GENERAL'}__${entry.workOrderNumber || 'ORDER'}`;
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(entry);
  });

  return result;
});

// Summary Metrics
const metrics = computed(() => {
  const entries = currentEntries.value.filter((e) => !e.isOnHold);
  const uniqueOrders = new Set(entries.map((e) => e.workOrderNumber)).size;
  const uniqueStaff = new Set(entries.flatMap((e) => e.assignedPersonnel || [])).size;
  const totalEq = entries.reduce((acc, e) => acc + (e.equipmentList?.length || 0), 0);
  const totalInsp = entries.reduce((acc, e) => acc + (e.inspectionList?.length || 0), 0);

  return {
    ordersCount: uniqueOrders,
    tasksCount: entries.length,
    personnelCount: uniqueStaff,
    equipmentCount: totalEq,
    inspectionsCount: totalInsp
  };
});

// Edit Mode Functions
const toggleEditMode = () => {
  if (isEditMode.value) {
    cancelEditMode();
  } else {
    isEditMode.value = true;
    originalEntriesBackup.value = JSON.stringify(currentEntries.value);
    emit('toast', `Edit mode enabled for ${formattedSelectedDate.value}. Modify details and click 'Save Changes'.`, 'info');
  }
};

const cancelEditMode = () => {
  if (originalEntriesBackup.value) {
    try {
      currentEntries.value = JSON.parse(originalEntriesBackup.value);
    } catch {}
  }
  isEditMode.value = false;
};

const handleSaveHistoricalChanges = async () => {
  try {
    const res = await updateSnapshot(selectedDate.value, currentEntries.value);
    if (res.unchanged) {
      emit('toast', `ℹ Log for ${selectedDate.value} is already up to date. No changes detected.`, 'info');
    } else {
      emit('toast', `✓ Work log history updated successfully for ${selectedDate.value}!`, 'success');
      originalEntriesBackup.value = JSON.stringify(currentEntries.value);
      isEditMode.value = false;
      // Refresh dates summaries
      availableSnapshots.value = await getSnapshotDates();
    }
  } catch (err) {
    emit('toast', 'Failed to update work log history.', 'warning');
  }
};

// Remarks
const openRemarksModal = (task: DailyWorkLogEntry) => {
  activeRemarksTask.value = task;
  newRemarkInput.value = '';
};

const addRemarkToTask = (task: DailyWorkLogEntry) => {
  if (!newRemarkInput.value.trim()) return;
  if (!task.remarksList) task.remarksList = [];
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  task.remarksList.push({
    id: `rem-${Date.now()}`,
    timestamp: `${selectedDate.value} • ${timeStr}`,
    text: newRemarkInput.value.trim()
  });
  task.hasComments = true;
  newRemarkInput.value = '';
};

const deleteRemark = (task: DailyWorkLogEntry, idx: number) => {
  if (!task.remarksList) return;
  task.remarksList.splice(idx, 1);
  if (task.remarksList.length === 0) task.hasComments = false;
};

// Inspections
const openInspectionsModal = (task: DailyWorkLogEntry) => {
  activeInspectionsTask.value = task;
};

const openLightbox = (photo: InspectionPhoto) => {
  activeLightboxPhoto.value = photo;
};

// Calendar Dropdown / Modal
const toggleCalendarModal = () => {
  showCalendarModal.value = !showCalendarModal.value;
  if (showCalendarModal.value) {
    const [y, m] = selectedDate.value.split('-').map(Number);
    calendarViewDate.value = new Date(y, m - 1, 1);
  }
};

const currentCalendarMonthLabel = computed(() => {
  return calendarViewDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
});

const isCalendarNextMonthDisabled = computed(() => {
  const now = new Date();
  const v = calendarViewDate.value;
  return v.getFullYear() >= now.getFullYear() && v.getMonth() >= now.getMonth();
});

const changeCalendarMonth = (delta: number) => {
  const v = new Date(calendarViewDate.value);
  v.setMonth(v.getMonth() + delta);
  calendarViewDate.value = v;
};

const calendarDays = computed(() => {
  const viewYear = calendarViewDate.value.getFullYear();
  const viewMonth = calendarViewDate.value.getMonth();

  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const snapshotDatesSet = new Set(availableSnapshots.value.map((s) => s.snapshot_date));

  const cells = [];

  // Previous month filler
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevDate = new Date(viewYear, viewMonth - 1, day);
    const dateStr = prevDate.toISOString().split('T')[0];
    cells.push({
      dayNumber: day,
      dateString: dateStr,
      isCurrentMonth: false,
      isFuture: dateStr > todayDateString,
      hasSnapshot: snapshotDatesSet.has(dateStr)
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(viewYear, viewMonth, d);
    const dateStr = curDate.toISOString().split('T')[0];
    cells.push({
      dayNumber: d,
      dateString: dateStr,
      isCurrentMonth: true,
      isFuture: dateStr > todayDateString,
      hasSnapshot: snapshotDatesSet.has(dateStr)
    });
  }

  // Next month filler
  const remaining = 42 - cells.length;
  for (let n = 1; n <= remaining; n++) {
    const nextDate = new Date(viewYear, viewMonth + 1, n);
    const dateStr = nextDate.toISOString().split('T')[0];
    cells.push({
      dayNumber: n,
      dateString: dateStr,
      isCurrentMonth: false,
      isFuture: dateStr > todayDateString,
      hasSnapshot: snapshotDatesSet.has(dateStr)
    });
  }

  return cells;
});

const handleSelectCalendarDay = (dateStr: string) => {
  showCalendarModal.value = false;
  selectDate(dateStr);
};

const formatDateLabel = (dateStr: string) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Activity type badges
const getActivityTypeStyle = (type?: string) => {
  const t = (type || '').toLowerCase();
  if (t.includes('carpenter') || t.includes('wood')) return { backgroundColor: '#EBF5FF', color: '#1E40AF', borderColor: '#BFDBFE' };
  if (t.includes('paint')) return { backgroundColor: '#F0FDF4', color: '#166534', borderColor: '#BBF7D0' };
  if (t.includes('plumb')) return { backgroundColor: '#ECFEFF', color: '#155E75', borderColor: '#A5F3FC' };
  if (t.includes('elec')) return { backgroundColor: '#FFFBEB', color: '#92400E', borderColor: '#FDE68A' };
  if (t.includes('air') || t.includes('hvac')) return { backgroundColor: '#F5F3FF', color: '#5B21B6', borderColor: '#DDD6FE' };
  return { backgroundColor: '#F1F5F9', color: '#334155', borderColor: '#CBD5E1' };
};

// Task status & timeline helpers for modern responsive cards
const isTaskCompleted = (task: DailyWorkLogEntry): boolean => {
  if (!task.completionDate) return false;
  const cd = task.completionDate.trim().toLowerCase();
  if (cd === '' || cd === 'in progress' || cd === '—' || cd === '-' || cd === 'ongoing' || cd === 'pending') {
    return false;
  }
  return true;
};

const formatTaskTimeline = (task: DailyWorkLogEntry): string => {
  const start = task.startDate && task.startDate !== '—' && task.startDate !== '-' ? task.startDate : '';
  const isDone = isTaskCompleted(task);
  const end = isDone ? task.completionDate : '';

  if (start && end) {
    return `${start} → ${end}`;
  }
  if (start && !end) {
    return `Started ${start} • In Progress`;
  }
  if (!start && end) {
    return `Completed on ${end}`;
  }
  return 'In Progress';
};

const getInitials = (name?: string): string => {
  if (!name) return '•';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

// Export Accomplishment PDF / Print Report
const handleExportPDF = () => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate the report.');
    return;
  }

  const itemsHtml = Object.entries(filteredGroups.value)
    .map(([groupKey, tasks]) => {
      const officeTitle = tasks[0]?.groupTitle || groupKey;
      const orderNo = tasks[0]?.workOrderNumber || '';
      const workTitle = tasks[0]?.groupSubTitle || '';
      const lead = tasks[0]?.assignedLead || 'Lead Foreman';

      const taskRows = tasks
        .map(
          (t) => `
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 10px; font-weight: 600; color: #006C49; width: 140px;">${t.workType || 'General'}</td>
            <td style="padding: 10px;">${t.description || 'Task execution'}</td>
            <td style="padding: 10px; font-size: 12px;">${t.startDate || '—'} to ${t.completionDate || 'Active'}</td>
            <td style="padding: 10px; font-size: 12px;">${(t.assignedPersonnel || []).join(', ') || 'Staff'}</td>
            <td style="padding: 10px; font-size: 12px;">${(t.equipmentList || []).map((e) => e.name).join(', ') || 'None'}</td>
            <td style="padding: 10px; font-size: 12px;">${(t.remarksList || []).map((r) => r.text).join('<br/>') || '—'}</td>
          </tr>`
        )
        .join('');

      return `
        <div style="margin-bottom: 24px; border: 1px solid #CBD5E1; border-radius: 6px; overflow: hidden;">
          <div style="background: #F1F5F9; padding: 10px 16px; display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px solid #CBD5E1;">
            <div>${officeTitle} &bull; <span style="color: #475569; font-weight: normal;">${workTitle}</span></div>
            <div>Order: <strong>${orderNo}</strong> | Lead: ${lead}</div>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: #F8FAFC; border-bottom: 1px solid #E2E8F0; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748B;">
                <th style="padding: 8px 10px;">Activity</th>
                <th style="padding: 8px 10px;">Accomplishment Details</th>
                <th style="padding: 8px 10px;">Schedule</th>
                <th style="padding: 8px 10px;">Personnel</th>
                <th style="padding: 8px 10px;">Tools/Equipment</th>
                <th style="padding: 8px 10px;">Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${taskRows}
            </tbody>
          </table>
        </div>
      `;
    })
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>GenSO Daily Accomplishment Report - ${selectedDate.value}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 28px; color: #0B1C30; }
        .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #006C49; padding-bottom: 12px; margin-bottom: 20px; }
        h1 { margin: 0; color: #006C49; font-size: 22px; }
        .sub { margin: 4px 0 0 0; color: #64748B; font-size: 13px; }
        .kpi-strip { display: flex; gap: 16px; margin-bottom: 20px; background: #F8FAFC; padding: 12px; border-radius: 6px; border: 1px solid #E2E8F0; }
        .kpi-item { flex: 1; text-align: center; }
        .kpi-val { font-size: 18px; font-weight: bold; color: #006C49; }
        .kpi-lbl { font-size: 11px; text-transform: uppercase; color: #64748B; margin-top: 2px; }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>GENERAL SERVICES OFFICE (GENSO)</h1>
          <div class="sub">Daily Accomplishment Compilation & Work Log Report</div>
        </div>
        <div style="text-align: right;">
          <strong>Date: ${formattedSelectedDate.value}</strong>
          <div class="sub">Generated on ${new Date().toLocaleString()}</div>
        </div>
      </div>

      <div class="kpi-strip">
        <div class="kpi-item">
          <div class="kpi-val">${metrics.value.ordersCount}</div>
          <div class="kpi-lbl">Work Orders</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-val">${metrics.value.tasksCount}</div>
          <div class="kpi-lbl">Tasks Accomplished</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-val">${metrics.value.personnelCount}</div>
          <div class="kpi-lbl">Personnel Deployed</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-val">${metrics.value.equipmentCount}</div>
          <div class="kpi-lbl">Equipment Utilized</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-val">${metrics.value.inspectionsCount}</div>
          <div class="kpi-lbl">Inspections Completed</div>
        </div>
      </div>

      ${itemsHtml || '<p>No records for this date.</p>'}

      <script>
        window.onload = function() { window.print(); }
      <\/script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

onMounted(async () => {
  availableSnapshots.value = await getSnapshotDates();
  // Default to today, or latest date if today is empty
  await loadSnapshotForDate(selectedDate.value);
  if (currentEntries.value.length === 0 && availableSnapshots.value.length > 0) {
    // If today has no snapshot yet, select latest available
    selectedDate.value = availableSnapshots.value[0].snapshot_date;
    await loadSnapshotForDate(selectedDate.value);
  }
});
</script>

<style scoped>
.wlh-history-canvas {
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

/* Date Navigator Bar */
.wlh-date-nav {
  display: inline-flex;
  align-items: center;
  background: #FFFFFF;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  padding: 2px;
}

.wlh-nav-arrow {
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: 6px;
  transition: all var(--transition-fast);
}

.wlh-nav-arrow:hover:not(:disabled) {
  background: #F1F5F9;
  color: var(--color-navy-header);
}

.wlh-nav-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.wlh-calendar-trigger-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-navy-header);
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s;
}

.wlh-calendar-trigger-btn:hover {
  background: #F8FAFC;
}

.wlh-today-tag {
  background: #DCFCE7;
  color: #166534;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  text-transform: uppercase;
}

.wlh-yesterday-tag {
  background: #E0E7FF;
  color: #3730A3;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  text-transform: uppercase;
}

/* Edit Mode Banner */
.wlh-edit-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FEF3C7;
  border: 1px solid #FCD34D;
  color: #92400E;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
}

.wlh-edit-banner-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.wlh-edit-cancel-btn {
  background: transparent;
  border: 1px solid #D97706;
  color: #92400E;
  font-weight: 600;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.wlh-edit-cancel-btn:hover {
  background: rgba(217, 119, 6, 0.1);
}

/* KPI Strip */
.wlh-kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.wlh-kpi-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #FFFFFF;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 12px 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  min-width: 0;
}

.wlh-kpi-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
}

.wlh-kpi-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-orders { background: #EFF6FF; color: #2563EB; }
.icon-tasks { background: #ECFDF5; color: #059669; }
.icon-personnel { background: #F5F3FF; color: #7C3AED; }
.icon-equipment { background: #FFFBEB; color: #D97706; }
.icon-inspections { background: #F0FDF4; color: #16A34A; }

.wlh-kpi-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.wlh-kpi-label {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wlh-kpi-val {
  font-size: 19px;
  font-weight: 700;
  color: var(--color-navy-header);
  line-height: 1.15;
}

/* Filter Row */
.wlh-filter-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.wlh-search-box {
  flex: 1;
  min-width: 280px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FFFFFF;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px 14px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.wlh-search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  color: var(--color-navy-header);
}

.wlh-search-clear {
  background: transparent;
  border: none;
  font-size: 16px;
  color: var(--color-text-muted);
  cursor: pointer;
}

.wlh-dept-select-wrap {
  min-width: 220px;
}

.wlh-dept-select {
  width: 100%;
  height: 38px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: #FFFFFF;
  padding: 0 12px;
  font-size: 13px;
  color: var(--color-navy-header);
  font-weight: 500;
  outline: none;
}

/* Empty State */
.wlh-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #FFFFFF;
  border: 1px dashed var(--color-border);
  border-radius: 12px;
  padding: 50px 24px;
  text-align: center;
}

.wlh-empty-icon {
  color: #94A3B8;
  margin-bottom: 14px;
}

.wlh-empty-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-navy-header);
  margin-bottom: 6px;
}

.wlh-empty-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  max-width: 420px;
  margin-bottom: 20px;
}

.wlh-empty-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* Groups and Task Cards */
.wlh-groups-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.wlh-group-card {
  background: #FFFFFF;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.wlh-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: #F8FAFC;
  border-bottom: 1px solid var(--color-border);
}

.wlh-group-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.wlh-group-badge {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  background: #E2E8F0;
  color: #475569;
  padding: 2px 8px;
  border-radius: 6px;
}

.wlh-group-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-navy-header);
  margin: 0;
}

.wlh-group-count {
  font-size: 11px;
  background: #E2E8F0;
  color: #475569;
  padding: 1px 7px;
  border-radius: 10px;
  font-weight: 600;
}

.wlh-group-order-no {
  font-size: 12px;
  color: var(--color-text-muted);
}

.wlh-group-order-no strong {
  color: var(--color-navy-header);
  font-size: 13px;
}

/* Group Subbar */
.wlh-group-subbar {
  padding: 8px 18px;
  background: #FFFFFF;
  border-bottom: 1px solid #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-muted);
  gap: 12px;
}

.wlh-group-subbar-title {
  font-weight: 600;
  color: #334155;
}

.wlh-group-lead {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #475569;
}

.wlh-group-lead strong {
  color: var(--color-navy-header);
}

/* Tasks rows */
.wlh-task-list {
  display: flex;
  flex-direction: column;
}

.wlh-task-row {
  display: grid;
  grid-template-columns: 2.2fr 1.2fr 1.2fr 1.2fr auto;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid #F1F5F9;
  transition: background 0.15s;
}

.wlh-task-row:last-child {
  border-bottom: none;
}

.wlh-task-row:hover {
  background: #FAFBFD;
}

.wlh-task-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.wlh-task-main-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.wlh-task-type-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 6px;
  border: 1px solid transparent;
  white-space: nowrap;
}

.wlh-task-status-wrap {
  display: inline-flex;
  align-items: center;
}

.wlh-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
  white-space: nowrap;
  line-height: 1.2;
}

.wlh-status-pill.status-completed {
  background: #ECFDF5;
  color: #047857;
  border: 1px solid #A7F3D0;
}

.wlh-status-pill.status-inprogress {
  background: #FFFBEB;
  color: #B45309;
  border: 1px solid #FDE68A;
}

.wlh-status-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #F59E0B;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.25);
}

.wlh-task-description {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-navy-header);
  line-height: 1.35;
}

.wlh-edit-input {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 13px;
}

.wlh-task-dates {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wlh-timeline-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 500;
  color: #334155;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  padding: 4px 8px;
  white-space: nowrap;
}

.wlh-timeline-pill svg {
  color: #64748B;
  flex-shrink: 0;
}

.wlh-edit-dates-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wlh-date-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.wlh-date-pill-label {
  color: var(--color-text-muted);
  width: 44px;
}

.wlh-date-pill-val {
  font-weight: 600;
  color: var(--color-navy-header);
}

.wlh-edit-date-input {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 11px;
  padding: 2px 4px;
}

.wlh-task-meta-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wlh-meta-tag-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.wlh-meta-count {
  font-size: 10px;
  font-weight: 500;
  color: #94A3B8;
}

.wlh-meta-avatars, .wlh-equipment-list-preview {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.wlh-person-chip, .wlh-eq-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  color: var(--color-navy-header);
  font-size: 11px;
  font-weight: 500;
  padding: 2px 7px;
  border-radius: 6px;
}

.wlh-avatar-mini {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #E2E8F0;
  color: #334155;
  font-size: 8.5px;
  font-weight: 700;
  flex-shrink: 0;
}

.wlh-chip-text {
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wlh-qty-badge {
  font-size: 10px;
  font-weight: 700;
  color: #2563EB;
}

.wlh-none-muted {
  font-size: 11px;
  color: #94A3B8;
  font-style: italic;
}

.wlh-task-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wlh-log-badge-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #FFFFFF;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 11.5px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.wlh-log-badge-btn:hover {
  background: #F8FAFC;
  color: var(--color-navy-header);
}

.wlh-log-badge-btn.has-data {
  border-color: #BFDBFE;
  background: #EFF6FF;
  color: #1E40AF;
  font-weight: 600;
}

.wlh-log-badge-btn.is-ghost {
  background: #FFFFFF;
  border-color: #E2E8F0;
  color: #64748B;
}

.wlh-log-badge-btn.is-ghost:hover {
  background: #F1F5F9;
  color: #0F172A;
}

/* Modals */
.wlh-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(11, 28, 48, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.wlh-calendar-modal-box {
  background: #FFFFFF;
  border-radius: 12px;
  width: 380px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.wlh-cal-modal-header {
  margin-bottom: 14px;
}

.wlh-cal-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.wlh-cal-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-navy-header);
  margin: 0;
}

.wlh-cal-subtitle {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 4px 0 0 0;
}

.wlh-cal-month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  background: #F8FAFC;
  padding: 6px 12px;
  border-radius: 8px;
}

.wlh-cal-month-label {
  font-weight: 700;
  font-size: 14px;
  color: var(--color-navy-header);
}

.wlh-cal-month-btn {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--color-navy-header);
  width: 28px;
  height: 28px;
  border-radius: 4px;
}

.wlh-cal-month-btn:hover:not(:disabled) {
  background: #E2E8F0;
}

.wlh-cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 14px;
}

.wlh-cal-weekday {
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  padding: 6px 0;
}

.wlh-cal-day-cell {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.wlh-cal-day-cell:hover:not(:disabled) {
  background: #F1F5F9;
}

.wlh-cal-day-cell.is-selected {
  background: #006C49 !important;
  color: #FFFFFF !important;
  font-weight: 700;
}

.wlh-cal-day-cell.is-today:not(.is-selected) {
  border-color: #006C49;
  font-weight: 700;
  color: #006C49;
}

.wlh-cal-day-cell.other-month, .wlh-cal-day-cell.is-future {
  opacity: 0.25;
  cursor: not-allowed;
}

.wlh-cal-dot {
  position: absolute;
  bottom: 3px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #2563EB;
}

.wlh-cal-day-cell.is-selected .wlh-cal-dot {
  background: #FFFFFF;
}

.wlh-cal-quick-links {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #E2E8F0;
  padding-top: 10px;
}

.wlh-quick-link-btn {
  background: transparent;
  border: none;
  font-size: 12px;
  font-weight: 600;
  color: #006C49;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.wlh-quick-link-btn:hover {
  background: #ECFDF5;
}

/* Detail Modals (Remarks & Inspections) */
.wlh-detail-modal-box {
  background: #FFFFFF;
  border-radius: 12px;
  width: 500px;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.wlh-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
}

.wlh-modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-navy-header);
}

.wlh-modal-sub {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: var(--color-text-muted);
}

.wlh-modal-close-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  line-height: 1;
  color: var(--color-text-muted);
  cursor: pointer;
}

.wlh-remarks-body, .wlh-inspections-body {
  padding: 18px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wlh-remark-item {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 10px 14px;
}

.wlh-remark-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.wlh-remark-text {
  font-size: 13px;
  color: var(--color-navy-header);
}

.wlh-item-del-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 12px;
}

.wlh-add-remark-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.wlh-add-remark-textarea {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 8px;
  font-size: 13px;
  resize: vertical;
}

.wlh-insp-card {
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 12px;
  background: #FFFFFF;
}

.wlh-insp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.wlh-insp-date {
  font-size: 11px;
  color: var(--color-text-muted);
}

.wlh-insp-status-tag {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
}

.status-passed { background: #DCFCE7; color: #15803D; }
.status-pending { background: #FEF3C7; color: #B45309; }

.wlh-insp-notes {
  font-size: 12px;
  color: var(--color-navy-header);
  margin: 0 0 8px 0;
}

.wlh-insp-photos {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.wlh-insp-thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #CBD5E1;
  cursor: pointer;
  transition: transform 0.15s;
}

.wlh-insp-thumb:hover {
  transform: scale(1.05);
}

.wlh-modal-footer {
  padding: 12px 20px;
  background: #F8FAFC;
  border-top: 1px solid #E2E8F0;
  display: flex;
  justify-content: flex-end;
}

.wlh-lightbox-box {
  position: relative;
  background: #FFFFFF;
  border-radius: 8px;
  padding: 12px;
  max-width: 80vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wlh-lightbox-img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 4px;
}

.wlh-lightbox-caption {
  margin-top: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-navy-header);
}

/* Action Buttons Group */
.wlh-action-btns {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.wlh-btn-action {
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
}

/* ==========================================================================
   RESPONSIVE DESIGN SYSTEM (Tablets, Mobiles, and Small Screens)
   ========================================================================== */

/* Medium Screens & Tablets (<= 1024px) - Addresses cluttered tablet view */
@media (max-width: 1024px) {
  /* Compact KPI Rail: keeps all 5 metrics visible without vertical bloat */
  .wlh-kpi-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 8px;
  }

  .wlh-kpi-card {
    padding: 8px 10px;
    gap: 8px;
    border-radius: 8px;
  }

  .wlh-kpi-icon-wrap {
    width: 32px;
    height: 32px;
    border-radius: 6px;
  }

  .wlh-kpi-icon-wrap svg {
    width: 16px;
    height: 16px;
  }

  .wlh-kpi-label {
    font-size: 9px;
    letter-spacing: 0.2px;
  }

  .wlh-kpi-val {
    font-size: 16px;
  }

  /* Group container spacing */
  .wlh-groups-container {
    gap: 16px;
  }

  .wlh-group-card {
    border-radius: 10px;
  }

  .wlh-group-header {
    padding: 10px 14px;
    gap: 8px;
  }

  .wlh-group-title {
    font-size: 14px;
  }

  .wlh-group-subbar {
    padding: 8px 14px;
    font-size: 11.5px;
  }

  /* Task row transforms into a structured Bento-style card */
  .wlh-task-list {
    padding: 8px 10px;
    gap: 10px;
    background: #F8FAFC;
  }

  .wlh-task-row {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 12px 14px;
    gap: 10px;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    background: #FFFFFF;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    transition: box-shadow 0.15s ease;
  }

  .wlh-task-row:hover {
    background: #FFFFFF;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  }

  .wlh-task-row:last-child {
    border-bottom: 1px solid #E2E8F0;
  }

  /* Header of task card: category badge + title + status pill */
  .wlh-task-main {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }

  .wlh-task-main-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 8px;
  }

  .wlh-task-type-badge {
    font-size: 10.5px;
    padding: 2.5px 8px;
  }

  .wlh-task-description {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--color-navy-header);
    line-height: 1.35;
  }

  /* Timeline pill fits neatly under title */
  .wlh-task-dates {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .wlh-timeline-pill {
    padding: 3px 8px;
    font-size: 11px;
    border-radius: 5px;
  }

  .wlh-edit-dates-block {
    flex-direction: row;
    gap: 10px;
    flex-wrap: wrap;
  }

  /* Metadata cells: Personnel and Equipment as inline chip rows */
  .wlh-task-meta-cell {
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 2px 0;
    flex-wrap: wrap;
  }

  .wlh-meta-tag-label {
    min-width: 90px;
    font-size: 10px;
    flex-shrink: 0;
  }

  .wlh-person-chip, .wlh-eq-chip {
    font-size: 11px;
    padding: 2.5px 7px;
  }

  /* Task Action Buttons (Remarks & Inspections) */
  .wlh-task-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 4px;
    padding-top: 10px;
    border-top: 1px dashed #E2E8F0;
  }

  .wlh-log-badge-btn {
    justify-content: center;
    height: 38px;
    font-size: 11.5px;
    border-radius: 6px;
  }
}

/* Mobile Devices (<= 768px) */
@media (max-width: 768px) {
  /* Prevent fixed mobile navigation bar from clipping bottom cards */
  .wlh-history-canvas {
    padding-bottom: 100px;
    gap: 12px;
  }

  /* Utility toolbar on mobile */
  .module-tab-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .module-tabs {
    width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .module-tabs::-webkit-scrollbar {
    display: none;
  }

  .module-tab-btn {
    flex-shrink: 0;
  }

  .module-utility-actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .wlh-date-nav {
    width: 100%;
    justify-content: space-between;
    height: 42px;
  }

  .wlh-calendar-picker-wrap {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .wlh-calendar-trigger-btn {
    width: 100%;
    justify-content: center;
    font-size: 13px;
    padding: 6px 10px;
  }

  .wlh-nav-arrow {
    width: 42px;
    height: 42px;
    font-size: 20px;
  }

  .wlh-action-btns {
    width: 100%;
    display: flex;
    gap: 8px;
  }

  .wlh-btn-action {
    flex: 1;
    height: 40px;
    font-size: 12px;
    padding: 0 10px;
  }

  /* Horizontal swipeable KPI track: zero vertical bloat, native app feel */
  .wlh-kpi-grid {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    gap: 8px;
    padding-bottom: 4px;
  }

  .wlh-kpi-grid::-webkit-scrollbar {
    display: none;
  }

  .wlh-kpi-card {
    flex: 0 0 132px;
    scroll-snap-align: start;
    padding: 8px 10px;
    border-radius: 8px;
  }

  /* Filter bar */
  .wlh-filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .wlh-search-box {
    min-width: 100%;
    height: 42px;
  }

  .wlh-dept-select-wrap {
    min-width: 100%;
  }

  .wlh-dept-select {
    height: 42px;
    font-size: 12.5px;
  }

  /* Group header & subbar mobile layout */
  .wlh-group-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 10px 12px;
  }

  .wlh-group-header-left {
    width: 100%;
    justify-content: flex-start;
    gap: 6px;
  }

  .wlh-group-title {
    font-size: 13.5px;
    line-height: 1.3;
  }

  .wlh-group-header-right {
    width: 100%;
    display: flex;
    justify-content: flex-start;
  }

  .wlh-group-order-no {
    font-size: 11.5px;
    background: #F1F5F9;
    padding: 2px 8px;
    border-radius: 4px;
    white-space: nowrap;
  }

  .wlh-group-subbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 8px 12px;
    background: #F8FAFC;
    font-size: 11px;
  }

  /* Task row adjustments on phone */
  .wlh-task-list {
    padding: 6px 8px;
    gap: 8px;
  }

  .wlh-task-row {
    padding: 10px 12px;
    gap: 8px;
  }

  .wlh-task-description {
    font-size: 13px;
  }

  .wlh-task-meta-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .wlh-meta-tag-label {
    min-width: auto;
  }

  .wlh-chip-text {
    max-width: 120px;
  }

  .wlh-log-badge-btn {
    height: 38px;
    font-size: 11px;
  }

  /* Calendar modal adjustments */
  .wlh-calendar-modal-box {
    width: calc(100vw - 28px);
    max-width: 360px;
    padding: 14px;
  }

  .wlh-cal-day-cell {
    height: 36px;
    font-size: 12px;
  }
}

/* Small Mobile (<= 480px) */
@media (max-width: 480px) {
  .wlh-kpi-card {
    flex: 0 0 120px;
    padding: 6px 8px;
  }

  .wlh-kpi-val {
    font-size: 15px;
  }

  .wlh-kpi-label {
    font-size: 8.5px;
  }

  .wlh-task-actions {
    grid-template-columns: 1fr;
  }
}
</style>
