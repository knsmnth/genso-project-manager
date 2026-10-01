<template>
  <section id="view-create-order" :class="['view-section active create-order-container', { 'has-open-drawer': activeRemarksTaskIndex !== null }]">
    <!-- Breadcrumbs & Header Row -->
    <div class="create-order-header-row">
      <div class="create-order-title-group">
        <nav class="create-order-nav" aria-label="Breadcrumbs">
          <span class="create-order-nav-link" @click="$emit('cancel')">
            {{ returnView === 'dailyworklog' ? 'Daily Work Log' : 'Work Orders' }}
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
    </div>

    <!-- Main Form Content Container -->
    <form @submit.prevent="handleSubmit" style="display: flex; flex-direction: column; gap: 24px; width: 100%; max-width: 100%; box-sizing: border-box; align-items: stretch;">
      
      <!-- CARD 1: Work Order General Information -->
      <div class="modern-section-card">
        <div class="modern-card-header">
          <div class="modern-heading-group">
            <span class="modern-heading-bar"></span>
            <h3 class="modern-heading-text">Work Order General Information</h3>
          </div>
          <label :class="['modern-lock-badge', { locked: isLocked }]">
            <span class="modern-lock-text">{{ isLocked ? 'LOCKED' : 'LOCK/UNLOCK' }}</span>
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
            <div class="modern-row-order-date">
              <div :class="['modern-field-group', 'modern-code-field', { 'has-error': errors.code || isDuplicateCode }]">
                <div class="modern-code-label-row">
                  <label class="modern-field-label" for="codePrefix">WORK ORDER NUMBER</label>
                </div>
                <div class="modern-code-segmented-box" :class="{ 'is-disabled': isLocked }">
                  <!-- Segment 1: Prefix Input (e.g. JR) -->
                  <input
                    type="text"
                    id="codePrefix"
                    class="code-segment-input code-prefix-input"
                    placeholder="JR"
                    v-model="codePrefix"
                    :disabled="isLocked"
                    maxlength="10"
                    title="Prefix (e.g. JR)"
                    @input="codePrefix = ($event.target as HTMLInputElement).value.toUpperCase()"
                  />

                  <span class="code-segment-divider">-</span>

                  <!-- Segment 2: Dept & Year Input (Defaults to BHM-26, editable) -->
                  <input
                    type="text"
                    id="codeDeptYear"
                    class="code-segment-input code-dept-year-input"
                    placeholder="BHM-26"
                    v-model="codeDeptYear"
                    :disabled="isLocked"
                    maxlength="15"
                    title="Department & Year (defaults to BHM-26, editable)"
                    @input="codeDeptYear = ($event.target as HTMLInputElement).value.toUpperCase()"
                  />

                  <span class="code-segment-divider">-</span>

                  <!-- Segment 3: Number Input (Inputted by user) -->
                  <input
                    type="text"
                    id="codeNumber"
                    class="code-segment-input code-number-input"
                    placeholder="e.g. 001"
                    v-model="codeNumber"
                    :disabled="isLocked"
                    maxlength="20"
                    title="Work Order Number / Suffix"
                  />
                </div>
                <span v-if="isDuplicateCode" class="error-msg">Work order number already exists. Please choose a different number.</span>
                <span v-else-if="errors.code" class="error-msg">Work order number is required.</span>
              </div>

              <div class="modern-field-group modern-received-date-col">
                <label class="modern-field-label" for="dateReceived">DATE RECEIVED</label>
                <div class="modern-date-input-wrapper">
                  <input
                    type="text"
                    id="dateReceived"
                    class="modern-input modern-date-text-input"
                    placeholder="MMM DD, YYYY"
                    v-model="dateReceived"
                    :disabled="isLocked"
                  />
                  <button
                    type="button"
                    class="modern-date-picker-btn"
                    :disabled="isLocked"
                    @click="openDatePicker"
                    title="Select Date"
                    aria-label="Select Date"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </button>
                  <input
                    ref="datePickerInput"
                    type="date"
                    class="modern-hidden-datepicker"
                    :value="isoDateValue"
                    :disabled="isLocked"
                    @input="handleDatePickerChange"
                    @change="handleDatePickerChange"
                    tabindex="-1"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            <!-- Row 2: Name of Requester -->
            <div class="modern-field-group">
              <label class="modern-field-label">NAME OF REQUESTER</label>
              <input
                type="text"
                id="requesterName"
                class="modern-input"
                placeholder="Type in Name of Requester"
                v-model="requesterName"
                :disabled="isLocked"
              />
            </div>

            <!-- Row 3: Requesting Office (Searchable Combobox) -->
            <div class="modern-field-group">
              <label class="modern-field-label" for="requestingOffice">REQUESTING OFFICE</label>
              <SearchableCombobox
                id="requestingOffice"
                v-model="requestingOffice"
                :items="officeCatalogItems"
                placeholder="Choose Requesting Office"
                :disabled="isLocked"
                @change="handleOfficeChange"
                @add-new="handleAddNewOffice"
                @manage="$emit('manageCatalogs')"
              />
            </div>

            <!-- Row 4: Facility/Asset (Searchable Combobox) -->
            <div class="modern-field-group">
              <label class="modern-field-label" for="assetName">FACILITY/ASSET</label>
              <SearchableCombobox
                id="assetName"
                v-model="assetName"
                :items="assetCatalogItems"
                placeholder="Choose Building Name"
                :disabled="isLocked"
                @change="handleAssetChange"
                @add-new="handleAddNewAsset"
                @manage="$emit('manageCatalogs')"
              />
            </div>

            <!-- Row 5: Room No./Name -->
            <div class="modern-field-group">
              <label class="modern-field-label">ROOM NO./NAME</label>
              <input
                type="text"
                class="modern-input"
                placeholder="Room No./Name"
                v-model="roomNo"
                :disabled="isLocked"
              />
            </div>

          </div>

          <!-- Right Column -->
          <div class="modern-right-col">
            
            <!-- Row 1: Work Title with Auto-generate Button Above Text Box -->
            <div class="modern-field-group">
              <div class="modern-title-label-row">
                <label class="modern-field-label" for="workTitle">WORK TITLE</label>
                <button
                  v-if="!isLocked"
                  type="button"
                  class="btn-reset-suggested-code"
                  @click="handleRegenerateWorkTitle"
                  title="Auto-compose work title from Office, Work Type, and Item Types"
                >
                  ↻ Auto-generate
                </button>
              </div>
              <input
                type="text"
                id="workTitle"
                class="modern-input"
                placeholder="Type in Work Title"
                v-model="workTitle"
                @input="handleWorkTitleManualInput"
                :disabled="isLocked"
              />
            </div>

            <!-- Row 2: Work Type (Searchable Combobox) -->
            <div class="modern-field-group">
              <label class="modern-field-label" for="generalWorktype">WORK TYPE</label>
              <SearchableCombobox
                id="generalWorktype"
                v-model="worktype"
                :items="workTypeCatalogItems"
                placeholder="Choose Work Type"
                :disabled="isLocked"
                @change="handleGeneralWorkTypeChange"
                @add-new="handleAddNewWorkType"
                @manage="$emit('manageCatalogs')"
              />
            </div>

            <!-- Row 3: Item Types (Tags Multi-select below Work Type) -->
            <div class="modern-field-group item-types-field-group" ref="tagBoxRef">
              <div style="display: flex; justify-content: space-between; align-items: center">
                <label class="modern-field-label" for="itemTypesInput">ITEM TYPES</label>
                <span v-if="selectedItemTypes.length > 0" class="tag-count-indicator">
                  {{ selectedItemTypes.length }} tag{{ selectedItemTypes.length > 1 ? 's' : '' }}
                </span>
              </div>

              <div
                class="modern-tag-input-box"
                :class="{ 'is-focused': isTagInputFocused, 'is-locked': isLocked, 'has-tags': selectedItemTypes.length > 0 }"
                @click="focusTagInput"
              >
                <!-- Selected Tag Pills with their own individual assigned colors -->
                <span
                  v-for="tag in selectedItemTypes"
                  :key="tag"
                  class="item-type-tag-pill"
                  :style="{ backgroundColor: getTagColor(tag) }"
                  :title="tag"
                >
                  <!-- Left Outline Tag Icon -->
                  <svg class="tag-pill-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
                    <circle cx="12" cy="14" r="1.8" />
                  </svg>
                  <span class="tag-pill-text">{{ tag }}</span>
                  <!-- Right Remove Close 'X' Button -->
                  <button
                    type="button"
                    class="tag-pill-remove"
                    @click.stop="removeItemType(tag)"
                    :disabled="isLocked"
                    title="Remove tag"
                    aria-label="Remove tag"
                  >
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </span>

                <!-- Inline Search/Add Input -->
                <input
                  ref="tagInputRef"
                  id="itemTypesInput"
                  type="text"
                  class="tag-inline-input"
                  :placeholder="selectedItemTypes.length === 0 ? 'Choose Item Type' : '+ Add tag...'"
                  v-model="tagSearchQuery"
                  :disabled="isLocked"
                  @focus="onTagInputFocus"
                  @blur="onTagInputBlur"
                  @keydown.enter.prevent="onTagInputEnter"
                  @keydown.backspace="onTagInputBackspace"
                  @keydown.down.prevent="highlightNextTag"
                  @keydown.up.prevent="highlightPrevTag"
                  @keydown.esc="onTagInputEsc"
                  autocomplete="off"
                />

                <!-- Dropdown Toggle Chevron Button -->
                <button
                  type="button"
                  class="tag-box-toggle-btn"
                  @click.stop="toggleTagDropdown"
                  :disabled="isLocked"
                  tabindex="-1"
                  aria-label="Toggle item types list"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>

              <!-- Dropdown Menu for Item Types -->
              <div v-if="isTagDropdownOpen && !isLocked" class="tag-dropdown-menu">
                <div v-if="filteredItemTypeOptions.length === 0" class="tag-dropdown-empty">
                  <span v-if="tagSearchQuery.trim()">Press <strong>Enter</strong> to add "<em>{{ tagSearchQuery.trim() }}</em>"</span>
                  <span v-else>All item types selected</span>
                </div>

                <div
                  v-for="(item, idx) in filteredItemTypeOptions"
                  :key="item.name"
                  :class="['tag-dropdown-item', { 'is-highlighted': highlightedTagIndex === idx, 'is-selected': selectedItemTypes.includes(item.name) }]"
                  @mousedown.prevent="toggleSelectItemType(item.name)"
                >
                  <div class="tag-dropdown-item-left">
                    <span class="tag-color-swatch-dot" :style="{ backgroundColor: item.color || getTagColor(item.name) }"></span>
                    <span v-if="item.code" class="tag-dropdown-code">{{ item.code }}</span>
                    <span class="tag-dropdown-name">{{ item.name }}</span>
                    <span v-if="item.title" class="tag-dropdown-code" style="background: rgba(180, 83, 9, 0.1); color: #B45309; font-weight: 600">{{ item.title }}</span>
                  </div>
                  <span v-if="selectedItemTypes.includes(item.name)" class="tag-dropdown-check">✓</span>
                </div>

                <!-- Custom Tag Option if typing something not in the list -->
                <div
                  v-if="tagSearchQuery.trim() && !itemTypeCatalogItems.some(i => i.name.toLowerCase() === tagSearchQuery.trim().toLowerCase())"
                  class="tag-dropdown-item custom-add"
                  @mousedown.prevent="toggleSelectItemType(tagSearchQuery.trim())"
                >
                  <span>+ Add custom tag: "<strong>{{ tagSearchQuery.trim() }}</strong>"</span>
                </div>
              </div>
            </div>

            <!-- Row 3: Work Details and Description -->
            <div class="modern-field-group" style="flex: 1; display: flex; flex-direction: column">
              <label class="modern-field-label">WORK DETAILS AND DESCRIPTION</label>
              <textarea
                class="modern-textarea"
                placeholder="Type in Work order request details and information"
                v-model="description"
                :disabled="isLocked"
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
          <!-- Desktop Table View -->
          <div class="scope-desktop-table">
            <table class="modern-scope-table">
              <thead>
                <tr>
                  <th style="width: 36px; text-align: center"></th>
                  <th style="width: 200px">ACTIVITY TYPE</th>
                  <th>DESCRIPTION</th>
                  <th style="width: 80px; text-align: center">REMARKS</th>
                  <th style="width: 170px">DEGREE OF WORK</th>
                  <th style="width: 40px; text-align: center"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(task, index) in tasks"
                  :key="index"
                  :draggable="!isLocked"
                  @dragstart="!isLocked && handleDragStart($event, index)"
                  @dragover="!isLocked && handleDragOver($event, index)"
                  @drop="!isLocked && handleDrop($event, index)"
                  @dragend="handleDragEnd"
                  :class="[{ dragging: draggedIndex === index, 'drag-over': dragOverIndex === index, 'is-locked-row': isLocked }]"
                >
                  <!-- Drag Handle Icon -->
                  <td style="text-align: center">
                    <div
                      class="drag-handle-btn"
                      :title="isLocked ? 'Reordering disabled while locked' : 'Click & drag to reorder scope'"
                      :style="{ opacity: isLocked ? 0.3 : 1, cursor: isLocked ? 'not-allowed' : 'grab' }"
                    >
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

                  <!-- Activity Type Select -->
                  <td>
                    <select
                      :class="['modern-table-select', { 'is-placeholder-selected': !task.type }]"
                      :value="task.type"
                      :disabled="isLocked"
                      @change="handleActivityTypeChange(index, ($event.target as HTMLSelectElement).value)"
                    >
                      <option value="">Select Activity Type...</option>
                      <option v-for="opt in activityTypeOptions" :key="opt" :value="opt">{{ opt }}</option>
                      <option value="__ADD_NEW__" style="font-weight: 600; color: #006c49">+ Add New...</option>
                    </select>
                  </td>

                  <!-- Activity Description Textarea -->
                  <td>
                    <textarea
                      class="modern-table-textarea"
                      placeholder="Type in Activity Description..."
                      v-model="task.remarks"
                      :disabled="isLocked"
                      rows="2"
                    />
                  </td>

                  <!-- Remarks Comment Bubble Button (Enabled) -->
                  <td style="text-align: center">
                    <button
                      type="button"
                      :class="['remarks-btn', { 'has-data-green': (task.remarksList && task.remarksList.length > 0) || task.hasComments }]"
                      @click="openRemarksDrawer(index)"
                      :title="(task.remarksList && task.remarksList.length > 0) ? `${task.remarksList.length} Remarks/Notes logged` : 'Open Remarks & Notes'"
                      aria-label="Open Remarks & Notes"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        :fill="(task.remarksList && task.remarksList.length > 0) || task.hasComments ? '#10B981' : 'none'"
                        :stroke="(task.remarksList && task.remarksList.length > 0) || task.hasComments ? '#006C49' : '#6C7A71'"
                        stroke-width="2"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>
                  </td>

                  <!-- Degree of Work Select -->
                  <td>
                    <select
                      class="modern-table-select"
                      :value="task.degreeOfWork === 'Major' ? 'Major' : 'Minor'"
                      :disabled="isLocked"
                      @change="task.degreeOfWork = ($event.target as HTMLSelectElement).value"
                    >
                      <option value="Minor">Minor</option>
                      <option value="Major">Major</option>
                    </select>
                  </td>

                  <!-- Delete Task Row Button -->
                  <td style="text-align: center">
                    <button
                      v-if="tasks.length > 1"
                      type="button"
                      class="btn-task-delete"
                      title="Remove Task"
                      :disabled="isLocked"
                      :style="{ opacity: isLocked ? 0.3 : 1, cursor: isLocked ? 'not-allowed' : 'pointer' }"
                      @click="!isLocked && handleDeleteTask(index)"
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
          </div>

          <!-- Mobile Card List View -->
          <div class="scope-mobile-cards">
            <div
              v-for="(task, index) in tasks"
              :key="index"
              class="scope-mob-card"
              :class="{ 'is-locked-card': isLocked }"
            >
              <!-- Card Header -->
              <div class="scope-mob-card-header">
                <div class="scope-mob-badge">
                  <span class="scope-mob-badge-num">#{{ index + 1 }}</span>
                  <span class="scope-mob-badge-label">Scope Item</span>
                </div>

                <div class="scope-mob-card-actions">
                  <!-- Reorder buttons -->
                  <div v-if="!isLocked && tasks.length > 1" class="scope-mob-reorder-group">
                    <button
                      type="button"
                      class="scope-mob-order-btn"
                      :disabled="index === 0"
                      @click="moveTaskUp(index)"
                      title="Move item up"
                      aria-label="Move item up"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="scope-mob-order-btn"
                      :disabled="index === tasks.length - 1"
                      @click="moveTaskDown(index)"
                      title="Move item down"
                      aria-label="Move item down"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>

                  <!-- Delete button -->
                  <button
                    v-if="tasks.length > 1"
                    type="button"
                    class="scope-mob-delete-btn"
                    :disabled="isLocked"
                    @click="!isLocked && handleDeleteTask(index)"
                    title="Remove Scope Item"
                    aria-label="Remove Scope Item"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Card Body -->
              <div class="scope-mob-card-body">
                <!-- Activity Type Field -->
                <div class="scope-mob-field">
                  <label class="scope-mob-field-label">ACTIVITY TYPE</label>
                  <select
                    :class="['scope-mob-select', { 'is-placeholder-selected': !task.type }]"
                    :value="task.type"
                    :disabled="isLocked"
                    @change="handleActivityTypeChange(index, ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="">Select Activity Type...</option>
                    <option v-for="opt in activityTypeOptions" :key="opt" :value="opt">{{ opt }}</option>
                    <option value="__ADD_NEW__" style="font-weight: 600; color: #006c49">+ Add New...</option>
                  </select>
                </div>

                <!-- Activity Description Field -->
                <div class="scope-mob-field">
                  <label class="scope-mob-field-label">DESCRIPTION</label>
                  <textarea
                    class="scope-mob-textarea"
                    placeholder="Type in Activity Description..."
                    v-model="task.remarks"
                    :disabled="isLocked"
                    rows="2"
                  />
                </div>

                <!-- Footer Row: Degree of Work & Remarks Button -->
                <div class="scope-mob-footer-row">
                  <!-- Degree of Work -->
                  <div class="scope-mob-degree-section">
                    <label class="scope-mob-field-label">DEGREE OF WORK</label>
                    <div class="scope-mob-degree-pills">
                      <button
                        type="button"
                        :class="['scope-mob-degree-pill', { active: task.degreeOfWork !== 'Major' }]"
                        :disabled="isLocked"
                        @click="!isLocked && (task.degreeOfWork = 'Minor')"
                      >
                        Minor
                      </button>
                      <button
                        type="button"
                        :class="['scope-mob-degree-pill', 'pill-major', { active: task.degreeOfWork === 'Major' }]"
                        :disabled="isLocked"
                        @click="!isLocked && (task.degreeOfWork = 'Major')"
                      >
                        Major
                      </button>
                    </div>
                  </div>

                  <!-- Remarks Button -->
                  <div class="scope-mob-remarks-section">
                    <label class="scope-mob-field-label">REMARKS & NOTES</label>
                    <button
                      type="button"
                      :class="['scope-mob-remarks-btn', { 'has-data': (task.remarksList && task.remarksList.length > 0) || task.hasComments }]"
                      @click="openRemarksDrawer(index)"
                      aria-label="Open Remarks & Notes"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="14"
                        height="14"
                        :fill="(task.remarksList && task.remarksList.length > 0) || task.hasComments ? '#10B981' : 'none'"
                        :stroke="(task.remarksList && task.remarksList.length > 0) || task.hasComments ? '#006C49' : 'currentColor'"
                        stroke-width="2"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span v-if="task.remarksList && task.remarksList.length > 0">
                        {{ task.remarksList.length }} {{ task.remarksList.length === 1 ? 'Note' : 'Notes' }}
                      </span>
                      <span v-else>Add Notes</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Add More Scope Button -->
          <div class="modern-add-scope-wrapper">
            <button
              type="button"
              class="btn-modern-add-scope"
              :disabled="isLocked"
              :style="{ opacity: isLocked ? 0.5 : 1, cursor: isLocked ? 'not-allowed' : 'pointer' }"
              @click="!isLocked && handleAddTask()"
            >
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

      <!-- Bottom Right Corner Actions -->
      <div class="create-order-footer-actions">
        <button class="btn-modern-cancel" type="button" @click="$emit('cancel')">
          Cancel
        </button>
        <button class="btn-modern-save" type="button" @click="handleSubmit" :disabled="isSaving">
          <svg v-if="!isSaving" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#FFFFFF" stroke-width="2.5">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <svg v-else class="spin-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#FFFFFF" stroke-width="2.5">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.3" fill="none" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          </svg>
          <span>{{ isSaving ? 'Saving...' : (editingOrderCode ? 'Update Order' : 'Create Order') }}</span>
        </button>
      </div>

    </form>

    <!-- SIDE DRAWER: REMARKS AND NOTES -->
    <RemarksDrawer
      :is-open="activeRemarksTaskIndex !== null && !!tasks[activeRemarksTaskIndex]"
      :is-locked="isLocked"
      :notes="activeRemarksTaskIndex !== null && tasks[activeRemarksTaskIndex] ? tasks[activeRemarksTaskIndex].remarksList : []"
      @close="closeRemarksDrawer"
      @add-note="handleAddRemarkNote"
      @delete-note="handleDeleteRemarkNote"
      @update-note-text="handleUpdateRemarkNoteText"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { WorkOrder, Task, Person, RemarkNote, MasterCatalogsState, CatalogItem } from '../types';
import { getItemTypeColor, ITEM_TYPE_COLOR_PALETTE } from '../utils/catalogsData';
import SearchableCombobox from '../components/ui/SearchableCombobox.vue';
import RemarksDrawer from '../components/modals/RemarksDrawer.vue';

const props = defineProps<{
  editingOrderCode: string | null;
  returnView?: string;
  workOrders: WorkOrder[];
  personnel: Person[];
  catalogs?: MasterCatalogsState;
}>();

const emit = defineEmits<{
  (e: 'saveOrder', data: WorkOrder): void;
  (e: 'cancel'): void;
  (e: 'manageCatalogs'): void;
  (e: 'addCatalogItem', item: CatalogItem): void;
}>();

const DEFAULT_OFFICES = [
  'Office of Student Housing',
  'College of Mathematics Office',
  'Medical Sciences Division',
  'Office of the University Registrar',
  "College of Engineering Dean's Office",
  'Physical Plant & Facilities Maintenance'
];

const DEFAULT_ASSETS = [
  'Coconut Dorm',
  'DMath Building',
  'CoMed Laboratory',
  'Engineering Hall',
  'Central Administration',
  'University Gymnasium & Sports Center'
];

const DEFAULT_WORK_TYPES = [
  'HVAC',
  'Electrical',
  'Plumbing',
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

const officeOptions = computed(() => {
  if (props.catalogs?.offices && props.catalogs.offices.length > 0) {
    return props.catalogs.offices
      .filter((o) => o.isActive !== false)
      .map((o) => o.name);
  }
  return loadSavedList('genso_custom_offices', DEFAULT_OFFICES);
});

const officeCatalogItems = computed<CatalogItem[]>(() => {
  if (props.catalogs?.offices && props.catalogs.offices.length > 0) {
    return props.catalogs.offices.filter((o) => o.isActive !== false);
  }
  return DEFAULT_OFFICES.map((name, idx) => ({
    id: `def-off-${idx}`,
    type: 'office',
    name,
    isActive: true
  }));
});

const assetOptions = computed(() => {
  if (props.catalogs?.assets && props.catalogs.assets.length > 0) {
    return props.catalogs.assets
      .filter((a) => a.isActive !== false)
      .map((a) => a.name);
  }
  if (props.catalogs?.offices && props.catalogs.offices.length > 0) {
    return props.catalogs.offices
      .filter((o) => o.isActive !== false)
      .map((o) => o.name);
  }
  return loadSavedList('genso_custom_assets', DEFAULT_ASSETS);
});

const assetCatalogItems = computed<CatalogItem[]>(() => {
  if (props.catalogs?.assets && props.catalogs.assets.length > 0) {
    return props.catalogs.assets.filter((a) => a.isActive !== false);
  }
  if (props.catalogs?.offices && props.catalogs.offices.length > 0) {
    return props.catalogs.offices.filter((o) => o.isActive !== false);
  }
  return DEFAULT_ASSETS.map((name, idx) => ({
    id: `def-ast-${idx}`,
    type: 'asset',
    name,
    isActive: true
  }));
});

const workTypeOptions = computed(() => {
  if (props.catalogs?.workTypes && props.catalogs.workTypes.length > 0) {
    return props.catalogs.workTypes
      .filter((w) => w.isActive !== false)
      .map((w) => w.name);
  }
  return loadSavedList('genso_custom_worktypes', DEFAULT_WORK_TYPES);
});

const workTypeCatalogItems = computed<CatalogItem[]>(() => {
  if (props.catalogs?.workTypes && props.catalogs.workTypes.length > 0) {
    return props.catalogs.workTypes.filter((w) => w.isActive !== false);
  }
  return DEFAULT_WORK_TYPES.map((name, idx) => ({
    id: `def-wt-${idx}`,
    type: 'work_type',
    name,
    isActive: true
  }));
});

const DEFAULT_ACTIVITY_TYPES = [
  'Carpentry Works',
  'Masonry Works',
  'Concreting Works',
  'Welding Works',
  'Painting Works',
  'Plumbing Works',
  'Electrical Works',
  'Electronics Works',
  'Mechanical Works',
  'Airconditioning Works',
  'Landscaping Works',
  'Hauling Works',
  'Fabrication Works',
  'Demolition Works',
  'Civil Works',
  'General Maintenance'
];

const activityTypeOptions = computed(() => {
  let list: string[] = [];
  if (props.catalogs?.activityTypes && props.catalogs.activityTypes.length > 0) {
    list = props.catalogs.activityTypes
      .filter((a) => a.isActive !== false)
      .map((a) => a.name);
  } else {
    list = [...DEFAULT_ACTIVITY_TYPES];
  }
  // Include existing task types if present (to avoid unselected option when opening existing order)
  tasks.value.forEach((t) => {
    if (t.type && t.type.trim() && !list.includes(t.type.trim())) {
      list.push(t.type.trim());
    }
  });
  return list;
});

const DEFAULT_ITEM_TYPES = [
  'Building/Structure',
  'Wall Partitions',
  'Doors & Windows',
  'Ceilings',
  'Flooring & Tiling',
  'Roofing & Gutters',
  'Cabinets & Millwork',
  'Lighting Fixtures',
  'Power Outlets & Switches',
  'Distribution Panel',
  'Sanitary Fixtures',
  'Water Pipelines & Valves',
  'Drainage & Sewerage',
  'Air Conditioning Units',
  'Ventilation Fans',
  'Exhaust Systems',
  'Desks & Tables',
  'Chairs & Seating',
  'Storage & Shelving',
  'Sidewalks & Pavements',
  'Fences & Gates',
  'Landscaping Elements'
];

const getTagColor = (tag: string): string => {
  return getItemTypeColor(tag, props.catalogs);
};

const itemTypeCatalogItems = computed(() => {
  if (props.catalogs?.itemTypes && props.catalogs.itemTypes.length > 0) {
    return props.catalogs.itemTypes
      .filter((it) => it.isActive !== false)
      .map((it) => ({
        id: it.id,
        name: it.name,
        code: it.code || '',
        title: it.title || '',
        category: it.category || '',
        color: it.color || getItemTypeColor(it.name, props.catalogs)
      }));
  }
  return DEFAULT_ITEM_TYPES.map((name, idx) => ({
    id: `def-it-${idx}`,
    name,
    code: String(idx + 1).padStart(2, '0'),
    title: '',
    category: '',
    color: ITEM_TYPE_COLOR_PALETTE[idx % ITEM_TYPE_COLOR_PALETTE.length]
  }));
});

const selectedItemTypes = ref<string[]>([]);
const tagSearchQuery = ref('');
const isTagInputFocused = ref(false);
const isTagDropdownOpen = ref(false);
const highlightedTagIndex = ref(-1);
const tagInputRef = ref<HTMLInputElement | null>(null);
const tagBoxRef = ref<HTMLElement | null>(null);

const isWorkTitleManuallyEdited = ref(false);

const filteredItemTypeOptions = computed(() => {
  const q = tagSearchQuery.value.toLowerCase().trim();
  if (!q) return itemTypeCatalogItems.value;
  return itemTypeCatalogItems.value.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.code && item.code.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q))
  );
});

const toggleSelectItemType = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return;
  if (selectedItemTypes.value.includes(trimmed)) {
    selectedItemTypes.value = selectedItemTypes.value.filter((t) => t !== trimmed);
  } else {
    selectedItemTypes.value.push(trimmed);
  }
  tagSearchQuery.value = '';
  highlightedTagIndex.value = -1;
  tagInputRef.value?.focus();
  tryUpdateAutoWorkTitle();
};

const removeItemType = (tag: string) => {
  if (isLocked.value) return;
  selectedItemTypes.value = selectedItemTypes.value.filter((t) => t !== tag);
  tryUpdateAutoWorkTitle();
};

const toggleTagDropdown = () => {
  if (isLocked.value) return;
  isTagDropdownOpen.value = !isTagDropdownOpen.value;
  if (isTagDropdownOpen.value) {
    tagInputRef.value?.focus();
  }
};

const focusTagInput = () => {
  if (isLocked.value) return;
  tagInputRef.value?.focus();
  isTagDropdownOpen.value = true;
};

const onTagInputFocus = () => {
  isTagInputFocused.value = true;
  isTagDropdownOpen.value = true;
};

const onTagInputBlur = () => {
  isTagInputFocused.value = false;
};

const onTagInputEsc = () => {
  isTagDropdownOpen.value = false;
  isTagInputFocused.value = false;
  tagInputRef.value?.blur();
};

const onTagInputEnter = () => {
  if (highlightedTagIndex.value >= 0 && highlightedTagIndex.value < filteredItemTypeOptions.value.length) {
    toggleSelectItemType(filteredItemTypeOptions.value[highlightedTagIndex.value].name);
    return;
  }
  if (tagSearchQuery.value.trim()) {
    toggleSelectItemType(tagSearchQuery.value.trim());
  }
};

const onTagInputBackspace = () => {
  if (!tagSearchQuery.value && selectedItemTypes.value.length > 0) {
    selectedItemTypes.value.pop();
  }
};

const highlightNextTag = () => {
  if (filteredItemTypeOptions.value.length === 0) return;
  highlightedTagIndex.value = (highlightedTagIndex.value + 1) % filteredItemTypeOptions.value.length;
};

const highlightPrevTag = () => {
  if (filteredItemTypeOptions.value.length === 0) return;
  highlightedTagIndex.value =
    highlightedTagIndex.value <= 0
      ? filteredItemTypeOptions.value.length - 1
      : highlightedTagIndex.value - 1;
};

const handleClickOutside = (e: MouseEvent) => {
  if (tagBoxRef.value && !tagBoxRef.value.contains(e.target as Node)) {
    isTagDropdownOpen.value = false;
    isTagInputFocused.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

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

const formatDateToDisplay = (val: string) => {
  if (!val) return '';
  const trimmed = val.trim();
  const parts = trimmed.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const date = new Date(y, m, d);
    if (!isNaN(date.getTime())) {
      const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month} ${day}, ${year}`;
    }
  }
  const date = new Date(trimmed);
  if (!isNaN(date.getTime())) {
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  }
  return val;
};

const currentYear2 = String(new Date().getFullYear()).slice(-2);
const codePrefix = ref('JR');
const codeDeptYear = ref(`BHM-${currentYear2}`);
const codeNumber = ref('');

const fullComputedCode = computed(() => {
  const p = codePrefix.value.trim().toUpperCase();
  const d = codeDeptYear.value.trim().toUpperCase();
  const n = codeNumber.value.trim();
  return [p, d, n].filter(Boolean).join('-');
});

const isDuplicateCode = computed(() => {
  const current = fullComputedCode.value.trim().toUpperCase();
  if (!current || !codeNumber.value.trim()) return false;
  if (!props.workOrders || props.workOrders.length === 0) return false;

  return props.workOrders.some((order) => {
    if (props.editingOrderCode && order.code && order.code.trim().toUpperCase() === props.editingOrderCode.trim().toUpperCase()) {
      return false;
    }
    return Boolean(order.code && order.code.trim().toUpperCase() === current);
  });
});

const parseExistingCode = (rawCode: string) => {
  if (!rawCode) {
    codePrefix.value = 'JR';
    codeDeptYear.value = `BHM-${currentYear2}`;
    codeNumber.value = '';
    return;
  }
  const clean = rawCode.replace(/\s*-\s*/g, '-').trim();
  const parts = clean.split('-');
  if (parts.length >= 3) {
    codePrefix.value = parts[0];
    codeDeptYear.value = parts.slice(1, -1).join('-');
    codeNumber.value = parts[parts.length - 1];
  } else if (parts.length === 2) {
    codePrefix.value = parts[0];
    codeDeptYear.value = `BHM-${currentYear2}`;
    codeNumber.value = parts[1];
  } else {
    codePrefix.value = 'JR';
    codeDeptYear.value = `BHM-${currentYear2}`;
    codeNumber.value = clean;
  }
};

const dateReceived = ref(getFormattedTodayDate());
const datePickerInput = ref<HTMLInputElement | null>(null);

const isoDateValue = computed(() => {
  if (!dateReceived.value) return getTodayString();
  const trimmed = dateReceived.value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return getTodayString();
});

const openDatePicker = () => {
  if (isLocked.value || !datePickerInput.value) return;
  try {
    if ('showPicker' in HTMLInputElement.prototype) {
      datePickerInput.value.showPicker();
      return;
    }
  } catch (err) {
    console.warn('showPicker error:', err);
  }
  datePickerInput.value.focus();
};

const handleDatePickerChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target && target.value) {
    dateReceived.value = formatDateToDisplay(target.value);
  }
};

const requesterName = ref('');
const requestingOffice = ref('');
const assetName = ref('');
const roomNo = ref('');
const workTitle = ref('');
const worktype = ref('');
const description = ref('');
const isLocked = ref(false);

const activeRemarksTaskIndex = ref<number | null>(null);
const editingNoteId = ref<string | null>(null);

const tasks = ref<Task[]>([
  {
    type: '',
    remarks: '',
    degreeOfWork: 'Minor',
    startDate: '',
    endDate: '',
    remarksList: []
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
        parseExistingCode(order.code || '');
        dateReceived.value = order.dateReceived ? formatDateToDisplay(order.dateReceived) : getFormattedTodayDate();
        requesterName.value = order.requesterName || '';
        requestingOffice.value = order.requestingOffice || '';
        assetName.value = order.assetName || '';
        roomNo.value = order.roomNo || order.space || '';
        workTitle.value = order.workTitle || '';
        worktype.value = order.worktype || (order.tasks && order.tasks[0]?.type) || '';
        description.value = order.description || '';
        isLocked.value = order.isLocked || false;
        selectedItemTypes.value = Array.isArray(order.itemTypes) ? [...order.itemTypes] : [];

        if (order.requestingOffice && !officeOptions.value.includes(order.requestingOffice)) {
          officeOptions.value.push(order.requestingOffice);
        }
        if (order.assetName && !assetOptions.value.includes(order.assetName)) {
          assetOptions.value.push(order.assetName);
        }
        if (worktype.value && !workTypeOptions.value.includes(worktype.value)) {
          workTypeOptions.value.push(worktype.value);
        }

        if (order.tasks && order.tasks.length > 0) {
          tasks.value = order.tasks.map((t) => ({
            ...t,
            remarks: t.remarks === 'General Maintenance Scope' ? '' : (t.remarks || ''),
            degreeOfWork: t.degreeOfWork === 'Major' ? 'Major' : 'Minor',
            remarksList: t.remarksList ? [...t.remarksList] : []
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
              remarks: (order.scope === 'General Maintenance Scope' ? '' : order.scope) || '',
              degreeOfWork: 'Minor',
              startDate: order.startDate || '',
              endDate: order.endDate || '',
              remarksList: []
            }
          ];
        }
      }
    } else {
      dateReceived.value = getFormattedTodayDate();
      codePrefix.value = 'JR';
      codeDeptYear.value = `BHM-${currentYear2}`;
      codeNumber.value = '';
      requesterName.value = '';
      requestingOffice.value = '';
      assetName.value = '';
      roomNo.value = '';
      workTitle.value = '';
      worktype.value = '';
      description.value = '';
      isLocked.value = false;
      selectedItemTypes.value = [];
      tagSearchQuery.value = '';
      isTagDropdownOpen.value = false;
      tasks.value = [
        {
          type: '',
          remarks: '',
          degreeOfWork: 'Minor',
          startDate: '',
          endDate: '',
          remarksList: []
        }
      ];
    }
    errors.value = {};
  },
  { immediate: true, deep: true }
);

const computeAutoWorkTitle = (): string => {
  const parts: string[] = [];

  // 1. Office Title of the requesting office (or Facility/Asset if office is not specified)
  const officeQuery = requestingOffice.value?.trim().toLowerCase() || '';
  const assetQuery = assetName.value?.trim().toLowerCase() || '';

  let off = (props.catalogs?.offices || []).find(
    (o) => o.name.toLowerCase() === officeQuery ||
           (o.acronym && o.acronym.toLowerCase() === officeQuery) ||
           (o.title && o.title.toLowerCase() === officeQuery) ||
           (o.code && o.code.toLowerCase() === officeQuery)
  );

  // Fallback to facility/asset if requesting office is not selected
  if (!off && assetQuery) {
    off = (props.catalogs?.offices || []).find(
      (o) => o.name.toLowerCase() === assetQuery ||
             (o.acronym && o.acronym.toLowerCase() === assetQuery) ||
             (o.title && o.title.toLowerCase() === assetQuery) ||
             (o.code && o.code.toLowerCase() === assetQuery)
    );
  }

  if (off) {
    const offTitle = off.title?.trim() || off.acronym?.trim() || off.name.trim();
    if (offTitle) {
      parts.push(offTitle.toUpperCase());
    }
  } else if (requestingOffice.value?.trim()) {
    parts.push(requestingOffice.value.trim().toUpperCase());
  }

  // 2. Work Title of the work type
  if (worktype.value && worktype.value.trim()) {
    const wtQuery = worktype.value.trim().toLowerCase();
    const wt = (props.catalogs?.workTypes || []).find(
      (w) => w.name.toLowerCase() === wtQuery ||
             (w.title && w.title.toLowerCase() === wtQuery) ||
             (w.code && w.code.toLowerCase() === wtQuery)
    );
    const wtTitle = wt?.title?.trim() || worktype.value.trim();
    if (wtTitle) {
      parts.push(wtTitle.toUpperCase());
    }
  }

  // 3. Item Type Title(s) with dashes if more than 1
  if (selectedItemTypes.value && selectedItemTypes.value.length > 0) {
    const itemTitles: string[] = [];
    for (const itName of selectedItemTypes.value) {
      const itQuery = itName.trim().toLowerCase();
      const it = (props.catalogs?.itemTypes || []).find(
        (i) => i.name.toLowerCase() === itQuery ||
               (i.title && i.title.toLowerCase() === itQuery) ||
               (i.code && i.code.toLowerCase() === itQuery)
      );
      const title = it?.title?.trim() || itName.trim();
      if (title && !itemTitles.includes(title.toUpperCase())) {
        itemTitles.push(title.toUpperCase());
      }
    }
    if (itemTitles.length > 0) {
      parts.push(itemTitles.join(' - '));
    }
  }

  return parts.join(' - ');
};

const tryUpdateAutoWorkTitle = () => {
  if (isWorkTitleManuallyEdited.value && workTitle.value.trim()) return;
  const auto = computeAutoWorkTitle();
  if (auto) {
    workTitle.value = auto;
  }
};

const handleRegenerateWorkTitle = () => {
  isWorkTitleManuallyEdited.value = false;
  const auto = computeAutoWorkTitle();
  if (auto) {
    workTitle.value = auto;
  }
};

const handleWorkTitleManualInput = () => {
  if (workTitle.value.trim()) {
    isWorkTitleManuallyEdited.value = true;
  } else {
    isWorkTitleManuallyEdited.value = false;
  }
};

const handleOfficeChange = (val: string) => {
  requestingOffice.value = val;
  tryUpdateAutoWorkTitle();
};

const handleAddNewOffice = () => {
  const newName = window.prompt('Enter new Requesting Office name:');
  if (newName && newName.trim()) {
    const trimmed = newName.trim();
    emit('addCatalogItem', {
      id: `off-${Date.now()}`,
      type: 'office',
      name: trimmed,
      isActive: true
    });
    requestingOffice.value = trimmed;
    tryUpdateAutoWorkTitle();
  }
};

const handleAssetChange = (val: string) => {
  assetName.value = val;
  tryUpdateAutoWorkTitle();
};

const handleAddNewAsset = () => {
  const newName = window.prompt('Enter new Facility / Building name:');
  if (newName && newName.trim()) {
    const trimmed = newName.trim();
    emit('addCatalogItem', {
      id: `ast-${Date.now()}`,
      type: 'asset',
      name: trimmed,
      isActive: true
    });
    assetName.value = trimmed;
    tryUpdateAutoWorkTitle();
  }
};

const handleGeneralWorkTypeChange = (val: string) => {
  worktype.value = val;
  tryUpdateAutoWorkTitle();
};

const handleAddNewWorkType = () => {
  const newName = window.prompt('Enter new Work Type:');
  if (newName && newName.trim()) {
    const trimmed = newName.trim();
    emit('addCatalogItem', {
      id: `wt-${Date.now()}`,
      type: 'work_type',
      name: trimmed,
      isActive: true
    });
    worktype.value = trimmed;
    tryUpdateAutoWorkTitle();
  }
};

const handleActivityTypeChange = (index: number, val: string) => {
  if (val === '__ADD_NEW__') {
    const newName = window.prompt('Enter new Activity Type:');
    if (newName && newName.trim()) {
      const trimmed = newName.trim();
      emit('addCatalogItem', {
        id: `act-${Date.now()}`,
        type: 'activity_type',
        name: trimmed,
        isActive: true
      });
      tasks.value[index].type = trimmed;
    }
  } else if (val === '__MANAGE__') {
    emit('manageCatalogs');
  } else {
    tasks.value[index].type = val;
  }
};

const handleWorkTypeChange = handleActivityTypeChange;

const handleAddTask = () => {
  tasks.value.push({
    type: '',
    remarks: '',
    degreeOfWork: 'Minor',
    startDate: '',
    endDate: '',
    remarksList: []
  });
};

const handleDeleteTask = (index: number) => {
  if (tasks.value.length <= 1) return;
  tasks.value.splice(index, 1);
  if (activeRemarksTaskIndex.value === index) {
    activeRemarksTaskIndex.value = null;
  } else if (activeRemarksTaskIndex.value !== null && activeRemarksTaskIndex.value > index) {
    activeRemarksTaskIndex.value -= 1;
  }
};

const moveTaskUp = (index: number) => {
  if (isLocked.value || index <= 0) return;
  const item = tasks.value.splice(index, 1)[0];
  tasks.value.splice(index - 1, 0, item);
  if (activeRemarksTaskIndex.value === index) {
    activeRemarksTaskIndex.value = index - 1;
  } else if (activeRemarksTaskIndex.value === index - 1) {
    activeRemarksTaskIndex.value = index;
  }
};

const moveTaskDown = (index: number) => {
  if (isLocked.value || index >= tasks.value.length - 1) return;
  const item = tasks.value.splice(index, 1)[0];
  tasks.value.splice(index + 1, 0, item);
  if (activeRemarksTaskIndex.value === index) {
    activeRemarksTaskIndex.value = index + 1;
  } else if (activeRemarksTaskIndex.value === index + 1) {
    activeRemarksTaskIndex.value = index;
  }
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

// Remarks and Notes Drawer Handlers
const openRemarksDrawer = (index: number) => {
  activeRemarksTaskIndex.value = index;
  editingNoteId.value = null;
};

const closeRemarksDrawer = () => {
  activeRemarksTaskIndex.value = null;
  editingNoteId.value = null;
};

const handleAddRemarkNote = () => {
  if (activeRemarksTaskIndex.value === null) return;
  const currentTask = tasks.value[activeRemarksTaskIndex.value];
  if (!currentTask) return;

  const now = new Date();
  const timeStr = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const newNote: RemarkNote = {
    id: `rem-${Date.now()}`,
    timestamp: timeStr,
    text: ''
  };

  if (!currentTask.remarksList) {
    currentTask.remarksList = [];
  }
  currentTask.remarksList.push(newNote);
  currentTask.hasComments = true;
  editingNoteId.value = newNote.id;
};

const handleUpdateRemarkNoteText = (noteId: string, text: string) => {
  if (activeRemarksTaskIndex.value === null) return;
  const currentTask = tasks.value[activeRemarksTaskIndex.value];
  if (!currentTask || !currentTask.remarksList) return;

  const note = currentTask.remarksList.find((n) => n.id === noteId);
  if (note) {
    note.text = text.length > 500 ? text.slice(0, 500) : text;
  }
};

const handleDeleteRemarkNote = (noteId: string) => {
  if (activeRemarksTaskIndex.value === null) return;
  const currentTask = tasks.value[activeRemarksTaskIndex.value];
  if (!currentTask || !currentTask.remarksList) return;

  currentTask.remarksList = currentTask.remarksList.filter((n) => n.id !== noteId);
  currentTask.hasComments = currentTask.remarksList.length > 0;
  if (editingNoteId.value === noteId) {
    editingNoteId.value = null;
  }
};

const isSaving = ref(false);

const handleAutoResize = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  if (!target) return;
  target.style.height = 'auto';
  target.style.height = `${target.scrollHeight}px`;
};

const handleSubmit = () => {
  const newErrors: Record<string, boolean> = {};
  let isValid = true;

  const assembledCode = fullComputedCode.value;
  if (!assembledCode || !codeNumber.value.trim()) {
    newErrors.code = true;
    isValid = false;
  } else if (isDuplicateCode.value) {
    newErrors.code = true;
    isValid = false;
  }

  errors.value = newErrors;

  if (!isValid) {
    const el = document.getElementById('codeNumber') || document.getElementById('codePrefix') || document.querySelector('.has-error');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  isSaving.value = true;

  const existing = props.workOrders?.find((o) => o.code === props.editingOrderCode);
  const cleanedTasks = tasks.value.filter(
    (t) => (t.type && t.type.trim() !== '' && t.type.trim() !== '-') ||
           (t.remarks && t.remarks.trim() !== '' && t.remarks.trim() !== '-')
  );
  const finalTasks = cleanedTasks.length > 0
    ? cleanedTasks
    : [
        {
          type: worktype.value.trim() || '',
          remarks: description.value.trim() || '',
          degreeOfWork: 'Minor' as const,
          startDate: '',
          endDate: '',
          remarksList: []
        }
      ];

  const primaryTask = finalTasks[0];
  const effectiveWorkType = worktype.value.trim() || primaryTask.type.trim() || '';
  const effectiveScope = primaryTask.remarks ? primaryTask.remarks.trim() : '';

  const payload: WorkOrder = {
    ...(existing || {}),
    code: assembledCode || (existing ? existing.code : `JR-BHM-${currentYear2}-001`),
    assetName: assetName.value.trim() || (existing ? existing.assetName : '-'),
    space: roomNo.value.trim() || (existing ? existing.space : '-'),
    scope: effectiveScope,
    workgroup: existing?.workgroup || '',
    status: existing ? existing.status : 'Pending',
    priority: existing ? existing.priority : 'Medium',
    worktype: effectiveWorkType,
    startDate: primaryTask.startDate || (existing ? existing.startDate : ''),
    endDate: primaryTask.endDate || (existing ? existing.endDate : ''),
    startTime: existing?.startTime || '08:00 AM',
    endTime: existing?.endTime || '05:00 PM',
    foreman: requesterName.value.trim() || (existing ? existing.foreman : '-'),
    assigned: existing?.assigned || [],
    description: description.value.trim() || '-',
    tasks: finalTasks.map((t) => ({
      ...t,
      type: t.type.trim() || worktype.value.trim() || '',
      remarks: t.remarks ? t.remarks.trim() : ''
    })),
    workTitle: workTitle.value.trim() || '-',
    dateReceived: dateReceived.value.trim() || getFormattedTodayDate(),
    requesterName: requesterName.value.trim() || '-',
    requestingOffice: requestingOffice.value.trim() || '-',
    roomNo: roomNo.value.trim() || '-',
    isLocked: Boolean(isLocked.value),
    itemTypes: [...selectedItemTypes.value]
  };

  emit('saveOrder', payload);
};
</script>

<style scoped src="../styles/create-order.css"></style>
