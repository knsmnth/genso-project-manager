<template>
  <div class="catalog-dropzone-wrapper">
    <div class="catalog-dropzone-divider">
      <span>Or Upload Spreadsheet</span>
    </div>

    <div
      class="catalog-dropzone-box"
      :class="{ 'is-dragover': isDragOver, 'is-processing': isProcessing }"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInputRef"
        type="file"
        class="dropzone-file-input"
        accept=".xlsx, .xls, .csv"
        @change="handleFileInputChange"
        :disabled="isProcessing"
        title="Upload spreadsheet"
        aria-label="Upload spreadsheet"
      />

      <div class="dropzone-inner-content">
        <!-- Modern Cloud / File Icon -->
        <div class="dropzone-modern-icon">
          <svg v-if="!isProcessing" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
            <path d="M12 12v9" />
            <path d="m16 16-4-4-4 4" />
          </svg>
          <div v-else class="dropzone-spinner"></div>
        </div>

        <div class="dropzone-text-group">
          <span class="dropzone-title">
            <template v-if="isProcessing">
              Processing spreadsheet...
            </template>
            <template v-else>
              <strong class="dropzone-highlight">Click to upload</strong> or drag and drop
            </template>
          </span>
          <span class="dropzone-subtitle">
            Excel (.xlsx, .xls) or CSV files
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CatalogItem, CatalogType } from '../../types';
import {
  parseCatalogFile,
  ParseCatalogExcelResult
} from '../../services/excelCatalogService';

const props = defineProps<{
  catalogType: CatalogType;
  categoryLabel: string;
  existingItems: CatalogItem[];
}>();

const emit = defineEmits<{
  (e: 'parsed', result: ParseCatalogExcelResult): void;
  (e: 'error', message: string): void;
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);
const isProcessing = ref(false);

const processFile = async (file: File) => {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
    emit('error', 'Please upload a valid Excel (.xlsx, .xls) or .csv spreadsheet.');
    return;
  }

  isProcessing.value = true;
  try {
    const result = await parseCatalogFile(file, props.catalogType, props.existingItems);
    if (result.errors.length > 0) {
      emit('error', result.errors.join(' '));
    } else if (result.cleanItems.length === 0 && result.conflicts.length === 0) {
      emit('error', 'No valid entries could be found in the uploaded spreadsheet.');
    } else {
      emit('parsed', result);
    }
  } catch (err: any) {
    emit('error', `Failed to parse spreadsheet: ${err?.message || 'Unknown error'}`);
  } finally {
    isProcessing.value = false;
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
  }
};

const handleFileInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    processFile(target.files[0]);
  }
};

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    processFile(event.dataTransfer.files[0]);
  }
};
</script>

<style scoped src="../../styles/catalogs-upload.css"></style>
