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

          <!-- General Hold Date Button -->
          <button
            type="button"
            :class="['btn', selectedDateHold.isHeld ? 'btn-warning-sm' : 'btn-outline-sm', 'wlh-btn-action']"
            @click="openHoldModal"
            :title="selectedDateHold.isHeld ? `On Hold: ${selectedDateHold.reason}` : 'Set Hold for holiday or memo'"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="10" y1="15" x2="10" y2="9" />
              <line x1="14" y1="15" x2="14" y2="9" />
            </svg>
            <span>{{ selectedDateHold.isHeld ? 'On Hold' : 'General Hold' }}</span>
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
          </button>
        </div>
      </div>
    </div>

    <!-- Date On Hold Alert Banner -->
    <div v-if="selectedDateHold.isHeld" class="wlh-hold-banner" style="margin-top: 14px;">
      <div class="wlh-hold-banner-icon">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="10" y1="15" x2="10" y2="9" />
          <line x1="14" y1="15" x2="14" y2="9" />
        </svg>
      </div>
      <div>
        <span class="wlh-hold-banner-title">DATE ON HOLD:</span>
        <span class="wlh-hold-banner-reason">{{ selectedDateHold.reason }}. Daily work log recording is suspended for this date.</span>
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

    <!-- Top Stats & Filter Section -->
    <div class="wlh-top-panel">
      <!-- Left: 2 Columns of Stacked Metric Cards (Balanced 2x2) -->
      <div class="wlh-metrics-stack-grid">
        <!-- Col 1 -->
        <div class="wlh-metrics-col">
          <!-- Card 1: Work Orders -->
          <div class="wlh-metric-mini-card">
            <div class="wlh-kpi-icon-wrap icon-orders">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div class="wlh-metric-mini-info">
              <span class="wlh-metric-mini-val">{{ metrics.ordersCount }}</span>
              <span class="wlh-metric-mini-label">WORK ORDERS</span>
            </div>
          </div>

          <!-- Card 2: Tasks Executed -->
          <div class="wlh-metric-mini-card">
            <div class="wlh-kpi-icon-wrap icon-tasks">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <div class="wlh-metric-mini-info">
              <span class="wlh-metric-mini-val">{{ metrics.tasksCount }}</span>
              <span class="wlh-metric-mini-label">TASKS EXECUTED</span>
            </div>
          </div>
        </div>

        <!-- Col 2 -->
        <div class="wlh-metrics-col">
          <!-- Card 3: Equipment -->
          <div class="wlh-metric-mini-card">
            <div class="wlh-kpi-icon-wrap icon-equipment">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <div class="wlh-metric-mini-info">
              <span class="wlh-metric-mini-val">{{ metrics.equipmentCount }}</span>
              <span class="wlh-metric-mini-label">EQUIPMENT</span>
            </div>
          </div>

          <!-- Card 4: Inspections -->
          <div class="wlh-metric-mini-card">
            <div class="wlh-kpi-icon-wrap icon-inspections">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M9 15l2 2 4-4" />
              </svg>
            </div>
            <div class="wlh-metric-mini-info">
              <span class="wlh-metric-mini-val">{{ metrics.inspectionsCount }}</span>
              <span class="wlh-metric-mini-label">INSPECTIONS</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Search & Department Filter Stacked -->
      <div class="wlh-search-filter-stack">
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
          @click="archiveTodayFromActiveLog"
          title="Archive current Daily Work Log entries into today's history"
        >
          📥 Archive Today's Work Log
        </button>

        <button
          v-if="isToday"
          type="button"
          class="btn btn-outline-sm"
          @click="$emit('navigateDailyLog')"
        >
          Go to Daily Work Log
        </button>
      </div>
    </div>

    <!-- Loaded Group Section - Consolidated Single Card -->
    <div v-else class="card wlh-consolidated-card">
      <!-- Consolidated Card Header / Toolbar -->
      <div class="wlh-consolidated-header">
        <div class="wlh-ch-left">
          <h3 class="wlh-ch-title">Accomplishment Records</h3>
          <div class="wlh-ch-meta">
            <span class="wlh-ch-badge">{{ Object.keys(filteredGroups).length }} {{ Object.keys(filteredGroups).length === 1 ? 'Work Order' : 'Work Orders' }}</span>
            <span class="wlh-ch-badge muted">{{ metrics.tasksCount }} {{ metrics.tasksCount === 1 ? 'Task' : 'Tasks' }}</span>
          </div>
        </div>

        <div class="wlh-ch-right">
          <button
            type="button"
            class="btn btn-outline-sm wlh-btn-toggle-all"
            @click="toggleAllGroups"
            :title="areAllExpanded ? 'Collapse all work order groups' : 'Expand all work order groups'"
          >
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              :style="{
                transform: areAllExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
            <span>{{ areAllExpanded ? 'Collapse All' : 'Expand All' }}</span>
          </button>
        </div>
      </div>

      <!-- Single Card Body: Accordion Groups -->
      <div class="wlh-consolidated-body">
        <div
          v-for="(items, groupKey) in filteredGroups"
          :key="groupKey"
          class="wlh-group-accordion-item"
        >
          <!-- Modern Structured Clickable Group Card Header -->
          <div
            class="wlh-group-header-card"
            :class="{
              'is-collapsed': isGroupCollapsed(groupKey),
              'is-all-completed': getGroupProgress(items).isAllCompleted
            }"
            @click="toggleGroup(groupKey)"
            role="button"
            tabindex="0"
            :title="isGroupCollapsed(groupKey) ? 'Click to expand group' : 'Click to collapse group'"
          >
            <!-- Top Row: Work Order Badge, Facility Header, Status Badge & Chevron -->
            <div class="wlh-gh-top-row">
              <div class="wlh-gh-main-info">
                <!-- WO Ticket Identifier Badge -->
                <span class="wlh-wo-ticket-badge" @click.stop title="Work Order Identifier">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <line x1="7" y1="8" x2="17" y2="8" />
                    <line x1="7" y1="12" x2="13" y2="12" />
                    <line x1="7" y1="16" x2="10" y2="16" />
                  </svg>
                  <span>#{{ items[0]?.workOrderNumber }}</span>
                </span>

                <!-- Facility Title with Building Icon -->
                <div class="wlh-gh-facility-header">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" class="wlh-facility-icon">
                    <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                  </svg>
                  <span class="wlh-group-title">{{ items[0]?.groupTitle || groupKey }}</span>
                </div>
              </div>

              <!-- Top Right: Status Badge & Chevron Button -->
              <div class="wlh-gh-actions">
                <span
                  class="wlh-group-status-pill"
                  :class="getGroupProgress(items).isAllCompleted ? 'status-all-completed' : 'status-in-progress'"
                >
                  <svg v-if="getGroupProgress(items).isAllCompleted" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span v-else class="wlh-pulse-dot"></span>
                  <span>{{ getGroupProgress(items).isAllCompleted ? 'Completed' : 'In Progress' }}</span>
                  <span class="wlh-status-count">({{ getGroupProgress(items).completed }}/{{ items.length }})</span>
                </span>

                <button
                  type="button"
                  class="wlh-accordion-trigger-btn"
                  :class="{ 'is-rotated': !isGroupCollapsed(groupKey) }"
                  aria-label="Toggle group details"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Bottom Row: Category Breadcrumbs, Lead Person & Task Count -->
            <div class="wlh-gh-bottom-row">
              <div class="wlh-gh-meta-left">
                <!-- Category Breadcrumbs Trail -->
                <div v-if="formatSubPathTags(items[0]?.groupSubTitle).length" class="wlh-breadcrumb-trail">
                  <span
                    v-for="(tag, tIdx) in formatSubPathTags(items[0]?.groupSubTitle)"
                    :key="tIdx"
                    class="wlh-crumb-item"
                  >
                    <span class="wlh-crumb-text">{{ tag }}</span>
                    <span v-if="tIdx < formatSubPathTags(items[0]?.groupSubTitle).length - 1" class="wlh-crumb-sep">›</span>
                  </span>
                </div>
                <span v-else class="wlh-crumb-default">General Maintenance</span>
              </div>

              <div class="wlh-gh-meta-right" @click.stop>
                <!-- Assigned Lead Pill -->
                <div v-if="items[0]?.assignedLead" class="wlh-lead-badge">
                  <div class="wlh-lead-avatar">
                    {{ getInitials(items[0].assignedLead) }}
                  </div>
                  <span class="wlh-lead-text">Lead: <strong>{{ items[0].assignedLead }}</strong></span>
                </div>

                <!-- Total Tasks Indicator -->
                <span class="wlh-tasks-total-pill">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  <span>{{ items.length }} {{ items.length === 1 ? 'Task' : 'Tasks' }}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Collapsible Tasks Panel -->
          <div v-show="!isGroupCollapsed(groupKey)" class="wlh-tasks-panel">
            <!-- Compact Table Column Headers -->
            <div class="wlh-tasks-table-header">
              <span class="wlh-th-cell th-task">Activity & Description</span>
              <span class="wlh-th-cell th-dates">Timeline</span>
              <span class="wlh-th-cell th-staff">Personnel</span>
              <span class="wlh-th-cell th-eq">Equipment</span>
              <span class="wlh-th-cell th-actions">Remarks & Inspections</span>
            </div>

            <!-- Task Accomplishment Items Table/List -->
            <div class="wlh-task-list">
              <div
                v-for="(task, taskIdx) in items"
                :key="task.id || taskIdx"
                class="wlh-task-row"
              >
                <!-- Task Main: Work Type Badge, Status, Description -->
                <div class="wlh-task-main">
                  <div class="wlh-task-main-header">
                    <div class="wlh-task-type-badge" :style="getActivityTypeStyle(task.workType)">
                      {{ task.workType || 'Maintenance' }}
                    </div>
                    <div class="wlh-task-status-wrap">
                      <span
                        :class="['wlh-status-pill', isTaskCompleted(task) ? 'status-completed' : 'status-inprogress']"
                      >
                        <svg v-if="isTaskCompleted(task)" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5">
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
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
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
                  <span v-else class="wlh-none-muted">—</span>
                </div>

                <!-- Equipment Used -->
                <div class="wlh-task-meta-cell">
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
                  <span v-else class="wlh-none-muted">—</span>
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
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
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
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
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
              :disabled="!cell.isCurrentMonth || (cell.isFuture && !cell.isHeld)"
              :class="[
                'wlh-cal-day-cell',
                {
                  'is-selected': cell.dateString === selectedDate,
                  'is-today': cell.dateString === todayDateString,
                  'is-held-cell': cell.isHeld,
                  'has-snapshot': cell.hasSnapshot,
                  'other-month': !cell.isCurrentMonth,
                  'is-future': cell.isFuture
                }
              ]"
              :title="cell.isHeld ? `On Hold: ${cell.holdReason}` : (cell.hasSnapshot ? 'Has saved log' : cell.dateString)"
              @click="handleSelectCalendarDay(cell.dateString)"
            >
              <span>{{ cell.dayNumber }}</span>
              <span v-if="cell.isHeld" class="wlh-cal-hold-badge">HOLD</span>
              <span v-else-if="cell.hasSnapshot" class="wlh-cal-dot" title="Has saved log"></span>
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

    <!-- General Hold Modal -->
    <HoldDateModal
      :is-open="isHoldModalOpen"
      :target-date="selectedDate"
      :initial-reason="selectedDateHold.reason"
      :initial-is-held="selectedDateHold.isHeld"
      @close="isHoldModalOpen = false"
      @save="handleSaveDateHold"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { WorkOrder, Person, Team, CatalogItem, DailyWorkLogEntry, InspectionPhoto, DateHoldRecord } from '../types';
import {
  getSnapshotDates,
  getSnapshotByDate,
  updateSnapshot,
  saveSnapshot,
  formatLocalDate,
  isDateHeld,
  saveDateHold,
  SnapshotSummary
} from '../services/workLogHistoryService';
import HoldDateModal from '../components/modals/HoldDateModal.vue';

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

// Hold Modal State & Logic
const isHoldModalOpen = ref<boolean>(false);
const holdDatesVersion = ref<number>(0);

const openHoldModal = () => {
  isHoldModalOpen.value = true;
};

// Dates setup
const todayDateString = formatLocalDate(new Date());
const yesterdayDateString = formatLocalDate(new Date(Date.now() - 86400000));

const selectedDate = ref<string>(todayDateString);

const selectedDateHold = computed(() => {
  holdDatesVersion.value;
  return isDateHeld(selectedDate.value);
});

const handleSaveDateHold = async (record: DateHoldRecord) => {
  await saveDateHold(record);
  holdDatesVersion.value++;
  emit(
    'toast',
    record.isHeld
      ? `✓ Date hold recorded for ${record.date} (${record.reason})`
      : `✓ Date hold removed for ${record.date}`,
    'success'
  );
};

const availableSnapshots = ref<SnapshotSummary[]>([]);
const currentEntries = ref<DailyWorkLogEntry[]>([]);
const isEditMode = ref<boolean>(false);
const searchQuery = ref<string>('');
const selectedDepartmentFilter = ref<string>('');
const originalEntriesBackup = ref<string>('');

// Collapsible groups state - collapsed by default
const expandedGroups = ref<Record<string, boolean>>({});

const isGroupCollapsed = (groupKey: string) => {
  return !expandedGroups.value[groupKey];
};

const toggleGroup = (groupKey: string) => {
  expandedGroups.value[groupKey] = !expandedGroups.value[groupKey];
};

const areAllExpanded = computed(() => {
  const keys = Object.keys(filteredGroups.value);
  return keys.length > 0 && keys.every((k) => !!expandedGroups.value[k]);
});

const toggleAllGroups = () => {
  const keys = Object.keys(filteredGroups.value);
  if (areAllExpanded.value) {
    expandedGroups.value = {};
  } else {
    const next: Record<string, boolean> = {};
    keys.forEach((k) => {
      next[k] = true;
    });
    expandedGroups.value = next;
  }
};

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
  const nextDateStr = formatLocalDate(cur);
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

const archiveTodayFromActiveLog = async () => {
  const holdInfo = isDateHeld(todayDateString);
  if (holdInfo.isHeld) {
    emit('toast', `Today is marked on Hold (${holdInfo.reason}). Daily work log archiving is suspended.`, 'warning');
    return;
  }
  try {
    const cached = localStorage.getItem('infra_daily_work_logs_v3');
    if (cached) {
      const parsed: DailyWorkLogEntry[] = JSON.parse(cached);
      const eligible = parsed.filter((e) => !e.isOnHold);
      if (eligible.length > 0) {
        await saveSnapshot(todayDateString, eligible, false);
        availableSnapshots.value = await getSnapshotDates();
        await loadSnapshotForDate(todayDateString);
        emit('toast', `✓ Current work log archived into history for ${todayDateString}!`, 'success');
        return;
      }
    }
    emit('navigateDailyLog');
  } catch (err) {
    emit('navigateDailyLog');
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
  const maxFuture = new Date();
  maxFuture.setMonth(maxFuture.getMonth() + 6);
  const v = calendarViewDate.value;
  return v.getFullYear() > maxFuture.getFullYear() || (v.getFullYear() === maxFuture.getFullYear() && v.getMonth() >= maxFuture.getMonth());
});

const changeCalendarMonth = (delta: number) => {
  const v = new Date(calendarViewDate.value);
  v.setMonth(v.getMonth() + delta);
  calendarViewDate.value = v;
};

const calendarDays = computed(() => {
  holdDatesVersion.value; // reactive dependency on hold updates
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
    const dateStr = formatLocalDate(prevDate);
    const holdInfo = isDateHeld(dateStr);
    cells.push({
      dayNumber: day,
      dateString: dateStr,
      isCurrentMonth: false,
      isFuture: dateStr > todayDateString,
      isHeld: holdInfo.isHeld,
      holdReason: holdInfo.reason,
      hasSnapshot: snapshotDatesSet.has(dateStr)
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(viewYear, viewMonth, d);
    const dateStr = formatLocalDate(curDate);
    const holdInfo = isDateHeld(dateStr);
    cells.push({
      dayNumber: d,
      dateString: dateStr,
      isCurrentMonth: true,
      isFuture: dateStr > todayDateString,
      isHeld: holdInfo.isHeld,
      holdReason: holdInfo.reason,
      hasSnapshot: snapshotDatesSet.has(dateStr)
    });
  }

  // Next month filler
  const remaining = 42 - cells.length;
  for (let n = 1; n <= remaining; n++) {
    const nextDate = new Date(viewYear, viewMonth + 1, n);
    const dateStr = formatLocalDate(nextDate);
    const holdInfo = isDateHeld(dateStr);
    cells.push({
      dayNumber: n,
      dateString: dateStr,
      isCurrentMonth: false,
      isFuture: dateStr > todayDateString,
      isHeld: holdInfo.isHeld,
      holdReason: holdInfo.reason,
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

const formatSubPathTags = (subTitle?: string): string[] => {
  if (!subTitle) return [];
  return subTitle
    .split(/[-•]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      if (s === s.toUpperCase() && s.length > 2) {
        return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
      }
      return s;
    });
};

const getGroupProgress = (items: DailyWorkLogEntry[]) => {
  if (!items || items.length === 0) return { completed: 0, total: 0, isAllCompleted: false };
  const completed = items.filter((t) => isTaskCompleted(t)).length;
  return {
    completed,
    total: items.length,
    isAllCompleted: completed === items.length && items.length > 0
  };
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

      <${'script'}>
        window.onload = function() { window.print(); }
      <${'/script'}>
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

<style scoped src="../styles/work-log-history.css"></style>
