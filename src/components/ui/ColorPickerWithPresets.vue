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

      <!-- Single Palette Box with Color Ranges in Lines (No Group Names, Unified Box) -->
      <div class="preset-single-box" role="radiogroup" aria-label="Preset Color Palette">
        <div class="preset-color-ranges" :class="{ 'is-editing': isEditingPalette }">
          <div
            v-for="(cluster, cIdx) in presetClusters"
            :key="cluster.id || cIdx"
            class="preset-range-line"
          >
            <button
              v-for="preset in cluster.items"
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
                width="12"
                height="12"
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
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </span>
            </button>
          </div>
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

const PALETTE_STORAGE_KEY = 'genso_curated_preset_palette_v3';

interface PresetCluster {
  id: string;
  label: string;
  items: PresetItem[];
}

// 24 Curated Preset Colors arranged into 6 harmonious color ranges (Reds -> Oranges/Yellows -> Greens -> Blues -> Purples -> Pinks/Neutrals)
const DEFAULT_PRESET_CLUSTERS: PresetCluster[] = [
  // Range 1: Warm Reds & Earthy
  {
    id: 'c-reds',
    label: 'Reds & Earth',
    items: [
      { id: 'c1-1', name: 'Coral Red', hex: '#FD5F56' },
      { id: 'c1-2', name: 'Terracotta', hex: '#A64942' },
      { id: 'c1-3', name: 'Crimson Rose', hex: '#C23934' },
      { id: 'c1-4', name: 'Warm Taupe', hex: '#68484B' },
    ]
  },
  // Range 2: Oranges & Sun Yellows
  {
    id: 'c-ambers',
    label: 'Oranges & Amber',
    items: [
      { id: 'c2-1', name: 'Tangerine Orange', hex: '#F3A853' },
      { id: 'c2-2', name: 'Amber Gold', hex: '#FFC46C' },
      { id: 'c2-3', name: 'Pale Champagne', hex: '#FFF1C2' },
      { id: 'c2-4', name: 'Lime Cream', hex: '#E6EFB6' },
    ]
  },
  // Range 3: Greens & Fresh Mints
  {
    id: 'c-greens',
    label: 'Greens & Mints',
    items: [
      { id: 'c3-1', name: 'Soft Mint', hex: '#B9E9C1' },
      { id: 'c3-2', name: 'Seafoam Mint', hex: '#BDF1D8' },
      { id: 'c3-3', name: 'Sky Cyan', hex: '#7BD9F5' },
      { id: 'c3-4', name: 'Slate Teal', hex: '#6484B3' },
    ]
  },
  // Range 4: Blues & Deep Indigos
  {
    id: 'c-blues',
    label: 'Blues & Indigo',
    items: [
      { id: 'c4-1', name: 'Cobalt Blue', hex: '#0649CC' },
      { id: 'c4-2', name: 'Azure Blue', hex: '#356ED9' },
      { id: 'c4-3', name: 'Periwinkle Blue', hex: '#9FA9F0' },
      { id: 'c4-4', name: 'Midnight Navy', hex: '#293462' },
    ]
  },
  // Range 5: Violets & Royal Purples
  {
    id: 'c-purples',
    label: 'Violets & Purple',
    items: [
      { id: 'c5-1', name: 'Electric Violet', hex: '#5D12E9' },
      { id: 'c5-2', name: 'Vivid Violet', hex: '#8A00D4' },
      { id: 'c5-3', name: 'Deep Purple', hex: '#553D8B' },
      { id: 'c5-4', name: 'Lavender Mist', hex: '#CCC0FE' },
    ]
  },
  // Range 6: Magentas, Pinks & Neutrals
  {
    id: 'c-pinks',
    label: 'Pinks & Neutrals',
    items: [
      { id: 'c6-1', name: 'Orchid Magenta', hex: '#D528B8' },
      { id: 'c6-2', name: 'Bubblegum Pink', hex: '#FF82C2' },
      { id: 'c6-3', name: 'Blush Lilac', hex: '#FFEAFF' },
      { id: 'c6-4', name: 'Soft Mist', hex: '#F3F3F3' },
    ]
  }
];

// Initialize clusters from localStorage or defaults
const loadClusters = (): PresetCluster[] => {
  try {
    const saved = localStorage.getItem(PALETTE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 6 && parsed[0]?.items) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load saved palette', err);
  }
  return JSON.parse(JSON.stringify(DEFAULT_PRESET_CLUSTERS));
};

const presetClusters = ref<PresetCluster[]>(loadClusters());

const totalPresetCount = computed(() => {
  return presetClusters.value.reduce((sum, cluster) => sum + (cluster.items?.length || 0), 0);
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
  if (!activeEditingSwatch.value && presetClusters.value[0]?.items?.[0]) {
    activeEditingSwatch.value = presetClusters.value[0].items[0];
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
  activeEditingSwatch.value = presetClusters.value[0]?.items?.[0] || null;
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

<style scoped src="../../styles/color-picker.css"></style>
