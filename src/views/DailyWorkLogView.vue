<template>
  <section id="view-daily-work-log" :class="['view-section', 'active', 'dwl-spec-canvas', { 'has-open-drawer': activeDrawer }]" style="display: flex">
    <!-- Standard View Header Row -->
    <div class="view-header-row">
      <div>
        <h1 class="view-main-title">Daily Work Log</h1>
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px; flex-wrap: wrap">
          <p class="view-main-subtitle" style="margin: 0">
            Daily accomplishment records, task execution, and progress tracking across active work orders.
          </p>
        </div>
      </div>
    </div>

    <!-- Sub-View Navigation Tabs & Action Bar -->
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
          class="module-tab-btn active"
          title="Daily Work Log"
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
          class="module-tab-btn"
          @click="$emit('navigateHistory')"
          title="Switch to Work Log History"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Work Log History</span>
        </button>
      </div>

      <!-- Right: Action Buttons (Date Badge, Save Progress, Export PDF) -->
      <div class="module-utility-actions">
        <!-- Standard Date Badge -->
        <div class="date-badge" title="Current Date">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span class="date-badge-label">Today</span>
          <span class="date-badge-separator">•</span>
          <span class="date-badge-value">{{ currentDateFormatted }}</span>
        </div>

        <button class="btn btn-outline-sm" @click="handleExportPDF" style="height: 36px">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
        </button>

        <button
          class="btn btn-primary-sm"
          @click="handleSaveAllProgress"
          style="height: 36px"
          :title="saveStatusText"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>Save All Progress</span>
        </button>
      </div>
    </div>

    <!-- Group Section Cards -->
    <div v-if="orderedGroups.length === 0" class="dwl-spec-empty">
      <p>No matching daily work log entries found.</p>
    </div>
    <template v-else>
        <div
          v-for="{ items, groupKey } in orderedGroups"
          :key="groupKey"
          :data-group-key="groupKey"
          class="dwl-spec-group-card"
          :class="{
            'group-dragging': draggedGroupKey === groupKey,
            'group-drag-over': dragOverGroupKey === groupKey && draggedGroupKey !== groupKey
          }"
          @dragover.prevent="handleGroupDragOver($event, String(groupKey))"
          @drop.prevent="handleGroupDrop($event, String(groupKey))"
        >
          <!-- Group Header -->
          <div
            class="dwl-spec-gh"
            @click="handleToggleGroup(String(groupKey))"
          >
            <!-- Normal Header State -->
            <template v-if="editingGroupKey !== groupKey">
              <div class="dwl-spec-gh-left">
                <!-- Draggable Handle Icon for Card -->
                <div
                  class="dwl-spec-drag-grid"
                  draggable="true"
                  @dragstart.stop="handleGroupDragStart($event, String(groupKey))"
                  @dragend="handleGroupDragEnd"
                  @click.stop
                  title="Drag to reorder card"
                >:::</div>
                <div class="dwl-spec-gh-text">
                  <div class="dwl-gh-title-row">
                    <h3 class="dwl-spec-gh-title">{{ items[0]?.requestingOffice || items[0]?.groupTitle || 'REQUESTING OFFICE' }}</h3>
                    <!-- Edit Button: Redirects to Work Order Edit Page -->
                    <button
                      class="dwl-spec-gh-edit-btn"
                      @click.stop="handleEditWorkOrderRedirect(items[0]?.workOrderNumber || '')"
                      @dragstart.stop
                      title="Edit General Information"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                  </div>
                  <span class="dwl-spec-gh-sub">{{ items[0]?.workTitle || items[0]?.groupSubTitle || 'Maintenance Work' }}</span>
                </div>
              </div>

              <div class="dwl-spec-gh-right" @dragstart.stop @click.stop>
                <div class="dwl-spec-wo-info">
                  <span class="dwl-spec-wo-label">Work Order Number</span>
                  <span class="dwl-spec-wo-val">{{ items[0]?.workOrderNumber || 'WO-2023-0000' }}</span>
                </div>

                <div class="dwl-spec-cat-dropdown" title="Assign Work Group Registry">
                  <select
                    class="dwl-spec-cat-select"
                    :class="{ 'is-unassigned': !items[0]?.category || items[0]?.category === '-' }"
                    :value="items[0]?.category && items[0]?.category !== '-' ? items[0]?.category : ''"
                    @change="handleGroupWorkGroupChange(items[0]?.workOrderNumber, items[0]?.groupTitle, ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="">Select Work Group</option>
                    <option v-for="wg in availableWorkGroups" :key="wg" :value="wg">
                      {{ wg }}
                    </option>
                    <option value="__ADD_NEW__" style="font-weight: 600; color: #006c49">+ Add New Work Group...</option>
                  </select>
                </div>

                <!-- Dropdown Chevron Toggle Icon Moved to Right Side Corner -->
                <button
                  class="dwl-spec-gh-toggle"
                  @click.stop="handleToggleGroup(String(groupKey))"
                  :title="isGroupExpanded(String(groupKey)) ? 'Collapse Scope of Work' : 'Expand Scope of Work'"
                  aria-label="Toggle Scope of Work"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="#6C7A71"
                    stroke-width="2.5"
                    :style="{
                      transform: isGroupExpanded(String(groupKey)) ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
            </template>

            <!-- Inline Editing Header State -->
            <template v-else>
              <div class="dwl-gh-inline-edit-form" @dragstart.stop>
                <div class="dwl-gh-edit-row">
                  <div class="dwl-gh-edit-field">
                    <label>Requesting Office</label>
                    <input type="text" v-model="tempGroupTitle" class="dwl-gh-input bold" placeholder="Requesting Office" />
                  </div>
                  <div class="dwl-gh-edit-field">
                    <label>Work Title</label>
                    <input type="text" v-model="tempGroupSubTitle" class="dwl-gh-input" placeholder="Work Title" />
                  </div>
                  <div class="dwl-gh-edit-field small">
                    <label>Work Order #</label>
                    <input type="text" v-model="tempWorkOrderNumber" class="dwl-gh-input mono" placeholder="WO-0000" />
                  </div>
                  <div class="dwl-gh-edit-field small">
                    <label>Category</label>
                    <select
                      v-model="tempCategory"
                      class="dwl-gh-input dwl-gh-select"
                      @change="handleTempCategoryChange(($event.target as HTMLSelectElement).value)"
                    >
                      <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
                      <option value="__ADD_NEW__" style="font-weight: 600; color: #006c49">+ Add New Category...</option>
                    </select>
                  </div>
                </div>

                <div class="dwl-gh-edit-actions">
                  <button class="btn-gh-save" @click="saveEditGroup(String(groupKey))">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Save</span>
                  </button>
                  <button class="btn-gh-cancel" @click="cancelEditGroup">
                    Cancel
                  </button>
                </div>
              </div>
            </template>
          </div>

          <!-- Internal Card Table Column Headers -->
          <div v-if="isGroupExpanded(String(groupKey))" class="dwl-card-column-headers">
            <span class="col-hdr col-worktype">ACTIVITY TYPE</span>
            <span class="col-hdr col-desc">DESCRIPTION</span>
            <span class="col-hdr col-actions">REMARKS</span>
            <span class="col-hdr col-date">START DATE</span>
            <span class="col-hdr col-date">COMPLETION</span>
            <span class="col-hdr col-lead">ASSIGNED LEAD</span>
            <span class="col-hdr col-badge">PERSONNEL</span>
            <span class="col-hdr col-badge">TOOLS</span>
          </div>

          <!-- Group Rows (Bento Responsive Layout) -->
          <div v-if="isGroupExpanded(String(groupKey))" class="dwl-spec-rows">
            <div
              v-for="row in items"
              :key="row.id"
              class="dwl-spec-row"
              :class="{
                'row-dragging': draggedRowId === row.id,
                'row-drag-over': dragOverRowId === row.id,
                'is-row-on-hold': row.isOnHold
              }"
              @dragover.prevent="!row.isOnHold && handleRowDragOver($event, row.id)"
              @drop.prevent="!row.isOnHold && handleRowDrop($event, row.id)"
            >
              <div
                class="dwl-spec-row-drag"
                :draggable="!row.isOnHold"
                @dragstart.stop="!row.isOnHold && handleRowDragStart($event, row.id)"
                @dragend="handleRowDragEnd"
                :title="row.isOnHold ? 'Reordering disabled while on hold' : 'Drag to reorder scope item'"
              >::</div>

              <!-- Main Horizontal Row (Activity Type, Description, and Actions) -->
              <div class="dwl-spec-main-row">
                <!-- Activity Type Display (Read-Only) -->
                <div class="dwl-spec-worktype-box" @dragstart.stop>
                  <span class="bento-field-label">ACTIVITY TYPE</span>
                  <div class="dwl-spec-worktype-display" :title="row.workType">
                    <span v-if="row.workType && row.workType !== '-'" class="dwl-spec-worktype-pill">{{ row.workType }}</span>
                    <span v-else class="text-muted">-</span>
                  </div>
                </div>

                <!-- Task Description / Description Display (Read-Only) -->
                <div class="dwl-spec-desc-box" @dragstart.stop>
                  <span class="bento-field-label">DESCRIPTION</span>
                  <div class="dwl-spec-desc-display">
                    <span>{{ row.description && row.description !== '-' ? row.description : '-' }}</span>
                  </div>
                </div>

                <!-- Remarks / On-Hold Action Buttons -->
                <div class="dwl-spec-icons-cell" @dragstart.stop>
                  <span class="bento-field-label">ACTIONS</span>
                  <div class="dwl-actions-pill-group">
                    <button
                      :class="['dwl-spec-icon-btn', { 'has-data-green': (row.remarksList && row.remarksList.length > 0) || row.hasComments, 'is-btn-disabled': row.isOnHold }]"
                      :disabled="row.isOnHold"
                      @click="!row.isOnHold && handleOpenDrawer('remarks', row.id)"
                      :title="row.isOnHold ? 'Remarks locked while on hold' : 'Open Remarks & Notes Drawer'"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        :fill="(row.remarksList && row.remarksList.length > 0) || row.hasComments ? '#10B981' : 'none'"
                        :stroke="(row.remarksList && row.remarksList.length > 0) || row.hasComments ? '#006C49' : '#6C7A71'"
                        stroke-width="1.8"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>

                    <button
                      :class="['dwl-spec-icon-btn', 'on-hold-toggle-btn', { 'is-on-hold': row.isOnHold }]"
                      @click.stop="handleToggleOnHold(row.id)"
                      :title="row.isOnHold ? 'Work is On Hold — Click to Resume' : 'Click to put Work On Hold'"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        :fill="row.isOnHold ? '#BA1A1A' : 'none'"
                        :stroke="row.isOnHold ? '#BA1A1A' : '#6C7A71'"
                        stroke-width="2"
                      >
                        <circle cx="12" cy="12" r="8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Start Date (Empty by default unless inputted) -->
              <div class="dwl-spec-date-cell dwl-spec-date-start" :class="{ 'disabled-field': row.isOnHold }">
                <span class="bento-field-label">START DATE</span>
                <input
                  type="date"
                  class="dwl-spec-date-pill-input"
                  :value="row.startDate || ''"
                  :disabled="row.isOnHold"
                  @change="handleUpdateField(row.id, 'startDate', ($event.target as HTMLInputElement).value)"
                />
              </div>

              <!-- Completion Date (Empty by default unless inputted) -->
              <div class="dwl-spec-date-cell dwl-spec-date-completion" :class="{ 'disabled-field': row.isOnHold }">
                <span class="bento-field-label">COMPLETION</span>
                <input
                  type="date"
                  class="dwl-spec-date-pill-input"
                  :value="row.completionDate || ''"
                  :disabled="row.isOnHold"
                  @change="handleUpdateField(row.id, 'completionDate', ($event.target as HTMLInputElement).value)"
                />
              </div>

              <!-- Assigned Lead Select -->
              <div class="dwl-spec-assignment-cell" :class="{ 'disabled-field': row.isOnHold }">
                <span class="bento-field-label">LEAD</span>
                <select
                  class="dwl-spec-lead-select"
                  :value="row.assignedLead"
                  :disabled="row.isOnHold"
                  @change="handleUpdateField(row.id, 'assignedLead', ($event.target as HTMLSelectElement).value)"
                >
                  <option value="Leadman J. Carter">Leadman J. Carter</option>
                  <option value="Foreman R. Lee">Foreman R. Lee</option>
                  <option value="Foreman M. Garcia">Foreman M. Garcia</option>
                  <option value="Robert Chen">Robert Chen</option>
                  <option value="Sarah Jenkins">Sarah Jenkins</option>
                  <option value="Marcus Thorne">Marcus Thorne</option>
                  <option value="Elena Rodriguez">Elena Rodriguez</option>
                  <option v-for="p in personnel" :key="p.name" :value="p.name">{{ p.name }}</option>
                </select>
              </div>

              <!-- Personnel Badge (Shows exact live checked count & tooltip preview) -->
              <div
                class="dwl-spec-badge-cell dwl-spec-badge-personnel"
                :class="{ 'clickable-badge': !row.isOnHold, 'disabled-badge': row.isOnHold }"
                @click="!row.isOnHold && handleOpenDrawer('personnel', row.id)"
                :title="row.isOnHold ? 'Personnel locked while on hold' : (row.assignedPersonnel && row.assignedPersonnel.length > 0 ? `Assigned (${row.assignedPersonnel.length}): ${row.assignedPersonnel.join(', ')}` : 'Click to Assign Personnel in Drawer')"
              >
                <span class="bento-field-label">PERSONNEL</span>
                <div class="dwl-badge-inner">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#006C49" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span class="dwl-spec-badge-num">{{ (row.assignedPersonnel || []).length }}</span>
                </div>
              </div>

              <!-- Tools / Equipment Badge -->
              <div
                :class="['dwl-spec-badge-cell', 'dwl-spec-badge-tools', { 'clickable-badge': !row.isOnHold, 'disabled-badge': row.isOnHold, 'has-data-green': row.equipmentList && row.equipmentList.length > 0 }]"
                @click="!row.isOnHold && handleOpenDrawer('equipment', row.id)"
                :title="row.isOnHold ? 'Equipment locked while on hold' : (row.equipmentList && row.equipmentList.length > 0 ? `${row.equipmentList.length} equipment item(s) logged. Click to view.` : 'Click to log equipment used')"
              >
                <span class="bento-field-label">TOOLS</span>
                <div class="dwl-badge-inner">
                  <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    :stroke="row.equipmentList && row.equipmentList.length > 0 ? '#006C49' : '#0B1C30'"
                    stroke-width="2"
                  >
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                  <span class="dwl-spec-badge-num">{{ (row.equipmentList || []).length }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

    <!-- SIDE DRAWER 1: REMARKS AND NOTES -->
    <aside v-if="activeDrawer === 'remarks' && selectedRow" class="dwl-drawer dwl-remarks-drawer">
      <div class="dwl-drawer-header">
        <div class="dwl-dh-title">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#006C49" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h3>Remarks and Notes</h3>
        </div>
        <button class="dwl-drawer-close" @click="handleCloseDrawer">&times;</button>
      </div>

      <div class="dwl-drawer-body">
        <div v-for="note in (selectedRow.remarksList || [])" :key="note.id" class="dwl-note-card">
          <div class="dwl-nc-header">
            <span class="dwl-nc-time">{{ note.timestamp }}</span>
            <div class="dwl-nc-actions">
              <button
                class="dwl-nc-btn"
                :class="{ active: editingNoteId === note.id }"
                @click="editingNoteId = editingNoteId === note.id ? null : note.id"
                title="Edit Note"
              >
                ✏️
              </button>
              <button class="dwl-nc-btn" @click="handleDeleteRemarkNote(note.id)" title="Delete Note">
                🗑️
              </button>
            </div>
          </div>

          <div class="dwl-nc-textarea-wrapper">
            <textarea
              class="dwl-nc-textarea"
              :value="note.text"
              :readonly="editingNoteId !== null && editingNoteId !== note.id"
              @input="handleAutoResize($event); handleUpdateRemarkNoteText(note.id, ($event.target as HTMLTextAreaElement).value)"
              maxlength="500"
              placeholder="Type in remarks and notes..."
            />
            <span class="dwl-nc-counter">{{ note.text.length }}/500</span>
          </div>
        </div>

        <button class="dwl-btn-add-more" @click="handleAddRemarkNote">
          + Add more Remarks and Notes
        </button>
      </div>

      <div class="dwl-drawer-footer">
        <button class="dwl-btn-drawer-confirm" @click="handleCloseDrawer">
          💾 Save Remarks and Notes
        </button>
      </div>
    </aside>

    <!-- SIDE DRAWER 2: ASSIGN PERSONNEL -->
    <aside v-if="activeDrawer === 'personnel' && selectedRow" class="dwl-drawer dwl-personnel-drawer">
      <div class="dwl-drawer-header blue-bg">
        <div class="dwl-dh-title-col">
          <div style="display: flex; align-items: center; gap: 8px">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0B1C30" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <h3>Assign Personnel</h3>
          </div>
          <span class="dwl-dh-sub">Select team members for this task</span>
        </div>
        <button class="dwl-drawer-close" @click="handleCloseDrawer">&times;</button>
      </div>

      <div class="dwl-drawer-search-bar">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#6C7A71" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          class="dwl-drawer-search-input"
          placeholder="Search employees..."
          v-model="personnelSearch"
        />
      </div>

      <div class="dwl-drawer-body">
        <div class="dwl-staff-group">
          <div class="dwl-sg-header">
            <h4>{{ selectedRow.category || 'General Maintenance' }}</h4>
          </div>
          <div class="dwl-sg-list">
            <template v-for="p in personnel" :key="p.name">
              <div
                v-if="!personnelSearch || p.name.toLowerCase().includes(personnelSearch.toLowerCase())"
                :class="['dwl-staff-row', { checked: (selectedRow.assignedPersonnel || []).includes(p.name) }]"
                @click="handleTogglePersonnelStaff(p.name)"
              >
                <span class="dwl-staff-name">{{ p.name }} ({{ p.role }})</span>
                <div :class="['dwl-checkbox', { active: (selectedRow.assignedPersonnel || []).includes(p.name) }]">
                  <span v-if="(selectedRow.assignedPersonnel || []).includes(p.name)">✓</span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <div class="dwl-staff-group" style="margin-top: 20px">
          <div class="dwl-sg-header">
            <h4>Other Roster Personnel</h4>
          </div>
          <div class="dwl-sg-list">
            <template v-for="name in OTHER_EMPLOYEES_DEFAULT" :key="name">
              <div
                v-if="!personnelSearch || name.toLowerCase().includes(personnelSearch.toLowerCase())"
                :class="['dwl-staff-row', { checked: (selectedRow.assignedPersonnel || []).includes(name) }]"
                @click="handleTogglePersonnelStaff(name)"
              >
                <span class="dwl-staff-name">{{ name }}</span>
                <div :class="['dwl-checkbox', { active: (selectedRow.assignedPersonnel || []).includes(name) }]">
                  <span v-if="(selectedRow.assignedPersonnel || []).includes(name)">✓</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="dwl-drawer-footer">
        <button class="dwl-btn-drawer-confirm" @click="handleCloseDrawer">
          ✓ Confirm Assignment ({{ selectedRow.assignedPersonnel?.length || 0 }} selected)
        </button>
      </div>
    </aside>

    <!-- SIDE DRAWER 3: EQUIPMENT USED -->
    <aside v-if="activeDrawer === 'equipment' && selectedRow" class="dwl-drawer dwl-equipment-drawer">
      <div class="dwl-drawer-header">
        <div class="dwl-dh-title">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#006C49" stroke-width="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <h3>Equipment Used</h3>
        </div>
        <button class="dwl-drawer-close" @click="handleCloseDrawer">&times;</button>
      </div>

      <div class="dwl-drawer-body">
        <!-- In-Drawer Form for Adding Equipment with Name, Quantity, Borrower -->
        <div class="dwl-drawer-form-card">
          <h4 class="dwl-df-title">Log New Equipment</h4>
          <div class="dwl-df-grid">
            <!-- Optional Quick Select from Registered Equipment Catalog -->
            <div v-if="registeredEquipmentList.length > 0" class="dwl-df-field full dwl-eq-catalog-selector">
              <label>Select from Registered Equipment</label>
              <select
                class="dwl-eq-select"
                v-model="selectedCatalogEquipment"
                @change="handleSelectCatalogEquipment(($event.target as HTMLSelectElement).value)"
              >
                <option value="">Choose an equipment item...</option>
                <option v-for="eq in registeredEquipmentList" :key="eq.id" :value="eq.name">
                  🧰 {{ eq.name }} {{ eq.code ? `(${eq.code})` : '' }}
                </option>
              </select>
            </div>

            <div class="dwl-df-field full">
              <label>Name of the Equipment used</label>
              <input
                type="text"
                class="dwl-df-input"
                v-model="newEquipmentName"
                placeholder="e.g. Hydraulic Pipe Sealer, Industrial Ladder"
              />
            </div>
            <div class="dwl-df-field half">
              <label>Quantity</label>
              <input
                type="text"
                class="dwl-df-input"
                v-model="newEquipmentQuantity"
                placeholder="e.g. 1 Unit, 2 Sets"
              />
            </div>
            <div class="dwl-df-field half">
              <label>Borrower</label>
              <input
                type="text"
                class="dwl-df-input"
                v-model="newEquipmentBorrower"
                placeholder="e.g. Robert Chen"
              />
            </div>
            <div class="dwl-df-field full">
              <label>Notes / Remarks</label>
              <input
                type="text"
                class="dwl-df-input"
                v-model="newEquipmentNotes"
                placeholder="e.g. Returned after shift, condition good"
              />
            </div>
          </div>
          <button
            class="dwl-btn-add-more"
            @click="handleConfirmAddEquipment"
            :disabled="!newEquipmentName.trim()"
            style="margin-top: 10px"
          >
            + Add Equipment
          </button>
        </div>

        <div class="dwl-eq-list-header">
          <span>Logged Equipment Items ({{ (selectedRow.equipmentList || []).length }})</span>
        </div>

        <div
          v-for="item in (selectedRow.equipmentList || [])"
          :key="item.id"
          class="dwl-eq-card"
          @click="handleToggleEquipmentChecked(item.id)"
        >
          <div class="dwl-eq-info">
            <div class="dwl-eq-field">
              <span class="dwl-eq-label">NAME OF EQUIPMENT USED</span>
              <span class="dwl-eq-val bold">{{ item.name }}</span>
            </div>
            <div style="display: flex; gap: 24px; margin-top: 8px">
              <div class="dwl-eq-field">
                <span class="dwl-eq-label">QUANTITY</span>
                <span class="dwl-eq-val">{{ item.quantity }}</span>
              </div>
              <div class="dwl-eq-field">
                <span class="dwl-eq-label">BORROWER</span>
                <span class="dwl-eq-val">{{ item.borrower }}</span>
              </div>
            </div>
            <div v-if="item.notes" style="margin-top: 8px; font-size: 12px; color: var(--color-text-muted)">
              <strong>Notes:</strong> {{ item.notes }}
            </div>
          </div>

          <div :class="['dwl-checkbox', { active: item.checked }]">
            <span v-if="item.checked">✓</span>
          </div>
        </div>
      </div>

      <div class="dwl-drawer-footer">
        <button class="dwl-btn-drawer-confirm" @click="handleCloseDrawer">
          ✓ Confirm Equipment
        </button>
      </div>
    </aside>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { DailyWorkLogEntry, Person, WorkOrder, RemarkNote, EquipmentItem, Team, CatalogItem } from '../types';
import { saveSnapshot, formatLocalDate } from '../services/workLogHistoryService';

const props = withDefaults(
  defineProps<{
    personnel?: Person[];
    workOrders?: WorkOrder[];
    teams?: Team[];
    equipmentCatalog?: CatalogItem[];
  }>(),
  {
    personnel: () => [],
    workOrders: () => [],
    teams: () => [],
    equipmentCatalog: () => []
  }
);

const emit = defineEmits<{
  (e: 'selectOrder', code: string): void;
  (e: 'editOrder', code: string): void;
  (e: 'navigateOrders'): void;
  (e: 'navigateHistory'): void;
  (e: 'updateWorkgroup', code: string, workgroup: string): void;
  (e: 'toast', message: string, type?: 'info' | 'success' | 'warning'): void;
}>();

const DEFAULT_IMAGE_SPEC_LOGS: DailyWorkLogEntry[] = [
  {
    id: 'log-spec-1',
    groupTitle: 'PHYSICAL PLANT OFFICE',
    groupSubTitle: 'Air Conditioning & Ventilation Maintenance',
    workOrderNumber: 'WO-8492',
    category: 'General Maintenance',
    workType: 'HVAC',
    description: 'Check and replace air filters in Building A. Calibrate thermostats.',
    startDate: '2024-08-24',
    completionDate: '2024-08-26',
    assignedLead: 'Robert Chen',
    personnelCount: 4,
    assignedPersonnel: ['Robert Chen', 'Sarah Jenkins', 'Marcus Thorne', 'Elena Rodriguez'],
    inspectionsCount: 2,
    hasComments: true,
    isOnHold: false,
    remarksList: [
      {
        id: 'rem-1',
        timestamp: 'Aug 24, 2024 • 09:15 AM',
        text: 'Building A air filters were heavily clogged. Recommended increasing inspection frequency during pollen season.'
      }
    ],
    equipmentList: [
      {
        id: 'eq-1',
        name: 'Industrial Air Filter Kit',
        quantity: '12 Units',
        borrower: 'Robert Chen',
        checked: true
      }
    ]
  },
  {
    id: 'log-spec-2',
    groupTitle: 'STUDENT HOUSING DORM',
    groupSubTitle: 'Plumbing & Waterproofing Repair',
    workOrderNumber: 'WO-9104',
    category: 'Plumbing & Repairs',
    workType: 'Plumbing',
    description: 'Waterproofing repair on cracks, replace sealing membranes, check drainage pipes.',
    startDate: '2024-08-25',
    completionDate: '2024-08-28',
    assignedLead: 'Sarah Jenkins',
    personnelCount: 3,
    assignedPersonnel: ['Sarah Jenkins', 'John Doe', 'Alice Williams'],
    inspectionsCount: 1,
    hasComments: false,
    isOnHold: false,
    remarksList: [],
    equipmentList: [
      {
        id: 'eq-2',
        name: 'Hydraulic Pipe Sealer',
        quantity: '1 Unit',
        borrower: 'Sarah Jenkins',
        checked: true
      }
    ]
  }
];

const OTHER_EMPLOYEES_DEFAULT = [
  'Michael Chen',
  'Emily Davis',
  'David Miller',
  'James Wilson',
  'Linda Thompson',
  'Christopher Lee',
  'Patricia Garcia',
  'Richard Martinez',
  'Susan Robinson'
];

const LOGS_STORAGE_KEY_V3 = 'infra_daily_work_logs_v3';

const DEFAULT_CATEGORIES = [
  'General Maintenance',
  'Building Repair & Maintenance',
  'Student Housing Repair & Maintenance',
  'Fabrication Workshop',
  'Administrative Office',
  'IT Infrastructure Department',
  'Plumbing & Repairs',
  'Electrical Systems',
  'HVAC Maintenance'
];

const loadSavedCategories = () => {
  try {
    const saved = localStorage.getItem('genso_custom_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
};

const categoryOptions = ref<string[]>(loadSavedCategories());

const getTodayDateStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const currentDateFormatted = computed(() => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

const logs = ref<DailyWorkLogEntry[]>([]);
const searchQuery = ref('');
const selectedDate = ref(getTodayDateStr());
const expandedGroups = ref<Record<string, boolean>>({});

const isGroupExpanded = (groupKey: string): boolean => {
  return Boolean(expandedGroups.value[groupKey]);
};

const saveStatusText = ref('Last auto-saved: 14:32:05 PM');

const activeDrawer = ref<'remarks' | 'personnel' | 'equipment' | null>(null);
const selectedRowId = ref<string | null>(null);
const personnelSearch = ref('');

// Group Header Inline Editing State
const editingGroupKey = ref<string | null>(null);
const tempGroupTitle = ref('');
const tempGroupSubTitle = ref('');
const tempWorkOrderNumber = ref('');
const tempCategory = ref('');

// Remarks & Notes Editing State
const editingNoteId = ref<string | null>(null);

// Equipment In-Drawer Form State
const newEquipmentName = ref('');
const newEquipmentQuantity = ref('1 Unit');
const newEquipmentBorrower = ref('');
const newEquipmentNotes = ref('');
const selectedCatalogEquipment = ref('');

const registeredEquipmentList = computed(() => {
  return (props.equipmentCatalog || []).filter((eq) => eq.isActive !== false);
});

const handleSelectCatalogEquipment = (val: string) => {
  if (!val) return;
  newEquipmentName.value = val;
  const match = registeredEquipmentList.value.find((e) => e.name === val);
  if (match && match.location) {
    newEquipmentNotes.value = `Storage: ${match.location}`;
  }
};

const availableWorkGroups = computed(() => {
  const customCats = categoryOptions.value;
  const teamNames = (props.teams || []).map((t) => t.name).filter(Boolean);
  const combined = Array.from(new Set([...customCats, ...teamNames]));
  return combined.filter((c) => c && c !== '-');
});

const handleGroupWorkGroupChange = (woNumber: string, groupTitle: string, val: string) => {
  if (val === '__ADD_NEW__') {
    const newCat = window.prompt('Enter new Work Group / Trade Registry:');
    if (newCat && newCat.trim()) {
      const trimmed = newCat.trim();
      if (!categoryOptions.value.includes(trimmed)) {
        categoryOptions.value.push(trimmed);
        try { localStorage.setItem('genso_custom_categories', JSON.stringify(categoryOptions.value)); } catch {}
      }
      applyWorkGroupToCard(woNumber, groupTitle, trimmed);
    }
  } else {
    applyWorkGroupToCard(woNumber, groupTitle, val);
  }
};

const applyWorkGroupToCard = (woNumber: string, groupTitle: string, workgroupVal: string) => {
  const updatedLogs = logs.value.map((log) => {
    if (log.workOrderNumber === woNumber || log.groupTitle === groupTitle) {
      return { ...log, category: workgroupVal };
    }
    return log;
  });
  saveLogs(updatedLogs);
  if (woNumber) {
    emit('updateWorkgroup', woNumber, workgroupVal);
  }
};

const handleUpdateGroupCategory = (groupTitle: string, val: string) => {
  handleGroupWorkGroupChange('', groupTitle, val);
};

const applyCategoryToGroup = (groupTitle: string, catVal: string) => {
  applyWorkGroupToCard('', groupTitle, catVal);
};

const handleTempCategoryChange = (val: string) => {
  if (val === '__ADD_NEW__') {
    const newCat = window.prompt('Enter new Category name:');
    if (newCat && newCat.trim()) {
      const trimmed = newCat.trim();
      if (!categoryOptions.value.includes(trimmed)) {
        categoryOptions.value.push(trimmed);
        try { localStorage.setItem('genso_custom_categories', JSON.stringify(categoryOptions.value)); } catch {}
      }
      tempCategory.value = trimmed;
    }
  }
};

const handleEditWorkOrderRedirect = (woNumber: string) => {
  if (!woNumber) return;
  const cleanWo = woNumber.replace(/[\s-]/g, '').toLowerCase();
  const matched = props.workOrders?.find((wo) => {
    const cleanCode = (wo.code || '').replace(/[\s-]/g, '').toLowerCase();
    return cleanCode === cleanWo || wo.code === woNumber || (wo.code && wo.code.toLowerCase().includes(cleanWo));
  });

  emit('editOrder', matched ? matched.code : woNumber);
};

const startEditGroup = (groupKey: string, items: DailyWorkLogEntry[]) => {
  editingGroupKey.value = groupKey;
  tempGroupTitle.value = items[0]?.requestingOffice || items[0]?.groupTitle || '';
  tempGroupSubTitle.value = items[0]?.workTitle || items[0]?.groupSubTitle || '';
  tempWorkOrderNumber.value = items[0]?.workOrderNumber || '';
  tempCategory.value = items[0]?.category || 'General Maintenance';
};

const saveEditGroup = (originalKey: string) => {
  const updatedLogs = logs.value.map((log) => {
    const key = log.workOrderNumber || log.id;
    if (key === originalKey) {
      return {
        ...log,
        groupTitle: tempGroupTitle.value.trim().toUpperCase() || log.groupTitle,
        requestingOffice: tempGroupTitle.value.trim() || log.requestingOffice,
        groupSubTitle: tempGroupSubTitle.value.trim() || log.groupSubTitle,
        workTitle: tempGroupSubTitle.value.trim() || log.workTitle,
        workOrderNumber: tempWorkOrderNumber.value.trim() || log.workOrderNumber,
        category: tempCategory.value.trim() || log.category
      };
    }
    return log;
  });

  saveLogs(updatedLogs);
  editingGroupKey.value = null;
  emit('toast', '✓ Work order card details updated', 'success');
};

const cancelEditGroup = () => {
  editingGroupKey.value = null;
};

const handleAutoResize = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  if (!target) return;
  target.style.height = 'auto';
  target.style.height = `${target.scrollHeight}px`;
};

const computeLogsFromWorkOrders = (orders: WorkOrder[]): DailyWorkLogEntry[] => {
  const savedOverrides: Record<string, Partial<DailyWorkLogEntry>> = {};
  try {
    const cached = localStorage.getItem(LOGS_STORAGE_KEY_V3);
    if (cached) {
      const parsed: DailyWorkLogEntry[] = JSON.parse(cached);
      parsed.forEach((item) => {
        savedOverrides[item.id] = {
          remarksList: item.remarksList,
          equipmentList: item.equipmentList,
          assignedPersonnel: item.assignedPersonnel,
          personnelCount: item.personnelCount,
          assignedLead: item.assignedLead,
          inspectionsCount: item.inspectionsCount,
          inspectionList: item.inspectionList,
          isOnHold: item.isOnHold,
          hasComments: item.hasComments,
          startDate: item.startDate,
          completionDate: item.completionDate,
          isUserSetStartDate: item.isUserSetStartDate,
          isUserSetCompletionDate: item.isUserSetCompletionDate,
          category: item.category,
        };
      });
    }
  } catch {}

  if (!orders || orders.length === 0) {
    return DEFAULT_IMAGE_SPEC_LOGS;
  }

  // Filter ONLY active orders - inactive orders will not reflect on Daily Work Log
  const activeOrders = orders.filter((order) => order.isActive !== false);
  if (activeOrders.length === 0) {
    return [];
  }

  const result: DailyWorkLogEntry[] = [];

  activeOrders.forEach((order) => {
    const rawTasks = order.tasks && order.tasks.length > 0 ? order.tasks : [];
    const validTasks = rawTasks.filter(
      (t) => (t.type && t.type.trim() !== '' && t.type.trim() !== '-') ||
             (t.remarks && t.remarks.trim() !== '' && t.remarks.trim() !== '-')
    );

    const taskList =
      validTasks.length > 0
        ? validTasks
        : [
            {
              type: (order.worktype && order.worktype !== '-') ? order.worktype : '',
              remarks: (order.scope && order.scope !== '-' && order.scope !== 'General Maintenance Scope') ? order.scope : (order.description && order.description !== '-' ? order.description : ''),
              startDate: order.startDate || '',
              endDate: order.endDate || ''
            }
          ];

    taskList.forEach((task, idx) => {
      if ((!task.type || task.type.trim() === '' || task.type === '-') &&
          (!task.remarks || task.remarks.trim() === '' || task.remarks === '-')) {
        return;
      }

      const logId = `log-${order.code}-${idx}`;
      const override = savedOverrides[logId] || {};

      const hasExplicitOrderAssigned = Boolean(order.assigned && order.assigned.length > 0);
      let assignedStaff: string[] = [];
      if (override.assignedPersonnel !== undefined) {
        // If override only contained the legacy auto-injected single foreman and order had no assigned personnel, clear to empty
        if (
          !hasExplicitOrderAssigned &&
          override.assignedPersonnel.length === 1 &&
          override.assignedPersonnel[0] === (order.foreman || 'Robert Chen') &&
          !(override as any).isUserAssignedPersonnel
        ) {
          assignedStaff = [];
        } else {
          assignedStaff = override.assignedPersonnel;
        }
      } else if (hasExplicitOrderAssigned) {
        assignedStaff = [...(order.assigned || [])];
      } else {
        assignedStaff = [];
      }

      const effectiveReqOffice =
        order.requestingOffice ||
        order.assetName ||
        override.requestingOffice ||
        'PHYSICAL PLANT OFFICE';
      const effectiveWorkTitle =
        order.workTitle ||
        order.scope ||
        override.workTitle ||
        'Facility Maintenance & Repair';

      // Start dates and completion dates MUST NOT be populated from order.dateReceived, order.startDate, or order.endDate.
      // They are only set if explicitly inputted here in the Daily Work Log.
      let effectiveStartDate = '';
      if (override.isUserSetStartDate && override.startDate) {
        effectiveStartDate = override.startDate;
      } else if (
        override.startDate &&
        override.startDate !== order.startDate &&
        override.startDate !== order.dateReceived
      ) {
        effectiveStartDate = override.startDate;
      }

      let effectiveCompletionDate = '';
      if (override.isUserSetCompletionDate && override.completionDate) {
        effectiveCompletionDate = override.completionDate;
      } else if (
        override.completionDate &&
        override.completionDate !== order.endDate &&
        override.completionDate !== order.dateReceived
      ) {
        effectiveCompletionDate = override.completionDate;
      }

      const effectiveInspectionList = override.inspectionList || [];

      result.push({
        id: logId,
        groupTitle: effectiveReqOffice.toUpperCase(),
        groupSubTitle: effectiveWorkTitle,
        requestingOffice: effectiveReqOffice,
        workTitle: effectiveWorkTitle,
        isActive: true,
        workOrderNumber: order.code,
        category: (order.workgroup && order.workgroup !== '-') ? order.workgroup : (override.category || ''),
        workType: task.type || order.worktype || 'General',
        description: task.remarks || order.scope || order.description || 'Facility Scope Task',
        startDate: effectiveStartDate,
        completionDate: effectiveCompletionDate,
        isUserSetStartDate: Boolean(override.isUserSetStartDate || (effectiveStartDate && override.startDate === effectiveStartDate)),
        isUserSetCompletionDate: Boolean(override.isUserSetCompletionDate || (effectiveCompletionDate && override.completionDate === effectiveCompletionDate)),
        assignedLead: override.assignedLead || order.foreman || 'Robert Chen',
        personnelCount: assignedStaff.length,
        assignedPersonnel: assignedStaff,
        inspectionsCount: effectiveInspectionList.length,
        inspectionList: effectiveInspectionList,
        hasComments:
          override.hasComments !== undefined
            ? override.hasComments
            : Boolean(override.remarksList && override.remarksList.length > 0),
        isOnHold: override.isOnHold || false,
        remarksList: override.remarksList || [],
        equipmentList: override.equipmentList || []
      });
    });
  });

  return result.filter(
    (item) => (item.workType && item.workType !== '-' && item.workType.trim() !== '') ||
              (item.description && item.description !== '-' && item.description.trim() !== '')
  );
};

watch(
  () => props.workOrders,
  (newOrders) => {
    const computedLogs = computeLogsFromWorkOrders(newOrders || []);
    logs.value = computedLogs;
    try {
      localStorage.setItem(LOGS_STORAGE_KEY_V3, JSON.stringify(computedLogs));
    } catch {}
  },
  { immediate: true, deep: true }
);

let autoSaveSnapshotTimer: ReturnType<typeof setTimeout> | null = null;
const saveLogs = (updated: DailyWorkLogEntry[]) => {
  logs.value = updated;
  localStorage.setItem(LOGS_STORAGE_KEY_V3, JSON.stringify(updated));
  const now = new Date().toLocaleTimeString();
  saveStatusText.value = `Last auto-saved: ${now}`;

  // Automatically sync to today's snapshot so history is continuously up to date
  if (autoSaveSnapshotTimer) clearTimeout(autoSaveSnapshotTimer);
  autoSaveSnapshotTimer = setTimeout(() => {
    const todayStr = formatLocalDate(new Date());
    const eligibleEntries = updated.filter((l) => !l.isOnHold);
    if (eligibleEntries.length > 0) {
      saveSnapshot(todayStr, eligibleEntries, true).catch(() => {});
    }
  }, 1200);
};

const draggedGroupKey = ref<string | null>(null);
const dragOverGroupKey = ref<string | null>(null);
const draggedRowId = ref<string | null>(null);
const dragOverRowId = ref<string | null>(null);

const GROUP_ORDER_KEY = 'infra_daily_work_logs_group_order_v1';

const loadSavedGroupOrder = (): string[] => {
  try {
    const saved = localStorage.getItem(GROUP_ORDER_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const savedGroupOrder = ref<string[]>(loadSavedGroupOrder());

// Group Drag and Drop
const handleGroupDragStart = (e: DragEvent, groupKey: string) => {
  if (draggedRowId.value) return;
  draggedGroupKey.value = groupKey;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `group:${groupKey}`);
  }
};

const handleGroupDragOver = (e: DragEvent, groupKey: string) => {
  if (draggedGroupKey.value && draggedGroupKey.value !== groupKey) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    dragOverGroupKey.value = groupKey;
  }
};

const handleGroupDrop = (e: DragEvent, targetGroupKey: string) => {
  e.preventDefault();
  if (draggedGroupKey.value && draggedGroupKey.value !== targetGroupKey) {
    const srcKey = draggedGroupKey.value;
    const groups: string[] = [];
    logs.value.forEach((l) => {
      const key = l.workOrderNumber || l.id;
      if (!groups.includes(key)) groups.push(key);
    });

    const srcIdx = groups.indexOf(srcKey);
    const targetIdx = groups.indexOf(targetGroupKey);
    if (srcIdx !== -1 && targetIdx !== -1) {
      groups.splice(srcIdx, 1);
      groups.splice(targetIdx, 0, srcKey);

      savedGroupOrder.value = [...groups];
      try {
        localStorage.setItem(GROUP_ORDER_KEY, JSON.stringify(groups));
      } catch {}

      const newLogs: DailyWorkLogEntry[] = [];
      groups.forEach((g) => {
        newLogs.push(...logs.value.filter((l) => (l.workOrderNumber || l.id) === g));
      });
      saveLogs(newLogs);
      emit('toast', '✓ Work order card reordered successfully', 'info');
    }
  }
  draggedGroupKey.value = null;
  dragOverGroupKey.value = null;
};

const handleGroupDragEnd = () => {
  draggedGroupKey.value = null;
  dragOverGroupKey.value = null;
};

// Row Drag and Drop
const handleRowDragStart = (e: DragEvent, rowId: string) => {
  e.stopPropagation();
  draggedRowId.value = rowId;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `row:${rowId}`);
  }
};

const handleRowDragOver = (e: DragEvent, rowId: string) => {
  if (draggedRowId.value && draggedRowId.value !== rowId) {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    dragOverRowId.value = rowId;
  }
};

const handleRowDrop = (e: DragEvent, targetRowId: string) => {
  e.preventDefault();
  e.stopPropagation();
  if (draggedRowId.value && draggedRowId.value !== targetRowId) {
    const srcIdx = logs.value.findIndex((l) => l.id === draggedRowId.value);
    const targetIdx = logs.value.findIndex((l) => l.id === targetRowId);
    if (srcIdx !== -1 && targetIdx !== -1) {
      const movedItem = { ...logs.value[srcIdx] };
      const newLogs = [...logs.value];
      newLogs.splice(srcIdx, 1);
      newLogs.splice(targetIdx, 0, movedItem);
      saveLogs(newLogs);
      emit('toast', '✓ Scope item reordered successfully', 'info');
    }
  }
  draggedRowId.value = null;
  dragOverRowId.value = null;
};

const handleRowDragEnd = () => {
  draggedRowId.value = null;
  dragOverRowId.value = null;
};

const handleToggleGroup = (title: string) => {
  expandedGroups.value[title] = !isGroupExpanded(title);
};

const handleUpdateField = (id: string, field: keyof DailyWorkLogEntry, value: any) => {
  const updated = logs.value.map((l) => {
    if (l.id === id) {
      const extra: Partial<DailyWorkLogEntry> = {};
      if (field === 'startDate') extra.isUserSetStartDate = true;
      if (field === 'completionDate') extra.isUserSetCompletionDate = true;
      return { ...l, [field]: value, ...extra };
    }
    return l;
  });
  saveLogs(updated);
};

const handleToggleOnHold = (id: string) => {
  const item = logs.value.find((l) => l.id === id);
  if (!item) return;
  const newOnHoldState = !item.isOnHold;
  handleUpdateField(id, 'isOnHold', newOnHoldState);

  // Immediately sync snapshot to exclude on-hold entries from Work Log History
  const todayStr = formatLocalDate(new Date());
  const updatedLogs = logs.value.map((l) => (l.id === id ? { ...l, isOnHold: newOnHoldState } : l));
  const eligibleEntries = updatedLogs.filter((l) => !l.isOnHold);
  saveSnapshot(todayStr, eligibleEntries, true).catch(() => {});
};

const handleOpenDrawer = (type: 'remarks' | 'personnel' | 'equipment', rowId: string) => {
  selectedRowId.value = rowId;
  activeDrawer.value = type;
  if (type === 'equipment' && selectedRow.value) {
    newEquipmentBorrower.value = selectedRow.value.assignedLead || 'Field Supervisor';
    newEquipmentName.value = '';
    newEquipmentQuantity.value = '1 Unit';
    newEquipmentNotes.value = '';
    selectedCatalogEquipment.value = '';
  }
};

const handleCloseDrawer = () => {
  if (activeDrawer.value === 'remarks') {
    emit('toast', '✓ Remarks and notes saved', 'success');
  } else if (activeDrawer.value === 'equipment') {
    emit('toast', '✓ Equipment assignments saved', 'success');
  } else if (activeDrawer.value === 'personnel') {
    emit('toast', '✓ Personnel assignments saved', 'success');
  }
  activeDrawer.value = null;
  selectedRowId.value = null;
  editingNoteId.value = null;
};

const selectedRow = computed(() => logs.value.find((l) => l.id === selectedRowId.value));

const handleAddRemarkNote = () => {
  if (!selectedRowId.value || !selectedRow.value) return;
  const now = new Date();
  const timeStr = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const newNote: RemarkNote = {
    id: `rem-${Date.now()}`,
    timestamp: timeStr,
    text: ''
  };

  const updatedRemarks = [...(selectedRow.value.remarksList || []), newNote];
  const updatedLogs = logs.value.map((l) =>
    l.id === selectedRowId.value ? { ...l, remarksList: updatedRemarks, hasComments: true } : l
  );
  saveLogs(updatedLogs);
  editingNoteId.value = newNote.id;
};

const handleUpdateRemarkNoteText = (noteId: string, text: string) => {
  if (!selectedRowId.value || !selectedRow.value) return;
  const textVal = text.length > 500 ? text.slice(0, 500) : text;

  const updatedRemarks = (selectedRow.value.remarksList || []).map((r) =>
    r.id === noteId ? { ...r, text: textVal } : r
  );
  const updatedLogs = logs.value.map((l) =>
    l.id === selectedRowId.value ? { ...l, remarksList: updatedRemarks } : l
  );
  saveLogs(updatedLogs);
};

const handleDeleteRemarkNote = (noteId: string) => {
  if (!selectedRowId.value || !selectedRow.value) return;
  const updatedRemarks = (selectedRow.value.remarksList || []).filter((r) => r.id !== noteId);
  const updatedLogs = logs.value.map((l) =>
    l.id === selectedRowId.value
      ? { ...l, remarksList: updatedRemarks, hasComments: updatedRemarks.length > 0 }
      : l
  );
  saveLogs(updatedLogs);
  if (editingNoteId.value === noteId) {
    editingNoteId.value = null;
  }
};

const handleTogglePersonnelStaff = (staffName: string) => {
  if (!selectedRowId.value || !selectedRow.value) return;
  const current = selectedRow.value.assignedPersonnel || [];
  let updatedStaff: string[] = [];

  if (current.includes(staffName)) {
    updatedStaff = current.filter((s) => s !== staffName);
  } else {
    updatedStaff = [...current, staffName];
  }

  const updatedLogs = logs.value.map((l) =>
    l.id === selectedRowId.value
      ? { ...l, assignedPersonnel: updatedStaff, personnelCount: updatedStaff.length, isUserAssignedPersonnel: true }
      : l
  );
  saveLogs(updatedLogs);
};

const handleToggleEquipmentChecked = (eqId: string) => {
  if (!selectedRowId.value || !selectedRow.value) return;
  const updatedEq = (selectedRow.value.equipmentList || []).map((e) =>
    e.id === eqId ? { ...e, checked: !e.checked } : e
  );
  const updatedLogs = logs.value.map((l) =>
    l.id === selectedRowId.value ? { ...l, equipmentList: updatedEq } : l
  );
  saveLogs(updatedLogs);
};

const handleConfirmAddEquipment = () => {
  if (!selectedRowId.value || !selectedRow.value || !newEquipmentName.value.trim()) return;

  const newItem: EquipmentItem = {
    id: `eq-${Date.now()}`,
    name: newEquipmentName.value.trim(),
    quantity: newEquipmentQuantity.value.trim() || '1 Unit',
    borrower: newEquipmentBorrower.value.trim() || selectedRow.value.assignedLead || 'Field Supervisor',
    checked: true,
    notes: newEquipmentNotes.value.trim() || undefined
  };

  const updatedEq = [...(selectedRow.value.equipmentList || []), newItem];
  const updatedLogs = logs.value.map((l) =>
    l.id === selectedRowId.value ? { ...l, equipmentList: updatedEq } : l
  );
  saveLogs(updatedLogs);

  // Reset form inputs
  newEquipmentName.value = '';
  newEquipmentQuantity.value = '1 Unit';
  newEquipmentNotes.value = '';
  selectedCatalogEquipment.value = '';
};

onMounted(() => {
  window.addEventListener('dragend', handleGroupDragEnd);
});

onUnmounted(() => {
  window.removeEventListener('dragend', handleGroupDragEnd);
});

const handleSaveAllProgress = async () => {
  saveLogs([...logs.value]);
  const todayStr = formatLocalDate(new Date());
  const eligibleEntries = logs.value.filter((l) => !l.isOnHold);
  try {
    const res = await saveSnapshot(todayStr, eligibleEntries, false);
    if (res.unchanged) {
      emit('toast', `ℹ Work Log is already up to date for ${todayStr}. No new changes detected.`, 'info');
    } else {
      emit('toast', `✓ All Daily Work Log progress, remarks, and equipment records have been saved for ${todayStr}!`, 'success');
    }
  } catch (err) {
    emit('toast', '✓ Work Log progress saved locally!', 'success');
  }
};

const handleExportPDF = () => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate PDF report.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Daily Work Log Report</title>
      <${'style'}>
        body { font-family: Arial, sans-serif; padding: 24px; color: #0B1C30; }
        h1 { color: #006C49; font-size: 24px; }
        .section { margin-bottom: 24px; border: 1px solid #BBCABF; border-radius: 8px; overflow: hidden; }
        .header { background: #EFF4FF; padding: 12px 16px; font-weight: bold; border-bottom: 1px solid #BBCABF; }
        .row { padding: 12px 16px; border-bottom: 1px solid #E2E8F0; }
        .row-title { font-weight: bold; margin-bottom: 4px; }
        .meta { font-size: 12px; color: #6C7A71; margin-bottom: 8px; }
        .box { background: #F8F9FF; padding: 8px 12px; border-radius: 4px; margin-top: 6px; font-size: 13px; }
        @media print { button { display: none; } }
      <\/${'style'}>
    </head>
    <body>
      <h1>DAILY WORK LOG REPORT</h1>
      <p><strong>Date:</strong> ${selectedDate.value} | <strong>Exported:</strong> ${new Date().toLocaleString()}</p>
      <hr />
      ${logs.value
        .map(
          (log) => `
        <div class="section">
          <div class="header">${log.groupTitle} - ${log.workOrderNumber} (${log.category})</div>
          <div class="row">
            <div class="row-title">[${log.workType}] ${log.description}</div>
            <div class="meta">
              Start: ${log.startDate || 'N/A'} | Completion: ${log.completionDate || 'N/A'} | Lead: ${log.assignedLead} | Staff Count: ${log.personnelCount}
            </div>
            
            <div class="box">
              <strong>Assigned Staff:</strong> ${(log.assignedPersonnel || []).join(', ') || 'None'}
            </div>

            ${
              (log.equipmentList || []).length > 0
                ? `
              <div class="box">
                <strong>Equipment Used:</strong>
                <ul>
                  ${log.equipmentList?.map((e) => `<li>${e.name} (${e.quantity}) - Borrower: ${e.borrower} ${e.checked ? '[Checked]' : ''}</li>`).join('')}
                </ul>
              </div>
            `
                : ''
            }

            ${
              (log.remarksList || []).length > 0
                ? `
              <div class="box">
                <strong>Remarks & Notes History:</strong>
                <ul>
                  ${log.remarksList?.map((r) => `<li><em>${r.timestamp}:</em> ${r.text}</li>`).join('')}
                </ul>
              </div>
            `
                : ''
            }

            ${
              (log.inspectionList || []).length > 0
                ? `
              <div class="box">
                <strong>Inspection Records (${log.inspectionList?.length}):</strong>
                <ul>
                  ${log.inspectionList
                    ?.map(
                      (insp) => `
                    <li>
                      <strong>[${insp.status}]</strong> Inspector: ${insp.inspector} (${insp.date})
                      ${insp.notes ? `<br><em>Headline:</em> ${insp.notes}` : ''}
                      ${insp.detailedNotes ? `<br><em>Detailed Observations:</em> ${insp.detailedNotes}` : ''}
                      ${insp.photos && insp.photos.length > 0 ? `<br><em>Attached Photos:</em> ${insp.photos.length} photo(s) captured` : ''}
                    </li>
                  `
                    )
                    .join('')}
                </ul>
              </div>
            `
                : ''
            }
          </div>
        </div>
      `
        )
        .join('')}
      <button onclick="window.print()" style="padding:10px 20px; background:#006C49; color:#fff; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">Print / Save as PDF</button>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

const filteredLogs = computed(() => {
  return logs.value.filter((l) => {
    if (l.isActive === false) return false;
    const q = searchQuery.value.toLowerCase();
    return (
      l.groupTitle.toLowerCase().includes(q) ||
      (l.groupSubTitle && l.groupSubTitle.toLowerCase().includes(q)) ||
      (l.workTitle && l.workTitle.toLowerCase().includes(q)) ||
      (l.requestingOffice && l.requestingOffice.toLowerCase().includes(q)) ||
      l.workOrderNumber.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.assignedLead.toLowerCase().includes(q) ||
      l.workType.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q)
    );
  });
});

const groupsMap = computed(() => {
  return filteredLogs.value.reduce((acc, log) => {
    const groupKey = log.workOrderNumber || log.id;
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(log);
    return acc;
  }, {} as Record<string, DailyWorkLogEntry[]>);
});

const orderedGroups = computed(() => {
  const map: Record<string, DailyWorkLogEntry[]> = {};
  filteredLogs.value.forEach((log) => {
    const key = log.workOrderNumber || log.id;
    if (!map[key]) map[key] = [];
    map[key].push(log);
  });

  const keys = Object.keys(map);
  const order = savedGroupOrder.value;
  keys.sort((a, b) => {
    const idxA = order.indexOf(a);
    const idxB = order.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  });

  return keys.map((key) => ({
    groupKey: key,
    items: map[key]
  }));
});
</script>
