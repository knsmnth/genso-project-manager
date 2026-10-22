<template>
  <section id="view-catalogs" class="view-section active" style="display: flex; flex-direction: column; gap: 20px">
    <!-- Header Row -->
    <div class="view-header-row">
      <div>
        <h1 class="view-main-title">System Registries & Assets</h1>
        <p class="view-main-subtitle">
          Centralized operational database for university offices, work classifications, activity types, item types, and equipment inventories.
        </p>
      </div>
      <div class="view-header-actions" style="display: flex; gap: 12px; align-items: center">
        <!-- Quick Search -->
        <div class="catalog-search-wrapper">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            v-model="searchQuery"
            :placeholder="`Search ${currentTabMeta.label.toLowerCase()}...`"
            class="catalog-search-input"
          />
          <button v-if="searchQuery" class="catalog-search-clear" @click="searchQuery = ''">&times;</button>
        </div>


        <!-- Add Button (Triggers Dedicated Pop Window) -->
        <button class="btn btn-primary-sm" @click="openAddModal">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" />
          </svg>
          <span>Add {{ currentTabMeta.singular }}</span>
        </button>
      </div>
    </div>

    <!-- Folder Tabs Navigation Bar with Scroll Arrows (No scrollbar) -->
    <div class="catalog-tabs-nav-wrapper">
      <!-- Previous Arrow Button -->
      <button
        v-if="canScrollLeft"
        type="button"
        class="catalog-tab-arrow prev"
        @click="scrollTabs('left')"
        title="See previous tabs"
        aria-label="Previous tabs"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <!-- Scrollable Tabs Area -->
      <div
        ref="tabsContainerRef"
        class="catalog-folder-tabs"
        @scroll="checkScrollArrows"
      >
        <button
          v-for="tab in TABS"
          :key="tab.type"
          :class="['catalog-folder-tab', { active: activeTab === tab.type }]"
          @click="switchTab(tab.type)"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
          <span class="tab-count-badge">{{ getListCount(tab.type) }}</span>
        </button>
      </div>

      <!-- Next Arrow Button -->
      <button
        v-if="canScrollRight"
        type="button"
        class="catalog-tab-arrow next"
        @click="scrollTabs('right')"
        title="See more tabs"
        aria-label="Next tabs"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>

    <!-- Active Catalog Card / Table View -->
    <div class="card catalog-data-card" style="padding: 20px; flex: 1">
      <div class="catalog-card-topbar">
        <div class="catalog-meta-info">
          <h2 class="catalog-active-title">
            {{ currentTabMeta.icon }} {{ currentTabMeta.label }}
          </h2>
          <span class="catalog-active-desc">{{ currentTabMeta.description }}</span>
        </div>

        <div class="catalog-stats-pill">
          <strong>{{ filteredList.length }}</strong> of {{ getListCount(activeTab) }} records displayed
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredList.length === 0" class="catalog-empty-state">
        <div class="catalog-empty-icon">{{ currentTabMeta.icon }}</div>
        <h4>No {{ currentTabMeta.label }} found</h4>
        <p v-if="searchQuery">No results matching "{{ searchQuery }}". Try clearing the search query.</p>
        <p v-else>There are no registered entries in this catalog yet.</p>
        <button class="btn btn-primary-sm" style="margin-top: 12px" @click="openAddModal">
          + Add First {{ currentTabMeta.singular }}
        </button>
      </div>

      <!-- Table View with Inline Editing -->
      <!-- Table View with Inline Editing (Desktop) -->
      <div v-else class="catalog-views-wrapper">
        <div class="table-responsive catalog-table-container catalog-desktop-table">
          <table class="catalog-table">
            <thead>
              <tr>
                <th
                  style="width: 130px; cursor: pointer; user-select: none;"
                  class="sortable-header"
                  :class="{ active: sortBy === 'code-asc' || sortBy === 'code-desc' }"
                  @click="toggleSort('code')"
                  title="Sort by Number / Code (Click to toggle)"
                >
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span>CODE / ID</span>
                    <span class="sort-indicator">
                      <template v-if="sortBy === 'code-asc'">▲</template>
                      <template v-else-if="sortBy === 'code-desc'">▼</template>
                      <template v-else>↕</template>
                    </span>
                  </div>
                </th>
                <th
                  style="cursor: pointer; user-select: none;"
                  class="sortable-header"
                  :class="{ active: sortBy === 'name-asc' || sortBy === 'name-desc' }"
                  @click="toggleSort('name')"
                  title="Sort Alphabetically by Name (Click to toggle)"
                >
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span>{{ currentTabMeta.nameColHeader }}</span>
                    <span class="sort-indicator">
                      <template v-if="sortBy === 'name-asc'">▲</template>
                      <template v-else-if="sortBy === 'name-desc'">▼</template>
                      <template v-else>↕</template>
                    </span>
                  </div>
                </th>

                <!-- Offices columns -->
                <th
                  v-if="activeTab === 'office'"
                  style="width: 180px; cursor: pointer; user-select: none;"
                  class="sortable-header"
                  :class="{ active: sortBy === 'acronym-asc' || sortBy === 'acronym-desc' }"
                  @click="toggleSort('acronym')"
                  title="Sort by Acronym (Click to toggle)"
                >
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span>ACRONYM</span>
                    <span class="sort-indicator">
                      <template v-if="sortBy === 'acronym-asc'">▲</template>
                      <template v-else-if="sortBy === 'acronym-desc'">▼</template>
                      <template v-else>↕</template>
                    </span>
                  </div>
                </th>
                <th
                  v-if="activeTab === 'office'"
                  style="width: 200px; cursor: pointer; user-select: none;"
                  class="sortable-header"
                  :class="{ active: sortBy === 'title-asc' || sortBy === 'title-desc' }"
                  @click="toggleSort('title')"
                  title="Sort by Office Title (Click to toggle)"
                >
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span>OFFICE TITLE</span>
                    <span class="sort-indicator">
                      <template v-if="sortBy === 'title-asc'">▲</template>
                      <template v-else-if="sortBy === 'title-desc'">▼</template>
                      <template v-else>↕</template>
                    </span>
                  </div>
                </th>

                <!-- Work Type column -->
                <th
                  v-if="activeTab === 'work_type'"
                  style="width: 200px; cursor: pointer; user-select: none;"
                  class="sortable-header"
                  :class="{ active: sortBy === 'title-asc' || sortBy === 'title-desc' }"
                  @click="toggleSort('title')"
                  title="Sort by Work Title (Click to toggle)"
                >
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span>WORK TITLE</span>
                    <span class="sort-indicator">
                      <template v-if="sortBy === 'title-asc'">▲</template>
                      <template v-else-if="sortBy === 'title-desc'">▼</template>
                      <template v-else>↕</template>
                    </span>
                  </div>
                </th>

                <!-- Item Type column -->
                <th
                  v-if="activeTab === 'item_type'"
                  style="width: 190px; cursor: pointer; user-select: none;"
                  class="sortable-header"
                  :class="{ active: sortBy === 'title-asc' || sortBy === 'title-desc' }"
                  @click="toggleSort('title')"
                  title="Sort by Item Title (Click to toggle)"
                >
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span>ITEM TITLE</span>
                    <span class="sort-indicator">
                      <template v-if="sortBy === 'title-asc'">▲</template>
                      <template v-else-if="sortBy === 'title-desc'">▼</template>
                      <template v-else>↕</template>
                    </span>
                  </div>
                </th>

                <!-- Item Type Tag Color Column -->
                <th
                  v-if="activeTab === 'item_type'"
                  style="width: 170px;"
                >
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span>TAG COLOR</span>
                  </div>
                </th>

                <!-- Equipment columns -->
                <th
                  v-if="activeTab === 'equipment'"
                  style="cursor: pointer; user-select: none;"
                  class="sortable-header"
                  :class="{ active: sortBy === 'category-asc' || sortBy === 'category-desc' }"
                  @click="toggleSort('category')"
                  title="Sort by Category (Click to toggle)"
                >
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span>CATEGORY</span>
                    <span class="sort-indicator">
                      <template v-if="sortBy === 'category-asc'">▲</template>
                      <template v-else-if="sortBy === 'category-desc'">▼</template>
                      <template v-else>↕</template>
                    </span>
                  </div>
                </th>
                <th
                  v-if="activeTab === 'equipment'"
                  style="cursor: pointer; user-select: none;"
                  class="sortable-header"
                  :class="{ active: sortBy === 'location-asc' || sortBy === 'location-desc' }"
                  @click="toggleSort('location')"
                  title="Sort by Storage Location (Click to toggle)"
                >
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span>STORAGE LOCATION</span>
                    <span class="sort-indicator">
                      <template v-if="sortBy === 'location-asc'">▲</template>
                      <template v-else-if="sortBy === 'location-desc'">▼</template>
                      <template v-else>↕</template>
                    </span>
                  </div>
                </th>
                <th
                  v-if="activeTab === 'equipment'"
                  style="cursor: pointer; user-select: none;"
                  class="sortable-header"
                  :class="{ active: sortBy === 'owner-asc' || sortBy === 'owner-desc' }"
                  @click="toggleSort('owner')"
                  title="Sort by Owner (Click to toggle)"
                >
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span>OWNER</span>
                    <span class="sort-indicator">
                      <template v-if="sortBy === 'owner-asc'">▲</template>
                      <template v-else-if="sortBy === 'owner-desc'">▼</template>
                      <template v-else>↕</template>
                    </span>
                  </div>
                </th>
                <th
                  v-if="activeTab === 'equipment'"
                  style="cursor: pointer; user-select: none; width: 130px;"
                  class="sortable-header"
                  :class="{ active: sortBy === 'purchased-asc' || sortBy === 'purchased-desc' }"
                  @click="toggleSort('purchased')"
                  title="Sort by Date Purchased (Click to toggle)"
                >
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span>PURCHASED</span>
                    <span class="sort-indicator">
                      <template v-if="sortBy === 'purchased-asc'">▲</template>
                      <template v-else-if="sortBy === 'purchased-desc'">▼</template>
                      <template v-else>↕</template>
                    </span>
                  </div>
                </th>
                <th v-if="activeTab === 'equipment'" style="text-align: center; width: 80px">UNITS</th>

                <th style="text-align: right; width: 110px">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in filteredList"
                :key="item.id"
                :class="['catalog-table-row', { 'is-inline-editing': editingRowId === item.id }]"
              >
                <!-- 1. Code / ID Cell -->
                <td>
                  <template v-if="editingRowId === item.id">
                    <input
                      type="text"
                      class="catalog-inline-input code-input"
                      v-model="inlineFormCode"
                      placeholder="Code"
                      @keydown.enter="saveInlineEdit(item)"
                      @keydown.esc="cancelInlineEdit"
                    />
                  </template>
                  <template v-else>
                    <span class="catalog-code-badge">{{ item.code || 'N/A' }}</span>
                  </template>
                </td>

                <!-- 2. Primary Name Cell -->
                <td>
                  <template v-if="editingRowId === item.id">
                    <div class="catalog-inline-name-group">
                      <input
                        type="text"
                        class="catalog-inline-input name-input"
                        v-model="inlineFormName"
                        placeholder="Name (Required)"
                        @keydown.enter="saveInlineEdit(item)"
                        @keydown.esc="cancelInlineEdit"
                        ref="inlineNameInputRef"
                      />
                      <input
                        v-if="activeTab === 'equipment'"
                        type="text"
                        class="catalog-inline-input desc-input"
                        v-model="inlineFormDescription"
                        placeholder="Description / details"
                        @keydown.enter="saveInlineEdit(item)"
                        @keydown.esc="cancelInlineEdit"
                      />
                    </div>
                  </template>
                  <template v-else>
                    <div class="catalog-primary-name">{{ item.name }}</div>
                    <div v-if="item.description && activeTab === 'equipment'" class="catalog-sub-desc">
                      {{ item.description }}
                    </div>
                  </template>
                </td>

                <!-- 3. Offices: Acronym & Office Title -->
                <template v-if="activeTab === 'office'">
                  <td>
                    <input
                      v-if="editingRowId === item.id"
                      type="text"
                      class="catalog-inline-input"
                      v-model="inlineFormAcronym"
                      placeholder="Acronym"
                      @keydown.enter="saveInlineEdit(item)"
                      @keydown.esc="cancelInlineEdit"
                    />
                    <span v-else class="catalog-cat-tag" style="background: rgba(30, 64, 175, 0.08); color: #1E40AF; font-weight: 600">
                      {{ item.acronym || '—' }}
                    </span>
                  </td>
                  <td>
                    <input
                      v-if="editingRowId === item.id"
                      type="text"
                      class="catalog-inline-input"
                      v-model="inlineFormTitle"
                      placeholder="Office Title"
                      @keydown.enter="saveInlineEdit(item)"
                      @keydown.esc="cancelInlineEdit"
                    />
                    <span v-else class="catalog-loc-text" style="font-weight: 500">
                      {{ item.title || '—' }}
                    </span>
                  </td>
                </template>

                <!-- 4. Work Type: Work Title -->
                <td v-if="activeTab === 'work_type'">
                  <input
                    v-if="editingRowId === item.id"
                    type="text"
                    class="catalog-inline-input"
                    v-model="inlineFormTitle"
                    placeholder="Work Title"
                    @keydown.enter="saveInlineEdit(item)"
                    @keydown.esc="cancelInlineEdit"
                  />
                  <span v-else class="catalog-cat-tag" style="background: rgba(0, 108, 73, 0.08); color: #006C49; font-weight: 600">
                    {{ item.title || '—' }}
                  </span>
                </td>

                <!-- 5. Item Type: Item Title & Tag Color -->
                <template v-if="activeTab === 'item_type'">
                  <td>
                    <input
                      v-if="editingRowId === item.id"
                      type="text"
                      class="catalog-inline-input"
                      v-model="inlineFormTitle"
                      placeholder="Item Title"
                      @keydown.enter="saveInlineEdit(item)"
                      @keydown.esc="cancelInlineEdit"
                    />
                    <span v-else class="catalog-cat-tag" style="background: rgba(180, 83, 9, 0.08); color: #B45309; font-weight: 600">
                      {{ item.title || '—' }}
                    </span>
                  </td>

                  <!-- Tag Color Cell -->
                  <td>
                    <!-- Inline Edit Mode -->
                    <div v-if="editingRowId === item.id" class="catalog-inline-color-wrapper">
                      <button
                        type="button"
                        class="catalog-inline-color-swatch-btn"
                        :style="{ backgroundColor: inlineFormColor || '#8BA869' }"
                        @click="openQuickColorPicker(item, true)"
                        title="Open color presets & advanced picker"
                      ></button>
                      <input
                        type="text"
                        class="catalog-inline-input color-hex-input"
                        v-model="inlineFormColor"
                        placeholder="#8BA869"
                        maxlength="9"
                        @keydown.enter="saveInlineEdit(item)"
                        @keydown.esc="cancelInlineEdit"
                      />
                    </div>

                    <!-- View Mode: Dynamic Color Badge -->
                    <div v-else class="catalog-color-display-row">
                      <div
                        class="catalog-color-badge-pill"
                        :style="{ backgroundColor: item.color || getItemTypeColor(item.name, props.catalogs) }"
                        :title="`Tag Color: ${item.color || getItemTypeColor(item.name, props.catalogs)} (Click to customize)`"
                        @click="openQuickColorPicker(item)"
                        style="cursor: pointer;"
                      >
                        <span class="catalog-color-pill-dot"></span>
                        <span class="catalog-color-pill-hex">
                          {{ (item.color || getItemTypeColor(item.name, props.catalogs)).toUpperCase() }}
                        </span>
                      </div>
                    </div>
                  </td>
                </template>

                <!-- 6. Equipment Columns -->
                <template v-if="activeTab === 'equipment'">
                  <td>
                    <input
                      v-if="editingRowId === item.id"
                      type="text"
                      class="catalog-inline-input"
                      v-model="inlineFormCategory"
                      placeholder="Category"
                      @keydown.enter="saveInlineEdit(item)"
                      @keydown.esc="cancelInlineEdit"
                    />
                    <span v-else class="catalog-cat-tag">{{ item.category || 'General' }}</span>
                  </td>
                  <td>
                    <input
                      v-if="editingRowId === item.id"
                      type="text"
                      class="catalog-inline-input"
                      v-model="inlineFormLocation"
                      placeholder="Location"
                      @keydown.enter="saveInlineEdit(item)"
                      @keydown.esc="cancelInlineEdit"
                    />
                    <span v-else class="catalog-loc-text">{{ item.location || 'Depot' }}</span>
                  </td>
                  <td>
                    <input
                      v-if="editingRowId === item.id"
                      type="text"
                      class="catalog-inline-input"
                      v-model="inlineFormOwner"
                      placeholder="Owner / Office"
                      @keydown.enter="saveInlineEdit(item)"
                      @keydown.esc="cancelInlineEdit"
                    />
                    <span v-else class="catalog-owner-badge">{{ item.owner || '—' }}</span>
                  </td>
                  <td>
                    <input
                      v-if="editingRowId === item.id"
                      type="date"
                      class="catalog-inline-input"
                      v-model="inlineFormPurchased"
                      @keydown.enter="saveInlineEdit(item)"
                      @keydown.esc="cancelInlineEdit"
                    />
                    <span v-else class="catalog-purchased-text">{{ formatPurchasedDate(item.purchased) }}</span>
                  </td>
                  <td style="text-align: center">
                    <input
                      v-if="editingRowId === item.id"
                      type="number"
                      min="0"
                      class="catalog-inline-input qty-input"
                      v-model.number="inlineFormQuantity"
                      @keydown.enter="saveInlineEdit(item)"
                      @keydown.esc="cancelInlineEdit"
                    />
                    <span v-else class="catalog-qty-badge">{{ item.quantity ?? 1 }}</span>
                  </td>
                </template>

                <!-- 7. Actions Cell -->
                <td style="text-align: right">
                  <!-- If Inline Editing this row -->
                  <div v-if="editingRowId === item.id" class="catalog-actions-cell">
                    <button
                      type="button"
                      class="btn-catalog-action save"
                      @click="saveInlineEdit(item)"
                      title="Save changes (Enter)"
                      aria-label="Save"
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      class="btn-catalog-action cancel"
                      @click="cancelInlineEdit"
                      title="Cancel edit (Esc)"
                      aria-label="Cancel"
                    >
                      ✕
                    </button>
                  </div>

                  <!-- Normal view: Edit & Delete buttons -->
                  <div v-else class="catalog-actions-cell">
                    <button
                      type="button"
                      class="btn-catalog-action edit"
                      @click="startInlineEdit(item)"
                      title="Quick inline edit"
                      aria-label="Edit"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="btn-catalog-action delete"
                      @click="handleDeleteClick(item)"
                      title="Delete record"
                      aria-label="Delete"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
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
        <div class="catalog-mobile-list">
          <div
            v-for="item in filteredList"
            :key="'mob-' + item.id"
            :class="['catalog-mobile-card', { 'is-editing': editingRowId === item.id }]"
          >
            <!-- 1. NORMAL VIEW MODE -->
            <template v-if="editingRowId !== item.id">
              <!-- Header Row: Code & Category/Acronym on left, Action buttons on right -->
              <div class="catalog-mc-header">
                <div class="catalog-mc-badges">
                  <span class="catalog-code-badge">{{ item.code || 'N/A' }}</span>
                  <span
                    v-if="activeTab === 'office' && item.acronym"
                    class="catalog-cat-tag"
                    style="background: rgba(30, 64, 175, 0.08); color: #1E40AF; font-weight: 600"
                  >
                    {{ item.acronym }}
                  </span>
                  <span
                    v-else-if="activeTab === 'equipment' && item.category"
                    class="catalog-cat-tag"
                  >
                    {{ item.category }}
                  </span>
                </div>

                <!-- Actions on Mobile Header -->
                <div class="catalog-mc-actions">
                  <button
                    type="button"
                    class="btn-catalog-action edit"
                    @click="startInlineEdit(item)"
                    title="Edit record"
                    aria-label="Edit"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="btn-catalog-action delete"
                    @click="handleDeleteClick(item)"
                    title="Delete record"
                    aria-label="Delete"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Body: Primary Name -->
              <div class="catalog-mc-body">
                <div class="catalog-mc-primary-name">{{ item.name }}</div>

                <!-- Tab-Specific Details -->
                <!-- Office: Title -->
                <div v-if="activeTab === 'office' && item.title" class="catalog-mc-detail-row">
                  <span class="catalog-mc-label">Office Title:</span>
                  <span class="catalog-mc-value">{{ item.title }}</span>
                </div>

                <!-- Work Type: Title -->
                <div v-if="activeTab === 'work_type' && item.title" class="catalog-mc-detail-row">
                  <span class="catalog-mc-label">Work Title:</span>
                  <span class="catalog-cat-tag" style="background: rgba(0, 108, 73, 0.08); color: #006C49; font-weight: 600">
                    {{ item.title }}
                  </span>
                </div>

                <!-- Item Type: Title & Tag Color -->
                <template v-if="activeTab === 'item_type'">
                  <div v-if="item.title" class="catalog-mc-detail-row">
                    <span class="catalog-mc-label">Item Title:</span>
                    <span class="catalog-cat-tag" style="background: rgba(180, 83, 9, 0.08); color: #B45309; font-weight: 600">
                      {{ item.title }}
                    </span>
                  </div>

                  <!-- Tag Color Row -->
                  <div class="catalog-mc-detail-row" style="align-items: center">
                    <span class="catalog-mc-label">Tag Color:</span>
                    <div class="catalog-color-display-row">
                      <div
                        class="catalog-color-badge-pill"
                        :style="{ backgroundColor: item.color || getItemTypeColor(item.name, props.catalogs) }"
                        :title="`Tag Color: ${item.color || getItemTypeColor(item.name, props.catalogs)}`"
                        @click="openQuickColorPicker(item)"
                        style="cursor: pointer;"
                      >
                        <span class="catalog-color-pill-dot"></span>
                        <span class="catalog-color-pill-hex">
                          {{ (item.color || getItemTypeColor(item.name, props.catalogs)).toUpperCase() }}
                        </span>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Equipment: Description, Details, Location, Quantity -->
                <template v-if="activeTab === 'equipment'">
                  <div v-if="item.description" class="catalog-sub-desc">
                    {{ item.description }}
                  </div>
                  <div class="catalog-mc-equipment-details">
                    <div class="catalog-mc-detail-item" v-if="item.owner">
                      <span class="catalog-mc-detail-label">Owner:</span>
                      <span class="catalog-owner-badge">{{ item.owner }}</span>
                    </div>
                    <div class="catalog-mc-detail-item" v-if="item.purchased">
                      <span class="catalog-mc-detail-label">Purchased:</span>
                      <span class="catalog-purchased-text">{{ formatPurchasedDate(item.purchased) }}</span>
                    </div>
                  </div>
                  <div class="catalog-mc-meta-footer">
                    <div class="catalog-mc-loc">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0; color: #94A3B8">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{{ item.location || 'Depot' }}</span>
                    </div>
                    <span class="catalog-qty-badge">{{ item.quantity ?? 1 }} Units</span>
                  </div>
                </template>
              </div>
            </template>

            <!-- 2. MOBILE INLINE EDIT MODE -->
            <template v-else>
              <div class="catalog-mc-edit-form">
                <div class="catalog-mc-edit-header">
                  <span class="catalog-mc-edit-title">Editing Record</span>
                  <span class="catalog-code-badge">{{ inlineFormCode || item.code || 'N/A' }}</span>
                </div>

                <div class="catalog-mc-field">
                  <label class="catalog-mc-field-label">Code / ID</label>
                  <input
                    type="text"
                    class="catalog-inline-input"
                    v-model="inlineFormCode"
                    placeholder="Code"
                  />
                </div>

                <div class="catalog-mc-field">
                  <label class="catalog-mc-field-label">{{ currentTabMeta.nameColHeader }} *</label>
                  <input
                    type="text"
                    class="catalog-inline-input"
                    v-model="inlineFormName"
                    placeholder="Name"
                    ref="inlineNameInputRef"
                  />
                </div>

                <!-- Office Edit Fields -->
                <template v-if="activeTab === 'office'">
                  <div class="catalog-mc-field">
                    <label class="catalog-mc-field-label">Acronym</label>
                    <input
                      type="text"
                      class="catalog-inline-input"
                      v-model="inlineFormAcronym"
                      placeholder="Acronym (e.g. HRMO)"
                    />
                  </div>
                  <div class="catalog-mc-field">
                    <label class="catalog-mc-field-label">Office Title</label>
                    <input
                      type="text"
                      class="catalog-inline-input"
                      v-model="inlineFormTitle"
                      placeholder="Office Title"
                    />
                  </div>
                </template>

                <!-- Work Type Edit Field -->
                <div v-if="activeTab === 'work_type'" class="catalog-mc-field">
                  <label class="catalog-mc-field-label">Work Title</label>
                  <input
                    type="text"
                    class="catalog-inline-input"
                    v-model="inlineFormTitle"
                    placeholder="Work Title"
                  />
                </div>

                <!-- Item Type Edit Fields -->
                <template v-if="activeTab === 'item_type'">
                  <div class="catalog-mc-field">
                    <label class="catalog-mc-field-label">Item Title</label>
                    <input
                      type="text"
                      class="catalog-inline-input"
                      v-model="inlineFormTitle"
                      placeholder="Item Title"
                    />
                  </div>
                  <div class="catalog-mc-field">
                    <label class="catalog-mc-field-label">Tag Color</label>
                    <div class="catalog-inline-color-wrapper">
                      <button
                        type="button"
                        class="catalog-inline-color-swatch-btn"
                        :style="{ backgroundColor: inlineFormColor || '#8BA869' }"
                        @click="openQuickColorPicker(item, true)"
                        title="Pick Color"
                      ></button>
                      <input
                        type="text"
                        class="catalog-inline-input color-hex-input"
                        v-model="inlineFormColor"
                        placeholder="#8BA869"
                        maxlength="9"
                      />
                    </div>
                  </div>
                </template>

                <!-- Equipment Edit Fields -->
                <template v-if="activeTab === 'equipment'">
                  <div class="catalog-mc-field">
                    <label class="catalog-mc-field-label">Category</label>
                    <input
                      type="text"
                      class="catalog-inline-input"
                      v-model="inlineFormCategory"
                      placeholder="Category"
                    />
                  </div>
                  <div class="catalog-mc-field">
                    <label class="catalog-mc-field-label">Storage Location</label>
                    <input
                      type="text"
                      class="catalog-inline-input"
                      v-model="inlineFormLocation"
                      placeholder="Location"
                    />
                  </div>
                  <div class="catalog-mc-field">
                    <label class="catalog-mc-field-label">Quantity</label>
                    <input
                      type="number"
                      min="0"
                      class="catalog-inline-input"
                      v-model.number="inlineFormQuantity"
                      placeholder="Units"
                    />
                  </div>
                  <div class="catalog-mc-field">
                    <label class="catalog-mc-field-label">Owner</label>
                    <input
                      type="text"
                      class="catalog-inline-input"
                      v-model="inlineFormOwner"
                      placeholder="Owner / Office"
                    />
                  </div>
                  <div class="catalog-mc-field">
                    <label class="catalog-mc-field-label">Date Purchased</label>
                    <input
                      type="date"
                      class="catalog-inline-input"
                      v-model="inlineFormPurchased"
                    />
                  </div>
                  <div class="catalog-mc-field">
                    <label class="catalog-mc-field-label">Description</label>
                    <input
                      type="text"
                      class="catalog-inline-input"
                      v-model="inlineFormDescription"
                      placeholder="Description"
                    />
                  </div>
                </template>

                <!-- Edit Mode Actions -->
                <div class="catalog-mc-edit-actions">
                  <button
                    type="button"
                    class="btn-catalog-action save catalog-mc-btn-save"
                    @click="saveInlineEdit(item)"
                  >
                    ✓ Save Changes
                  </button>
                  <button
                    type="button"
                    class="btn-catalog-action cancel catalog-mc-btn-cancel"
                    @click="cancelInlineEdit"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- DEDICATED ADD POPUP WINDOW (POP WINDOW) -->
    <Teleport to="body">
      <div
        v-if="isAddModalOpen"
        class="catalog-pop-backdrop"
        @click.self="closeAddModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-add-title"
      >
        <div class="catalog-pop-window" role="document">
          <!-- Pop Window Header -->
          <div class="catalog-pop-header">
            <div class="catalog-pop-header-main">
              <span class="catalog-pop-icon-badge">{{ currentTabMeta.icon }}</span>
              <div>
                <h3 id="catalog-add-title" class="catalog-pop-title">
                  Register New {{ currentTabMeta.singular }}
                </h3>
                <p class="catalog-pop-subtitle">
                  Adding entry to <span class="catalog-pop-tag">{{ currentTabMeta.label }}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              class="catalog-pop-close-btn"
              @click="closeAddModal"
              title="Close window (Esc)"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          <!-- Pop Window Form -->
          <form @submit.prevent="handleSaveAddForm" class="catalog-pop-form">
            <div class="catalog-pop-grid">
              <!-- 1. Primary Name (Required for all tabs) -->
              <div class="catalog-pop-field full">
                <label class="catalog-pop-label">
                  {{ currentTabMeta.nameColHeader }} <span class="required-star">*</span>
                </label>
                <div class="catalog-pop-input-wrapper">
                  <input
                    ref="addNameInputRef"
                    type="text"
                    class="catalog-pop-input name-input"
                    v-model="addFormName"
                    :placeholder="`e.g. ${currentTabMeta.namePlaceholder}`"
                    required
                    autocomplete="off"
                  />
                </div>
                <span class="catalog-pop-hint">The primary operational name displayed across work orders and logs.</span>
              </div>

              <!-- 2. Code / ID -->
              <div class="catalog-pop-field half">
                <div class="catalog-pop-label-row">
                  <label class="catalog-pop-label">
                    Code / Identifier
                  </label>
                  <span
                    v-if="suggestedCode"
                    class="catalog-suggested-pill"
                    :class="{ 'is-applied': addFormCode.trim() === suggestedCode }"
                    @click="addFormCode = suggestedCode"
                    title="Click to apply suggested sequential code"
                  >
                    Auto: <strong>{{ suggestedCode }}</strong>
                  </span>
                </div>
                <div class="catalog-code-input-wrapper">
                  <input
                    type="text"
                    class="catalog-pop-input code"
                    v-model="addFormCode"
                    :placeholder="suggestedCode || `e.g. ${currentTabMeta.codePlaceholder}`"
                    autocomplete="off"
                  />
                  <button
                    v-if="suggestedCode && addFormCode.trim() !== suggestedCode"
                    type="button"
                    class="btn-reset-suggested-code"
                    @click="addFormCode = suggestedCode"
                    title="Reset to suggested sequential code"
                  >
                    ↺ Use {{ suggestedCode }}
                  </button>
                </div>
                <span class="catalog-pop-hint">
                  Auto-suggested based on saved order. You can freely edit or type your own code.
                </span>
              </div>

              <!-- 3. Offices Specific Fields: Acronym & Office Title -->
              <template v-if="activeTab === 'office'">
                <div class="catalog-pop-field half">
                  <label class="catalog-pop-label">
                    Acronym
                  </label>
                  <input
                    type="text"
                    class="catalog-pop-input"
                    v-model="addFormAcronym"
                    placeholder="e.g. OP, HRMO, UICTS"
                    autocomplete="off"
                  />
                  <span class="catalog-pop-hint">Standard university abbreviation or acronym</span>
                </div>
                <div class="catalog-pop-field full">
                  <label class="catalog-pop-label">
                    Office Title
                  </label>
                  <input
                    type="text"
                    class="catalog-pop-input"
                    v-model="addFormTitle"
                    placeholder="e.g. OP, HRMO, AUDIT"
                    autocomplete="off"
                  />
                  <span class="catalog-pop-hint">Short formal title used in registry</span>
                </div>
              </template>

              <!-- 4. Work Type Specific Field: Work Title -->
              <div v-if="activeTab === 'work_type'" class="catalog-pop-field half">
                <label class="catalog-pop-label">
                  Work Title
                </label>
                <input
                  type="text"
                  class="catalog-pop-input"
                  v-model="addFormTitle"
                  placeholder="e.g. REPAIR, REPLACEMENT, FAB & INSTALL"
                  autocomplete="off"
                />
                <span class="catalog-pop-hint">Uppercase short title for job classification</span>
              </div>

              <!-- 5. Item Type Specific Fields: Item Title & Tag Color -->
              <template v-if="activeTab === 'item_type'">
                <div class="catalog-pop-field half">
                  <label class="catalog-pop-label">
                    Item Title
                  </label>
                  <input
                    type="text"
                    class="catalog-pop-input"
                    v-model="addFormTitle"
                    placeholder="e.g. BUILDING, FLOOR, WALL, DOOR"
                    autocomplete="off"
                  />
                  <span class="catalog-pop-hint">Uppercase title identifier</span>
                </div>

                <div class="catalog-pop-field full">
                  <label class="catalog-pop-label">
                    Assign Tag Color
                  </label>
                  <ColorPickerWithPresets
                    v-model="addFormColor"
                    :preview-text="addFormName || 'Sample Item Tag'"
                  />
                  <span class="catalog-pop-hint">Select a curated preset or expand Advanced Mode for custom spectrum, eyedropper, and RGB channels.</span>
                </div>
              </template>

              <!-- 6. Equipment Specific Fields -->
              <template v-if="activeTab === 'equipment'">
                <div class="catalog-pop-field half">
                  <label class="catalog-pop-label">
                    Category / Classification
                  </label>
                  <input
                    type="text"
                    class="catalog-pop-input"
                    v-model="addFormCategory"
                    placeholder="e.g. Heavy Duty, Hand Tools, Power Tools"
                    autocomplete="off"
                  />
                  <span class="catalog-pop-hint">Tool classification or group</span>
                </div>

                <div class="catalog-pop-field half">
                  <label class="catalog-pop-label">
                    Storage Location / Depot Bay
                  </label>
                  <input
                    type="text"
                    class="catalog-pop-input"
                    v-model="addFormLocation"
                    placeholder="e.g. Depot Bay 1, Rack A"
                    autocomplete="off"
                  />
                  <span class="catalog-pop-hint">Where tools and equipment are kept</span>
                </div>

                <div class="catalog-pop-field half">
                  <label class="catalog-pop-label">
                    Units in Stock / Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    class="catalog-pop-input qty"
                    v-model.number="addFormQuantity"
                    placeholder="1"
                  />
                  <span class="catalog-pop-hint">Current depot quantity</span>
                </div>

                <div class="catalog-pop-field half">
                  <label class="catalog-pop-label">
                    Owner / Office Custodian
                  </label>
                  <input
                    type="text"
                    class="catalog-pop-input"
                    v-model="addFormOwner"
                    placeholder="e.g. Facilities Management Office"
                    autocomplete="off"
                  />
                  <span class="catalog-pop-hint">Managing department or custodian</span>
                </div>

                <div class="catalog-pop-field half">
                  <label class="catalog-pop-label">
                    Date Purchased / Acquired
                  </label>
                  <input
                    type="date"
                    class="catalog-pop-input"
                    v-model="addFormPurchased"
                  />
                  <span class="catalog-pop-hint">Acquisition or receipt date</span>
                </div>

                <div class="catalog-pop-field full">
                  <label class="catalog-pop-label">
                    Additional Notes / Specifications
                  </label>
                  <textarea
                    class="catalog-pop-textarea"
                    v-model="addFormDescription"
                    placeholder="Add specifications, model info, or remarks..."
                    rows="3"
                  ></textarea>
                </div>
              </template>

              <!-- Batch Spreadsheet Upload Feature (Below fields for all categories) -->
              <div class="catalog-pop-field full">
                <CatalogExcelDropzone
                  :catalog-type="activeTab"
                  :category-label="currentTabMeta.label"
                  :existing-items="currentList"
                  @parsed="handleExcelParsed"
                  @error="handleExcelError"
                />
              </div>
            </div>

            <!-- Pop Window Footer -->
            <div class="catalog-pop-footer">
              <button
                type="button"
                class="catalog-pop-btn-cancel"
                @click="closeAddModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="catalog-pop-btn-submit"
                :disabled="!addFormName.trim()"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 5v14M5 12h14" stroke-linecap="round" />
                </svg>
                <span>Save & Register {{ currentTabMeta.singular }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Dedicated Quick Color Picker Modal for Item Type Rows -->
    <Teleport to="body">
      <div
        v-if="quickColorTargetItem"
        class="catalog-pop-backdrop color-picker-backdrop"
        @click.self="closeQuickColorPicker"
        role="dialog"
        aria-modal="true"
      >
        <div class="color-quick-picker-modal" role="document">
          <!-- Pop Window Header -->
          <div class="color-picker-modal-header">
            <div class="color-picker-header-left">
              <div class="color-picker-icon-badge">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z"/>
                  <circle cx="13.5" cy="6.5" r=".7" fill="currentColor"/>
                  <circle cx="17.5" cy="10.5" r=".7" fill="currentColor"/>
                  <circle cx="8.5" cy="7.5" r=".7" fill="currentColor"/>
                  <circle cx="6.5" cy="12.5" r=".7" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <div class="color-picker-title-row">
                  <h3 class="color-picker-modal-title">Tag Color: {{ quickColorTargetItem.name }}</h3>
                </div>
                <p class="color-picker-modal-subtitle">Pick from 24 curated swatches or customize with advanced tools</p>
              </div>
            </div>
            <button
              type="button"
              class="color-picker-close-btn"
              @click="closeQuickColorPicker"
              title="Close (Esc)"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Pop Window Body -->
          <div class="color-quick-picker-body">
            <ColorPickerWithPresets
              :model-value="quickColorValue"
              :preview-text="quickColorTargetItem.name"
              @update:model-value="handleQuickColorUpdate"
            />
          </div>

          <!-- Pop Window Footer -->
          <div class="color-picker-modal-footer">
            <button
              type="button"
              class="color-picker-cancel-btn"
              @click="closeQuickColorPicker"
            >
              Cancel
            </button>
            <button
              type="button"
              class="color-picker-apply-btn"
              @click="saveQuickColorChange"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Apply Tag Color</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Duplicate Conflict Resolution Review Modal -->
    <Teleport to="body">
      <CatalogConflictModal
        :is-open="isConflictModalOpen"
        :category-label="currentTabMeta.label"
        :clean-items-count="pendingCleanItems.length"
        :conflicts="pendingConflicts"
        @close="isConflictModalOpen = false"
        @confirm="handleConfirmConflictResolutions"
      />
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { CatalogItem, CatalogType, MasterCatalogsState } from '../types';
import { ITEM_TYPE_COLOR_PALETTE, getItemTypeColor } from '../utils/catalogsData';
import ColorPickerWithPresets from '../components/ui/ColorPickerWithPresets.vue';
import CatalogExcelDropzone from '../components/ui/CatalogExcelDropzone.vue';
import CatalogConflictModal from '../components/modals/CatalogConflictModal.vue';
import { ParseCatalogExcelResult, ConflictItemPair } from '../services/excelCatalogService';
import { useCatalogsStore } from '../stores/catalogs';

const props = defineProps<{
  catalogs: MasterCatalogsState;
}>();

const catalogsStore = useCatalogsStore();

const emit = defineEmits<{
  (e: 'addItem', item: CatalogItem): void;
  (e: 'updateItem', item: CatalogItem): void;
  (e: 'deleteItem', id: string, type: CatalogType): void;
  (e: 'toast', message: string, type?: 'info' | 'success' | 'warning'): void;
}>();

interface TabMeta {
  type: CatalogType;
  label: string;
  singular: string;
  icon: string;
  description: string;
  nameColHeader: string;
  namePlaceholder: string;
  codePlaceholder: string;
}

const TABS: TabMeta[] = [
  {
    type: 'office',
    label: 'Offices',
    singular: 'Office',
    icon: '🏢',
    description: 'University administrative offices, colleges, departments, and housing facilities.',
    nameColHeader: 'OFFICE NAME',
    namePlaceholder: 'Office of the President',
    codePlaceholder: '100'
  },
  {
    type: 'work_type',
    label: 'Work Type',
    singular: 'Work Type',
    icon: '🛠️',
    description: 'Operational work classifications and job types.',
    nameColHeader: 'WORK TYPE',
    namePlaceholder: 'Repair',
    codePlaceholder: '11'
  },
  {
    type: 'activity_type',
    label: 'Activity Type',
    singular: 'Activity Type',
    icon: '📋',
    description: 'Operational activity classifications and trade tasks.',
    nameColHeader: 'ACTIVITY TYPE',
    namePlaceholder: 'Carpentry Works',
    codePlaceholder: '01'
  },
  {
    type: 'item_type',
    label: 'Item Type',
    singular: 'Item Type',
    icon: '📦',
    description: 'Facility structure elements, architectural categories, and asset item types.',
    nameColHeader: 'ITEM TYPE',
    namePlaceholder: 'Building/Structure',
    codePlaceholder: '01'
  },
  {
    type: 'equipment',
    label: 'Equipment & Tools Registry',
    singular: 'Equipment / Tool',
    icon: '🧰',
    description: 'Depot machinery, testing apparatus, and field tools available for checkout.',
    nameColHeader: 'EQUIPMENT / TOOL NAME',
    namePlaceholder: 'Industrial Scaffolding Kit',
    codePlaceholder: 'EQ-001'
  }
];

const activeTab = ref<CatalogType>('office');
const searchQuery = ref('');

type SortOption =
  | 'code-asc'
  | 'code-desc'
  | 'name-asc'
  | 'name-desc'
  | 'acronym-asc'
  | 'acronym-desc'
  | 'title-asc'
  | 'title-desc'
  | 'category-asc'
  | 'category-desc'
  | 'location-asc'
  | 'location-desc'
  | 'owner-asc'
  | 'owner-desc'
  | 'purchased-asc'
  | 'purchased-desc';

const sortBy = ref<SortOption>('code-asc');

const toggleSort = (field: 'code' | 'name' | 'acronym' | 'title' | 'category' | 'location' | 'owner' | 'purchased') => {
  if (field === 'code') {
    sortBy.value = sortBy.value === 'code-asc' ? 'code-desc' : 'code-asc';
  } else if (field === 'name') {
    sortBy.value = sortBy.value === 'name-asc' ? 'name-desc' : 'name-asc';
  } else if (field === 'acronym') {
    sortBy.value = sortBy.value === 'acronym-asc' ? 'acronym-desc' : 'acronym-asc';
  } else if (field === 'title') {
    sortBy.value = sortBy.value === 'title-asc' ? 'title-desc' : 'title-asc';
  } else if (field === 'category') {
    sortBy.value = sortBy.value === 'category-asc' ? 'category-desc' : 'category-asc';
  } else if (field === 'location') {
    sortBy.value = sortBy.value === 'location-asc' ? 'location-desc' : 'location-asc';
  } else if (field === 'owner') {
    sortBy.value = sortBy.value === 'owner-asc' ? 'owner-desc' : 'owner-asc';
  } else if (field === 'purchased') {
    sortBy.value = sortBy.value === 'purchased-asc' ? 'purchased-desc' : 'purchased-asc';
  }
};

const formatPurchasedDate = (dateStr?: string): string => {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, monthIndex, day);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

const currentTabMeta = computed(() => {
  return TABS.find((t) => t.type === activeTab.value) || TABS[0];
});

const currentList = computed<CatalogItem[]>(() => {
  if (activeTab.value === 'office') return props.catalogs.offices || [];
  if (activeTab.value === 'work_type') return props.catalogs.workTypes || [];
  if (activeTab.value === 'activity_type') return props.catalogs.activityTypes || [];
  if (activeTab.value === 'item_type') return props.catalogs.itemTypes || [];
  if (activeTab.value === 'equipment') return props.catalogs.equipment || [];
  return [];
});

const getListCount = (type: CatalogType): number => {
  if (type === 'office') return (props.catalogs.offices || []).length;
  if (type === 'work_type') return (props.catalogs.workTypes || []).length;
  if (type === 'activity_type') return (props.catalogs.activityTypes || []).length;
  if (type === 'item_type') return (props.catalogs.itemTypes || []).length;
  if (type === 'equipment') return (props.catalogs.equipment || []).length;
  return 0;
};

const filteredList = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  let list = currentList.value;

  if (q) {
    list = list.filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        (item.code && item.code.toLowerCase().includes(q)) ||
        (item.acronym && item.acronym.toLowerCase().includes(q)) ||
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.owner && item.owner.toLowerCase().includes(q)) ||
        (item.purchased && item.purchased.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    });
  }

  const sorted = [...list].sort((a, b) => {
    if (sortBy.value === 'code-asc') {
      if (!a.code && !b.code) return 0;
      if (!a.code) return 1;
      if (!b.code) return -1;
      return a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' });
    }
    if (sortBy.value === 'code-desc') {
      if (!a.code && !b.code) return 0;
      if (!a.code) return 1;
      if (!b.code) return -1;
      return b.code.localeCompare(a.code, undefined, { numeric: true, sensitivity: 'base' });
    }
    if (sortBy.value === 'name-asc') {
      return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
    }
    if (sortBy.value === 'name-desc') {
      return (b.name || '').localeCompare(a.name || '', undefined, { sensitivity: 'base' });
    }
    if (sortBy.value === 'acronym-asc') {
      return (a.acronym || '').localeCompare(b.acronym || '', undefined, { sensitivity: 'base' });
    }
    if (sortBy.value === 'acronym-desc') {
      return (b.acronym || '').localeCompare(a.acronym || '', undefined, { sensitivity: 'base' });
    }
    if (sortBy.value === 'title-asc') {
      return (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' });
    }
    if (sortBy.value === 'title-desc') {
      return (b.title || '').localeCompare(a.title || '', undefined, { sensitivity: 'base' });
    }
    if (sortBy.value === 'category-asc') {
      return (a.category || '').localeCompare(b.category || '', undefined, { sensitivity: 'base' });
    }
    if (sortBy.value === 'category-desc') {
      return (b.category || '').localeCompare(a.category || '', undefined, { sensitivity: 'base' });
    }
    if (sortBy.value === 'location-asc') {
      return (a.location || '').localeCompare(b.location || '', undefined, { sensitivity: 'base' });
    }
    if (sortBy.value === 'location-desc') {
      return (b.location || '').localeCompare(a.location || '', undefined, { sensitivity: 'base' });
    }
    if (sortBy.value === 'owner-asc') {
      return (a.owner || '').localeCompare(b.owner || '', undefined, { sensitivity: 'base' });
    }
    if (sortBy.value === 'owner-desc') {
      return (b.owner || '').localeCompare(a.owner || '', undefined, { sensitivity: 'base' });
    }
    if (sortBy.value === 'purchased-asc') {
      return (a.purchased || '').localeCompare(b.purchased || '');
    }
    if (sortBy.value === 'purchased-desc') {
      return (b.purchased || '').localeCompare(a.purchased || '');
    }
    return 0;
  });

  return sorted;
});

// ==========================================
// TABS NAVIGATION & SMOOTH ARROW SCROLLING
// ==========================================
const tabsContainerRef = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

const checkScrollArrows = () => {
  if (!tabsContainerRef.value) return;
  const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.value;
  canScrollLeft.value = scrollLeft > 6;
  canScrollRight.value = scrollLeft + clientWidth < scrollWidth - 6;
};

const scrollTabs = (direction: 'left' | 'right') => {
  if (!tabsContainerRef.value) return;
  const scrollAmount = 240;
  tabsContainerRef.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  });
  setTimeout(checkScrollArrows, 280);
};

const switchTab = (type: CatalogType) => {
  cancelInlineEdit();
  activeTab.value = type;
  nextTick(() => {
    checkScrollArrows();
    const activeEl = tabsContainerRef.value?.querySelector('.catalog-folder-tab.active') as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  });
};

// ==========================================
// 1. INLINE ROW EDITING
// ==========================================
const editingRowId = ref<string | null>(null);
const inlineFormCode = ref('');
const inlineFormName = ref('');
const inlineFormAcronym = ref('');
const inlineFormTitle = ref('');
const inlineFormColor = ref('');
const inlineFormCategory = ref('');
const inlineFormLocation = ref('');
const inlineFormOwner = ref('');
const inlineFormPurchased = ref('');
const inlineFormQuantity = ref<number>(1);
const inlineFormDescription = ref('');
const inlineNameInputRef = ref<HTMLInputElement | null>(null);

const startInlineEdit = (item: CatalogItem) => {
  editingRowId.value = item.id;
  inlineFormCode.value = item.code || '';
  inlineFormName.value = item.name;
  inlineFormAcronym.value = item.acronym || '';
  inlineFormTitle.value = item.title || '';
  inlineFormColor.value = item.color || getItemTypeColor(item.name, props.catalogs);
  inlineFormCategory.value = item.category || '';
  inlineFormLocation.value = item.location || '';
  inlineFormOwner.value = item.owner || '';
  inlineFormPurchased.value = item.purchased || '';
  inlineFormQuantity.value = item.quantity ?? 1;
  inlineFormDescription.value = item.description || '';

  nextTick(() => {
    if (inlineNameInputRef.value) {
      inlineNameInputRef.value.focus();
    }
  });
};

const cancelInlineEdit = () => {
  editingRowId.value = null;
  inlineFormCode.value = '';
  inlineFormName.value = '';
  inlineFormAcronym.value = '';
  inlineFormTitle.value = '';
  inlineFormColor.value = '';
  inlineFormCategory.value = '';
  inlineFormLocation.value = '';
  inlineFormOwner.value = '';
  inlineFormPurchased.value = '';
  inlineFormQuantity.value = 1;
  inlineFormDescription.value = '';
};

const saveInlineEdit = (item: CatalogItem) => {
  if (!inlineFormName.value.trim()) {
    emit('toast', '⚠️ Name cannot be empty', 'warning');
    return;
  }

  const updated: CatalogItem = {
    ...item,
    name: inlineFormName.value.trim(),
    code: inlineFormCode.value.trim() || undefined,
    acronym: activeTab.value === 'office' ? (inlineFormAcronym.value.trim() || undefined) : undefined,
    title: (activeTab.value === 'office' || activeTab.value === 'work_type' || activeTab.value === 'item_type') ? (inlineFormTitle.value.trim() || undefined) : undefined,
    color: activeTab.value === 'item_type' ? (inlineFormColor.value.trim() || item.color || getItemTypeColor(inlineFormName.value, props.catalogs)) : item.color,
    category: activeTab.value === 'equipment' ? (inlineFormCategory.value.trim() || undefined) : item.category,
    location: activeTab.value === 'equipment' ? (inlineFormLocation.value.trim() || undefined) : undefined,
    owner: activeTab.value === 'equipment' ? (inlineFormOwner.value.trim() || undefined) : undefined,
    purchased: activeTab.value === 'equipment' ? (inlineFormPurchased.value.trim() || undefined) : undefined,
    quantity: activeTab.value === 'equipment' ? Math.max(0, Number(inlineFormQuantity.value) || 0) : undefined,
    description: inlineFormDescription.value.trim() || undefined,
    isActive: true
  };

  emit('updateItem', updated);
  emit('toast', `✓ Saved ${currentTabMeta.value.singular}: ${updated.name}`, 'success');
  editingRowId.value = null;
};

const handleQuickColorChange = (item: CatalogItem, newColor: string) => {
  if (!newColor) return;
  const updated: CatalogItem = {
    ...item,
    color: newColor.trim()
  };
  emit('updateItem', updated);
  emit('toast', `✓ Updated tag color for "${item.name}"`, 'success');
};

// Color Picker Dialog (Presets + Advanced Mode)
const quickColorTargetItem = ref<CatalogItem | null>(null);
const quickColorValue = ref<string>('');
const isInlineColorPicker = ref(false);

const openQuickColorPicker = (item: CatalogItem, isInline = false) => {
  quickColorTargetItem.value = item;
  isInlineColorPicker.value = isInline;
  quickColorValue.value = isInline
    ? (inlineFormColor.value || item.color || getItemTypeColor(item.name, props.catalogs))
    : (item.color || getItemTypeColor(item.name, props.catalogs));
};

const closeQuickColorPicker = () => {
  quickColorTargetItem.value = null;
};

const handleQuickColorUpdate = (newColor: string) => {
  quickColorValue.value = newColor;
};

const saveQuickColorChange = () => {
  if (!quickColorTargetItem.value) return;
  const newColor = quickColorValue.value.trim();
  if (isInlineColorPicker.value) {
    inlineFormColor.value = newColor;
  } else {
    handleQuickColorChange(quickColorTargetItem.value, newColor);
  }
  quickColorTargetItem.value = null;
};

// ==========================================
// 2. DEDICATED ADD POPUP WINDOW ("POP WINDOW")
// ==========================================
const isAddModalOpen = ref(false);
const addFormName = ref('');
const addFormCode = ref('');
const addFormAcronym = ref('');
const addFormTitle = ref('');
const addFormColor = ref('#8BA869');
const addFormCategory = ref('');
const addFormLocation = ref('');
const addFormOwner = ref('');
const addFormPurchased = ref('');
const addFormQuantity = ref<number>(1);
const addFormDescription = ref('');
const addNameInputRef = ref<HTMLInputElement | null>(null);

// Automatically compute next suggested code based on saved records in active tab
const computeSuggestedCode = (type: CatalogType): string => {
  const items: CatalogItem[] = (
    type === 'office' ? props.catalogs.offices :
    type === 'work_type' ? props.catalogs.workTypes :
    type === 'activity_type' ? props.catalogs.activityTypes :
    type === 'item_type' ? props.catalogs.itemTypes :
    props.catalogs.equipment
  ) || [];

  if (!items || items.length === 0) {
    if (type === 'equipment') return 'EQ-001';
    if (type === 'activity_type' || type === 'item_type') return '01';
    return '100';
  }

  const validCodes = items
    .map((i) => i.code?.trim().toUpperCase())
    .filter((c): c is string => Boolean(c));

  if (type === 'equipment') {
    let highestNum = 0;
    for (const c of validCodes) {
      const match = c.match(/(?:[-_]|^)(\d+)$/);
      if (match) {
        const numVal = parseInt(match[1], 10);
        if (numVal > highestNum) highestNum = numVal;
      }
    }
    return `EQ-${String(highestNum + 1).padStart(3, '0')}`;
  }

  // Numerical codes (offices, work_type, activity_type, item_type)
  let highestNum = 0;
  let pad = 2;
  for (const c of validCodes) {
    const match = c.match(/^(\d+)$/);
    if (match) {
      const numVal = parseInt(match[1], 10);
      if (numVal > highestNum) {
        highestNum = numVal;
        pad = Math.max(pad, match[1].length);
      }
    }
  }

  if (highestNum > 0) {
    return String(highestNum + 1).padStart(pad, '0');
  }

  return String(items.length + 1).padStart(pad, '0');
};

const suggestedCode = computed(() => computeSuggestedCode(activeTab.value));

const openAddModal = () => {
  cancelInlineEdit();
  addFormName.value = '';
  addFormCode.value = suggestedCode.value;
  addFormAcronym.value = '';
  addFormTitle.value = '';
  if (activeTab.value === 'item_type') {
    const existingCount = (props.catalogs.itemTypes || []).length;
    addFormColor.value = ITEM_TYPE_COLOR_PALETTE[existingCount % ITEM_TYPE_COLOR_PALETTE.length];
  } else {
    addFormColor.value = '#8BA869';
  }
  addFormCategory.value = '';
  addFormLocation.value = '';
  addFormOwner.value = '';
  addFormPurchased.value = '';
  addFormQuantity.value = 1;
  addFormDescription.value = '';
  isAddModalOpen.value = true;

  nextTick(() => {
    if (addNameInputRef.value) {
      addNameInputRef.value.focus();
    }
  });
};

const closeAddModal = () => {
  isAddModalOpen.value = false;
};

// ==========================================
// EXCEL BATCH UPLOAD & CONFLICT RESOLUTION
// ==========================================
const isConflictModalOpen = ref(false);
const pendingCleanItems = ref<CatalogItem[]>([]);
const pendingConflicts = ref<ConflictItemPair[]>([]);

const handleExcelParsed = async (result: ParseCatalogExcelResult) => {
  if (result.conflicts.length > 0) {
    pendingCleanItems.value = result.cleanItems;
    pendingConflicts.value = result.conflicts;
    isConflictModalOpen.value = true;
  } else if (result.cleanItems.length > 0) {
    await catalogsStore.batchAddOrUpdateItems(activeTab.value, result.cleanItems, []);
    emit('toast', `Successfully imported ${result.cleanItems.length} new ${currentTabMeta.value.label.toLowerCase()}!`, 'success');
    closeAddModal();
  }
};

const handleConfirmConflictResolutions = async (resolvedConflicts: ConflictItemPair[]) => {
  const toReplace = resolvedConflicts
    .filter((c) => c.resolution === 'replace')
    .map((c) => c.newItem);

  const ignoredCount = resolvedConflicts.filter((c) => c.resolution === 'ignore').length;

  await catalogsStore.batchAddOrUpdateItems(
    activeTab.value,
    pendingCleanItems.value,
    toReplace
  );

  const totalSaved = pendingCleanItems.value.length + toReplace.length;
  let msg = `Successfully saved ${totalSaved} ${currentTabMeta.value.label.toLowerCase()}`;
  if (toReplace.length > 0) {
    msg += ` (${toReplace.length} updated)`;
  }
  if (ignoredCount > 0) {
    msg += ` • ${ignoredCount} duplicates skipped`;
  }

  emit('toast', msg, 'success');
  isConflictModalOpen.value = false;
  pendingCleanItems.value = [];
  pendingConflicts.value = [];
  closeAddModal();
};

const handleExcelError = (msg: string) => {
  emit('toast', msg, 'warning');
};

// Global Esc key support for popup window
const handleWindowKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (isConflictModalOpen.value) {
      isConflictModalOpen.value = false;
    } else if (quickColorTargetItem.value) {
      closeQuickColorPicker();
    } else if (isAddModalOpen.value) {
      closeAddModal();
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleWindowKeydown);
  window.addEventListener('resize', checkScrollArrows);
  nextTick(checkScrollArrows);
  setTimeout(checkScrollArrows, 300);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleWindowKeydown);
  window.removeEventListener('resize', checkScrollArrows);
});

const handleSaveAddForm = () => {
  if (!addFormName.value.trim()) return;

  const newItem: CatalogItem = {
    id: `${activeTab.value}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    type: activeTab.value,
    name: addFormName.value.trim(),
    code: addFormCode.value.trim() || undefined,
    acronym: activeTab.value === 'office' ? (addFormAcronym.value.trim() || undefined) : undefined,
    title: (activeTab.value === 'office' || activeTab.value === 'work_type' || activeTab.value === 'item_type') ? (addFormTitle.value.trim() || undefined) : undefined,
    color: activeTab.value === 'item_type' ? (addFormColor.value.trim() || '#8BA869') : undefined,
    category: activeTab.value === 'equipment' ? (addFormCategory.value.trim() || undefined) : (activeTab.value === 'office' ? 'University Office' : undefined),
    location: activeTab.value === 'equipment' ? (addFormLocation.value.trim() || undefined) : undefined,
    owner: activeTab.value === 'equipment' ? (addFormOwner.value.trim() || undefined) : undefined,
    purchased: activeTab.value === 'equipment' ? (addFormPurchased.value.trim() || undefined) : undefined,
    quantity: activeTab.value === 'equipment' ? Math.max(0, Number(addFormQuantity.value) || 1) : 1,
    description: addFormDescription.value.trim() || undefined,
    isActive: true,
    createdAt: new Date().toISOString().split('T')[0]
  };

  emit('addItem', newItem);
  emit('toast', `✓ Registered new ${currentTabMeta.value.singular}: ${newItem.name}`, 'success');
  closeAddModal();
};

// ==========================================
// 3. DELETE RECORD
// ==========================================
const handleDeleteClick = (item: CatalogItem) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${item.name}" from ${currentTabMeta.value.label}?\n\nThis will remove it from all active work order and log dropdown choices.`
  );
  if (!confirmed) return;

  if (editingRowId.value === item.id) {
    cancelInlineEdit();
  }

  emit('deleteItem', item.id, item.type);
  emit('toast', `✓ Deleted ${item.name} from ${currentTabMeta.value.label}`, 'info');
};
</script>

<style scoped src="../styles/catalogs.css"></style>
