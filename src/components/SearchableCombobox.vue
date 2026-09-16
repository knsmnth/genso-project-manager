<template>
  <div class="searchable-combobox-wrapper" ref="wrapperRef">
    <div class="combobox-input-box" :class="{ 'is-focused': isOpen, 'is-disabled': disabled }">
      <input
        ref="inputRef"
        :id="id"
        type="text"
        class="combobox-search-input"
        :placeholder="placeholder"
        :value="searchQuery"
        :disabled="disabled"
        @focus="handleFocus"
        @input="handleInput(($event.target as HTMLInputElement).value)"
        @keydown.down.prevent="highlightNext"
        @keydown.up.prevent="highlightPrev"
        @keydown.enter.prevent="selectHighlighted"
        @keydown.esc="closeDropdown"
        autocomplete="off"
      />

      <button
        v-if="modelValue && !disabled"
        type="button"
        class="combobox-clear-btn"
        @click.stop="clearSelection"
        title="Clear selection"
        aria-label="Clear selection"
        tabindex="-1"
      >
        &times;
      </button>

      <button
        type="button"
        class="combobox-toggle-btn"
        :disabled="disabled"
        @click.stop="toggleDropdown"
        tabindex="-1"
        aria-label="Toggle options"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#6B7280" stroke-width="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>

    <!-- Dropdown Menu -->
    <div v-if="isOpen && !disabled" class="combobox-dropdown-menu">
      <div v-if="filteredItems.length === 0" class="combobox-empty">
        <span v-if="searchQuery.trim()">No exact match for "<em>{{ searchQuery.trim() }}</em>"</span>
        <span v-else>{{ emptyLabel || 'No options available' }}</span>
      </div>

      <!-- Custom text selection if typed text doesn't exist in registry -->
      <div
        v-if="allowCustom && searchQuery.trim() && !hasExactMatch"
        class="combobox-item custom-entry"
        :class="{ 'is-highlighted': highlightedIndex === -1 }"
        @mousedown.prevent="selectCustom(searchQuery.trim())"
      >
        <span>+ Use custom: "<strong>{{ searchQuery.trim() }}</strong>"</span>
      </div>

      <!-- Registry Options -->
      <div
        v-for="(item, idx) in filteredItems"
        :key="item.id || item.name"
        class="combobox-item"
        :class="{
          'is-highlighted': highlightedIndex === idx,
          'is-selected': item.name === modelValue
        }"
        @mousedown.prevent="selectItem(item)"
      >
        <div class="combobox-item-main">
          <span class="combobox-item-name">{{ item.name }}</span>
          
          <div class="combobox-item-badges">
            <span v-if="item.acronym" class="combobox-badge acronym" title="Acronym">
              {{ item.acronym }}
            </span>
            <span v-else-if="item.title" class="combobox-badge title" title="Title">
              {{ item.title }}
            </span>
            <span v-if="item.category && item.category !== 'General'" class="combobox-badge category">
              {{ item.category }}
            </span>
            <span v-if="item.code" class="combobox-badge code">
              {{ item.code }}
            </span>
          </div>
        </div>

        <span v-if="item.name === modelValue" class="combobox-check">✓</span>
      </div>

      <!-- Quick Registry Actions -->
      <div class="combobox-actions-footer">
        <button
          type="button"
          class="combobox-action-btn add"
          @mousedown.prevent="$emit('addNew'); closeDropdown()"
        >
          <span>+ Add New...</span>
        </button>
        <button
          type="button"
          class="combobox-action-btn manage"
          @mousedown.prevent="$emit('manage'); closeDropdown()"
        >
          <span>⚙️ Manage in Registries...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { CatalogItem } from '../types';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    items?: CatalogItem[];
    placeholder?: string;
    disabled?: boolean;
    allowCustom?: boolean;
    emptyLabel?: string;
    id?: string;
  }>(),
  {
    items: () => [],
    placeholder: 'Choose or type to search...',
    disabled: false,
    allowCustom: true,
    emptyLabel: 'No options found'
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
  (e: 'change', val: string): void;
  (e: 'addNew'): void;
  (e: 'manage'): void;
}>();

const wrapperRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const isOpen = ref(false);
const searchQuery = ref(props.modelValue || '');
const highlightedIndex = ref(-1);

watch(
  () => props.modelValue,
  (newVal) => {
    searchQuery.value = newVal || '';
  }
);

const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  const list = props.items || [];
  if (!q) return list;

  return list.filter((item) => {
    const nameMatch = item.name.toLowerCase().includes(q);
    const acronymMatch = item.acronym ? item.acronym.toLowerCase().includes(q) : false;
    const titleMatch = item.title ? item.title.toLowerCase().includes(q) : false;
    const codeMatch = item.code ? item.code.toLowerCase().includes(q) : false;
    const catMatch = item.category ? item.category.toLowerCase().includes(q) : false;
    const locMatch = item.location ? item.location.toLowerCase().includes(q) : false;

    return nameMatch || acronymMatch || titleMatch || codeMatch || catMatch || locMatch;
  });
});

const hasExactMatch = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return false;
  return (props.items || []).some(
    (item) =>
      item.name.toLowerCase() === q ||
      (item.acronym && item.acronym.toLowerCase() === q) ||
      (item.title && item.title.toLowerCase() === q)
  );
});

const handleFocus = () => {
  if (props.disabled) return;
  isOpen.value = true;
};

const handleInput = (val: string) => {
  searchQuery.value = val;
  isOpen.value = true;
  highlightedIndex.value = 0;
};

const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    inputRef.value?.focus();
  }
};

const closeDropdown = () => {
  isOpen.value = false;
  highlightedIndex.value = -1;
  // If closed without selecting and typed query differs from modelValue
  if (searchQuery.value !== props.modelValue) {
    if (props.allowCustom && searchQuery.value.trim()) {
      emit('update:modelValue', searchQuery.value.trim());
      emit('change', searchQuery.value.trim());
    } else {
      searchQuery.value = props.modelValue || '';
    }
  }
};

const selectItem = (item: CatalogItem) => {
  searchQuery.value = item.name;
  emit('update:modelValue', item.name);
  emit('change', item.name);
  isOpen.value = false;
};

const selectCustom = (customVal: string) => {
  searchQuery.value = customVal;
  emit('update:modelValue', customVal);
  emit('change', customVal);
  isOpen.value = false;
};

const clearSelection = () => {
  if (props.disabled) return;
  searchQuery.value = '';
  emit('update:modelValue', '');
  emit('change', '');
  isOpen.value = true;
  inputRef.value?.focus();
};

const highlightNext = () => {
  if (!isOpen.value) {
    isOpen.value = true;
    return;
  }
  const len = filteredItems.value.length;
  if (len === 0) return;
  highlightedIndex.value = (highlightedIndex.value + 1) % len;
};

const highlightPrev = () => {
  if (!isOpen.value) {
    isOpen.value = true;
    return;
  }
  const len = filteredItems.value.length;
  if (len === 0) return;
  highlightedIndex.value = highlightedIndex.value <= 0 ? len - 1 : highlightedIndex.value - 1;
};

const selectHighlighted = () => {
  if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredItems.value.length) {
    selectItem(filteredItems.value[highlightedIndex.value]);
  } else if (searchQuery.value.trim()) {
    if (filteredItems.value.length > 0) {
      selectItem(filteredItems.value[0]);
    } else if (props.allowCustom) {
      selectCustom(searchQuery.value.trim());
    }
  }
};

const handleClickOutside = (e: MouseEvent) => {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.searchable-combobox-wrapper {
  position: relative;
  width: 100%;
}

.combobox-input-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  background: #FFFFFF;
  border: 1px solid #BBCABF;
  border-radius: 8px;
  min-height: 42px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.combobox-input-box:hover:not(.is-disabled) {
  border-color: #8BA869;
}

.combobox-input-box.is-focused {
  border-color: #006C49;
  box-shadow: 0 0 0 2px rgba(0, 108, 73, 0.15);
}

.combobox-input-box.is-disabled {
  background: #F8FAFC;
  border-color: #CBD5E1;
  cursor: not-allowed;
  opacity: 0.85;
}

.combobox-search-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  padding: 10px 14px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 20px;
  color: #0B1C30;
}

.combobox-search-input::placeholder {
  color: rgba(187, 202, 191, 0.7);
  font-size: 14px;
  font-weight: 400;
}

.combobox-search-input:disabled {
  cursor: not-allowed;
  color: #94A3B8;
}

.combobox-clear-btn {
  background: none;
  border: none;
  color: #94A3B8;
  font-size: 16px;
  line-height: 1;
  padding: 4px;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.12s ease;
}

.combobox-clear-btn:hover {
  color: #EF4444;
}

.combobox-toggle-btn {
  background: none;
  border: none;
  padding: 6px 12px 6px 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.combobox-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 250px;
  overflow-y: auto;
  background: #FFFFFF;
  border: 1px solid #BBCABF;
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.06);
  z-index: 70;
  padding: 5px;
}

.combobox-empty {
  padding: 12px;
  text-align: center;
  font-size: 13px;
  color: #64748B;
}

.combobox-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13.5px;
  color: #1E293B;
  transition: background-color 0.12s ease;
}

.combobox-item:hover,
.combobox-item.is-highlighted {
  background-color: #F1F5F0;
  color: #006C49;
}

.combobox-item.is-selected {
  background-color: rgba(0, 108, 73, 0.08);
  color: #006C49;
  font-weight: 600;
}

.combobox-item.custom-entry {
  border-bottom: 1px dashed #E2E8F0;
  color: #006C49;
  font-weight: 500;
  margin-bottom: 4px;
}

.combobox-item-main {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.combobox-item-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.combobox-item-badges {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.combobox-badge {
  font-size: 10.5px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  line-height: 1.3;
}

.combobox-badge.acronym {
  background: rgba(30, 64, 175, 0.08);
  color: #1E40AF;
}

.combobox-badge.title {
  background: rgba(0, 108, 73, 0.08);
  color: #006C49;
}

.combobox-badge.category {
  background: #F1F5F9;
  color: #475569;
}

.combobox-badge.code {
  font-family: monospace;
  background: rgba(139, 168, 105, 0.15);
  color: #5E7743;
}

.combobox-check {
  font-size: 13px;
  font-weight: 700;
  color: #006C49;
  margin-left: 8px;
}

.combobox-actions-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #E2E8F0;
  padding-top: 6px;
  margin-top: 4px;
}

.combobox-action-btn {
  background: none;
  border: none;
  font-size: 12px;
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 4px;
  transition: background-color 0.12s ease;
}

.combobox-action-btn.add {
  color: #006C49;
  font-weight: 600;
}

.combobox-action-btn.manage {
  color: #1E40AF;
  font-weight: 500;
}

.combobox-action-btn:hover {
  background-color: #F8FAFC;
}
</style>
