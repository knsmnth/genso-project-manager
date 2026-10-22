<template>
  <div v-if="isOpen" class="conflict-modal-backdrop" @click="$emit('close')">
    <div class="conflict-modal-card" @click.stop role="dialog" aria-modal="true">
      <!-- Modal Header -->
      <div class="conflict-modal-header">
        <div class="conflict-header-title-wrap">
          <div class="conflict-warning-badge">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h3 class="conflict-title">Duplicate Registries Detected</h3>
            <p class="conflict-subtitle">
              {{ localConflicts.length }} items in this spreadsheet match existing {{ categoryLabel }} records.
            </p>
          </div>
        </div>
        <button
          type="button"
          class="conflict-close-btn"
          @click="$emit('close')"
          aria-label="Close dialog"
        >
          &times;
        </button>
      </div>

      <!-- Quick Action Toolbar -->
      <div class="conflict-toolbar">
        <div class="conflict-stats-summary">
          <span v-if="cleanItemsCount > 0" class="conflict-clean-pill">
            ✓ {{ cleanItemsCount }} new clean items ready to save
          </span>
          <span v-else style="color: #64748B">All imported rows matched existing records.</span>
        </div>

        <div class="conflict-bulk-buttons">
          <button
            type="button"
            class="btn-bulk-toggle"
            @click="setAllResolutions('replace')"
            title="Replace all conflicting records with the spreadsheet versions"
          >
            Replace All
          </button>
          <button
            type="button"
            class="btn-bulk-toggle"
            @click="setAllResolutions('ignore')"
            title="Keep existing records and ignore duplicates from spreadsheet"
          >
            Ignore All (Skip)
          </button>
        </div>
      </div>

      <!-- Conflicts List Body -->
      <div class="conflict-modal-body">
        <div
          v-for="item in localConflicts"
          :key="item.id"
          class="conflict-row-card"
          :class="`action-${item.resolution}`"
        >
          <!-- Row Header: Name, Conflict Tag, Toggle -->
          <div class="conflict-row-header">
            <div class="conflict-item-title-group">
              <span class="conflict-item-name">{{ item.newItem.name }}</span>
              <span class="conflict-reason-badge">
                <template v-if="item.conflictReason === 'both'">Matches Code & Name</template>
                <template v-else-if="item.conflictReason === 'code'">Matches Code ({{ item.existingItem.code }})</template>
                <template v-else>Matches Existing Name</template>
              </span>
            </div>

            <!-- Segmented Control -->
            <div class="conflict-action-toggle">
              <button
                type="button"
                :class="['toggle-opt-btn', 'opt-replace', { active: item.resolution === 'replace' }]"
                @click="item.resolution = 'replace'"
              >
                Replace
              </button>
              <button
                type="button"
                :class="['toggle-opt-btn', 'opt-ignore', { active: item.resolution === 'ignore' }]"
                @click="item.resolution = 'ignore'"
              >
                Ignore / Skip
              </button>
            </div>
          </div>

          <!-- Comparison Diff Grid -->
          <div class="conflict-diff-grid">
            <!-- Existing Record -->
            <div class="diff-col existing">
              <span class="diff-label">Current in Registry</span>
              <div class="diff-details">
                <div><strong>Name:</strong> {{ item.existingItem.name }}</div>
                <div v-if="item.existingItem.code">
                  <strong>Code:</strong> <span class="diff-code">{{ item.existingItem.code }}</span>
                </div>
                <div v-if="item.existingItem.acronym">
                  <strong>Acronym:</strong> {{ item.existingItem.acronym }}
                </div>
                <div v-if="item.existingItem.title">
                  <strong>Title:</strong> {{ item.existingItem.title }}
                </div>
                <div v-if="item.existingItem.category">
                  <strong>Category:</strong> {{ item.existingItem.category }}
                </div>
              </div>
            </div>

            <!-- Incoming Spreadsheet Record -->
            <div class="diff-col imported">
              <span class="diff-label">Incoming from File</span>
              <div class="diff-details">
                <div><strong>Name:</strong> {{ item.newItem.name }}</div>
                <div v-if="item.newItem.code">
                  <strong>Code:</strong> <span class="diff-code">{{ item.newItem.code }}</span>
                </div>
                <div v-if="item.newItem.acronym">
                  <strong>Acronym:</strong> {{ item.newItem.acronym }}
                </div>
                <div v-if="item.newItem.title">
                  <strong>Title:</strong> {{ item.newItem.title }}
                </div>
                <div v-if="item.newItem.category">
                  <strong>Category:</strong> {{ item.newItem.category }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="conflict-modal-footer">
        <div class="conflict-footer-counts">
          <span>Will import: </span>
          <strong style="color: #006C49">{{ cleanItemsCount + replaceCount }}</strong> items
          <span v-if="ignoreCount > 0" style="color: #64748B"> ({{ ignoreCount }} duplicates skipped)</span>
        </div>

        <div class="conflict-footer-buttons">
          <button type="button" class="btn btn-outline" @click="$emit('close')">
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="handleConfirm"
          >
            Confirm & Save Registries
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ConflictItemPair } from '../../services/excelCatalogService';

const props = defineProps<{
  isOpen: boolean;
  categoryLabel: string;
  cleanItemsCount: number;
  conflicts: ConflictItemPair[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm', resolved: ConflictItemPair[]): void;
}>();

const localConflicts = ref<ConflictItemPair[]>([]);

watch(
  () => props.conflicts,
  (newVal) => {
    localConflicts.value = newVal.map((item) => ({ ...item }));
  },
  { immediate: true, deep: true }
);

const replaceCount = computed(() => {
  return localConflicts.value.filter((c) => c.resolution === 'replace').length;
});

const ignoreCount = computed(() => {
  return localConflicts.value.filter((c) => c.resolution === 'ignore').length;
});

const setAllResolutions = (res: 'replace' | 'ignore') => {
  localConflicts.value.forEach((item) => {
    item.resolution = res;
  });
};

const handleConfirm = () => {
  emit('confirm', localConflicts.value);
};
</script>

<style scoped src="../../styles/catalogs-upload.css"></style>
