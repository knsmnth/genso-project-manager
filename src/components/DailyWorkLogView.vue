<template>
  <div :class="['dwl-spec-canvas', { 'has-open-drawer': activeDrawer }]">
    <!-- Top Header Bar -->
    <header class="dwl-spec-header">
      <div class="dwl-spec-header-left">
        <h2 class="dwl-spec-title">Daily Work Log</h2>
        <span class="dwl-spec-divider">|</span>
        <div class="dwl-spec-date-pill">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#6C7A71" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <input
            type="text"
            class="dwl-spec-date-input"
            v-model="selectedDate"
          />
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#6C7A71" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      <div class="dwl-spec-header-right">
        <!-- Search Box -->
        <div class="dwl-spec-search-pill">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#6C7A71" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            class="dwl-spec-search-input"
            placeholder="Search logs..."
            v-model="searchQuery"
          />
        </div>

        <!-- Action Icons -->
        <button class="dwl-spec-action-icon" title="Notifications" @click="alert('Notifications active.')">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0B1C30" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span class="dwl-spec-dot"></span>
        </button>

        <button class="dwl-spec-action-icon" title="Settings" @click="alert('Settings menu.')">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0B1C30" stroke-width="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        <!-- User Profile Badge -->
        <div class="dwl-spec-user-profile">
          <div class="dwl-spec-avatar">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#006C49" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span class="dwl-spec-user-name">Admin. Sarah</span>
        </div>
      </div>
    </header>

    <!-- Main Page Content Area -->
    <div class="dwl-spec-content">
      <!-- Table Column Headers Bar -->
      <div class="dwl-spec-th-bar">
        <div class="dwl-spec-th-cell" style="width: 380px; padding-left: 40px">
          WORK REQUEST INFORMATION
        </div>
        <div class="dwl-spec-th-cell" style="width: 130px; justify-content: center">
          REMARKS / ON HOLD
        </div>
        <div class="dwl-spec-th-cell" style="width: 120px; justify-content: center">
          START DATE
        </div>
        <div class="dwl-spec-th-cell" style="width: 120px; justify-content: center">
          COMPLETION DATE
        </div>
        <div class="dwl-spec-th-cell" style="width: 190px">
          WORK ASSIGNMENT
        </div>
        <div class="dwl-spec-th-cell" style="width: 90px; justify-content: center">
          PERSONNEL
        </div>
        <div class="dwl-spec-th-cell" style="width: 70px; justify-content: center">
          TOOLS
        </div>
        <div class="dwl-spec-th-cell" style="width: 90px; justify-content: center">
          INSPECTIONS
        </div>
      </div>

      <!-- Group Section Cards -->
      <div v-if="Object.keys(groupsMap).length === 0" class="dwl-spec-empty">
        <p>No matching daily work log entries found.</p>
      </div>
      <template v-else>
        <div v-for="(items, groupTitle) in groupsMap" :key="groupTitle" class="dwl-spec-group-card">
          <!-- Group Header -->
          <div class="dwl-spec-gh">
            <div class="dwl-spec-gh-left">
              <span class="dwl-spec-drag-grid" title="Drag to reorder section">
                :::
              </span>
              <button
                class="dwl-spec-gh-toggle"
                @click="handleToggleGroup(String(groupTitle))"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="#6C7A71"
                  stroke-width="2.5"
                  :style="{
                    transform: collapsedGroups[groupTitle] ? 'rotate(-90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <div class="dwl-spec-gh-text">
                <h3 class="dwl-spec-gh-title">{{ groupTitle }}</h3>
                <span class="dwl-spec-gh-sub">{{ items[0]?.groupSubTitle || 'Maintenance Overview' }}</span>
              </div>
            </div>

            <div class="dwl-spec-gh-right">
              <div class="dwl-spec-wo-info">
                <span class="dwl-spec-wo-label">Work Order Number</span>
                <span class="dwl-spec-wo-val">{{ items[0]?.workOrderNumber || 'WO-2023-0000' }}</span>
              </div>

              <div class="dwl-spec-cat-dropdown">
                <span>{{ items[0]?.category || 'General Maintenance' }}</span>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#6C7A71" stroke-width="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Group Rows -->
          <div v-if="!collapsedGroups[groupTitle]" class="dwl-spec-rows">
            <div v-for="row in items" :key="row.id" class="dwl-spec-row">
              <div class="dwl-spec-row-drag" title="Drag row">::</div>

              <!-- Work Type Box -->
              <div class="dwl-spec-worktype-box">
                <input
                  type="text"
                  class="dwl-spec-worktype-input"
                  :value="row.workType"
                  @change="handleUpdateField(row.id, 'workType', ($event.target as HTMLInputElement).value)"
                />
              </div>

              <!-- Task Description Textarea -->
              <div class="dwl-spec-desc-box">
                <textarea
                  class="dwl-spec-desc-textarea"
                  :value="row.description"
                  @change="handleUpdateField(row.id, 'description', ($event.target as HTMLTextAreaElement).value)"
                  rows="2"
                />
              </div>

              <!-- Icons -->
              <div class="dwl-spec-icons-cell">
                <button
                  :class="['dwl-spec-icon-btn', { 'has-data-green': (row.remarksList && row.remarksList.length > 0) || row.hasComments }]"
                  @click="handleOpenDrawer('remarks', row.id)"
                  title="Open Remarks & Notes Drawer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    :fill="(row.remarksList && row.remarksList.length > 0) || row.hasComments ? '#10B981' : 'none'"
                    :stroke="(row.remarksList && row.remarksList.length > 0) || row.hasComments ? '#006C49' : '#6C7A71'"
                    stroke-width="1.8"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </button>

                <button
                  :class="['dwl-spec-icon-btn', { 'is-on-hold': row.isOnHold }]"
                  @click="handleToggleOnHold(row.id)"
                  title="Toggle On Hold"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    :fill="row.isOnHold ? '#BA1A1A' : 'none'"
                    :stroke="row.isOnHold ? '#BA1A1A' : '#6C7A71'"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="8" />
                  </svg>
                </button>
              </div>

              <!-- Dates -->
              <div class="dwl-spec-date-cell">
                <input
                  type="date"
                  class="dwl-spec-date-pill-input"
                  :value="row.startDate.includes('-') ? row.startDate : '2023-10-24'"
                  @change="handleUpdateField(row.id, 'startDate', ($event.target as HTMLInputElement).value)"
                />
              </div>

              <div class="dwl-spec-date-cell">
                <input
                  type="date"
                  class="dwl-spec-date-pill-input"
                  :value="row.completionDate.includes('-') ? row.completionDate : '2023-10-25'"
                  @change="handleUpdateField(row.id, 'completionDate', ($event.target as HTMLInputElement).value)"
                />
              </div>

              <!-- Lead Select -->
              <div class="dwl-spec-assignment-cell">
                <select
                  class="dwl-spec-lead-select"
                  :value="row.assignedLead"
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

              <!-- Personnel Badge -->
              <div
                class="dwl-spec-badge-cell clickable-badge"
                style="width: 90px"
                @click="handleOpenDrawer('personnel', row.id)"
                title="Click to Assign Personnel in Drawer"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#006C49" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span class="dwl-spec-badge-num">👤 {{ row.personnelCount }}</span>
              </div>

              <!-- Tools Badge -->
              <div
                :class="['dwl-spec-badge-cell', 'clickable-badge', { 'has-data-green': row.equipmentList && row.equipmentList.length > 0 }]"
                style="width: 70px"
                @click="handleOpenDrawer('equipment', row.id)"
                title="Click to View Equipment Used Drawer"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  :stroke="row.equipmentList && row.equipmentList.length > 0 ? '#006C49' : '#0B1C30'"
                  stroke-width="2"
                >
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>

              <!-- Inspections Count -->
              <div class="dwl-spec-badge-cell" style="width: 90px">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#0B1C30" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span class="dwl-spec-badge-num">📄 {{ row.inspectionsCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Bottom Save / Export Action Bar -->
      <div class="dwl-spec-bottom-bar">
        <div class="dwl-spec-bottom-left">
          <button class="dwl-spec-btn-save" @click="handleSaveAllProgress">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#FFFFFF" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span>Save All Progress</span>
          </button>

          <button class="dwl-spec-btn-export" @click="handleExportPDF">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#006C49" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            <span>Export PDF Log</span>
          </button>
        </div>

        <span class="dwl-spec-timestamp">{{ saveStatusText }}</span>
      </div>
    </div>

    <!-- Floating Action Button (FAB) -->
    <button
      class="dwl-spec-fab"
      title="Add New Daily Work Log Task"
      @click="showAddModal = true"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#FFFFFF" stroke-width="3">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>

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
              <button class="dwl-nc-btn" title="Edit Note">✏️</button>
              <button class="dwl-nc-btn" @click="handleDeleteRemarkNote(note.id)" title="Delete Note">🗑️</button>
            </div>
          </div>

          <div class="dwl-nc-textarea-wrapper">
            <textarea
              class="dwl-nc-textarea"
              :value="note.text"
              @input="handleUpdateRemarkNoteText(note.id, ($event.target as HTMLTextAreaElement).value)"
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
            <template v-for="name in ['John Doe', 'Jane Smith', 'Robert Wilson', 'Sarah Jenkins']" :key="name">
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

        <div class="dwl-staff-group" style="margin-top: 20px">
          <div class="dwl-sg-header">
            <h4>Other Personnels</h4>
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
          </div>

          <div :class="['dwl-checkbox', { active: item.checked }]">
            <span v-if="item.checked">✓</span>
          </div>
        </div>

        <button class="dwl-btn-add-more" @click="handleAddEquipmentItem">
          + Add more Equipment
        </button>
      </div>

      <div class="dwl-drawer-footer">
        <button class="dwl-btn-drawer-confirm" @click="handleCloseDrawer">
          ✓ Confirm Equipment
        </button>
      </div>
    </aside>

    <!-- Add New Entry Modal -->
    <div v-if="showAddModal" class="modal-overlay">
      <div class="modal-content" style="max-width: 520px">
        <div class="modal-header">
          <h3 class="modal-title">Add Daily Work Log Entry</h3>
          <button class="modal-close" @click="showAddModal = false">&times;</button>
        </div>
        <form @submit.prevent="handleAddLogSubmit">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px">
            <div class="form-group">
              <label class="form-label">Facility / Office Group Title</label>
              <input
                type="text"
                class="form-control"
                placeholder="e.g. PHYSICAL PLANT OFFICE"
                v-model="newGroupTitle"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Group Subtitle</label>
              <input
                type="text"
                class="form-control"
                placeholder="e.g. Air Conditioning & Ventilation Maintenance"
                v-model="newGroupSubTitle"
              />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
              <div class="form-group">
                <label class="form-label">Work Order Number</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="newWONumber"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-control" v-model="newCategory">
                  <option value="General Maintenance">General Maintenance</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
              <div class="form-group">
                <label class="form-label">Work Type</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="e.g. HVAC, Electric, Pipework"
                  v-model="newWorkType"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Assigned Lead</label>
                <select class="form-control" v-model="newLead">
                  <option value="Leadman J. Carter">Leadman J. Carter</option>
                  <option value="Foreman R. Lee">Foreman R. Lee</option>
                  <option value="Foreman M. Garcia">Foreman M. Garcia</option>
                  <option value="Robert Chen">Robert Chen</option>
                  <option value="Sarah Jenkins">Sarah Jenkins</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Task Description</label>
              <textarea
                class="form-control"
                rows="2"
                placeholder="Type task details..."
                v-model="newDesc"
                required
              />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px">
              <div class="form-group">
                <label class="form-label">Start Date</label>
                <input type="date" class="form-control" v-model="newStartDate" />
              </div>
              <div class="form-group">
                <label class="form-label">Completion</label>
                <input type="date" class="form-control" v-model="newCompDate" />
              </div>
              <div class="form-group">
                <label class="form-label">Personnel</label>
                <input type="number" class="form-control" v-model.number="newPersonnelCount" />
              </div>
              <div class="form-group">
                <label class="form-label">Inspections</label>
                <input type="number" class="form-control" v-model.number="newInspectionsCount" />
              </div>
            </div>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px">
            <button type="button" class="btn btn-outline" @click="showAddModal = false">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              Save Task Log
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { DailyWorkLogEntry, Person, WorkOrder, RemarkNote, EquipmentItem } from '../types';

const props = withDefaults(
  defineProps<{
    personnel?: Person[];
    workOrders?: WorkOrder[];
  }>(),
  {
    personnel: () => [],
    workOrders: () => []
  }
);

defineEmits<{
  (e: 'selectOrder', code: string): void;
  (e: 'createTask'): void;
}>();

const DEFAULT_IMAGE_SPEC_LOGS: DailyWorkLogEntry[] = [
  {
    id: 'log-spec-1',
    groupTitle: 'PHYSICAL PLANT OFFICE',
    groupSubTitle: 'Air Conditioning & Ventilation Maintenance',
    workOrderNumber: 'WO-2023-0492',
    category: 'General Maintenance',
    workType: 'HVAC',
    description: 'Check and replace air filters in Building A. Calibrate thermostats.',
    startDate: '2023-10-24',
    completionDate: '2023-10-25',
    assignedLead: 'Leadman J. Carter',
    personnelCount: 5,
    assignedPersonnel: ['John Doe', 'Jane Smith', 'Robert Wilson', 'Sarah Jenkins', 'Elena Rodriguez'],
    inspectionsCount: 2,
    hasComments: true,
    isOnHold: false,
    remarksList: [
      {
        id: 'rem-1',
        timestamp: 'Oct 24, 2023 • 09:15 AM',
        text: 'Building A air filters were heavily clogged. Recommended increasing inspection frequency to bi-monthly during pollen season.'
      },
      {
        id: 'rem-2',
        timestamp: 'Oct 24, 2023 • 11:30 AM',
        text: "Condenser fan motor in AC-04 is showing signs of bearing wear. Part ordered for next week's maintenance cycle."
      }
    ],
    equipmentList: [
      {
        id: 'eq-1',
        name: 'Industrial Air Filter Kit',
        quantity: '12 Units',
        borrower: 'Leadman J. Carter',
        checked: true
      },
      {
        id: 'eq-2',
        name: 'Digital Manometer',
        quantity: '1 Unit',
        borrower: 'Leadman J. Carter',
        checked: false
      }
    ]
  },
  {
    id: 'log-spec-2',
    groupTitle: 'PHYSICAL PLANT OFFICE',
    groupSubTitle: 'Air Conditioning & Ventilation Maintenance',
    workOrderNumber: 'WO-2023-0492',
    category: 'General Maintenance',
    workType: 'Electric',
    description: 'Testing condenser fan motors and replacing worn wiring in unit AC-04.',
    startDate: '2023-10-24',
    completionDate: '2023-10-24',
    assignedLead: 'Foreman R. Lee',
    personnelCount: 3,
    assignedPersonnel: ['Robert Wilson', 'Sarah Jenkins', 'David Kim'],
    inspectionsCount: 2,
    hasComments: false,
    isOnHold: false,
    remarksList: [],
    equipmentList: [
      {
        id: 'eq-3',
        name: 'Multimeter & Wire Crimper',
        quantity: '2 Sets',
        borrower: 'Foreman R. Lee',
        checked: true
      }
    ]
  },
  {
    id: 'log-spec-3',
    groupTitle: 'RESIDENCE HALL B',
    groupSubTitle: 'Plumbing Infrastructure Overhaul',
    workOrderNumber: 'WO-2023-0511',
    category: 'Civil Engineering',
    workType: 'Pipework',
    description: 'Repairing main leak in floor 3 riser. Pressure testing valves.',
    startDate: '2023-10-24',
    completionDate: '2023-10-26',
    assignedLead: 'Foreman M. Garcia',
    personnelCount: 4,
    assignedPersonnel: ['Michael Chen', 'Emily Davis', 'David Miller', 'James Wilson'],
    inspectionsCount: 1,
    hasComments: true,
    isOnHold: false,
    remarksList: [
      {
        id: 'rem-3',
        timestamp: 'Oct 24, 2023 • 02:45 PM',
        text: 'Main riser leak in Residence Hall B was more extensive than initially reported. Required additional copper fittings from central stock.'
      }
    ],
    equipmentList: [
      {
        id: 'eq-4',
        name: 'Hydraulic Pipe Cutter & Welder',
        quantity: '1 Set',
        borrower: 'Foreman M. Garcia',
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

const logs = ref<DailyWorkLogEntry[]>([]);
const searchQuery = ref('');
const selectedDate = ref('2023-10-24');
const collapsedGroups = ref<Record<string, boolean>>({});
const saveStatusText = ref('Last auto-saved: 14:32:05 PM');
const showAddModal = ref(false);

const activeDrawer = ref<'remarks' | 'personnel' | 'equipment' | null>(null);
const selectedRowId = ref<string | null>(null);
const personnelSearch = ref('');

const newGroupTitle = ref('PHYSICAL PLANT OFFICE');
const newGroupSubTitle = ref('General Facility Maintenance');
const newWONumber = ref('WO-2023-0899');
const newCategory = ref('General Maintenance');
const newWorkType = ref('HVAC');
const newDesc = ref('');
const newStartDate = ref('2023-10-24');
const newCompDate = ref('2023-10-25');
const newLead = ref('Leadman J. Carter');
const newPersonnelCount = ref(3);
const newInspectionsCount = ref(1);

onMounted(() => {
  const cached = localStorage.getItem(LOGS_STORAGE_KEY_V3);
  if (cached) {
    try {
      logs.value = JSON.parse(cached);
    } catch {
      logs.value = DEFAULT_IMAGE_SPEC_LOGS;
    }
  } else {
    logs.value = DEFAULT_IMAGE_SPEC_LOGS;
    localStorage.setItem(LOGS_STORAGE_KEY_V3, JSON.stringify(DEFAULT_IMAGE_SPEC_LOGS));
  }
});

const saveLogs = (updated: DailyWorkLogEntry[]) => {
  logs.value = updated;
  localStorage.setItem(LOGS_STORAGE_KEY_V3, JSON.stringify(updated));
  const now = new Date().toLocaleTimeString();
  saveStatusText.value = `Last auto-saved: ${now}`;
};

const handleToggleGroup = (title: string) => {
  collapsedGroups.value[title] = !collapsedGroups.value[title];
};

const handleUpdateField = (id: string, field: keyof DailyWorkLogEntry, value: any) => {
  const updated = logs.value.map((l) => (l.id === id ? { ...l, [field]: value } : l));
  saveLogs(updated);
};

const handleToggleOnHold = (id: string) => {
  const item = logs.value.find((l) => l.id === id);
  if (!item) return;
  handleUpdateField(id, 'isOnHold', !item.isOnHold);
};

const handleOpenDrawer = (type: 'remarks' | 'personnel' | 'equipment', rowId: string) => {
  selectedRowId.value = rowId;
  activeDrawer.value = type;
};

const handleCloseDrawer = () => {
  activeDrawer.value = null;
  selectedRowId.value = null;
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
      ? { ...l, assignedPersonnel: updatedStaff, personnelCount: updatedStaff.length }
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

const handleAddEquipmentItem = () => {
  if (!selectedRowId.value || !selectedRow.value) return;
  const name = window.prompt('Enter Equipment Name:');
  if (!name) return;
  const quantity = window.prompt('Enter Quantity (e.g. 2 Units):') || '1 Unit';

  const newItem: EquipmentItem = {
    id: `eq-${Date.now()}`,
    name,
    quantity,
    borrower: selectedRow.value.assignedLead || 'Field Supervisor',
    checked: true
  };

  const updatedEq = [...(selectedRow.value.equipmentList || []), newItem];
  const updatedLogs = logs.value.map((l) =>
    l.id === selectedRowId.value ? { ...l, equipmentList: updatedEq } : l
  );
  saveLogs(updatedLogs);
};

const handleSaveAllProgress = () => {
  saveLogs([...logs.value]);
  alert('All Daily Work Log progress, remarks, personnel assignments, and equipment records have been saved!');
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
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #0B1C30; }
        h1 { color: #006C49; font-size: 24px; }
        .section { margin-bottom: 24px; border: 1px solid #BBCABF; border-radius: 8px; overflow: hidden; }
        .header { background: #EFF4FF; padding: 12px 16px; font-weight: bold; border-bottom: 1px solid #BBCABF; }
        .row { padding: 12px 16px; border-bottom: 1px solid #E2E8F0; }
        .row-title { font-weight: bold; margin-bottom: 4px; }
        .meta { font-size: 12px; color: #6C7A71; margin-bottom: 8px; }
        .box { background: #F8F9FF; padding: 8px 12px; border-radius: 4px; margin-top: 6px; font-size: 13px; }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      <h1>DAILY WORK LOG REPORT</h1>
      <p><strong>Date:</strong> ${selectedDate.value} | <strong>Exported:</strong> ${new Date().toLocaleString()}</p>
      <hr />
      ${logs.value.map(log => `
        <div class="section">
          <div class="header">${log.groupTitle} - ${log.workOrderNumber} (${log.category})</div>
          <div class="row">
            <div class="row-title">[${log.workType}] ${log.description}</div>
            <div class="meta">
              Start: ${log.startDate} | Completion: ${log.completionDate} | Lead: ${log.assignedLead} | Staff Count: ${log.personnelCount}
            </div>
            
            <div class="box">
              <strong>Assigned Staff:</strong> ${(log.assignedPersonnel || []).join(', ') || 'None'}
            </div>

            ${(log.equipmentList || []).length > 0 ? `
              <div class="box">
                <strong>Equipment Used:</strong>
                <ul>
                  ${log.equipmentList?.map(e => `<li>${e.name} (${e.quantity}) - Borrower: ${e.borrower} ${e.checked ? '[Checked]' : ''}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            ${(log.remarksList || []).length > 0 ? `
              <div class="box">
                <strong>Remarks & Notes History:</strong>
                <ul>
                  ${log.remarksList?.map(r => `<li><em>${r.timestamp}:</em> ${r.text}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        </div>
      `).join('')}
      <button onclick="window.print()" style="padding:10px 20px; background:#006C49; color:#fff; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">Print / Save as PDF</button>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

const handleAddLogSubmit = () => {
  if (!newDesc.value.trim()) return;

  const newEntry: DailyWorkLogEntry = {
    id: `log-spec-${Date.now()}`,
    groupTitle: newGroupTitle.value.toUpperCase(),
    groupSubTitle: newGroupSubTitle.value,
    workOrderNumber: newWONumber.value,
    category: newCategory.value,
    workType: newWorkType.value,
    description: newDesc.value,
    startDate: newStartDate.value,
    completionDate: newCompDate.value,
    assignedLead: newLead.value,
    personnelCount: Number(newPersonnelCount.value) || 1,
    assignedPersonnel: [newLead.value],
    inspectionsCount: Number(newInspectionsCount.value) || 1,
    hasComments: false,
    isOnHold: false,
    remarksList: [],
    equipmentList: []
  };

  saveLogs([...logs.value, newEntry]);
  showAddModal.value = false;
  newDesc.value = '';
};

const filteredLogs = computed(() => {
  return logs.value.filter((l) => {
    const q = searchQuery.value.toLowerCase();
    return (
      l.groupTitle.toLowerCase().includes(q) ||
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
    const gTitle = log.groupTitle || 'PHYSICAL PLANT OFFICE';
    if (!acc[gTitle]) acc[gTitle] = [];
    acc[gTitle].push(log);
    return acc;
  }, {} as Record<string, DailyWorkLogEntry[]>);
});
</script>
