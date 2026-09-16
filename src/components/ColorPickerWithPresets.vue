<template>
  <div class="color-picker-modern-container">
    <!-- 1. Hero Showcase: Live Tag Preview Card -->
    <div class="picker-showcase-card">
      <div class="showcase-left">
        <span class="showcase-badge-label">Live Tag Preview:</span>
        <span
          class="modern-tag-pill"
          :style="{
            backgroundColor: currentColor,
            color: getContrastColor(currentColor)
          }"
        >
          <svg
            class="tag-pill-icon"
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
            <circle cx="12" cy="14" r="1.8" />
          </svg>
          <span class="tag-pill-text">{{ previewText?.trim() || 'Sample Item Tag' }}</span>
        </span>
      </div>

      <div class="showcase-right">
        <!-- Interactive Color Badge & Hex Display -->
        <div class="modern-active-chip" :title="`Current Color: ${currentColor}`">
          <span
            class="active-chip-circle"
            :style="{ backgroundColor: currentColor }"
          ></span>
          <span class="active-chip-hex">{{ currentColor.toUpperCase() }}</span>
          <button
            type="button"
            class="chip-copy-btn"
            @click="copyHexToClipboard"
            :title="copiedHex ? 'Copied!' : 'Copy HEX code'"
          >
            <svg v-if="!copiedHex" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#006C49" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 2. Presets Palette Section with Edit Palette Option -->
    <div class="presets-section">
      <div class="presets-header-row">
        <div class="presets-header-title">
          <span class="presets-title-text">Curated Preset Palette</span>
          <span class="presets-count-pill">{{ totalPresetCount }} Colors</span>
          <span v-if="isEditingPalette" class="presets-edit-active-pill">Editing Mode</span>
        </div>

        <!-- Edit Mode Toggle & Controls -->
        <div class="presets-header-actions">
          <button
            v-if="!isEditingPalette"
            type="button"
            class="palette-action-btn edit-btn"
            @click="startEditingPalette"
            title="Edit curated preset colors"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span>Edit Palette</span>
          </button>

          <template v-else>
            <button
              type="button"
              class="palette-action-btn reset-btn"
              @click="resetPaletteToDefault"
              title="Reset presets back to original 24 reference colors"
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              class="palette-action-btn done-btn"
              @click="finishEditingPalette"
              title="Save palette customizations"
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Done Editing</span>
            </button>
          </template>
        </div>
      </div>

      <!-- Live Swatch Customizer Drawer (Active when editing a swatch) -->
      <transition name="expand-slide">
        <div v-if="isEditingPalette" class="palette-editor-callout">
          <div v-if="activeEditingSwatch" class="swatch-editor-card">
            <div class="swatch-editor-info-row">
              <span class="swatch-editor-tag">Editing Selected Swatch</span>
              <span class="swatch-editor-help">Pick a new color via picker, type HEX, or sample screen:</span>
            </div>

            <div class="swatch-editor-controls-row">
              <!-- Swatch Color Picker Box -->
              <label
                class="swatch-editor-color-trigger"
                :style="{ backgroundColor: activeEditingSwatch.hex }"
                title="Click to open color spectrum"
              >
                <input
                  type="color"
                  class="native-swatch-input"
                  :value="to6Hex(activeEditingSwatch.hex)"
                  @input="handleActiveSwatchNativeChange(($event.target as HTMLInputElement).value)"
                />
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" :stroke="getContrastColor(activeEditingSwatch.hex)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </label>

              <!-- Swatch Label/Name Input -->
              <div class="swatch-editor-input-wrap flex-1">
                <input
                  type="text"
                  class="swatch-editor-text-input name"
                  v-model="activeEditingSwatch.name"
                  placeholder="Color Name"
                  @input="saveCustomPalette"
                />
              </div>

              <!-- Swatch HEX Code Input -->
              <div class="swatch-editor-hex-wrap">
                <span class="hex-hash-prefix">#</span>
                <input
                  type="text"
                  class="swatch-editor-text-input hex"
                  :value="activeEditingSwatch.hex.replace(/^#/, '').toUpperCase()"
                  @input="handleActiveSwatchHexInput(($event.target as HTMLInputElement).value)"
                  maxlength="6"
                  placeholder="0649CC"
                />
              </div>

              <!-- Screen Eyedropper API Button -->
              <button
                v-if="hasEyeDropper"
                type="button"
                class="swatch-tool-btn"
                @click="sampleScreenForActiveSwatch"
                title="Sample any pixel on screen"
              >
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 22s2.5-1 4-2.5L18 7.5 16.5 6 4.5 18C3 19.5 2 22 2 22z"/>
                  <path d="M15 5l2.5 2.5 4-4-2.5-2.5-4 4z"/>
                </svg>
                <span>Pick</span>
              </button>

              <!-- Sync with Current Tag Color Button -->
              <button
                type="button"
                class="swatch-tool-btn sync"
                @click="syncCurrentColorToActiveSwatch"
                title="Apply current tag color to this preset swatch"
              >
                <span>Use {{ currentColor.toUpperCase() }}</span>
              </button>
            </div>
          </div>

          <div v-else class="swatch-editor-empty-hint">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Click any swatch below to customize its color and name.</span>
          </div>
        </div>
      </transition>

      <!-- 6 Harmony Cluster Blocks (3 clusters per row x 2 rows, matching user reference image) -->
      <div class="preset-clusters-grid" role="radiogroup" aria-label="Preset Color Palette">
        <div
          v-for="(cluster, cIdx) in presetClusters"
          :key="cIdx"
          class="preset-cluster-group"
          :class="{ 'is-editing': isEditingPalette }"
        >
          <button
            v-for="preset in cluster"
            :key="preset.id || preset.hex"
            type="button"
            class="cluster-swatch-tile"
            :class="{
              'is-selected': !isEditingPalette && isColorMatch(preset.hex),
              'is-editing-target': isEditingPalette && activeEditingSwatch?.id === preset.id,
              'in-edit-mode': isEditingPalette
            }"
            :style="{ backgroundColor: preset.hex }"
            :title="isEditingPalette ? `Click to edit: ${preset.name} (${preset.hex})` : `${preset.name} (${preset.hex})`"
            :aria-label="`${preset.name} ${preset.hex}`"
            @click="handleSwatchClick(preset)"
          >
            <!-- Normal Mode: Animated High-contrast Checkmark -->
            <svg
              v-if="!isEditingPalette && isColorMatch(preset.hex)"
              class="cluster-check-icon"
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              :stroke="getContrastColor(preset.hex)"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>

            <!-- Edit Mode: Pencil indicator on active or hovered swatch -->
            <span
              v-if="isEditingPalette"
              class="edit-swatch-overlay"
              :style="{ color: getContrastColor(preset.hex) }"
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- 3. Modern Advanced Mode Accordion -->
    <div class="advanced-section">
      <button
        type="button"
        class="modern-advanced-toggle"
        :class="{ 'is-open': showAdvanced }"
        @click="showAdvanced = !showAdvanced"
        aria-label="Toggle advanced color customization"
      >
        <span class="toggle-icon-wrap">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </span>
        <span class="toggle-text">{{ showAdvanced ? 'Hide Advanced Mode' : 'Advanced Mode (Custom Spectrum, Eyedropper & RGB)' }}</span>
        <svg
          class="toggle-chevron"
          viewBox="0 0 24 24"
          width="13"
          height="13"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <transition name="expand-slide">
        <div v-if="showAdvanced" class="modern-advanced-panel">
          <!-- Top Row: Full Spectrum Trigger, Eyedropper, HEX input -->
          <div class="advanced-tools-row">
            <!-- Full Spectrum Picker Button -->
            <div class="tool-cell">
              <span class="tool-label">Spectrum</span>
              <div class="spectrum-btn-wrap">
                <input
                  ref="nativeColorInputRef"
                  type="color"
                  class="native-color-hidden"
                  :value="currentColorHex6"
                  @input="handleNativeColorInput(($event.target as HTMLInputElement).value)"
                  title="Open system color spectrum"
                />
                <button
                  type="button"
                  class="modern-tool-btn"
                  @click="triggerNativePicker"
                  title="Open full spectrum color palette"
                >
                  <span class="spectrum-swatch-chip" :style="{ backgroundColor: currentColor }"></span>
                  <span>Spectrum</span>
                </button>
              </div>
            </div>

            <!-- Eyedropper API Tool -->
            <div v-if="hasEyeDropper" class="tool-cell">
              <span class="tool-label">Eyedropper</span>
              <button
                type="button"
                class="modern-tool-btn"
                @click="handleEyeDropper"
                title="Sample any color from screen"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 22s2.5-1 4-2.5L18 7.5 16.5 6 4.5 18C3 19.5 2 22 2 22z"/>
                  <path d="M15 5l2.5 2.5 4-4-2.5-2.5-4 4z"/>
                </svg>
                <span>Eyedropper</span>
              </button>
            </div>

            <!-- Custom HEX Input -->
            <div class="tool-cell flex-1">
              <span class="tool-label">HEX Code</span>
              <div class="modern-hex-input-box">
                <span class="hex-hash">#</span>
                <input
                  type="text"
                  class="hex-field"
                  :value="hexWithoutHash"
                  @input="handleHexInput(($event.target as HTMLInputElement).value)"
                  placeholder="0649CC"
                  maxlength="6"
                  spellcheck="false"
                />
              </div>
            </div>
          </div>

          <!-- RGB Sliders & Channel Controls -->
          <div class="modern-rgb-box">
            <div class="rgb-title-row">
              <span class="tool-label">RGB Channels</span>
              <div class="rgb-code-pill" @click="copyRgbToClipboard" :title="'Click to copy rgb() code'">
                <code>rgb({{ rgbValues.r }}, {{ rgbValues.g }}, {{ rgbValues.b }})</code>
                <span class="rgb-copy-tag">{{ copiedRgb ? 'Copied!' : 'Copy' }}</span>
              </div>
            </div>

            <!-- R Channel Slider -->
            <div class="channel-slider-row">
              <span class="channel-badge r">R</span>
              <input
                type="range"
                min="0"
                max="255"
                class="channel-range-slider r-slider"
                :value="rgbValues.r"
                @input="handleRgbChange('r', ($event.target as HTMLInputElement).value)"
              />
              <input
                type="number"
                min="0"
                max="255"
                class="channel-num-input"
                :value="rgbValues.r"
                @input="handleRgbChange('r', ($event.target as HTMLInputElement).value)"
              />
            </div>

            <!-- G Channel Slider -->
            <div class="channel-slider-row">
              <span class="channel-badge g">G</span>
              <input
                type="range"
                min="0"
                max="255"
                class="channel-range-slider g-slider"
                :value="rgbValues.g"
                @input="handleRgbChange('g', ($event.target as HTMLInputElement).value)"
              />
              <input
                type="number"
                min="0"
                max="255"
                class="channel-num-input"
                :value="rgbValues.g"
                @input="handleRgbChange('g', ($event.target as HTMLInputElement).value)"
              />
            </div>

            <!-- B Channel Slider -->
            <div class="channel-slider-row">
              <span class="channel-badge b">B</span>
              <input
                type="range"
                min="0"
                max="255"
                class="channel-range-slider b-slider"
                :value="rgbValues.b"
                @input="handleRgbChange('b', ($event.target as HTMLInputElement).value)"
              />
              <input
                type="number"
                min="0"
                max="255"
                class="channel-num-input"
                :value="rgbValues.b"
                @input="handleRgbChange('b', ($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface PresetItem {
  id: string;
  name: string;
  hex: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: string;
    previewText?: string;
  }>(),
  {
    modelValue: '#0649CC',
    previewText: 'Sample Item Tag'
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
  (e: 'change', val: string): void;
}>();

const showAdvanced = ref(false);
const isEditingPalette = ref(false);
const activeEditingSwatch = ref<PresetItem | null>(null);
const copiedHex = ref(false);
const copiedRgb = ref(false);
const nativeColorInputRef = ref<HTMLInputElement | null>(null);

const PALETTE_STORAGE_KEY = 'genso_curated_preset_palette_v2';

// 24 Curated Preset Colors in 6 harmony clusters (from user reference image)
const DEFAULT_PRESET_CLUSTERS: PresetItem[][] = [
  // Cluster 1 (Top Left): Lime Cream, Soft Mint, Slate Steel, Warm Taupe
  [
    { id: 'c1-1', name: 'Lime Cream', hex: '#E6EFB6' },
    { id: 'c1-2', name: 'Soft Mint', hex: '#B9E9C1' },
    { id: 'c1-3', name: 'Slate Steel', hex: '#6484B3' },
    { id: 'c1-4', name: 'Warm Taupe', hex: '#68484B' },
  ],
  // Cluster 2 (Top Middle): Cobalt Blue, Azure Blue, Tangerine Orange, Soft Mist
  [
    { id: 'c2-1', name: 'Cobalt Blue', hex: '#0649CC' },
    { id: 'c2-2', name: 'Azure Blue', hex: '#356ED9' },
    { id: 'c2-3', name: 'Tangerine Orange', hex: '#F3A853' },
    { id: 'c2-4', name: 'Soft Mist', hex: '#F3F3F3' },
  ],
  // Cluster 3 (Top Right): Midnight Navy, Terracotta, Coral Red, Pale Champagne
  [
    { id: 'c3-1', name: 'Midnight Navy', hex: '#293462' },
    { id: 'c3-2', name: 'Terracotta', hex: '#A64942' },
    { id: 'c3-3', name: 'Coral Red', hex: '#FD5F56' },
    { id: 'c3-4', name: 'Pale Champagne', hex: '#FFF1C2' },
  ],
  // Cluster 4 (Bottom Left): Vivid Violet, Orchid Magenta, Bubblegum Pink, Amber Gold
  [
    { id: 'c4-1', name: 'Vivid Violet', hex: '#8A00D4' },
    { id: 'c4-2', name: 'Orchid Magenta', hex: '#D528B8' },
    { id: 'c4-3', name: 'Bubblegum Pink', hex: '#FF82C2' },
    { id: 'c4-4', name: 'Amber Gold', hex: '#FFC46C' },
  ],
  // Cluster 5 (Bottom Middle): Deep Purple, Periwinkle Blue, Lavender Mist, Blush Lilac
  [
    { id: 'c5-1', name: 'Deep Purple', hex: '#553D8B' },
    { id: 'c5-2', name: 'Periwinkle Blue', hex: '#9FA9F0' },
    { id: 'c5-3', name: 'Lavender Mist', hex: '#CCC0FE' },
    { id: 'c5-4', name: 'Blush Lilac', hex: '#FFEAFF' },
  ],
  // Cluster 6 (Bottom Right): Pure Cloud, Seafoam Mint, Sky Cyan, Electric Ultraviolet
  [
    { id: 'c6-1', name: 'Pure Cloud', hex: '#F6F6F6' },
    { id: 'c6-2', name: 'Seafoam Mint', hex: '#BDF1D8' },
    { id: 'c6-3', name: 'Sky Cyan', hex: '#7BD9F5' },
    { id: 'c6-4', name: 'Electric Violet', hex: '#5D12E9' },
  ],
];

// Initialize clusters from localStorage or defaults
const loadClusters = (): PresetItem[][] => {
  try {
    const saved = localStorage.getItem(PALETTE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 6) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load saved palette', err);
  }
  return JSON.parse(JSON.stringify(DEFAULT_PRESET_CLUSTERS));
};

const presetClusters = ref<PresetItem[][]>(loadClusters());

const totalPresetCount = computed(() => {
  return presetClusters.value.reduce((sum, cluster) => sum + cluster.length, 0);
});

const saveCustomPalette = () => {
  try {
    localStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify(presetClusters.value));
  } catch (err) {
    console.error('Failed to save custom palette', err);
  }
};

const startEditingPalette = () => {
  isEditingPalette.value = true;
  // Automatically select the first swatch for editing if none selected
  if (!activeEditingSwatch.value && presetClusters.value[0]?.[0]) {
    activeEditingSwatch.value = presetClusters.value[0][0];
  }
};

const finishEditingPalette = () => {
  saveCustomPalette();
  isEditingPalette.value = false;
  activeEditingSwatch.value = null;
};

const resetPaletteToDefault = () => {
  presetClusters.value = JSON.parse(JSON.stringify(DEFAULT_PRESET_CLUSTERS));
  try {
    localStorage.removeItem(PALETTE_STORAGE_KEY);
  } catch {
    // ignore
  }
  activeEditingSwatch.value = presetClusters.value[0]?.[0] || null;
};

const handleSwatchClick = (preset: PresetItem) => {
  if (isEditingPalette.value) {
    activeEditingSwatch.value = preset;
  } else {
    selectPreset(preset.hex);
  }
};

const to6Hex = (hex: string): string => {
  let val = (hex || '').replace('#', '');
  if (val.length === 3) {
    val = val.split('').map(c => c + c).join('');
  }
  if (val.length >= 6) {
    return `#${val.substring(0, 6)}`;
  }
  return '#0649CC';
};

const handleActiveSwatchNativeChange = (newHex: string) => {
  if (!activeEditingSwatch.value || !newHex) return;
  activeEditingSwatch.value.hex = newHex.toUpperCase();
  saveCustomPalette();
};

const handleActiveSwatchHexInput = (raw: string) => {
  if (!activeEditingSwatch.value) return;
  const sanitized = raw.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
  if (sanitized.length === 3 || sanitized.length === 6) {
    activeEditingSwatch.value.hex = `#${sanitized.toUpperCase()}`;
    saveCustomPalette();
  }
};

const sampleScreenForActiveSwatch = async () => {
  if (activeEditingSwatch.value && hasEyeDropper.value) {
    try {
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      if (result && result.sRGBHex) {
        activeEditingSwatch.value.hex = result.sRGBHex.toUpperCase();
        saveCustomPalette();
      }
    } catch {
      // User cancelled
    }
  }
};

const syncCurrentColorToActiveSwatch = () => {
  if (!activeEditingSwatch.value) return;
  activeEditingSwatch.value.hex = currentColor.value.toUpperCase();
  saveCustomPalette();
};

// Helper: Calculate text contrast (black or white) based on luminance
const getContrastColor = (hex: string): string => {
  if (!hex) return '#FFFFFF';
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 175 ? '#0F172A' : '#FFFFFF';
};

const currentColor = computed(() => {
  return props.modelValue || '#0649CC';
});

const currentColorHex6 = computed(() => {
  return to6Hex(currentColor.value);
});

const hexWithoutHash = computed(() => {
  return currentColor.value.replace(/^#/, '').toUpperCase();
});

const isColorMatch = (hex: string) => {
  return currentColor.value.trim().toLowerCase() === hex.trim().toLowerCase();
};

const selectPreset = (hex: string) => {
  emit('update:modelValue', hex);
  emit('change', hex);
};

// Check if browser supports EyeDropper API
const hasEyeDropper = computed(() => {
  return typeof window !== 'undefined' && 'EyeDropper' in window;
});

const triggerNativePicker = () => {
  nativeColorInputRef.value?.click();
};

const handleNativeColorInput = (hex: string) => {
  if (hex) {
    emit('update:modelValue', hex.toUpperCase());
    emit('change', hex.toUpperCase());
  }
};

const handleHexInput = (raw: string) => {
  const sanitized = raw.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
  if (sanitized.length === 3 || sanitized.length === 6) {
    const formatted = `#${sanitized.toUpperCase()}`;
    emit('update:modelValue', formatted);
    emit('change', formatted);
  }
};

// RGB values conversion
const rgbValues = computed(() => {
  let clean = currentColor.value.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length >= 6) {
    const r = parseInt(clean.substring(0, 2), 16) || 0;
    const g = parseInt(clean.substring(2, 4), 16) || 0;
    const b = parseInt(clean.substring(4, 6), 16) || 0;
    return { r, g, b };
  }
  return { r: 6, g: 73, b: 204 };
});

const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (n: number) => {
    const clamp = Math.max(0, Math.min(255, Math.round(n)));
    return clamp.toString(16).padStart(2, '0').toUpperCase();
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const handleRgbChange = (channel: 'r' | 'g' | 'b', valStr: string) => {
  const val = Math.max(0, Math.min(255, parseInt(valStr, 10) || 0));
  const current = { ...rgbValues.value, [channel]: val };
  const newHex = rgbToHex(current.r, current.g, current.b);
  emit('update:modelValue', newHex);
  emit('change', newHex);
};

const handleEyeDropper = async () => {
  if (hasEyeDropper.value) {
    try {
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      if (result && result.sRGBHex) {
        const hex = result.sRGBHex.toUpperCase();
        emit('update:modelValue', hex);
        emit('change', hex);
      }
    } catch {
      // User cancelled
    }
  }
};

const copyHexToClipboard = () => {
  navigator.clipboard.writeText(currentColor.value.toUpperCase()).then(() => {
    copiedHex.value = true;
    setTimeout(() => { copiedHex.value = false; }, 1500);
  });
};

const copyRgbToClipboard = () => {
  const rgbStr = `rgb(${rgbValues.value.r}, ${rgbValues.value.g}, ${rgbValues.value.b})`;
  navigator.clipboard.writeText(rgbStr).then(() => {
    copiedRgb.value = true;
    setTimeout(() => { copiedRgb.value = false; }, 1500);
  });
};
</script>

<style scoped>
.color-picker-modern-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #FFFFFF;
  border-radius: 12px;
  box-sizing: border-box;
}

/* =========================================================
   1. HERO SHOWCASE CARD (Live Tag Preview)
   ========================================================= */
.picker-showcase-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 14px 18px;
  background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.showcase-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.showcase-badge-label {
  font-family: 'Inter', sans-serif;
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #64748B;
}

.modern-tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px;
  border-radius: 9999px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  letter-spacing: -0.1px;
}

.tag-pill-icon {
  flex-shrink: 0;
}

.modern-active-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 10px;
  background: #FFFFFF;
  border: 1.5px solid #CBD5E1;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.active-chip-circle {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px solid rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.active-chip-hex {
  font-family: monospace;
  font-size: 13px;
  font-weight: 700;
  color: #0F172A;
  letter-spacing: 0.5px;
}

.chip-copy-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #94A3B8;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.chip-copy-btn:hover {
  color: #0F172A;
  background: #F1F5F9;
}

/* =========================================================
   2. PRESETS PALETTE SECTION & EDIT MODE
   ========================================================= */
.presets-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.presets-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.presets-header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.presets-title-text {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #0F172A;
  letter-spacing: -0.2px;
}

.presets-count-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 9999px;
  background: #ECFDF5;
  color: #065F46;
  border: 1px solid #A7F3D0;
}

.presets-edit-active-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 1px 8px;
  border-radius: 9999px;
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FDE68A;
  animation: pulseEdit 1.5s infinite;
}

@keyframes pulseEdit {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.presets-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.palette-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.palette-action-btn.edit-btn {
  background: #F1F5F9;
  border-color: #CBD5E1;
  color: #334155;
}

.palette-action-btn.edit-btn:hover {
  background: #E2E8F0;
  color: #0F172A;
  border-color: #94A3B8;
}

.palette-action-btn.reset-btn {
  background: #FFFFFF;
  border-color: #CBD5E1;
  color: #64748B;
}

.palette-action-btn.reset-btn:hover {
  background: #FEF2F2;
  border-color: #FECACA;
  color: #DC2626;
}

.palette-action-btn.done-btn {
  background: #006C49;
  border-color: #005A3C;
  color: #FFFFFF;
  box-shadow: 0 1px 3px rgba(0, 108, 73, 0.2);
}

.palette-action-btn.done-btn:hover {
  background: #00563A;
  transform: translateY(-1px);
}

/* Palette Editor Callout */
.palette-editor-callout {
  padding: 10px 14px;
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.swatch-editor-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.swatch-editor-info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.swatch-editor-tag {
  font-weight: 700;
  color: #92400E;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.swatch-editor-help {
  color: #78350F;
}

.swatch-editor-controls-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.swatch-editor-color-trigger {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1.5px solid rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  transition: transform 0.1s ease;
}

.swatch-editor-color-trigger:hover {
  transform: scale(1.1);
}

.native-swatch-input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
}

.swatch-editor-input-wrap.flex-1 {
  flex: 1;
  min-width: 110px;
}

.swatch-editor-text-input {
  height: 32px;
  padding: 0 10px;
  background: #FFFFFF;
  border: 1.5px solid #CBD5E1;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #0F172A;
  outline: none;
  box-sizing: border-box;
  width: 100%;
}

.swatch-editor-text-input:focus {
  border-color: #006C49;
}

.swatch-editor-hex-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 90px;
}

.hex-hash-prefix {
  position: absolute;
  left: 8px;
  font-family: monospace;
  font-size: 13px;
  font-weight: 700;
  color: #94A3B8;
  pointer-events: none;
}

.swatch-editor-text-input.hex {
  padding-left: 20px;
  font-family: monospace;
  letter-spacing: 0.5px;
}

.swatch-tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 32px;
  padding: 0 10px;
  background: #FFFFFF;
  border: 1.5px solid #CBD5E1;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 11.5px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.swatch-tool-btn:hover {
  background: #F0FDF4;
  border-color: #006C49;
  color: #006C49;
}

.swatch-tool-btn.sync {
  background: #ECFDF5;
  border-color: #A7F3D0;
  color: #065F46;
}

.swatch-tool-btn.sync:hover {
  background: #D1FAE5;
}

.swatch-editor-empty-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #92400E;
}

/* 6 Cluster Grid layout: 3 columns x 2 rows */
.preset-clusters-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
}

.preset-cluster-group {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 8px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.03);
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.preset-cluster-group.is-editing {
  background: #F8FAFC;
  border: 1px dashed #CBD5E1;
}

.cluster-swatch-tile {
  width: 100%;
  aspect-ratio: 1;
  min-height: 42px;
  border-radius: 10px;
  border: 1.5px solid rgba(0, 0, 0, 0.08);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  position: relative;
  transition: transform 0.16s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.16s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.16s ease;
  outline: none;
}

.cluster-swatch-tile:hover {
  transform: translateY(-2px) scale(1.08);
  box-shadow: 0 8px 16px -2px rgba(0, 0, 0, 0.22);
  z-index: 3;
  border-color: #FFFFFF;
}

.cluster-swatch-tile.is-selected {
  transform: scale(1.04);
  box-shadow: 0 0 0 3px #FFFFFF, 0 0 0 5.5px #006C49, 0 6px 14px rgba(0, 108, 73, 0.25);
  z-index: 4;
  border-color: transparent;
}

.cluster-swatch-tile.is-editing-target {
  transform: scale(1.06);
  box-shadow: 0 0 0 3px #FFFFFF, 0 0 0 5.5px #D97706, 0 6px 14px rgba(217, 119, 6, 0.3);
  z-index: 5;
  border-color: transparent;
}

.cluster-swatch-tile.in-edit-mode:hover {
  border-color: #D97706;
}

.edit-swatch-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

.cluster-check-icon {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45));
  animation: checkPop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes checkPop {
  0% { transform: scale(0.6); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* =========================================================
   3. ADVANCED MODE SECTION
   ========================================================= */
.advanced-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 4px;
}

.modern-advanced-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 14px;
  background: #F8FAFC;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.18s ease;
}

.modern-advanced-toggle:hover {
  background: #F1F5F9;
  border-color: #CBD5E1;
  color: #0F172A;
}

.modern-advanced-toggle.is-open {
  background: #ECFDF5;
  border-color: #A7F3D0;
  color: #006C49;
}

.toggle-icon-wrap {
  display: inline-flex;
  margin-right: 8px;
}

.toggle-chevron {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  margin-left: auto;
}

.modern-advanced-toggle.is-open .toggle-chevron {
  transform: rotate(180deg);
}

.modern-advanced-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  background: #F8FAFC;
  border: 1.5px dashed #CBD5E1;
  border-radius: 12px;
}

.advanced-tools-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.tool-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tool-cell.flex-1 {
  flex: 1;
  min-width: 120px;
}

.tool-label {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.spectrum-btn-wrap {
  position: relative;
  display: inline-flex;
}

.native-color-hidden {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
}

.modern-tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 12px;
  background: #FFFFFF;
  border: 1.5px solid #CBD5E1;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.modern-tool-btn:hover {
  background: #F0FDF4;
  border-color: #006C49;
  color: #006C49;
}

.spectrum-swatch-chip {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background-image: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 100%);
}

.modern-hex-input-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.hex-hash {
  position: absolute;
  left: 10px;
  font-family: monospace;
  font-size: 14px;
  font-weight: 700;
  color: #94A3B8;
  user-select: none;
}

.hex-field {
  width: 100%;
  height: 36px;
  padding: 0 10px 0 24px;
  background: #FFFFFF;
  border: 1.5px solid #CBD5E1;
  border-radius: 8px;
  font-family: monospace;
  font-size: 13px;
  font-weight: 700;
  color: #0F172A;
  letter-spacing: 0.5px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.hex-field:focus {
  border-color: #006C49;
  box-shadow: 0 0 0 3px rgba(0, 108, 73, 0.12);
}

/* RGB Channels & Sliders */
.modern-rgb-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #E2E8F0;
}

.rgb-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rgb-code-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 6px;
  padding: 3px 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.rgb-code-pill:hover {
  background: #ECFDF5;
  border-color: #A7F3D0;
}

.rgb-code-pill code {
  font-family: monospace;
  font-size: 11px;
  color: #334155;
}

.rgb-copy-tag {
  font-size: 10px;
  font-weight: 700;
  color: #006C49;
  text-transform: uppercase;
}

.channel-slider-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.channel-badge {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 800;
  color: #FFFFFF;
  flex-shrink: 0;
}

.channel-badge.r { background: #EF4444; }
.channel-badge.g { background: #10B981; }
.channel-badge.b { background: #3B82F6; }

.channel-range-slider {
  flex: 1;
  height: 6px;
  border-radius: 9999px;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  background: #E2E8F0;
}

.channel-range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #FFFFFF;
  border: 2px solid #006C49;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.channel-range-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.channel-num-input {
  width: 52px;
  height: 30px;
  border: 1.5px solid #CBD5E1;
  border-radius: 6px;
  text-align: center;
  font-family: monospace;
  font-size: 12px;
  font-weight: 700;
  color: #0F172A;
  background: #FFFFFF;
  outline: none;
  box-sizing: border-box;
}

.channel-num-input:focus {
  border-color: #006C49;
}

/* Animations */
.expand-slide-enter-active,
.expand-slide-leave-active {
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.expand-slide-enter-from,
.expand-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
